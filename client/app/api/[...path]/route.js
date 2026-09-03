import { NextResponse } from 'next/server';

const EXPRESS_BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE;

async function handleProxy(request, { params }) {
  const pathArr = (await params).path || [];
  const targetPath = pathArr.join('/');
  const search = request.nextUrl.search || '';
  
  const targetUrl = `${EXPRESS_BACKEND_URL}/${targetPath}${search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');

  let body = null;
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    try {
      body = await request.text();
    } catch (e) {}
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': headers.get('content-type') || 'application/json',
        'Authorization': headers.get('authorization') || ''
      },
      body: body ? body : undefined
    });

    const data = await backendRes.text();
    try {
      const json = JSON.parse(data);
      return NextResponse.json(json, { status: backendRes.status });
    } catch (e) {
      return new NextResponse(data, { 
        status: backendRes.status,
        headers: { 'Content-Type': backendRes.headers.get('content-type') || 'text/html' }
      });
    }
  } catch (err) {
    return NextResponse.json({ message: 'Proxy request error: ' + err.message }, { status: 502 });
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
