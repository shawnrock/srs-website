import { Redis } from '@upstash/redis';

// ─────────────────────────────────────────────────────────────
//  Interview Archive — permanent Redis store (no TTL)
//  Keys:
//    archive:{id}                          → InterviewRecord JSON
//    archive_by_date                        → Sorted Set (score=epoch, member=id)
//    archive_by_interviewer:{email_hash}    → Set of ids
//    archive_by_skill:{skill_lower}         → Set of ids
// ─────────────────────────────────────────────────────────────

export interface InterviewRecord {
  id: string;
  interviewerName: string;
  interviewerEmail: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  client: string;
  skills: string[];
  matchScore: number;
  overallScore: number;
  recommendation: string;
  interviewDate: string;       // ISO — when the interview started
  archivedAt: string;          // ISO — when the report was generated
  interviewDurationMinutes: number;
  totalQuestions: number;
  questionsAnswered: number;
  proctorAlerts: number;
  proctorRedFlags: number;
  proctorScore: number;
  disposition?: string;
  reportSummary?: string;
  strengths?: string[];
  areasForImprovement?: string[];
  sessionId: string;
}

export interface InterviewerStats {
  name: string;
  email: string;
  totalInterviews: number;
  avgScore: number;
  avgDurationMinutes: number;
  lastInterviewDate: string;
  recommended: number;
  conditional: number;
  notRecommended: number;
}

function getRedis(): Redis {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// In-memory fallback for local dev
const localArchive = new Map<string, InterviewRecord>();

function slugEmail(email: string) {
  return email.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function slugSkill(skill: string) {
  return skill.toLowerCase().trim().replace(/[^a-z0-9+#.]/g, '_');
}

class InterviewArchiveStore {
  private static instance: InterviewArchiveStore;
  static getInstance() {
    if (!this.instance) this.instance = new InterviewArchiveStore();
    return this.instance;
  }

  async archive(record: InterviewRecord): Promise<void> {
    if (!isRedisConfigured()) {
      localArchive.set(record.id, record);
      return;
    }
    const redis = getRedis();
    const epoch = new Date(record.interviewDate).getTime();
    const emailKey = slugEmail(record.interviewerEmail || 'unknown');

    await Promise.all([
      // Store the record (permanent — no TTL)
      redis.set(`archive:${record.id}`, record),
      // Date-sorted set
      redis.zadd('archive_by_date', { score: epoch, member: record.id }),
      // Interviewer index
      redis.sadd(`archive_by_interviewer:${emailKey}`, record.id),
      // Skill indexes
      ...record.skills.map(s => redis.sadd(`archive_by_skill:${slugSkill(s)}`, record.id)),
    ]);
  }

  async getById(id: string): Promise<InterviewRecord | null> {
    if (!isRedisConfigured()) return localArchive.get(id) || null;
    return getRedis().get<InterviewRecord>(`archive:${id}`);
  }

  async getAll(limit = 200): Promise<InterviewRecord[]> {
    if (!isRedisConfigured()) {
      return Array.from(localArchive.values())
        .sort((a, b) => new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime())
        .slice(0, limit);
    }
    const redis = getRedis();
    // Get most recent IDs from sorted set (ZRANGE with REV)
    const ids = await redis.zrange('archive_by_date', 0, limit - 1, { rev: true }) as string[];
    if (!ids.length) return [];
    const records = await Promise.all(ids.map(id => redis.get<InterviewRecord>(`archive:${id}`)));
    return records.filter((r): r is InterviewRecord => r !== null);
  }

  async searchByDateRange(fromDate: Date, toDate: Date): Promise<InterviewRecord[]> {
    if (!isRedisConfigured()) {
      return Array.from(localArchive.values()).filter(r => {
        const d = new Date(r.interviewDate).getTime();
        return d >= fromDate.getTime() && d <= toDate.getTime();
      });
    }
    const redis = getRedis();
    const ids = await redis.zrange(
      'archive_by_date',
      fromDate.getTime(),
      toDate.getTime(),
      { byScore: true },
    ) as string[];
    if (!ids.length) return [];
    const records = await Promise.all(ids.map(id => redis.get<InterviewRecord>(`archive:${id}`)));
    return records.filter((r): r is InterviewRecord => r !== null)
      .sort((a, b) => new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime());
  }

  async searchBySkills(skills: string[]): Promise<InterviewRecord[]> {
    if (!isRedisConfigured()) {
      const lower = skills.map(s => s.toLowerCase());
      return Array.from(localArchive.values()).filter(r =>
        lower.some(s => r.skills.some(rs => rs.toLowerCase().includes(s)))
      );
    }
    const redis = getRedis();
    // Union of all skill sets — candidate matches ANY of the requested skills
    const skillKeys = skills.map(s => `archive_by_skill:${slugSkill(s)}`);
    let ids: string[];
    if (skillKeys.length === 1) {
      ids = (await redis.smembers(skillKeys[0])) as string[];
    } else {
      ids = (await redis.sunion(skillKeys[0], ...skillKeys.slice(1))) as string[];
    }
    if (!ids.length) return [];
    const records = await Promise.all(ids.map(id => redis.get<InterviewRecord>(`archive:${id}`)));
    return records.filter((r): r is InterviewRecord => r !== null)
      .sort((a, b) => new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime());
  }

  async getByInterviewer(email: string): Promise<InterviewRecord[]> {
    if (!isRedisConfigured()) {
      return Array.from(localArchive.values()).filter(r => r.interviewerEmail === email);
    }
    const redis = getRedis();
    const ids = (await redis.smembers(`archive_by_interviewer:${slugEmail(email)}`)) as string[];
    if (!ids.length) return [];
    const records = await Promise.all(ids.map(id => redis.get<InterviewRecord>(`archive:${id}`)));
    return records.filter((r): r is InterviewRecord => r !== null)
      .sort((a, b) => new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime());
  }

  async getInterviewerStats(): Promise<InterviewerStats[]> {
    const all = await this.getAll(1000);
    const map = new Map<string, InterviewRecord[]>();
    for (const r of all) {
      const key = r.interviewerEmail || 'unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries()).map(([email, records]) => {
      const avgScore = records.reduce((s, r) => s + (r.overallScore || 0), 0) / records.length;
      const avgDur = records.reduce((s, r) => s + (r.interviewDurationMinutes || 0), 0) / records.length;
      const sorted = [...records].sort((a, b) => new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime());
      return {
        name: records[0].interviewerName || email,
        email,
        totalInterviews: records.length,
        avgScore: Math.round(avgScore),
        avgDurationMinutes: Math.round(avgDur),
        lastInterviewDate: sorted[0].interviewDate,
        recommended: records.filter(r => r.recommendation?.toLowerCase().includes('recommend') && !r.recommendation?.toLowerCase().includes('not')).length,
        conditional: records.filter(r => r.recommendation?.toLowerCase().includes('conditional')).length,
        notRecommended: records.filter(r => r.recommendation?.toLowerCase().includes('not')).length,
      };
    }).sort((a, b) => b.totalInterviews - a.totalInterviews);
  }

  async combinedSearch(params: {
    skills?: string[];
    days?: number;         // last N days
    fromDate?: string;
    toDate?: string;
    interviewer?: string;
    minScore?: number;
    maxScore?: number;
    recommendation?: string;
    query?: string;        // free text on candidate name / position
  }): Promise<InterviewRecord[]> {
    let results: InterviewRecord[];

    // Start with skill filter if provided (most selective)
    if (params.skills && params.skills.length > 0) {
      results = await this.searchBySkills(params.skills);
    } else {
      results = await this.getAll(1000);
    }

    // Date filter
    if (params.days) {
      const cutoff = Date.now() - params.days * 24 * 60 * 60 * 1000;
      results = results.filter(r => new Date(r.interviewDate).getTime() >= cutoff);
    } else if (params.fromDate || params.toDate) {
      const from = params.fromDate ? new Date(params.fromDate).getTime() : 0;
      const to = params.toDate ? new Date(params.toDate).getTime() : Date.now();
      results = results.filter(r => {
        const t = new Date(r.interviewDate).getTime();
        return t >= from && t <= to;
      });
    }

    // Interviewer filter
    if (params.interviewer) {
      const q = params.interviewer.toLowerCase();
      results = results.filter(r =>
        r.interviewerEmail?.toLowerCase().includes(q) ||
        r.interviewerName?.toLowerCase().includes(q)
      );
    }

    // Score filter
    if (params.minScore !== undefined)
      results = results.filter(r => (r.overallScore || 0) >= params.minScore!);
    if (params.maxScore !== undefined)
      results = results.filter(r => (r.overallScore || 0) <= params.maxScore!);

    // Recommendation filter
    if (params.recommendation)
      results = results.filter(r => r.recommendation?.toLowerCase().includes(params.recommendation!.toLowerCase()));

    // Free text
    if (params.query) {
      const q = params.query.toLowerCase();
      results = results.filter(r =>
        r.candidateName?.toLowerCase().includes(q) ||
        r.position?.toLowerCase().includes(q) ||
        r.client?.toLowerCase().includes(q) ||
        r.skills?.some(s => s.toLowerCase().includes(q))
      );
    }

    return results;
  }
}

export const archiveStore = InterviewArchiveStore.getInstance();
