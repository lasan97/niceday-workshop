import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiBase = process.env.SERVER_API_BASE_URL ?? 'http://localhost:8080';
  const cookieHeader = request.headers.get('cookie');
  try {
    await fetch(`${apiBase}/api/v1/auth/logout`, {
      method: 'POST',
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    });
  } catch {
    // 서버 로그아웃 요청이 실패해도 로컬 세션 쿠키는 삭제한다.
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('workshop_role', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 0,
  });
  response.cookies.set('workshop_session', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 0,
  });
  return response;
}
