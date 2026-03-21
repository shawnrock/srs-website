/**
 * auth-store.ts
 * Redis-backed store for interviewers, auth sessions, invite tokens and
 * location-approval requests.  Falls back to in-memory maps when Redis is
 * not configured (local dev).
 */

import { Redis } from '@upstash/redis';
import { randomBytes, pbkdf2Sync, createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApprovedLocation {
  id: string;
  fingerprint: string;       // SHA-256 slice(0,16) of ip||ua
  ipAddress: string;
  userAgentSummary: string;  // short browser + OS string
  label: string;             // "Location 1", "Location 2"
  approvedAt: string;
  approvedBy: string;        // "system" or admin email
  lastUsedAt?: string;
}

export interface Interviewer {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;       // undefined until invite accepted
  status: 'invited' | 'active' | 'suspended';
  invitedAt: string;
  invitedBy: string;           // admin email
  activatedAt?: string;
  lastLoginAt?: string;
  approvedLocations: ApprovedLocation[];  // max 2
  createdAt: string;
}

export interface AuthSession {
  token: string;
  userId: string;              // interviewer id  OR  "admin:{email}"
  email: string;
  name: string;
  role: 'Admin' | 'Interviewer';
  fingerprint: string;
  createdAt: string;
  expiresAt: string;
}

export interface InviteToken {
  token: string;
  interviewerId: string;
  email: string;
  name: string;
  createdAt: string;
  expiresAt: string;
}

export interface LocationRequest {
  id: string;
  interviewerId: string;
  interviewerEmail: string;
  interviewerName: string;
  fingerprint: string;
  ipAddress: string;
  userAgentSummary: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  resolvedAt?: string;
  resolvedBy?: string;
}

// ─── Hardcoded Admin Accounts ─────────────────────────────────────────────────
// These are the super-admins; they bypass location restrictions.

export const ADMIN_USERS: Record<string, { password: string; name: string }> = {
  'project.developers@srsinfoway.com': { password: 'SRS@Dev2026',  name: 'Dev Team'   },
  'admin@srsinfoway.com':              { password: 'SRS@Admin2026', name: 'SRS Admin'  },
};

// ─── Hardcoded Interviewer Accounts (built-in test / seed accounts) ───────────
// These behave exactly like Redis-provisioned interviewers but are always
// available without needing an invite. Location restrictions are skipped for
// these accounts (same as admins) so they are easy to use during testing.

export const HARDCODED_INTERVIEWERS: Record<string, { password: string; name: string }> = {
  'priya.m@srsinfoway.com':     { password: 'SRS@Priya2026',  name: 'Priya M'      },
  'dhivyapriya@srsinfoway.com': { password: 'SRS@Dhivya2026', name: 'Dhivya Priya' },
};

// ─── Crypto Helpers ───────────────────────────────────────────────────────────

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const attempt = pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex');
  return attempt === hash;
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

/** Stable fingerprint from IP + User-Agent (16 hex chars). */
export function fingerprintRequest(ip: string, userAgent: string): string {
  return createHash('sha256').update(`${ip}||${userAgent}`).digest('hex').slice(0, 16);
}

/** Short human-readable label from a full UA string. */
export function summarizeUA(ua: string): string {
  const browser = ua.match(/(Chrome|Firefox|Safari|Edg|Opera)\/[\d.]+/)?.[0] ?? '';
  const os = ua.match(/\(([^)]+)\)/)?.[1]?.split(';')[0] ?? '';
  return `${browser} · ${os}`.trim().slice(0, 70);
}

/** Extract the real IP from Next.js request headers. */
export function getClientIp(req: Request): string {
  const fwd = (req.headers as any).get?.('x-forwarded-for') ??
               (req.headers as any)['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  const real = (req.headers as any).get?.('x-real-ip') ??
               (req.headers as any)['x-real-ip'];
  return real ?? '0.0.0.0';
}

// ─── Redis Setup ──────────────────────────────────────────────────────────────

const AUTH_SESSION_TTL = 60 * 60 * 8;   // 8 hours
const INVITE_TTL       = 60 * 60 * 72;  // 72 hours

function getRedis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

function isRedisConfigured() {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// In-memory fallback for local dev
const mem = {
  interviewers: new Map<string, Interviewer>(),
  emailIdx:     new Map<string, string>(),        // email → id
  sessions:     new Map<string, AuthSession>(),
  activeSession:new Map<string, string>(),        // userId → token
  invites:      new Map<string, InviteToken>(),
  locRequests:  new Map<string, LocationRequest>(),
};

// ─── Interviewer CRUD ─────────────────────────────────────────────────────────

export async function createInterviewer(
  name: string,
  email: string,
  invitedBy: string,
): Promise<Interviewer> {
  const id  = uuidv4();
  const now = new Date().toISOString();
  const rec: Interviewer = {
    id, name, email: email.toLowerCase(),
    status: 'invited', invitedAt: now, invitedBy,
    approvedLocations: [], createdAt: now,
  };
  if (isRedisConfigured()) {
    const r = getRedis();
    await r.set(`interviewer:${id}`, rec);
    await r.set(`interviewer_email:${email.toLowerCase()}`, id);
    await r.sadd('interviewers_list', id);
  } else {
    mem.interviewers.set(id, rec);
    mem.emailIdx.set(email.toLowerCase(), id);
  }
  return rec;
}

export async function getInterviewerById(id: string): Promise<Interviewer | null> {
  if (isRedisConfigured()) return getRedis().get<Interviewer>(`interviewer:${id}`);
  return mem.interviewers.get(id) ?? null;
}

export async function getInterviewerByEmail(email: string): Promise<Interviewer | null> {
  const lower = email.toLowerCase();
  if (isRedisConfigured()) {
    const r  = getRedis();
    const id = await r.get<string>(`interviewer_email:${lower}`);
    if (!id) return null;
    return r.get<Interviewer>(`interviewer:${id}`);
  }
  const id = mem.emailIdx.get(lower);
  return id ? (mem.interviewers.get(id) ?? null) : null;
}

export async function updateInterviewer(id: string, updates: Partial<Interviewer>): Promise<void> {
  const existing = await getInterviewerById(id);
  if (!existing) return;
  const updated = { ...existing, ...updates };
  if (isRedisConfigured()) {
    await getRedis().set(`interviewer:${id}`, updated);
  } else {
    mem.interviewers.set(id, updated);
  }
}

export async function deleteInterviewer(id: string): Promise<void> {
  const existing = await getInterviewerById(id);
  if (!existing) return;
  if (isRedisConfigured()) {
    const r = getRedis();
    await r.del(`interviewer:${id}`);
    await r.del(`interviewer_email:${existing.email}`);
    await r.srem('interviewers_list', id);
  } else {
    mem.emailIdx.delete(existing.email);
    mem.interviewers.delete(id);
  }
}

export async function getAllInterviewers(): Promise<Interviewer[]> {
  if (isRedisConfigured()) {
    const r   = getRedis();
    const ids = await r.smembers<string[]>('interviewers_list');
    if (!ids.length) return [];
    const list = await Promise.all(ids.map(id => r.get<Interviewer>(`interviewer:${id}`)));
    return list
      .filter((i): i is Interviewer => i !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return Array.from(mem.interviewers.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ─── Auth Sessions ────────────────────────────────────────────────────────────

export async function createAuthSession(
  userId: string,
  email: string,
  name: string,
  role: 'Admin' | 'Interviewer',
  fingerprint: string,
): Promise<AuthSession> {
  const token = generateToken();
  const now   = new Date();
  const session: AuthSession = {
    token, userId, email, name, role, fingerprint,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + AUTH_SESSION_TTL * 1000).toISOString(),
  };
  if (isRedisConfigured()) {
    const r = getRedis();
    // Kill any existing active session so only one login at a time is allowed
    const prev = await r.get<string>(`active_session:${userId}`);
    if (prev) await r.del(`auth_session:${prev}`);
    await r.setex(`auth_session:${token}`, AUTH_SESSION_TTL, session);
    await r.setex(`active_session:${userId}`, AUTH_SESSION_TTL, token);
  } else {
    const prev = mem.activeSession.get(userId);
    if (prev) mem.sessions.delete(prev);
    mem.sessions.set(token, session);
    mem.activeSession.set(userId, token);
  }
  return session;
}

export async function getAuthSession(token: string): Promise<AuthSession | null> {
  if (isRedisConfigured()) return getRedis().get<AuthSession>(`auth_session:${token}`);
  return mem.sessions.get(token) ?? null;
}

export async function deleteAuthSession(token: string): Promise<void> {
  if (isRedisConfigured()) {
    const r = getRedis();
    const s = await r.get<AuthSession>(`auth_session:${token}`);
    if (s) {
      await r.del(`auth_session:${token}`);
      await r.del(`active_session:${s.userId}`);
    }
  } else {
    const s = mem.sessions.get(token);
    if (s) { mem.activeSession.delete(s.userId); mem.sessions.delete(token); }
  }
}

// ─── Invite Tokens ────────────────────────────────────────────────────────────

export async function createInviteToken(
  interviewerId: string,
  email: string,
  name: string,
): Promise<InviteToken> {
  const token = generateToken();
  const now   = new Date();
  const inv: InviteToken = {
    token, interviewerId, email, name,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + INVITE_TTL * 1000).toISOString(),
  };
  if (isRedisConfigured()) {
    await getRedis().setex(`invite_token:${token}`, INVITE_TTL, inv);
  } else {
    mem.invites.set(token, inv);
  }
  return inv;
}

export async function getInviteToken(token: string): Promise<InviteToken | null> {
  if (isRedisConfigured()) return getRedis().get<InviteToken>(`invite_token:${token}`);
  return mem.invites.get(token) ?? null;
}

export async function deleteInviteToken(token: string): Promise<void> {
  if (isRedisConfigured()) await getRedis().del(`invite_token:${token}`);
  else mem.invites.delete(token);
}

// ─── Location Requests ────────────────────────────────────────────────────────

export async function createLocationRequest(
  interviewerId: string,
  interviewerEmail: string,
  interviewerName: string,
  fingerprint: string,
  ipAddress: string,
  userAgentSummary: string,
): Promise<LocationRequest> {
  const id  = uuidv4();
  const req: LocationRequest = {
    id, interviewerId, interviewerEmail, interviewerName,
    fingerprint, ipAddress, userAgentSummary,
    requestedAt: new Date().toISOString(),
    status: 'pending',
  };
  if (isRedisConfigured()) {
    const r = getRedis();
    await r.set(`location_request:${id}`, req);
    await r.sadd('location_requests_pending', id);
  } else {
    mem.locRequests.set(id, req);
  }
  return req;
}

export async function getLocationRequest(id: string): Promise<LocationRequest | null> {
  if (isRedisConfigured()) return getRedis().get<LocationRequest>(`location_request:${id}`);
  return mem.locRequests.get(id) ?? null;
}

export async function updateLocationRequest(
  id: string,
  updates: Partial<LocationRequest>,
): Promise<void> {
  const existing = await getLocationRequest(id);
  if (!existing) return;
  const updated = { ...existing, ...updates };
  if (isRedisConfigured()) {
    const r = getRedis();
    await r.set(`location_request:${id}`, updated);
    if (updates.status && updates.status !== 'pending')
      await r.srem('location_requests_pending', id);
  } else {
    mem.locRequests.set(id, updated);
  }
}

export async function getAllLocationRequests(): Promise<LocationRequest[]> {
  if (isRedisConfigured()) {
    const r    = getRedis();
    const keys = await r.keys('location_request:*');
    if (!keys.length) return [];
    const list = await Promise.all(keys.map(k => r.get<LocationRequest>(k)));
    return list
      .filter((r): r is LocationRequest => r !== null)
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  }
  return Array.from(mem.locRequests.values())
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
}

export async function getPendingLocationRequests(): Promise<LocationRequest[]> {
  return (await getAllLocationRequests()).filter(r => r.status === 'pending');
}
