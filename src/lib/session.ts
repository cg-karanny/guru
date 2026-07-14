import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'cg_session';
const SECRET      = process.env.NEXTAUTH_SECRET ?? 'dev-secret-key-32chars-minimum!!';
const COOKIE_SECURE = process.env.SESSION_COOKIE_SECURE?.toLowerCase() !== 'false';

interface SessionPayload {
  id: string;
  email: string;
  role: string;
}

// Simple base64 sign/verify (use jose for prod JWT if needed)
function encode(obj: SessionPayload): string {
  const str = JSON.stringify(obj);
  return Buffer.from(str).toString('base64url');
}
function decode(token: string): SessionPayload | null {
  try {
    return JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));
  } catch {
    return null;
  }
}

export async function createSession(res: NextResponse, payload: SessionPayload) {
  const token = encode(payload);
  // Only use secure cookies if explicitly enabled - AWS might not have proper HTTPS setup
  const secureCookie = process.env.SESSION_COOKIE_SECURE === 'true';
  const isDev = process.env.NODE_ENV !== 'production';

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: secureCookie, // Only true if explicitly set in env
    sameSite: 'lax', // Use lax for both dev and prod
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  
  console.log(`[Session] Created session cookie for user ${payload.email}`, {
    secure: secureCookie,
    NODE_ENV: process.env.NODE_ENV,
  });
}

export async function getSession(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  console.log(`[Session] getSession - token exists: ${!!token}`, {
    cookieName: COOKIE_NAME,
  });
  if (!token) {
    console.log('[Session] No session token found in cookies');
    return null;
  }
  const session = decode(token);
  if (!session) {
    console.log('[Session] Failed to decode session token');
  } else {
    console.log(`[Session] Session decoded for user: ${session.email}`);
  }
  return session;
}

export async function clearSession(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
}
