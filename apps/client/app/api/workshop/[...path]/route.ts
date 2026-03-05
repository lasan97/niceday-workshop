import { NextResponse } from 'next/server';

function buildTargetUrl(pathSegments: string[], requestUrl: string): string {
  const apiBase = process.env.SERVER_API_BASE_URL ?? 'http://localhost:8080';
  const url = new URL(requestUrl);
  const query = url.search;
  const path = pathSegments.join('/');
  return `${apiBase}/api/v1/workshop/${path}${query}`;
}

async function proxy(request: Request, context: { params: { path: string[] } }) {
  const targetUrl = buildTargetUrl(context.params.path, request.url);
  const cookieHeader = request.headers.get('cookie');
  const contentType = request.headers.get('content-type');
  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text();

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers: {
      ...(contentType ? { 'content-type': contentType } : {}),
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
    body,
    cache: 'no-store',
  });

  const text = await upstreamResponse.text();
  return new NextResponse(text, {
    status: upstreamResponse.status,
    headers: {
      'content-type': upstreamResponse.headers.get('content-type') ?? 'application/json',
    },
  });
}

export async function GET(request: Request, context: { params: { path: string[] } }) {
  return proxy(request, context);
}

export async function POST(request: Request, context: { params: { path: string[] } }) {
  return proxy(request, context);
}

export async function PATCH(request: Request, context: { params: { path: string[] } }) {
  return proxy(request, context);
}

export async function DELETE(request: Request, context: { params: { path: string[] } }) {
  return proxy(request, context);
}
