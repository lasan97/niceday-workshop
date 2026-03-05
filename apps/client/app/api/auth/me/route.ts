import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const apiBase = process.env.SERVER_API_BASE_URL ?? 'http://localhost:8080';
  const cookie = request.headers.get('cookie') ?? '';

  const response = await fetch(`${apiBase}/api/v1/auth/me`, {
    method: 'GET',
    headers: {
      ...(cookie ? { cookie } : {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return NextResponse.json({ message: '사용자 정보를 불러오지 못했습니다.' }, { status: response.status });
  }

  const body = await response.json();
  return NextResponse.json(body);
}
