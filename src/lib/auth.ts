import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

interface TokenPayload {
  userId: string
  role: string
}

export async function verifyToken(req: Request): Promise<TokenPayload | NextResponse> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, code: 'MISSING_TOKEN', message: 'Missing token' }, { status: 401 })
  }
  const token = authHeader.replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
    // Return payload directly on successful verification
    return payload
  } catch {
    return NextResponse.json({ success: false, code: 'INVALID_TOKEN', message: 'Invalid token' }, { status: 401 })
  }
}
