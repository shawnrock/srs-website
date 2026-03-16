import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { WebSocketServer, WebSocket } from 'ws';
import { sessionManager } from './src/lib/session-manager';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (req, socket, head) => {
    const parsedUrl = parse(req.url!, true);
    if (parsedUrl.pathname === '/ws') {
      wss.handleUpgrade(req, socket as any, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket, req: any) => {
    const parsedUrl = parse(req.url!, true);
    const sessionId = parsedUrl.query.session as string;
    const role = parsedUrl.query.role as string;

    if (!sessionId || !role) {
      ws.close(1008, 'Missing session or role');
      return;
    }

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      ws.close(1008, 'Session not found');
      return;
    }

    if (role === 'candidate') {
      handleCandidateConnection(ws, session, sessionId);
    } else if (role === 'observer') {
      handleObserverConnection(ws, session, sessionId);
    } else {
      ws.close(1008, 'Invalid role');
    }
  });

  function handleCandidateConnection(ws: WebSocket, session: any, sessionId: string) {
    session.candidateWs = ws;
    sessionManager.updateSessionStatus(sessionId, 'waiting');

    ws.send(JSON.stringify({
      type: 'session_joined',
      status: session.status,
      currentQuestion: session.currentQuestion,
      candidateName: session.candidate?.name,
      position: session.jd?.title,
    }));

    ws.on('message', (data: any) => {
      try {
        const msg = JSON.parse(data.toString());
        switch (msg.type) {
          case 'transcript_update':
            if (!session.answerTranscripts) session.answerTranscripts = {};
            const qi = session.currentQuestion;
            session.answerTranscripts[qi] = (session.answerTranscripts[qi] || '') + ' ' + msg.text;
            sessionManager.broadcastToObservers(sessionId, {
              type: 'transcript_update',
              questionIndex: qi,
              text: msg.text,
              isFinal: msg.isFinal,
            });
            break;
          case 'proctor_alert':
            if (!session.proctorAlerts) session.proctorAlerts = [];
            session.proctorAlerts.push(msg.alert);
            sessionManager.broadcastToObservers(sessionId, {
              type: 'proctor_alert',
              alert: msg.alert,
            });
            break;
          case 'face_data':
            sessionManager.broadcastToObservers(sessionId, {
              type: 'face_data',
              ...msg,
            });
            break;
        }
      } catch (err) {
        console.error('[WS Candidate] Parse error:', err);
      }
    });

    ws.on('close', () => {
      if (session.candidateWs === ws) session.candidateWs = null;
    });
  }

  function handleObserverConnection(ws: WebSocket, session: any, sessionId: string) {
    sessionManager.addObserver(sessionId, ws);

    ws.send(JSON.stringify({
      type: 'session_joined',
      session: {
        id: session.id,
        status: session.status,
        candidate: session.candidate,
        jd: session.jd,
        questions: session.questions,
        currentQuestion: session.currentQuestion,
        proctorAlerts: session.proctorAlerts || [],
        answerTranscripts: session.answerTranscripts || {},
      }
    }));

    ws.on('message', async (data: any) => {
      try {
        const msg = JSON.parse(data.toString());
        switch (msg.type) {
          case 'start_interview':
            if (session.questions && session.questions.length > 0) {
              session.currentQuestion = 0;
              sessionManager.updateSessionStatus(sessionId, 'in_progress');
              const q = session.questions[0];
              if (session.candidateWs?.readyState === WebSocket.OPEN) {
                session.candidateWs.send(JSON.stringify({
                  type: 'interview_started',
                  questionIndex: 0,
                  question: q,
                  totalQuestions: session.questions.length,
                }));
              }
              sessionManager.broadcastToObservers(sessionId, {
                type: 'interview_started',
                questionIndex: 0,
                question: q,
              });
            }
            break;

          case 'next_question':
            const nextIdx = (session.currentQuestion || 0) + 1;
            if (nextIdx < session.questions.length) {
              session.currentQuestion = nextIdx;
              const nextQ = session.questions[nextIdx];
              if (session.candidateWs?.readyState === WebSocket.OPEN) {
                session.candidateWs.send(JSON.stringify({
                  type: 'question_change',
                  questionIndex: nextIdx,
                  question: nextQ,
                }));
              }
              sessionManager.broadcastToObservers(sessionId, {
                type: 'question_change',
                questionIndex: nextIdx,
                question: nextQ,
              });
            }
            break;

          case 'end_interview':
            if (session.candidateWs?.readyState === WebSocket.OPEN) {
              session.candidateWs.send(JSON.stringify({ type: 'interview_complete' }));
            }
            sessionManager.updateSessionStatus(sessionId, 'completed');
            sessionManager.broadcastToObservers(sessionId, { type: 'interview_complete' });
            break;
        }
      } catch (err) {
        console.error('[WS Observer] Error:', err);
      }
    });

    ws.on('close', () => {
      sessionManager.removeObserver(sessionId, ws);
    });
  }

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
