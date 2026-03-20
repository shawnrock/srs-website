"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const STATES = {
  LOADING: 'loading',
  SETUP: 'setup',
  RECONNECTING: 'reconnecting', // interview is live, candidate lost connection
  READY: 'ready',
  INTERVIEW: 'interview',
  COMPLETE: 'complete',
  ERROR: 'error',
};

export default function InterviewRoom({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState(STATES.LOADING);
  const [session, setSession] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [elapsed, setElapsed] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [fullTranscript, setFullTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  // Start optimistic: candidate just set up camera so we assume face is present
  // until MediaPipe proves otherwise with sustained absence
  const [proctorStatus, setProctorStatus] = useState({ faceDetected: true, eyeContact: true, faceCount: 1, gazeX: 0.5, gazeY: 0.5 });
  const consecutiveNoFaceRef = useRef(0); // frames with no face — only flip badge after sustained absence
  const [error, setError] = useState<string | null>(null);
  const [videoConnected, setVideoConnected] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [dailyUrl, setDailyUrl] = useState<string | null>(null);
  const [reconnecting, setReconnecting] = useState(false); // true during rejoin media setup
  const [showQuestionText, setShowQuestionText] = useState(false);
  const [questionText, setQuestionText] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const deepgramWsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const isInterviewActiveRef = useRef(false);
  const currentQuestionRef = useRef(0);
  const faceLandmarkerRef = useRef<any>(null);
  const gazeStateRef = useRef<any>({ lookDownStart: null, lookUpStart: null, lookAwayStart: null, lastAlert: {}, lastFaceSeen: null });

  // Keep currentQuestionRef in sync so Deepgram callback can read latest value
  useEffect(() => { currentQuestionRef.current = currentQuestion; }, [currentQuestion]);

  const sendAlert = useCallback((check: string, severity: string, detail: string) => {
    const alert = { check, severity, detail, timestamp: Date.now() };
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'proctor_alert', alert }));
    }
    // Always persist via REST so observer sees it even without WS
    fetch(`/api/interviews/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alert }),
    }).catch(() => {});
  }, [sessionId]);

  const processProctorResult = useCallback((result: any, now: number) => {
    const faces = result.faceLandmarks ?? [];
    const matrices = result.facialTransformationMatrixes ?? [];
    const faceCount = faces.length;
    const detected = faceCount > 0;
    const gaze = gazeStateRef.current;

    if (faceCount > 1) {
      const key = 'multi_face';
      if (!gaze.lastAlert[key] || now - gaze.lastAlert[key] > 15000) {
        sendAlert('Multiple People', 'high', `${faceCount} faces detected in the camera frame — possible coaching or outside assistance.`);
        gaze.lastAlert[key] = now;
      }
    }

    if (!detected) {
      consecutiveNoFaceRef.current += 1;
      // Require 8 consecutive no-face frames (~1.6 s) before flipping badge
      // This prevents a single dark / transitional frame from showing "No Face"
      if (consecutiveNoFaceRef.current >= 8) {
        setProctorStatus({ faceDetected: false, faceCount: 0, eyeContact: false, gazeX: 0.5, gazeY: 0.5 });
        const key = 'no_face';
        if (!gaze.lastAlert[key] || now - gaze.lastAlert[key] > 8000) {
          const vanishedRecently = gaze.lastFaceSeen && (now - gaze.lastFaceSeen) < 6000;
          if (vanishedRecently) {
            sendAlert('Face Left Frame', 'high', `Candidate's face moved out of camera view — may be looking down at notes or a phone.`);
          } else {
            sendAlert('No Face Detected', 'high', `No face visible in camera — candidate may have stepped away or the camera is blocked.`);
          }
          gaze.lastAlert[key] = now;
        }
      }
      gaze.lookDownStart = null;
      gaze.lookAwayStart = null;
      gaze.lookUpStart = null;
      return;
    }
    // Face IS detected — reset counter and immediately show as detected
    consecutiveNoFaceRef.current = 0;

    gaze.lastFaceSeen = now;
    const lm = faces[0];
    let gazeX = 0.5, gazeY = 0.5;

    if (lm.length > 473) {
      const rIris = lm[468], lIris = lm[473];
      const rOut = lm[33], rIn = lm[133];
      const lIn = lm[362], lOut = lm[263];
      const rTop = lm[159], rBot = lm[145];
      const lTop = lm[386], lBot = lm[374];
      const rGazeX = (rIris.x - rOut.x) / (rIn.x - rOut.x + 1e-6);
      const lGazeX = (lIris.x - lIn.x) / (lOut.x - lIn.x + 1e-6);
      gazeX = (rGazeX + lGazeX) / 2;
      const rGazeY = (rIris.y - rTop.y) / (rBot.y - rTop.y + 1e-6);
      const lGazeY = (lIris.y - lTop.y) / (lBot.y - lTop.y + 1e-6);
      gazeY = (rGazeY + lGazeY) / 2;
    }

    let headTiltedDown = false;
    let headTiltedUp = false;
    const m = matrices[0]?.data;
    if (m?.length >= 16) {
      const pitch = Math.asin(Math.max(-1, Math.min(1, -m[6]))) * (180 / Math.PI);
      headTiltedDown = pitch > 18;
      headTiltedUp = pitch < -18;
    }

    // ── Looking Down ──
    const lookingDown = gazeY > 0.65 || headTiltedDown;
    if (lookingDown) {
      if (!gaze.lookDownStart) gaze.lookDownStart = now;
      else if (now - gaze.lookDownStart > 2500) {
        const key = 'look_down';
        if (!gaze.lastAlert[key] || now - gaze.lastAlert[key] > 12000) {
          sendAlert('Looking Down', 'high', `Candidate is looking downward — possibly reading from notes or using a mobile device.`);
          gaze.lastAlert[key] = now;
        }
      }
    } else { gaze.lookDownStart = null; }

    // ── Looking Up ──
    const lookingUp = gazeY < 0.25 || headTiltedUp;
    if (lookingUp && !lookingDown) {
      if (!gaze.lookUpStart) gaze.lookUpStart = now;
      else if (now - gaze.lookUpStart > 2500) {
        const key = 'look_up';
        if (!gaze.lastAlert[key] || now - gaze.lastAlert[key] > 12000) {
          sendAlert('Looking Up', 'warning', `Candidate is looking upward — eyes are not focused on the interview screen.`);
          gaze.lastAlert[key] = now;
        }
      }
    } else { gaze.lookUpStart = null; }

    // ── Looking Away (left / right) ──
    const lookingAway = Math.abs(gazeX - 0.5) > 0.28;
    if (lookingAway) {
      if (!gaze.lookAwayStart) gaze.lookAwayStart = now;
      else if (now - gaze.lookAwayStart > 3000) {
        const key = 'look_away';
        if (!gaze.lastAlert[key] || now - gaze.lastAlert[key] > 12000) {
          const dir = gazeX < 0.5 ? 'left' : 'right';
          sendAlert('Looking Away', 'warning', `Candidate's eyes are drifting to the ${dir} — not focused on the interview screen.`);
          gaze.lastAlert[key] = now;
        }
      }
    } else { gaze.lookAwayStart = null; }

    const eyeContact = !lookingDown && !lookingAway;
    setProctorStatus({ faceDetected: true, faceCount, eyeContact, gazeX, gazeY });
  }, [sendAlert]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
        const fl = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task', delegate: 'GPU' },
          runningMode: 'VIDEO', numFaces: 4,
          minFaceDetectionConfidence: 0.35, minTrackingConfidence: 0.35,
          outputFaceBlendshapes: false, outputFacialTransformationMatrixes: true,
        });
        if (!cancelled) faceLandmarkerRef.current = fl;
      } catch (err: any) { console.warn('[Proctor] FaceLandmarker init failed:', err.message); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    fetch(`/api/interviews/${sessionId}`)
      .then(r => { if (!r.ok) throw new Error('Session not found'); return r.json(); })
      .then(data => {
        if (data.error) throw new Error(data.error);
        setSession(data);
        setTotalQuestions(data.totalQuestions || 5);

        // Interview already completed — go straight to done screen
        if (data.status === 'completed') {
          setState(STATES.COMPLETE);
          return;
        }

        // Interview is live — candidate is reconnecting after a disconnect
        if (data.status === 'in_progress') {
          setCurrentQuestion(data.currentQuestion ?? 0);
          currentQuestionRef.current = data.currentQuestion ?? 0;
          setState(STATES.RECONNECTING);
          return; // Don't overwrite in_progress with 'waiting'
        }

        // Normal first-join flow
        setState(STATES.SETUP);
        // Notify interviewer that candidate has arrived
        fetch(`/api/interviews/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'waiting' }),
        }).catch(() => {});
      })
      .catch(() => { setError('Interview session not found or has expired. Please contact your recruiter for a new link.'); setState(STATES.ERROR); });
  }, [sessionId]);

  const setupMedia = useCallback(async (isRejoin = false) => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera access is blocked. This page must be served over HTTPS or localhost.');
        setState(STATES.ERROR);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;

      const tokenRes = await fetch(`/api/interviews/${sessionId}/daily-token?role=candidate`);
      if (tokenRes.ok) {
        const { roomUrl, token } = await tokenRes.json();
        const name = encodeURIComponent(session?.candidateName || 'Candidate');
        setDailyUrl(`${roomUrl}?t=${token}&userName=${name}`);
        setVideoConnected(true);
      } else {
        setError('Video room is not available. Please contact your recruiter.');
        setState(STATES.ERROR);
        return;
      }

      if (isRejoin) {
        // Skip the waiting screen — go straight back into the interview
        isInterviewActiveRef.current = true;
        setState(STATES.INTERVIEW);
        startDeepgramSTTRef.current();
      } else {
        setState(STATES.READY);
      }
    } catch (err: any) {
      setError(`Camera/microphone access failed: ${err.message}`);
      setState(STATES.ERROR);
    }
  }, [sessionId, session?.candidateName]);

  const startDeepgramSTT = useCallback(async () => {
    try {
      const res = await fetch('/api/deepgram/token');
      if (!res.ok) { console.warn('[Deepgram] Not configured'); return; }
      const { apiKey } = await res.json();
      const audioTrack = mediaStreamRef.current?.getAudioTracks()[0];
      if (!audioTrack) return;
      const audioStream = new MediaStream([audioTrack]);
      const dgWs = new WebSocket('wss://api.deepgram.com/v1/listen?model=nova-2&language=en-US&smart_format=true&interim_results=true', ['token', apiKey]);
      deepgramWsRef.current = dgWs;
      dgWs.onopen = () => {
        setIsListening(true);
        const recorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => { if (e.data.size > 0 && dgWs.readyState === WebSocket.OPEN) dgWs.send(e.data); };
        recorder.start(250);
      };
      dgWs.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          const transcript = data?.channel?.alternatives?.[0]?.transcript;
          const isFinal = data?.is_final;
          if (!transcript) return;
          if (isFinal) {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'transcript_update', text: transcript, isFinal: true }));
            }
            // Persist via REST for Vercel (no WS) and for report generation
            fetch(`/api/interviews/${sessionId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transcript, questionIndex: currentQuestionRef.current }),
            }).catch(() => {});
            setFullTranscript(prev => prev + transcript + ' ');
            setLiveTranscript('');
          } else { setLiveTranscript(transcript); }
        } catch (err) {}
      };
      dgWs.onclose = () => setIsListening(false);
    } catch (err) {}
  }, []);

  const stopDeepgramSTT = useCallback(() => {
    if (mediaRecorderRef.current) { try { mediaRecorderRef.current.stop(); } catch (_) {} mediaRecorderRef.current = null; }
    if (deepgramWsRef.current) { try { deepgramWsRef.current.close(); } catch (_) {} deepgramWsRef.current = null; }
    setIsListening(false);
  }, []);

  const startDeepgramSTTRef = useRef(startDeepgramSTT);
  startDeepgramSTTRef.current = startDeepgramSTT;
  const stopDeepgramSTTRef = useRef(stopDeepgramSTT);
  stopDeepgramSTTRef.current = stopDeepgramSTT;

  useEffect(() => {
    if (state !== STATES.READY) return;
    if (wsRef.current) return;
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws?session=${sessionId}&role=candidate`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'session_joined':
            if (msg.status === 'in_progress' && msg.currentQuestion !== undefined) {
              setCurrentQuestion(msg.currentQuestion);
              isInterviewActiveRef.current = true;
              setState(STATES.INTERVIEW);
              startDeepgramSTTRef.current();
            }
            break;
          case 'interview_started':
            setCurrentQuestion(msg.questionIndex);
            isInterviewActiveRef.current = true;
            setState(STATES.INTERVIEW);
            startDeepgramSTTRef.current();
            break;
          case 'question_change':
            setCurrentQuestion(msg.questionIndex);
            setFullTranscript('');
            setLiveTranscript('');
            break;
          case 'interview_complete':
            isInterviewActiveRef.current = false;
            stopDeepgramSTTRef.current();
            if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
            setState(STATES.COMPLETE);
            break;
          case 'error':
            setError(msg.message);
            break;
        }
      } catch (err) {}
    };
    ws.onclose = () => { wsRef.current = null; };
  }, [sessionId, state]);

  // REST polling — detects interview start, question changes, and completion
  // when WS is unavailable (Vercel serverless)
  useEffect(() => {
    if (state !== STATES.READY && state !== STATES.INTERVIEW) return;
    let stopped = false;
    const poll = setInterval(async () => {
      if (stopped) return;
      try {
        const r = await fetch(`/api/interviews/${sessionId}`);
        const data = await r.json();
        if (stopped) return;
        if (data.status === 'in_progress') {
          if (state === STATES.READY) {
            setCurrentQuestion(data.currentQuestion ?? 0);
            currentQuestionRef.current = data.currentQuestion ?? 0;
            isInterviewActiveRef.current = true;
            setState(STATES.INTERVIEW);
            startDeepgramSTTRef.current();
          } else if (state === STATES.INTERVIEW && data.currentQuestion !== undefined && data.currentQuestion !== currentQuestionRef.current) {
            setCurrentQuestion(data.currentQuestion);
            currentQuestionRef.current = data.currentQuestion;
            setFullTranscript('');
            setLiveTranscript('');
          }
        }
        if (data.status === 'completed' && state === STATES.INTERVIEW) {
          isInterviewActiveRef.current = false;
          stopDeepgramSTTRef.current();
          if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
          setState(STATES.COMPLETE);
          clearInterval(poll);
        }
      } catch (_) {}
    }, 3000);
    return () => { stopped = true; clearInterval(poll); };
  }, [sessionId, state]);

  useEffect(() => {
    return () => {
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
      if (mediaRecorderRef.current) { try { mediaRecorderRef.current.stop(); } catch (_) {} mediaRecorderRef.current = null; }
      if (deepgramWsRef.current) { try { deepgramWsRef.current.close(); } catch (_) {} deepgramWsRef.current = null; }
      if (mediaStreamRef.current) { mediaStreamRef.current.getTracks().forEach(t => { try { t.stop(); } catch (_) {} }); mediaStreamRef.current = null; }
      if (faceLandmarkerRef.current) { try { faceLandmarkerRef.current.close(); } catch (_) {} faceLandmarkerRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (state !== STATES.INTERVIEW) return;
    const t = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isInterviewActiveRef.current) {
        sendAlert('Tab Switch', 'warning', `Candidate switched to a different browser tab or application during the interview.`);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [sendAlert]);

  // Poll for showQuestionText toggle from interviewer every 3s during interview
  useEffect(() => {
    if (state !== STATES.INTERVIEW) return;
    const poll = setInterval(async () => {
      try {
        const r = await fetch(`/api/interviews/${sessionId}`);
        if (!r.ok) return;
        const data = await r.json();
        setShowQuestionText(data.showQuestionText ?? false);
        if (data.currentQuestionText) setQuestionText(data.currentQuestionText);
        // Sync current question number in case of drift
        if (data.currentQuestion !== undefined) {
          setCurrentQuestion(data.currentQuestion);
          currentQuestionRef.current = data.currentQuestion;
        }
      } catch (_) {}
    }, 3000);
    return () => clearInterval(poll);
  }, [state, sessionId]);

  useEffect(() => {
    if (state !== STATES.INTERVIEW || !videoRef.current) return;
    let frameId: number;
    let lastTs = 0;
    const INTERVAL = 200;
    let darkNoFaceCount = 0;      // consecutive truly-dark + no-face frames
    let lastCameraOffAlert = 0;
    let startupDelay = true;      // suppress all alerts for first 6 seconds
    const startedAt = performance.now();
    const canvas = document.createElement('canvas');
    canvas.width = 160; canvas.height = 120;
    const ctx = canvas.getContext('2d')!;

    const loop = (now: number) => {
      frameId = requestAnimationFrame(loop);
      if (now - lastTs < INTERVAL) return;
      lastTs = now;

      // ── Startup grace period: give camera + Daily.co 6 s to settle ──
      if (startupDelay) {
        if (performance.now() - startedAt < 6000) return;
        startupDelay = false;
      }

      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;

      // ── Compute frame brightness ──
      ctx.drawImage(video, 0, 0, 160, 120);
      const px = ctx.getImageData(0, 0, 160, 120).data;
      let brightness = 0;
      for (let i = 0; i < px.length; i += 4) brightness += px[i] + px[i + 1] + px[i + 2];
      const avgBrightness = brightness / (160 * 120 * 3);
      // Only treat as truly dark when essentially pitch-black (< 5/255 avg).
      // This avoids false positives in dim rooms or when Daily.co briefly
      // mutes the parent-page camera track on certain browsers (Safari).
      const isDark = avgBrightness < 5;

      // ── Always run MediaPipe regardless of brightness ──
      const fl = faceLandmarkerRef.current;
      let mediaPipeFaceCount = 0;
      if (fl) {
        try {
          const result = fl.detectForVideo(video, now);
          mediaPipeFaceCount = (result.faceLandmarks ?? []).length;
          if (isDark) {
            // Dark frame = stream likely muted by Daily.co taking camera priority.
            // Don't update proctorStatus — preserve whatever the last known state was.
            // Reset no-face counter so we don't count dark frames as "no face" evidence.
            consecutiveNoFaceRef.current = 0;
          } else {
            // Good frame — run full gaze + face analysis
            processProctorResult(result, now);
          }
        } catch (_) {}
      } else {
        // Skin-pixel fallback while MediaPipe model is still downloading
        if (!isDark) {
          let skinPixels = 0;
          for (let i = 0; i < px.length; i += 4) {
            const r = px[i], g = px[i + 1], b = px[i + 2];
            if (r > 60 && g > 30 && b > 15 && r >= g && r >= b && (r - Math.min(g, b)) > 15) skinPixels++;
          }
          mediaPipeFaceCount = skinPixels / (160 * 120) > 0.03 ? 1 : 0;
          if (mediaPipeFaceCount > 0) consecutiveNoFaceRef.current = 0;
          setProctorStatus(prev => ({ ...prev, faceDetected: mediaPipeFaceCount > 0, faceCount: mediaPipeFaceCount > 0 ? 1 : 0 }));
        }
      }

      // ── Camera Off: ONLY fire when frame is truly pitch-black AND no face
      //    for 30 consecutive frames (~6 s). Do NOT use trackDead — the parent
      //    page's camera track can appear "muted" simply because Daily.co's
      //    iframe claimed the same device (normal on Safari / some Chrome configs).
      if (isDark && mediaPipeFaceCount === 0) {
        darkNoFaceCount++;
        if (darkNoFaceCount >= 30 && now - lastCameraOffAlert > 20000) {
          sendAlert('Camera Off', 'high', `Camera feed is completely dark — candidate may have turned off their camera or covered the lens.`);
          lastCameraOffAlert = now;
          darkNoFaceCount = 0;
        }
      } else {
        darkNoFaceCount = 0;
      }
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [state, processProctorResult]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const renderVideoCall = () => (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#0a2540', height: state === STATES.INTERVIEW ? 480 : 400, width: '100%' }}>
      {dailyUrl ? (
        <iframe src={dailyUrl} allow="camera *; microphone *; autoplay *; display-capture *; fullscreen *; speaker-selection *" allowFullScreen style={{ width: '100%', height: '100%', border: 'none' }} title="Video Interview" />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
          <p style={{ fontSize: 14 }}>{state === STATES.READY ? 'Connecting to video room...' : 'Preparing video call...'}</p>
        </div>
      )}
      {cameraOff && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 30, borderRadius: 16 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>📷</div>
          <h3 style={{ color: '#ef4444', fontSize: 20, fontWeight: 'bold', margin: '0 0 8px', textAlign: 'center' }}>Camera is Off</h3>
          <p style={{ color: '#f1f5f9', fontSize: 14, textAlign: 'center', maxWidth: 280, margin: '0 0 20px', lineHeight: 1.5 }}>Your camera must remain on during the entire interview.</p>
          <button onClick={async () => {
            try {
              const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
              const newTrack = newStream.getVideoTracks()[0];
              if (mediaStreamRef.current) { const old = mediaStreamRef.current.getVideoTracks()[0]; if (old) { mediaStreamRef.current.removeTrack(old); old.stop(); } mediaStreamRef.current.addTrack(newTrack); } else { mediaStreamRef.current = newStream; }
              if (videoRef.current) videoRef.current.srcObject = mediaStreamRef.current;
              setCameraOff(false);
            } catch (err: any) { alert('Could not re-enable camera: ' + err.message); }
          }} style={{ padding: '12px 32px', borderRadius: 8, border: 'none', background: '#e8542f', color: 'white', fontWeight: 'bold', fontSize: 15, cursor: 'pointer' }}>
            Turn Camera On
          </button>
        </div>
      )}
      {state === STATES.INTERVIEW && dailyUrl && (
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, zIndex: 10, pointerEvents: 'none' }}>
          <div style={{ background: 'rgba(232,84,47,0.92)', padding: '5px 12px', borderRadius: 8, fontSize: 13, color: '#fff', fontWeight: 'bold' }}>
            Q{currentQuestion + 1}/{totalQuestions}
          </div>
          <div style={{ background: 'rgba(10,37,64,0.85)', padding: '5px 12px', borderRadius: 8, fontSize: 13, color: '#fff', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
            ⏱ {formatTime(elapsed)}
          </div>
        </div>
      )}
      {state === STATES.INTERVIEW && (
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
          <span style={{ background: proctorStatus.faceDetected ? 'rgba(22,163,74,0.85)' : 'rgba(220,38,38,0.85)', padding: '4px 10px', borderRadius: 6, fontSize: 11, color: '#fff', fontWeight: 'bold' }}>
            {!proctorStatus.faceDetected ? 'No Face' : proctorStatus.faceCount > 1 ? `⚠ ${proctorStatus.faceCount} Faces` : 'Face OK'}
          </span>
          {proctorStatus.faceDetected && (
            <span style={{ background: proctorStatus.eyeContact ? 'rgba(0,151,167,0.85)' : 'rgba(234,179,8,0.9)', padding: '4px 10px', borderRadius: 6, fontSize: 11, color: '#fff', fontWeight: 'bold' }}>
              {proctorStatus.eyeContact ? 'Eye Contact' : (proctorStatus.gazeY > 0.65 ? '👇 Looking Down' : '👀 Looking Away')}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', color: '#1e293b', fontFamily: 'system-ui, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <header style={{ borderBottom: '1px solid #e2e8f0', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #0a2540, #e8542f)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 12, color: '#fff' }}>SRS</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 14, color: '#1e293b' }}>SRS AI Interview</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{session?.position || 'Loading...'}{session?.client ? ` • ${session.client}` : ''}</div>
          </div>
        </div>
        {(state === STATES.INTERVIEW || state === STATES.READY) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {state === STATES.INTERVIEW && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: isListening ? '#10b981' : '#ef4444', animation: isListening ? 'pulse 1.5s infinite' : 'none' }} />
                <span style={{ fontSize: 12, color: isListening ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{isListening ? 'LISTENING' : 'MIC OFF'}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: videoConnected ? '#0097a7' : '#f59e0b' }} />
              <span style={{ fontSize: 11, color: videoConnected ? '#0097a7' : '#f59e0b', fontWeight: 'bold' }}>{videoConnected ? 'VIDEO LIVE' : 'CONNECTING'}</span>
            </div>
            {state === STATES.INTERVIEW && <span style={{ fontSize: 13, color: '#64748b' }}>Q{currentQuestion + 1}/{totalQuestions} {formatTime(elapsed)}</span>}
          </div>
        )}
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {state === STATES.LOADING && <div style={{ textAlign: 'center' }}><div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div><p style={{ color: '#0a2540' }}>Loading interview session...</p></div>}
        {state === STATES.SETUP && (
          <div style={{ textAlign: 'center', maxWidth: 500, background: '#fff', borderRadius: 16, padding: 40, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎥</div>
            <h2 style={{ marginBottom: 8, color: '#0a2540' }}>Camera &amp; Microphone Setup</h2>
            <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>Allow camera and microphone access to join your video interview.</p>
            <button onClick={() => setupMedia(false)} style={{ padding: '12px 32px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #0a2540, #e8542f)', color: 'white', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>
              Grant Camera &amp; Mic Access
            </button>
          </div>
        )}
        {state === STATES.RECONNECTING && (
          <div style={{ textAlign: 'center', maxWidth: 500, background: '#fff', borderRadius: 16, padding: 40, border: '2px solid #fbbf24', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
            {/* Pulsing signal icon */}
            <div style={{ fontSize: 56, marginBottom: 16, animation: 'pulse 1.5s infinite' }}>📡</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 999, background: '#fef3c7', border: '1px solid #fbbf24', marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1s infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: 1 }}>Interview In Progress</span>
            </div>
            <h2 style={{ marginBottom: 8, color: '#0a2540', fontSize: 22 }}>You Were Disconnected</h2>
            <p style={{ color: '#64748b', marginBottom: 6, fontSize: 14, lineHeight: 1.6 }}>
              Don't worry — your progress is saved. The interviewer is still waiting for you.
            </p>
            <div style={{ background: '#f1f5f9', borderRadius: 10, padding: '12px 16px', margin: '16px 0', textAlign: 'left' }}>
              <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Resuming at</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0a2540' }}>
                Question {(currentQuestion ?? 0) + 1} of {totalQuestions}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                {session?.position} {session?.client ? `· ${session.client}` : ''}
              </div>
            </div>
            <button
              onClick={async () => {
                setReconnecting(true);
                await setupMedia(true);
                setReconnecting(false);
              }}
              disabled={reconnecting}
              style={{ width: '100%', padding: '14px 32px', borderRadius: 10, border: 'none', background: reconnecting ? '#94a3b8' : 'linear-gradient(135deg, #0a2540, #e8542f)', color: 'white', fontWeight: 'bold', fontSize: 16, cursor: reconnecting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'opacity 0.2s' }}>
              {reconnecting ? (
                <><span style={{ display: 'inline-block', width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Reconnecting...</>
              ) : (
                <>🔄 Rejoin Interview Now</>
              )}
            </button>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>
              Your previous answers and transcript have been saved.
            </p>
          </div>
        )}
        {state === STATES.READY && (
          <div style={{ width: '100%', maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {renderVideoCall()}
            <div style={{ textAlign: 'center', background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#0a2540', marginBottom: 4 }}>Welcome, {session?.candidateName}</h3>
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>{totalQuestions} questions • approximately 10 minutes</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', borderRadius: 8, background: videoConnected ? '#f0fdf4' : '#fefce8', border: `1px solid ${videoConnected ? '#bbf7d0' : '#fef08a'}`, color: videoConnected ? '#15803d' : '#a16207', fontSize: 14 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: videoConnected ? '#22c55e' : '#f59e0b', animation: 'pulse 1.5s infinite' }} />
                {videoConnected ? 'Connected! Waiting for interviewer to start...' : 'Setting up video room...'}
              </div>
            </div>
          </div>
        )}
        {state === STATES.INTERVIEW && (
          <div style={{ width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {renderVideoCall()}
            <div style={{ background: '#e2e8f0', borderRadius: 8, height: 6 }}>
              <div style={{ height: '100%', borderRadius: 8, background: 'linear-gradient(90deg, #e8542f, #0097a7)', width: `${((currentQuestion + 1) / totalQuestions) * 100}%`, transition: 'width 0.5s ease' }} />
            </div>

            {/* ── Question text card — shown when interviewer toggles it on ── */}
            {showQuestionText && questionText && (
              <div style={{
                background: 'linear-gradient(135deg, #0a2540, #1e3a5f)',
                borderRadius: 12, padding: '18px 22px',
                border: '2px solid #0097a7',
                boxShadow: '0 4px 20px rgba(10,37,64,0.25)',
                animation: 'fadeSlideIn 0.3s ease',
              }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📖</span>
                  <span>Question {currentQuestion + 1} of {totalQuestions}</span>
                </div>
                <p style={{ fontSize: 17, color: '#fff', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
                  {questionText}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 20px', borderRadius: 10, background: isListening ? '#f0fdf4' : '#f8fafc', border: `1px solid ${isListening ? '#a7f3d0' : '#e2e8f0'}` }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: isListening ? '#10b981' : '#94a3b8', animation: isListening ? 'pulse 1s infinite' : 'none', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: isListening ? '#059669' : '#94a3b8', fontWeight: 500 }}>{isListening ? 'Microphone active — speak clearly' : 'Microphone inactive'}</span>
            </div>
          </div>
        )}
        {state === STATES.COMPLETE && (
          <div style={{ textAlign: 'center', maxWidth: 500, background: '#fff', borderRadius: 16, padding: 40, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: '#0a2540' }}>Interview Complete</h2>
            <p style={{ color: '#0097a7', marginBottom: 8, fontWeight: 'bold' }}>Thank you, {session?.candidateName}!</p>
            <p style={{ color: '#64748b', fontSize: 14 }}>Your interview has been recorded and evaluated by our AI system. The SRS Infoway team will review your results and be in touch shortly.</p>
          </div>
        )}
        {state === STATES.ERROR && (
          <div style={{ textAlign: 'center', maxWidth: 500, background: '#fff', borderRadius: 16, padding: 40, border: '1px solid #fca5a5' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ color: '#dc2626' }}>Error</h2>
            <p style={{ color: '#64748b', whiteSpace: 'pre-line' }}>{error}</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f1f5f9', color: '#475569', cursor: 'pointer' }}>Retry</button>
          </div>
        )}
      </main>

      {/* Hidden video for MediaPipe — must NOT be 1x1px or display:none or browser skips rendering frames */}
      <video ref={videoRef} autoPlay muted playsInline style={{ position: 'fixed', top: -9999, left: -9999, width: 320, height: 240, opacity: 0, pointerEvents: 'none' }} />
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
