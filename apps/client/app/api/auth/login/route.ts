import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = (await request.json()) as { employeeId?: string; password?: string };

  if (!body.employeeId || !body.password) {
    return NextResponse.json({ message: '사번과 비밀번호를 입력해주세요.' }, { status: 400 });
  }

  const apiBase = process.env.SERVER_API_BASE_URL ?? 'http://localhost:8080';
  const authResponse = await fetch(`${apiBase}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: body.employeeId,
      password: body.password,
    }),
    cache: 'no-store',
  });

  if (!authResponse.ok) {
    return NextResponse.json({ message: '인증에 실패했습니다.' }, { status: 401 });
  }

  const authBody = (await authResponse.json()) as { role: 'ADMIN' | 'PARTICIPANT'; sessionToken?: string };
  if (!authBody.sessionToken) {
    return NextResponse.json({ message: '인증 토큰 발급에 실패했습니다.' }, { status: 500 });
  }
  const role = authBody.role;

  const response = NextResponse.json({ role });
  response.cookies.set('workshop_role', role, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  response.cookies.set('workshop_session', authBody.sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
