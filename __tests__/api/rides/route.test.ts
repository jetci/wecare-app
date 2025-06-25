import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from '@/app/api/rides/route'
import { mockRides } from '@/app/api/rides/mocks'
import { verifyToken } from '@/lib/auth'
import { NextResponse } from 'next/server'

vi.mock('@/lib/auth', () => ({ verifyToken: vi.fn() }))

describe('/api/rides', () => {
  function makeReq(body?: any): Request {
    return { json: () => Promise.resolve(body), headers: new Headers(), url: '' } as unknown as Request
  }

  beforeEach(() => {
    mockRides.length = 0
    ;(verifyToken as any).mockReset()
  })

  it('GET - rejects unauthorized', async () => {
    ;(verifyToken as any).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    )
    const res = await GET(makeReq())
    expect(res.status).toBe(401)
  })

  it('GET - returns rides list on success', async () => {
    ;(verifyToken as any).mockResolvedValue({ userId: 'u1', role: 'COMMUNITY' })
    mockRides.push({ id: 'r1', patientId: 'p1', date: new Date(Date.now() + 10000).toISOString(), status: 'PENDING' })
    const res = await GET(makeReq())
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.rides).toHaveLength(1)
  })

  it('POST - rejects unauthorized', async () => {
    ;(verifyToken as any).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    )
    const res = await POST(makeReq({ patientId: 'p1', date: new Date(Date.now() + 10000).toISOString() }))
    expect(res.status).toBe(401)
  })

  it('POST - validation error', async () => {
    ;(verifyToken as any).mockResolvedValue({ userId: 'u1', role: 'COMMUNITY' })
    const res = await POST(makeReq({ patientId: 'bad', date: 'no' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.success).toBe(false)
    expect(data.error.fieldErrors?.patientId).toBeDefined()
    expect(data.error.fieldErrors?.date).toBeDefined()
  })

  it('POST - creates ride', async () => {
    ;(verifyToken as any).mockResolvedValue({ userId: 'u1', role: 'COMMUNITY' })
    const future = new Date(Date.now() + 10000).toISOString()
    const res = await POST(makeReq({ patientId: 'p1', date: future }))
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.ride).toMatchObject({ patientId: 'p1', date: future })
    expect(mockRides).toHaveLength(1)
  })
})
