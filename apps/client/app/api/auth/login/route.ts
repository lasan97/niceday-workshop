import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = (await request.json()) as { employeeId?: string; password?: string };

  if (!body.employeeId || !body.password) {
    return NextResponse.json({ message: 'employeeId and password are required' }, { status: 400 });
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
