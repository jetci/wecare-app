import { describe, it, expect } from 'vitest'
import { uploadSchema } from './schema'

// Mock FileList
function makeFileList(file: File): FileList {
  const fileList = { 0: file, length: 1, item: (i: number) => (i === 0 ? file : null) }
  Object.setPrototypeOf(fileList, FileList.prototype)
  return fileList as unknown as FileList
}

describe('Form Submission Schema (validate with uploadSchema)', () => {
  it('requires at least one file present', () => {
    const data = { certHead: makeFileList(new File([''], 'a.pdf', { type: 'application/pdf' })) }
    const res = uploadSchema.safeParse(data as any)
    expect(res.success).toBe(false)
  })

  it('rejects non-PDF type', () => {
    const bad = new File([''], 'bad.txt', { type: 'text/plain' })
    Object.defineProperty(bad, 'size', { value: 1024 })
    const fl = makeFileList(bad)
    const data = { certHead: fl, certBed: fl, appointment: fl }
    const res = uploadSchema.safeParse(data as any)
    expect(res.success).toBe(false)
  })

  it('rejects file size >5MB', () => {
    const big = new File([''], 'big.pdf', { type: 'application/pdf' })
    Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 })
    const fl = makeFileList(big)
    const data = { certHead: fl, certBed: fl, appointment: fl }
    const res = uploadSchema.safeParse(data as any)
    expect(res.success).toBe(false)
  })

  it('accepts valid files', () => {
    const ok = new File([''], 'ok.pdf', { type: 'application/pdf' })
    Object.defineProperty(ok, 'size', { value: 1024 })
    const fl = makeFileList(ok)
    const data = { certHead: fl, certBed: fl, appointment: fl }
    const res = uploadSchema.safeParse(data as any)
    expect(res.success).toBe(true)
  })
})
