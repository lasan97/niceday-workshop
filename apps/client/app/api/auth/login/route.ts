import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = (await request.json()) as { employeeId?: string; password?: string };

  if (!body.employeeId || !body.password) {
    return NextResponse.json({ message: '사번과 비밀번호를 입력해주세요.' }, { status: 400 });
  }

  const role = body.employeeId.toLowerCase().startsWith('admin') ? 'ADMIN' : 'PARTICIPANT';

  const response = NextResponse.json({ role });
  response.cookies.set('workshop_role', role, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
