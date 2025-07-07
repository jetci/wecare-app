import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { uploadSchema } from './schema'

// Mock FileList
function makeFileList(file: File): FileList {
  const fileList = { 0: file, length: 1, item: (i: number) => (i === 0 ? file : null) }
  Object.setPrototypeOf(fileList, FileList.prototype)
  return fileList as unknown as FileList
}

describe('uploadSchema validation', () => {
  it('rejects file type not allowed', () => {
    const bad = new File(['x'], 'bad.txt', { type: 'text/plain' })
    const fl = makeFileList(bad)
    const data = { certHead: fl, certBed: fl, appointment: fl }
    const res = uploadSchema.safeParse(data)
    expect(res.success).to.equal(false)
    if (!res.success) {
      const errs = res.error.flatten().fieldErrors
      expect(errs.certHead?.[0]).toMatch(/เฉพาะ JPEG, PNG หรือ PDF/)
    }
  })

  it('rejects file size > 5MB', () => {
    const big = new File([''], 'big.pdf', { type: 'application/pdf' })
    Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 })
    const fl = makeFileList(big)
    const data = { certHead: fl, certBed: fl, appointment: fl }
    const res = uploadSchema.safeParse(data)
    expect(res.success).to.equal(false)
    if (!res.success) {
      const errs = res.error.flatten().fieldErrors
      expect(errs.appointment?.[0]).toMatch(/ไม่เกิน 5MB/)
    }
  })

  it('accepts valid PDF <=5MB', () => {
    const ok = new File([''], 'ok.pdf', { type: 'application/pdf' })
    Object.defineProperty(ok, 'size', { value: 1024 * 100 })
    const fl = makeFileList(ok)
    const data = { certHead: fl, certBed: fl, appointment: fl }
    const res = uploadSchema.safeParse(data)
    expect(res.success).to.equal(true)
  })
})

