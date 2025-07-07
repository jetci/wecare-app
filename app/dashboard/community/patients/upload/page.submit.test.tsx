import '@testing-library/jest-dom/vitest';
import React from 'react'
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup } from '@/app/dashboard/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import UploadPatientDocsPage from './page'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

// Clean up between tests
afterEach(() => cleanup())

// Mocks
vi.mock('next/navigation', async (importOriginal: any) => {
  const actual: any = await importOriginal()
  return { ...actual, useRouter: vi.fn(), useSearchParams: vi.fn() }
})
vi.mock('react-hot-toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:mock') })

// Helper to create a FileList instance
type FileMap = { [key: number]: File; length: number; item: (i: number) => File | null }
function makeFileList(file: File): FileList {
  const fileList: FileMap = { 0: file, length: 1, item: (i: number) => (i === 0 ? file : null) }
  Object.setPrototypeOf(fileList, FileList.prototype)
  return fileList as unknown as FileList
}

describe('UploadPatientDocsPage submission', () => {
  const mockPush = vi.fn()

  beforeEach(() => {
    ;(useRouter as any).mockReturnValue({ push: mockPush })
    mockPush.mockReset()
    ;(toast.success as any).mockReset()
    global.fetch = vi.fn().mockResolvedValue({ ok: true })
  })

  it('submits valid files and redirects', async () => {
    render(<UploadPatientDocsPage />)
    const file = new File(['x'], 'ok.pdf', { type: 'application/pdf' })
    Object.defineProperty(file, 'size', { value: 1024 })

    // Fill required fields
    const labels = [
      'หนังสือรับรอง กำนัน/ผู้ใหญ่บ้าน',
      'หนังสือรับรองผู้ป่วยติดเตียง',
      'สำเนาใบนัดแพทย์',
    ]
    labels.forEach(labelText => {
      const input = screen.getByLabelText((t) => t.includes(labelText))
      fireEvent.change(input, { target: { files: makeFileList(file) } })
    })

    fireEvent.click(screen.getByRole('button', { name: /ส่งข้อมูล/ }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })
})

