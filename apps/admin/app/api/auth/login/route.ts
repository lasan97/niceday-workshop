import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };

  if (!body.username || !body.password) {
    return NextResponse.json({ message: '아이디와 비밀번호를 입력해주세요.' }, { status: 400 });
  }

  const apiBase = process.env.SERVER_API_BASE_URL ?? 'http://localhost:8080';
  const authResponse = await fetch(`${apiBase}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: body.username,
      password: body.password,
    }),
    cache: 'no-store',
  });

  if (!authResponse.ok) {
    return NextResponse.json({ message: '관리자 계정 정보가 올바르지 않습니다.' }, { status: 401 });
  }

  const authBody = (await authResponse.json()) as { role: 'ADMIN' | 'PARTICIPANT' };
  if (authBody.role !== 'ADMIN') {
    return NextResponse.json({ message: '관리자 권한이 없습니다.' }, { status: 403 });
  }

  const response = NextResponse.json({ role: 'ADMIN' });
  response.cookies.set('workshop_role', 'ADMIN', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
