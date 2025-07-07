import '@testing-library/jest-dom/vitest';
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RideForm from './RideForm'
import useSWR, { SWRConfig } from 'swr'
import { vi } from 'vitest'

// Mock SWR to include SWRConfig and default hook
vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swr')>();
  return {
    ...actual,
    SWRConfig: actual.SWRConfig,
    default: vi.fn(),
  };
})

describe('RideForm', () => {
  const mockedSWR = useSWR as unknown as jest.Mock
  const onSuccess = vi.fn()

  beforeEach(() => {
    vi.resetAllMocks()
    // default patients data
    mockedSWR.mockReturnValue({ data: { patients: [{ id: '1', firstName: 'A', lastName: 'B', villageName: 'V' }] }, error: null })
  })

  it('shows validation errors when submitting empty form', async () => {
    render(<RideForm onSuccess={onSuccess} />)
    const submitBtn = screen.getByText('ส่งคำขอ')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('กรุณาเลือกผู้ป่วย')).toBeInTheDocument()
      expect(screen.getByText('กรุณาเลือกวันเวลาที่อยู่ในอนาคต')).toBeInTheDocument()
    })
  })

  it('calls onSuccess when cancel button is clicked', () => {
    render(<RideForm onSuccess={onSuccess} />)
    const cancelBtn = screen.getByText('ยกเลิก')
    fireEvent.click(cancelBtn)
    expect(onSuccess).toHaveBeenCalled()  
  })

  it('submits valid data and calls onSuccess', async () => {
    // mock fetch
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })) as any
    // spy alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<RideForm onSuccess={onSuccess} />)

    // select patient
    fireEvent.change(screen.getByLabelText('ผู้ป่วย'), { target: { value: '1' } })
    // set a future date
    const future = new Date(Date.now() + 86400000).toISOString().slice(0,16)
    fireEvent.change(screen.getByLabelText('วันและเวลานัดหมาย'), { target: { value: future } })

    const submitBtn = screen.getByText('ส่งคำขอ')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/rides', expect.any(Object))
      expect(alertSpy).toHaveBeenCalledWith('ส่งคำขอสำเร็จ')
      expect(onSuccess).toHaveBeenCalled()
    })
  })
})

