import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from './server-store';

export function withSessionCookie<T>(
  data: T,
  sessionId: string,
  status = 200
): NextResponse<T> {
  const res = NextResponse.json(data, { status });
  res.cookies.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
