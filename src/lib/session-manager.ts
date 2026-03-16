import { v4 as uuidv4 } from 'uuid';

export interface Session {
  id: string;
  jd: { title: string; client: string; description: string };
  candidate: { name: string; email: string; phone?: string; resume?: string; matchScore?: number };
  questions: Array<{ text: string; category: string; keywords?: string[]; difficulty?: string }>;
  scores: Record<number, any>;
  proctorAlerts: Array<{ check: string; severity: string; detail: string; timestamp: number }>;
  answerTranscripts: Record<number, string>;
  currentQuestion: number;
  candidateWs: any | null;
  observerWs: Set<any>;
  status: 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'abandoned';
  profileAnalysis: any | null;
  createdAt: Date;
  lastActivityAt: Date;
  interviewUrl: string;
  observerUrl: string;
  report: any | null;
  dailyRoomName?: string;
  dailyRoomUrl?: string;
}

class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private static instance: SessionManager;

  private constructor() {
    // Clean up expired sessions every 30 minutes
    setInterval(() => this.cleanup(), 30 * 60 * 1000);
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  createSession(jd: Session['jd'], candidate: Session['candidate']): Session {
    const id = uuidv4();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const session: Session = {
      id,
      jd,
      candidate,
      questions: [],
      scores: {},
      proctorAlerts: [],
      answerTranscripts: {},
      currentQuestion: 0,
      candidateWs: null,
      observerWs: new Set(),
      status: 'scheduled',
      profileAnalysis: null,
      createdAt: new Date(),
      lastActivityAt: new Date(),
      interviewUrl: `${baseUrl}/ai-interview/session/${id}`,
      observerUrl: `${baseUrl}/ai-interview/observe/${id}`,
      report: null,
    };
    this.sessions.set(id, session);
    return session;
  }

  getSession(id: string): Session | undefined {
    const session = this.sessions.get(id);
    if (session) session.lastActivityAt = new Date();
    return session;
  }

  getAllSessions(): Session[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  addObserver(sessionId: string, ws: any): void {
    const session = this.sessions.get(sessionId);
    if (session) session.observerWs.add(ws);
  }

  removeObserver(sessionId: string, ws: any): void {
    const session = this.sessions.get(sessionId);
    if (session) session.observerWs.delete(ws);
  }

  broadcastToObservers(sessionId: string, message: object): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    const payload = JSON.stringify(message);
    session.observerWs.forEach((ws) => {
      if (ws.readyState === 1) ws.send(payload);
    });
  }

  updateSessionStatus(sessionId: string, status: Session['status']): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = status;
      session.lastActivityAt = new Date();
    }
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  private cleanup(): void {
    const now = Date.now();
    this.sessions.forEach((session, id) => {
      const age = now - session.lastActivityAt.getTime();
      if (session.status === 'completed' && age > 24 * 60 * 60 * 1000) {
        this.sessions.delete(id);
      } else if (session.status !== 'completed' && age > 4 * 60 * 60 * 1000) {
        this.sessions.delete(id);
      }
    });
  }
}

export const sessionManager = SessionManager.getInstance();
