import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from '@/lib/auth-cookie'

const API_BASE_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

async function proxy(req: NextRequest, path: string[]) {
  const token = getTokenFromRequest(req)

  if (!token) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 })
  }

  const endpoint = path.join('/')
  const search = req.nextUrl.search
  const url = `${API_BASE_URL}/client/${endpoint}${search}`

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  }

  const contentType = req.headers.get('content-type')
  if (contentType) headers['Content-Type'] = contentType

  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await req.text()

  const res = await fetch(url, {
    method: req.method,
    headers,
    body,
    cache: 'no-store',
  })

  const responseContentType = res.headers.get('content-type') ?? 'application/json'
  const responseHeaders: Record<string, string> = { 'Content-Type': responseContentType }
  const contentDisposition = res.headers.get('content-disposition')
  if (contentDisposition) responseHeaders['Content-Disposition'] = contentDisposition

  if (responseContentType.includes('application/pdf')) {
    const data = await res.arrayBuffer()
    return new NextResponse(data, { status: res.status, headers: responseHeaders })
  }

  const data = await res.text()
  return new NextResponse(data, { status: res.status, headers: responseHeaders })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxy(req, path)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxy(req, path)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxy(req, path)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxy(req, path)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxy(req, path)
}
