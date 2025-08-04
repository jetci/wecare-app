import '@testing-library/jest-dom/vitest';
/// <reference types="vitest" />
import { vi } from 'vitest';
// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));
// โหลด mocks ของ next/link, navigation และ context ก่อนอื่น
import '../../../test-utils';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import React from 'react'
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import { useForm, FormProvider } from 'react-hook-form'
import NewPatientPage from './page';

// mocks
vi.mock('./useDirtyCheck', () => ({ useDirtyCheck: () => {} }))
vi.mock('./useNewPatientForm', () => {
  const defaults = { prefix: '', firstName: '', lastName: '', nationalId: '', phone: '', dob: new Date(), photo: [], docAppointment: [], docOther: [] }
  return { useNewPatientForm: () => ({ ...useForm({ defaultValues: defaults }), getValues: () => defaults, trigger: async () => true, formState: { errors: {}, isDirty: false, isSubmitting: false } }) }
})

beforeAll(() => {
  Object.defineProperty(document, 'cookie', { value: 'accessToken=valid', writable: true })
  ;(window as any).location = { href: 'http://localhost/' }
})

beforeEach(() => {
  // mock geolocation via vi.stubGlobal to avoid redefine errors
  vi.stubGlobal('navigator.geolocation', {
    getCurrentPosition: (success: any) => success({ coords: { latitude: 13.7563, longitude: 100.5018 } } as GeolocationPosition),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  });
})

// helper to wrap component with form context
const Wrapper = () => {
  const methods = useForm()
  return <FormProvider {...methods}><NewPatientPage /></FormProvider>
}

describe('หน้าเพิ่มผู้ป่วยใหม่', () => {
  it('ทดสอบความถูกต้องเบื้องต้น', () => expect(true).to.equal(true))

  it('แสดงปุ่มตรวจสอบข้อมูล', () => {
    render(<Wrapper />, { role: 'COMMUNITY', route: '/dashboard/community/patients/new' })
    expect(screen.getByRole('button', { name: /ตรวจสอบข้อมูล/i })).toBeInTheDocument()
  })

  it('ส่งข้อมูลที่ถูกต้องและเปลี่ยนหน้าไปยังหน้าตรวจสอบ', async () => {
    render(<Wrapper />, { role: 'COMMUNITY', route: '/dashboard/community/patients/new' })
    fireEvent.change(screen.getByLabelText(/^ชื่อ$/), { target: { value: 'A' } })
    fireEvent.change(screen.getByLabelText(/^สกุล$/), { target: { value: 'B' } })
    fireEvent.change(screen.getByLabelText(/หมายเลขบัตรประชาชน/), { target: { value: '1234567890123' } })
    fireEvent.change(screen.getByLabelText(/เบอร์โทรศัพท์/), { target: { value: '0900000000' } })
    fireEvent.click(screen.getByRole('button', { name: /ตรวจสอบข้อมูล/i }))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard/community/patients/review'));
  })

  it('ไม่เปลี่ยนหน้าเมื่อฟิลด์ไม่ครบ', async () => {
    render(<Wrapper />, { role: 'COMMUNITY', route: '/dashboard/community/patients/new' })
    fireEvent.click(screen.getByRole('button', { name: /ตรวจสอบข้อมูล/i }))
    await waitFor(() => expect(mockPush).not.toHaveBeenCalled());
  })
})

