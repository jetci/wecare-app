import '@testing-library/jest-dom/vitest';
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import UploadPatientDocsPage from './page'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

// Mocks
vi.mock('next/navigation', () => ({ useRouter: vi.fn() }))
vi.mock('react-hot-toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:mock') })

const mockPush = vi.fn()

beforeEach(() => {
  ;(useRouter as any).mockReturnValue({ push: mockPush })
  mockPush.mockReset()
  ;(toast.error as any).mockReset()
  ;(toast.success as any).mockReset()
  global.fetch = vi.fn().mockResolvedValue({ ok: true })
})

// Polyfill FileList to pass instanceof FileList in JSDOM
const realFileInput = document.createElement('input')
let fileListProto: any
if (realFileInput.files) {
  fileListProto = Object.getPrototypeOf(realFileInput.files)
  ;(global as any).FileList = fileListProto.constructor as { new (): FileList; prototype: FileList }
} else {
  fileListProto = {} as any
  ;(global as any).FileList = function () {} as any
}

// Stub FileList for tests
function fakeFileList(file: File): FileList {
  const list = Object.create(fileListProto) as any
  list[0] = file
  list.length = 1
  list.item = (i: number) => list[i]
  list[Symbol.iterator] = function* () { yield file }
  return list as FileList
}

describe('UploadPatientDocsPage', () => {
  const fields = [
    { name: 'certHead', label: /หนังสือรับรอง กำนัน\/ผู้ใหญ่บ้าน/ },
    { name: 'certBed', label: /หนังสือรับรองผู้ป่วยติดเตียง/ },
    { name: 'appointment', label: /สำเนาใบนัดแพทย์/ },
    { name: 'other', label: /เอกสารอื่นๆ/ },
  ]

  fields.forEach(({ name, label }) => {
    it(`renders ${name} input`, () => {
      render(<UploadPatientDocsPage />)
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    })

    it(`shows image preview when PNG selected in ${name}`, async () => {
      render(<UploadPatientDocsPage />)
      const file = new File(['img'], 'photo.png', { type: 'image/png' })
      const input = screen.getByLabelText(label)
      fireEvent.change(input, { target: { files: fakeFileList(file) } })
      await waitFor(() => expect(screen.getByAltText(`${name}-preview`)).toBeInTheDocument())
    })

    it(`shows filename when PDF selected in ${name}`, async () => {
      render(<UploadPatientDocsPage />)
      const pdfFile = new File(['doc'], 'file.pdf', { type: 'application/pdf' })
      const input = screen.getByLabelText(label)
      fireEvent.change(input, { target: { files: fakeFileList(pdfFile) } })
      await waitFor(() => expect(screen.getByText('file.pdf')).toBeInTheDocument())
    })

    it(`validates invalid type in ${name}`, async () => {
      render(<UploadPatientDocsPage />)
      const bad = new File(['txt'], 'file.txt', { type: 'text/plain' })
      const input = screen.getByLabelText(label)
      fireEvent.change(input, { target: { files: fakeFileList(bad) } })
      fireEvent.click(screen.getByRole('button', { name: /ส่งข้อมูล/ }))
      await waitFor(() => expect(screen.getByText((t) => t.includes('รองรับเฉพาะ') && t.includes('PDF'))).toBeInTheDocument())
    })

    it(`validates oversize in ${name}`, async () => {
      render(<UploadPatientDocsPage />)
      const large = new File([new Uint8Array(6 * 1024 * 1024)], 'large.png', { type: 'image/png' })
      const input = screen.getByLabelText(label)
      fireEvent.change(input, { target: { files: fakeFileList(large) } })
      fireEvent.click(screen.getByRole('button', { name: /ส่งข้อมูล/ }))
      await waitFor(() => expect(screen.getByText((t) => t.includes('5MB'))).toBeInTheDocument())
    })
  })

  it('redirects and shows success toast on upload success', async () => {
    render(<UploadPatientDocsPage />)
    const input = screen.getByLabelText(fields[0].label)
    const file = new File([''], 'f.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: fakeFileList(file) } })
    fireEvent.click(screen.getByRole('button', { name: /ส่งข้อมูล/ }))
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/patients/upload-docs', expect.objectContaining({ method: 'POST' }))
      expect(toast.success).toHaveBeenCalledWith('อัปโหลดสำเร็จ')
      expect(mockPush).toHaveBeenCalledWith('/dashboard/community/patients/review')
    })
  })

  it('shows error toast on upload failure', async () => {
    ;(global.fetch as any).mockResolvedValue({ ok: false })
    render(<UploadPatientDocsPage />)
    const input = screen.getByLabelText(fields[2].label)
    const file = new File([''], 'f.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: fakeFileList(file) } })
    fireEvent.click(screen.getByRole('button', { name: /ส่งข้อมูล/ }))
    await waitFor(() => expect(toast.error).toHaveBeenCalled())
  })
})

