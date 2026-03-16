"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const STATES = {
  LOADING: 'loading',
  SETUP: 'setup',
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
  const [proctorStatus, setProctorStatus] = useState({ faceDetected: false, eyeContact: false, faceCount: 0, gazeX: 0.5, gazeY: 0.5 });
  const [error, setError] = useState<string | null>(null);
  const [videoConnected, setVideoConnected] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [dailyUrl, setDailyUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const deepgramWsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const isInterviewActiveRef = useRef(false);
  const currentQuestionRef = useRef(0);
  const faceLandmarkerRef = useRef<any>(null);
  const gazeStateRef = useRef<any>({ lookDownStart: null, lookAwayStart: null, lastAlert: {}, lastFaceSeen: null });

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
        sendAlert('Multiple People', 'high', `${faceCount} faces detected — possible assistance at ${new Date().toLocaleTimeString()}`);
        gaze.lastAlert[key] = now;
      }
    }

    if (!detected) {
      const key = 'no_face';
      if (!gaze.lastAlert[key] || now - gaze.lastAlert[key] > 8000) {
        const vanishedRecently = gaze.lastFaceSeen && (now - gaze.lastFaceSeen) < 6000;
        if (vanishedRecently) {
          sendAlert('Looking Down / Face Left Frame', 'high', `Candidate's face left camera view at ${new Date().toLocaleTimeString()}`);
        } else {
          sendAlert('Camera Off / No Face', 'high', `Face not detected at ${new Date().toLocaleTimeString()}`);
        }
        gaze.lastAlert[key] = now;
      }
      gaze.lookDownStart = null;
      gaze.lookAwayStart = null;
      setProctorStatus({ faceDetected: false, faceCount: 0, eyeContact: false, gazeX: 0.5, gazeY: 0.5 });
      return;
    }

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
    const m = matrices[0]?.data;
    if (m?.length >= 16) {
      const pitch = Math.asin(Math.max(-1, Math.min(1, -m[6]))) * (180 / Math.PI);
      headTiltedDown = pitch > 18;
    }

    const lookingDown = gazeY > 0.65 || headTiltedDown;
    if (lookingDown) {
      if (!gaze.lookDownStart) gaze.lookDownStart = now;
      else if (now - gaze.lookDownStart > 2500) {
        const key = 'look_down';
        if (!gaze.lastAlert[key] || now - gaze.lastAlert[key] > 12000) {
          sendAlert('Looking Down', 'high', `Candidate looking down at ${new Date().toLocaleTimeString()}`);
          gaze.lastAlert[key] = now;
        }
      }
    } else { gaze.lookDownStart = null; }

    const lookingAway = Math.abs(gazeX - 0.5) > 0.28;
    if (lookingAway) {
      if (!gaze.lookAwayStart) gaze.lookAwayStart = now;
      else if (now - gaze.lookAwayStart > 3000) {
        const key = 'look_away';
        if (!gaze.lastAlert[key] || now - gaze.lastAlert[key] > 12000) {
          const dir = gazeX < 0.5 ? 'left' : 'right';
          sendAlert('Looking Away', 'warning', `Candidate looking ${dir} at ${new Date().toLocaleTimeString()}`);
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
          runningMode: 'VIDEO', numFaces: 3,
          minFaceDetectionConfidence: 0.5, minTrackingConfidence: 0.5,
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
        setState(STATES.SETUP);
        // Notify observer that candidate has arrived (REST fallback for Vercel)
        fetch(`/api/interviews/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'waiting' }),
        }).catch(() => {});
      })
      .catch(err => { setError('Interview session not found or has expired. Please contact your recruiter for a new link.'); setState(STATES.ERROR); });
  }, [sessionId]);

  const setupMedia = useCallback(async () => {
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
      setState(STATES.READY);
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
        sendAlert('Tab Switch', 'warning', `Tab switch detected at ${new Date().toLocaleTimeString()}`);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [sendAlert]);

  useEffect(() => {
    if (state !== STATES.INTERVIEW || !videoRef.current) return;
    let frameId: number;
    let lastTs = 0;
    const INTERVAL = 200;
    let blackFrameCount = 0;
    let lastBlackAlert = 0;
    const canvas = document.createElement('canvas');
    canvas.width = 80; canvas.height = 60;
    const ctx = canvas.getContext('2d')!;
    const loop = (now: number) => {
      frameId = requestAnimationFrame(loop);
      if (now - lastTs < INTERVAL) return;
      lastTs = now;
      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;
      ctx.drawImage(video, 0, 0, 80, 60);
      const px = ctx.getImageData(0, 0, 80, 60).data;
      let brightness = 0;
      for (let i = 0; i < px.length; i += 4) brightness += px[i] + px[i + 1] + px[i + 2];
      const avgBrightness = brightness / (80 * 60 * 3);
      if (avgBrightness < 8) {
        blackFrameCount++;
        if (blackFrameCount >= 5 && now - lastBlackAlert > 10000) {
          sendAlert('Camera Turned Off', 'high', `Camera feed is black at ${new Date().toLocaleTimeString()}`);
          lastBlackAlert = now;
          blackFrameCount = 0;
        }
        return;
      } else { blackFrameCount = 0; }
      const fl = faceLandmarkerRef.current;
      if (fl) {
        try { const result = fl.detectForVideo(video, now); processProctorResult(result, now); } catch (_) {}
      } else {
        let skinPixels = 0;
        for (let i = 0; i < px.length; i += 4) {
          const r = px[i], g = px[i + 1], b = px[i + 2];
          const maxRG = Math.max(r, g, b);
          if (maxRG > 60 && r > 40 && g > 20 && b > 10 && r >= g && r >= b && (r - Math.min(g, b)) > 10) skinPixels++;
        }
        const detected = skinPixels / (80 * 60) > 0.04;
        setProctorStatus(prev => ({ ...prev, faceDetected: detected, faceCount: detected ? 1 : 0 }));
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
        <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(232,84,47,0.9)', padding: '6px 14px', borderRadius: 8, fontSize: 13, color: '#fff', fontWeight: 'bold', zIndex: 10, pointerEvents: 'none' }}>
          Q{currentQuestion + 1}/{totalQuestions}
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
            <button onClick={setupMedia} style={{ padding: '12px 32px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #0a2540, #e8542f)', color: 'white', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>
              Grant Camera &amp; Mic Access
            </button>
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

      <video ref={videoRef} autoPlay muted playsInline style={{ position: 'fixed', top: -9999, left: -9999, width: 1, height: 1 }} />
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}
