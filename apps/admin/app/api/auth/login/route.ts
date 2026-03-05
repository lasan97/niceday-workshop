import { NextResponse } from 'next/server';

const ADMIN_ID = 'admin';
const ADMIN_PASSWORD = 'admin1234';

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };

  if (body.username !== ADMIN_ID || body.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ message: 'invalid admin credentials' }, { status: 401 });
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
