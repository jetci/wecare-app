import '@testing-library/jest-dom/vitest';
/// <reference types="vitest" />
import React from 'react';
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import { vi } from 'vitest';

// Stub ResizeObserver
global.ResizeObserver = class { observe(){}; unobserve(){}; disconnect(){}; };

// Mock MapOverview
vi.mock('@/components/dashboard/MapOverview', () => ({ default: () => <div data-testid="map-overview" /> }));

// Component under test
import HealthOfficerDashboardPage from './page';

describe('หน้าหลักแดชบอร์ดเจ้าหน้าที่สาธารณสุข', () => {
  const patients: Patient[] = [
    { id: '1', status: 'PENDING', lat: 0, lng: 0 },
    { id: '2', status: 'IN_CARE', lat: 1, lng: 1 },
    { id: '3', status: 'TRANSFERRED', lat: 2, lng: 2 },
    { id: '4', status: 'PENDING', lat: 3, lng: 3 },
  ];

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ patients }),
    } as unknown as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Data fetching', () => {
    it('แสดงตัวโหลดขณะดึงข้อมูลผู้ป่วย', async () => {
      // clear default fetch mock
      vi.restoreAllMocks();
      vi.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {}));
      await act(async () => {
        render(<HealthOfficerDashboardPage />, { role: 'HEALTH_OFFICER', route: '/dashboard/health-officer' });
      });
      expect(await screen.findByRole('status', { name: 'loading-patients' })).toBeInTheDocument();
    });

    it('แสดงข้อความผิดพลาดเมื่อดึงข้อมูลล้มเหลว', async () => {
      // override default fetch mock for error scenario
      vi.restoreAllMocks();
      // mock fetch ให้ reject เพื่อทดสอบ error state
      vi.spyOn(global, 'fetch').mockRejectedValue(new Error('fail'));
      await act(async () => {
        render(<HealthOfficerDashboardPage />, { role: 'HEALTH_OFFICER', route: '/dashboard/health-officer' });
      });
      expect(await screen.findByRole('alert', { name: 'patient-error' })).toBeInTheDocument();
    });
  });

  describe('KPI summary', () => {
    it('แสดงสถิติ KPI ตามสถานะผู้ป่วย', async () => {
      await act(async () => {
        render(<HealthOfficerDashboardPage />, { role: 'HEALTH_OFFICER', route: '/dashboard/health-officer' });
      });
      // รอให้ loader หายไปก่อน
      await waitFor(() => expect(screen.queryByTestId('loading-patients')).not.toBeInTheDocument());
      // ตรวจสอบการ์ด PENDING
      const pendingCard = screen.getByTestId('kpi-pending');
      await within(pendingCard).findByText('2');
      // ตรวจสอบการ์ด IN_CARE
      const inCareCard = screen.getByTestId('kpi-in-care');
      await within(inCareCard).findByText('1');
      // ตรวจสอบการ์ด TRANSFERRED
      const transferredCard = screen.getByTestId('kpi-transferred');
      await within(transferredCard).findByText('1');
    });
  });

  describe('Map overview', () => {
    it('แสดงแผนที่ภาพรวมผู้ป่วย', async () => {
      await act(async () => {
        render(<HealthOfficerDashboardPage />, { role: 'HEALTH_OFFICER', route: '/dashboard/health-officer' });
      });
      expect(await screen.findByTestId('map-overview')).toBeInTheDocument();
    });
  });

  describe('Broadcast', () => {
    it('เปิดหน้าต่างส่งประกาศฉุกเฉิน', async () => {
      await act(async () => {
        render(<HealthOfficerDashboardPage />, { role: 'HEALTH_OFFICER', route: '/dashboard/health-officer' });
      });
      const button = await screen.findByTestId('broadcast-button');
      fireEvent.click(button);
      await screen.findByTestId('broadcast-modal');
    });

    it('แสดงข้อผิดพลาดเมื่อข้อความว่างหรือยาวเกินกำหนด', async () => {
      await act(async () => {
        render(<HealthOfficerDashboardPage />, { role: 'HEALTH_OFFICER', route: '/dashboard/health-officer' });
      });
      const btn = await screen.findByTestId('broadcast-button');
      fireEvent.click(btn);
      const sendBtn = await screen.findByTestId('broadcast-send');
      fireEvent.click(sendBtn);
      expect(await screen.findByText('กรุณาใส่ข้อความ')).toBeInTheDocument();
      const long = 'a'.repeat(501);
      const textarea = await screen.findByPlaceholderText('ข้อความ');
      fireEvent.change(textarea, { target: { value: long } });
      fireEvent.click(sendBtn);
      expect(await screen.findByText('ข้อความยาวเกิน 500 ตัวอักษร')).toBeInTheDocument();
    });

    it('ส่งประกาศสำเร็จ รีเซ็ตฟอร์มและปิดหน้าต่าง', async () => {
      const patients: Patient[] = [{ id: '1', status: 'PENDING', lat:0, lng:0 }];
      // mock GET then POST
      vi.spyOn(global, 'fetch')
        .mockResolvedValueOnce({ ok: true, json: async ()=>({ patients }) } as unknown as Response)
        .mockResolvedValueOnce({ ok: true, json: async ()=>({ success: true }) } as unknown as Response);
      await act(async () => {
        render(<HealthOfficerDashboardPage />, { role: 'HEALTH_OFFICER', route: '/dashboard/health-officer' });
      });
      const btn = await screen.findByTestId('broadcast-button');
      fireEvent.click(btn);
      const textarea = await screen.findByPlaceholderText('ข้อความ');
      fireEvent.change(textarea, { target: { value: 'Hello' } });
      const sendBtn = await screen.findByTestId('broadcast-send');
      fireEvent.click(sendBtn);
      // รอ modal หายไป
      await waitForElementToBeRemoved(() => screen.queryByTestId('broadcast-modal'));
      // ensure POST called with correct payload
      expect(global.fetch).toHaveBeenCalledWith('/api/notifications', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Hello' }),
      }));
    });
  });

  describe('Access control', () => {
    it('ปฏิเสธการเข้าถึงสำหรับผู้ใช้ที่ไม่ใช่เจ้าหน้าที่สาธารณสุข', async () => {
      await act(async () => {
        render(<HealthOfficerDashboardPage />, { role: 'ADMIN', route: '/dashboard/health-officer' });
      });
      expect(await screen.findByRole('alert', { name: 'access-denied' })).toBeInTheDocument();
    });
  });
});

