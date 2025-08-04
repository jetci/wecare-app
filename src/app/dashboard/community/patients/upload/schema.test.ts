import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest'
import { uploadSchema } from './schema'

// Mock FileList with prototype
function makeFileListMock(file: File): FileList {
  const fileList = { 0: file, length: 1, item: (i: number) => (i === 0 ? file : null) }
  Object.setPrototypeOf(fileList, FileList.prototype)
  return fileList as unknown as FileList
}

describe('uploadSchema validation', () => {
  it('rejects appointment file > 5MB', () => {
    const largeFile = new File(['x'], 'large.pdf', { type: 'application/pdf' })
    Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 })
    const fileList = makeFileListMock(largeFile)
    const data = {
      certHead: fileList,
      certBed: fileList,
      appointment: fileList,
      other: makeFileListMock(new File(['x'], 'small.pdf', { type: 'application/pdf' })),
    }
    const result = uploadSchema.safeParse(data)
    expect(result.success).to.equal(false)
    if (!result.success) {
      const err = result.error.flatten().fieldErrors.appointment
      expect(err).toBeDefined()
      expect(err?.[0]).toMatch(/ไม่เกิน 5MB/)
    }
  })

  it('accepts valid appointment file <= 5MB', () => {
    const validFile = new File(['x'], 'valid.pdf', { type: 'application/pdf' })
    Object.defineProperty(validFile, 'size', { value: 1024 })
    const fileList = makeFileListMock(validFile)
    const data = {
      certHead: fileList,
      certBed: fileList,
      appointment: fileList,
      other: makeFileListMock(validFile),
    }
    const result = uploadSchema.safeParse(data)
    expect(result.success).to.equal(true)
  })
})

