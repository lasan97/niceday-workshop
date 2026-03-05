import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
    return NextResponse.json(
      { message: '사용자 정보를 불러오지 못했습니다.' },
      {
        status: response.status,
        headers: { 'cache-control': 'no-store, no-cache, must-revalidate' },
      },
    );
  }

  const body = await response.json();
  return NextResponse.json(body, {
    headers: { 'cache-control': 'no-store, no-cache, must-revalidate' },
  });
}
