import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET } from './route'
import { mockRides } from '../mocks'
import { verifyToken } from '@/lib/auth'
import { NextResponse } from 'next/server'

vi.mock('@/lib/auth', () => ({ verifyToken: vi.fn() }))

function makeReq(auth = 'Bearer token') {
  return new Request('http://', { headers: { Authorization: auth }, method: 'GET' })
}

describe('[id] route', () => {
  beforeEach(() => {
    mockRides.length = 0
    ;(verifyToken as any).mockReset()
  })

  it('returns 400 for invalid id format', async () => {
    ;(verifyToken as any).mockResolvedValue({ userId: 'u1', role: 'COMMUNITY' })
    const res = await GET(makeReq(), { params: { id: 'invalid' } })
    expect(res.status).toBe(400)
  })

  it('returns 404 when ride not found', async () => {
    ;(verifyToken as any).mockResolvedValue({ userId: 'u1', role: 'COMMUNITY' })
    const res = await GET(makeReq(), { params: { id: '123e4567-e89b-12d3-a456-426614174000' } })
    expect(res.status).toBe(404)
  })

  it('returns ride on success', async () => {
    ;(verifyToken as any).mockResolvedValue({ userId: 'u1', role: 'COMMUNITY' })
    const fake = { id: '123e4567-e89b-12d3-a456-426614174000', patientId: 'p1', date: new Date().toISOString(), status: 'PENDING' }
    mockRides.push(fake)
    const res = await GET(makeReq(), { params: { id: fake.id } })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ride).toEqual(fake)
  })
})
