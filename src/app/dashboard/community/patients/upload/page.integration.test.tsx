import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, vi, beforeEach, afterEach, expect } from 'vitest'
import UploadPatientDocsPage from './page'

// Mock toast and router
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

// Helper to create file
function createFile(name: string, size: number, type: string) {
  const blob = new Blob(['a'.repeat(size)], { type })
  return new File([blob], name, { type })
}

describe('UploadPatientDocsPage Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.restoreAllMocks()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('แสดง preview เมื่อเลือกไฟล์ภาพ', async () => {
    render(<UploadPatientDocsPage />)
    const input = screen.getByTestId('certHead-input') as HTMLInputElement
    const file = createFile('test.png', 1024, 'image/png')
    await userEvent.upload(input, file)
    expect(await screen.findByTestId('certHead-preview')).toBeInTheDocument()
  })

  it('แสดง error เมื่อไฟล์ขนาดเกิน', async () => {
    render(<UploadPatientDocsPage />)
    const input = screen.getByTestId('certHead-input') as HTMLInputElement
    const bigFile = createFile('big.png', 6 * 1024 * 1024, 'image/png')
    await userEvent.upload(input, bigFile)
    expect(await screen.findByTestId('certHead-error')).toHaveTextContent('File size exceeds limit')
  })

  it('แสดง warning เมื่อชื่อไฟล์ซ้ำ', async () => {
    render(<UploadPatientDocsPage />)
    const input1 = screen.getByTestId('certHead-input') as HTMLInputElement
    const input2 = screen.getByTestId('certBed-input') as HTMLInputElement
    const file = createFile('dup.png', 1024, 'image/png')
    await userEvent.upload(input1, file)
    await userEvent.upload(input2, file)
    expect(await screen.findByTestId('certBed-error')).toHaveTextContent('Duplicate file name')
  })

  it('submit สำเร็จและรีเซ็ตฟอร์ม', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true } as any)
    const toast = require('react-hot-toast').toast
    const { push } = require('next/navigation').useRouter()
    render(<UploadPatientDocsPage />)
    const input = screen.getByTestId('certHead-input') as HTMLInputElement
    const file = createFile('ok.png', 1024, 'image/png')
    await userEvent.upload(input, file)

    const button = screen.getByRole('button', { name: /ส่งข้อมูล/i })
    await userEvent.click(button)
    expect(button).toBeDisabled()
    await waitFor(() => expect(toast.success).toHaveBeenCalled())
    expect(push).toHaveBeenCalledWith('/dashboard/community/patients/review')
    expect(input.value).toBe('')
  })

  it('submit ล้มเหลว แสดง error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false } as any)
    const toast = require('react-hot-toast').toast
    render(<UploadPatientDocsPage />)
    const input = screen.getByTestId('certHead-input') as HTMLInputElement
    const file = createFile('fail.png', 1024, 'image/png')
    await userEvent.upload(input, file)

    const button = screen.getByRole('button', { name: /ส่งข้อมูล/i })
    await userEvent.click(button)
    await waitFor(() => expect(toast.error).toHaveBeenCalled())
  })
})
