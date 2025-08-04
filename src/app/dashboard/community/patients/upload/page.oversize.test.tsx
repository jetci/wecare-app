import '@testing-library/jest-dom/vitest';
import React from 'react'
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import UploadPatientDocsPage from './page'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

// Clean up DOM between tests
afterEach(() => cleanup())

// Mocks
vi.mock('next/navigation', async (importOriginal: any) => {
  const actual: any = await importOriginal()
  return { ...actual, useRouter: vi.fn(), useSearchParams: vi.fn() }
})
vi.mock('react-hot-toast', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:mock') })

// Helper to create a valid FileList instance
function makeFileList(file: File): FileList {
  const fileList = { 0: file, length: 1, item: (i: number) => (i === 0 ? file : null), [Symbol.iterator]: function* () { yield file } }
  Object.setPrototypeOf(fileList, FileList.prototype)
  return fileList as unknown as FileList
}

describe('UploadPatientDocsPage oversize validation', () => {
  beforeEach(() => {
    ;(useRouter as any).mockReturnValue({ push: vi.fn() })
    ;(toast.error as any).mockReset()
    ;(toast.success as any).mockReset()
    global.fetch = vi.fn().mockResolvedValue({ ok: true })
  })

  it('shows error when file size exceeds limit', async () => {
    render(<UploadPatientDocsPage />)
    const largeFile = new File(['dummy'], 'bigfile.pdf', { type: 'application/pdf' })
    Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 })
    fireEvent.change(screen.getByLabelText(text => text.includes('สำเนาใบนัดแพทย์')), { target: { files: makeFileList(largeFile) } })
    fireEvent.click(screen.getByRole('button', { name: /ส่งข้อมูล/ }))
    const errorEl = await screen.findByTestId('appointment-error')
    expect(errorEl).toBeInTheDocument()
    expect(errorEl).toHaveTextContent(/ไม่เกิน 5MB/)
  })
})

