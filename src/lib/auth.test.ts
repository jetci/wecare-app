import { describe, it, expect } from 'vitest'
import { verifyToken } from './auth'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

const secret = process.env.JWT_SECRET || 'test-secret'
// Ensure secret is set for verifyToken
process.env.JWT_SECRET = secret

describe('verifyToken helper', () => {
  it('returns payload for valid token', async () => {
    const token = jwt.sign({ userId: 'user1', role: 'ADMIN' }, secret)
    const req = new Request('http://localhost', { headers: { Authorization: `Bearer ${token}` } })
    const result = await verifyToken(req)
    // For valid token, function returns payload object directly
    expect(result).toMatchObject({ userId: 'user1', role: 'ADMIN' })
  })

  it('returns 401 NextResponse for missing token', async () => {
    const req = new Request('http://localhost')
    const result = await verifyToken(req)
    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(401)
  })

  it('returns 401 NextResponse for invalid token', async () => {
    const req = new Request('http://localhost', { headers: { Authorization: 'Bearer invalid' } })
    const result = await verifyToken(req)
    expect(result).toBeInstanceOf(NextResponse)
    expect((result as NextResponse).status).toBe(401)
  })
})
