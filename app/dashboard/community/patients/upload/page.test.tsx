import '@testing-library/jest-dom/vitest';
import React from 'react'
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup } from '@/app/dashboard/test-utils'

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import UploadPatientDocsPage from './page'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

// Mocks
vi.mock('next/navigation', async (importOriginal: any) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
  };
})
vi.mock('react-hot-toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:mock') })

afterEach(() => cleanup());
// Use real DataTransfer and FileList
// Removed stubGlobal DataTransfer for Node.js environment
// Removed stubGlobal FileList for Node.js environment

// Helper to create a FileList
function makeFileList(file: File): FileList {
  const fileList = {
    0: file,
    length: 1,
    item: (i: number) => (i === 0 ? file : null),
    [Symbol.iterator]: function* () { yield file; }
  };
  Object.setPrototypeOf(fileList, FileList.prototype);
  return fileList as FileList;
}

const mockPush = vi.fn()

describe('UploadPatientDocsPage', () => {
  afterEach(() => cleanup());
  
  beforeEach(() => {
    ;(useRouter as any).mockReturnValue({ push: mockPush })
    mockPush.mockReset()
    ;(toast.error as any).mockReset()
    ;(toast.success as any).mockReset()
    global.fetch = vi.fn().mockResolvedValue({ ok: true })
  
  })

  it('renders file inputs' , () => {
    render(<UploadPatientDocsPage />)
    expect(screen.getByLabelText(text => text.includes('หนังสือรับรอง กำนัน/ผู้ใหญ่บ้าน'))).toBeInTheDocument()
    expect(screen.getByLabelText(text => text.includes('หนังสือรับรองผู้ป่วยติดเตียง'))).toBeInTheDocument()
  })

  it('shows preview when image selected' , async () => {
    render(<UploadPatientDocsPage />)
    const file = new File(['dummy'], 'photo.png', { type: 'image/png' })
    const input = screen.getByLabelText(text => text.includes('สำเนาใบนัดแพทย์'))
    fireEvent.change(input, { target: { files: makeFileList(file) } })
    await screen.findByAltText('appointment-preview')
  })

  it('validates file type and size' , async () => {
    render(<UploadPatientDocsPage />)
    const badFile = new File(['dummy'], 'doc.txt', { type: 'text/plain' })
    const input = screen.getByLabelText(text => text.includes('เอกสารอื่นๆ'))
    fireEvent.change(input, { target: { files: makeFileList(badFile) } })
    fireEvent.click(screen.getByRole('button', { name: /ส่งข้อมูล/ }))
    const alerts = screen.getAllByRole('alert').map(el => el.textContent)
    expect(alerts.some(t => t?.includes('PDF'))).to.be.true()
  })

  it('submits valid files and redirects', async () => {
    render(<UploadPatientDocsPage />)
    const file = new File(['dummy'], 'file.pdf', { type: 'application/pdf' })
    const inputs = [
      screen.getByLabelText(text => text.includes('หนังสือรับรอง กำนัน/ผู้ใหญ่บ้าน')),
      screen.getByLabelText(text => text.includes('หนังสือรับรองผู้ป่วยติดเตียง')),
      screen.getByLabelText(text => text.includes('สำเนาใบนัดแพทย์')),
      screen.getByLabelText(text => text.includes('เอกสารอื่นๆ')),
    ]
    fireEvent.change(inputs[0], { target: { files: makeFileList(file) } })
    fireEvent.click(screen.getByRole('button', { name: /ส่งข้อมูล/ }))
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/patients/upload-docs', expect.objectContaining({ method: 'POST' }))
      expect(toast.success).toHaveBeenCalledWith('อัปโหลดสำเร็จ')
      expect(mockPush).toHaveBeenCalledWith('/dashboard/community/patients/review')
    })
  })

  it('shows error toast on upload failure' , async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false })
    render(<UploadPatientDocsPage />)
    const file = new File(['dummy'], 'file.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(text => text.includes('สำเนาใบนัดแพทย์'))
    fireEvent.change(input, { target: { files: makeFileList(file) } })
    fireEvent.click(screen.getByRole('button', { name: /ส่งข้อมูล/ }))
    await waitFor(() => expect(toast.error).toHaveBeenCalled())
  })

  it('shows preview when PDF selected' , async () => {
    render(<UploadPatientDocsPage />)
    const file = new File(['dummy'], 'doc.pdf', { type: 'application/pdf' })
    const input = screen.getByLabelText(text => text.includes('เอกสารอื่นๆ'))
    fireEvent.change(input, { target: { files: makeFileList(file) } })
    await screen.findByText('doc.pdf')
  })

  it('shows error when file size exceeds limit', async () => {
    render(<UploadPatientDocsPage />)
    const largeFile = new File(['dummy'], 'bigfile.pdf', { type: 'application/pdf' });
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });
    const valid = new File(['ok'], 'file.pdf', { type: 'application/pdf' })
    fireEvent.change(screen.getByLabelText(text => text.includes('หนังสือรับรอง กำนัน')), { target: { files: makeFileList(valid) } })
    fireEvent.change(screen.getByLabelText(text => text.includes('หนังสือรับรองผู้ป่วยติดเตียง')), { target: { files: makeFileList(valid) } })
    const input = screen.getByLabelText(text => text.includes('สำเนาใบนัดแพทย์'))
    fireEvent.change(input, { target: { files: makeFileList(largeFile) } })
    fireEvent.click(screen.getByRole('button', { name: /ส่งข้อมูล/ }))
    await waitFor(() => {
      const el = screen.getByTestId('appointment-error');
      expect(el).toBeInTheDocument();
      expect(el).toHaveTextContent(/ไม่เกิน 5MB/);
    }, { timeout: 1500 })
  })
})

