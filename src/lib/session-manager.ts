import { Redis } from '@upstash/redis';
import { v4 as uuidv4 } from 'uuid';

export interface Session {
  id: string;
  jd: { title: string; client: string; description: string };
  candidate: { name: string; email: string; phone?: string; resume?: string; matchScore?: number };
  questions: Array<{ text: string; question?: string; category: string; keywords?: string[]; difficulty?: string }>;
  scores: Record<number, any>;
  proctorAlerts: Array<{ check: string; severity: string; detail: string; timestamp: number }>;
  answerTranscripts: Record<number, string>;
  currentQuestion: number;
  status: 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'abandoned';
  showQuestionText?: boolean;
  interviewStartedAt?: string;   // ISO timestamp when status flipped to in_progress
  candidateInfo?: {              // Candidate-submitted info (filled at interview start)
    totalExperience?: string;
    relevantExperience?: string;
    highestDegree?: string;
    currentLocation?: string;
    noticePeriod?: string;
    locationPreference?: string;
    currentSalary?: string;
    expectedSalary?: string;
  };
  interviewerNotes?: string;     // Post-interview recruiter comments
  profileAnalysis: any | null;
  createdAt: string;
  lastActivityAt: string;
  interviewUrl: string;
  observerUrl: string;
  report: any | null;
  dailyRoomName?: string;
  dailyRoomUrl?: string;
  recruiterEmail?: string;
  recruiterName?: string;
}

const SESSION_TTL = 60 * 60 * 24; // 24 hours in seconds

function getRedis(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

// In-memory fallback for local dev (when Redis env vars not set)
const localSessions = new Map<string, Session>();

function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

class SessionManager {
  private static instance: SessionManager;
  static getInstance(): SessionManager {
    if (!SessionManager.instance) SessionManager.instance = new SessionManager();
    return SessionManager.instance;
  }

  async createSession(jd: Session['jd'], candidate: Session['candidate'], recruiterEmail?: string, recruiterName?: string): Promise<Session> {
    const id = uuidv4();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const session: Session = {
      id, jd, candidate,
      questions: [], scores: {}, proctorAlerts: [], answerTranscripts: {},
      currentQuestion: 0, status: 'scheduled', profileAnalysis: null,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      interviewUrl: `${baseUrl}/ai-interview/session/${id}`,
      observerUrl: `${baseUrl}/ai-interview/interview/${id}`,
      report: null,
      recruiterEmail,
      recruiterName,
    };
    if (isRedisConfigured()) {
      await getRedis().setex(`session:${id}`, SESSION_TTL, session);
    } else {
      localSessions.set(id, session);
    }
    return session;
  }

  async getSession(id: string): Promise<Session | null> {
    if (isRedisConfigured()) {
      const data = await getRedis().get<Session>(`session:${id}`);
      if (!data) return null;
      // Refresh TTL on access
      await getRedis().expire(`session:${id}`, SESSION_TTL);
      return data;
    }
    return localSessions.get(id) || null;
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<void> {
    const session = await this.getSession(id);
    if (!session) return;
    const updated: Session = { ...session, ...updates, lastActivityAt: new Date().toISOString() };
    if (isRedisConfigured()) {
      await getRedis().setex(`session:${id}`, SESSION_TTL, updated);
    } else {
      localSessions.set(id, updated);
    }
  }

  async getAllSessions(): Promise<Session[]> {
    if (isRedisConfigured()) {
      const redis = getRedis();
      const keys = await redis.keys('session:*');
      if (!keys.length) return [];
      const sessions = await Promise.all(keys.map(k => redis.get<Session>(k)));
      return sessions
        .filter((s): s is Session => s !== null)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return Array.from(localSessions.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async deleteSession(id: string): Promise<boolean> {
    if (isRedisConfigured()) {
      const result = await getRedis().del(`session:${id}`);
      return result > 0;
    }
    return localSessions.delete(id);
  }

  async updateSessionStatus(id: string, status: Session['status']): Promise<void> {
    await this.updateSession(id, { status });
  }

  // WebSocket helpers (in-memory only — used by standalone server, not Vercel)
  private wsConnections = new Map<string, { candidateWs: any; observerWs: Set<any> }>();

  addObserver(sessionId: string, ws: any): void {
    if (!this.wsConnections.has(sessionId))
      this.wsConnections.set(sessionId, { candidateWs: null, observerWs: new Set() });
    this.wsConnections.get(sessionId)!.observerWs.add(ws);
  }

  removeObserver(sessionId: string, ws: any): void {
    this.wsConnections.get(sessionId)?.observerWs.delete(ws);
  }

  broadcastToObservers(sessionId: string, message: object): void {
    const conns = this.wsConnections.get(sessionId);
    if (!conns) return;
    const payload = JSON.stringify(message);
    conns.observerWs.forEach(ws => { if (ws.readyState === 1) ws.send(payload); });
  }
}

export const sessionManager = SessionManager.getInstance();
