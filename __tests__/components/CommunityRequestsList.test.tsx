import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import CommunityRequestsPage from '@/app/community/requests/page';

// Mock useCommunityRequests
vi.mock('@/hooks/useCommunityRequests', () => {
  return {
    useCommunityRequests: vi.fn(),
  };
});

const mockUseCommunityRequests = require('@/hooks/useCommunityRequests').useCommunityRequests;

const mockData = [
  {
    id: 1,
    nationalId: '1234567890123',
    type: 'help',
    status: 'pending',
    details: 'ขอความช่วยเหลือ',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    nationalId: '9876543210987',
    type: 'info',
    status: 'approved',
    details: 'สอบถามข้อมูล',
    createdAt: new Date().toISOString(),
  },
];

describe('CommunityRequestsPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('แสดง skeleton loader ขณะ loading', () => {
    mockUseCommunityRequests.mockReturnValue({ data: [], loading: true, error: null });
    render(<CommunityRequestsPage />);
    expect(screen.getAllByText('', { selector: '.animate-pulse' }).length).toBeGreaterThan(0);
  });

  it('แสดง error message เมื่อ error', () => {
    mockUseCommunityRequests.mockReturnValue({ data: [], loading: false, error: 'เกิดข้อผิดพลาด' });
    render(<CommunityRequestsPage />);
    expect(screen.getByText('เกิดข้อผิดพลาด')).toBeInTheDocument();
  });

  it('แสดงตารางข้อมูลเมื่อโหลดสำเร็จ', () => {
    mockUseCommunityRequests.mockReturnValue({ data: mockData, loading: false, error: null });
    render(<CommunityRequestsPage />);
    expect(screen.getByText('1234567890123')).toBeInTheDocument();
    expect(screen.getByText('9876543210987')).toBeInTheDocument();
    expect(screen.getByText('help')).toBeInTheDocument();
    expect(screen.getByText('info')).toBeInTheDocument();
  });

  it('แสดงข้อความ "ไม่พบข้อมูล" เมื่อไม่มีข้อมูล', () => {
    mockUseCommunityRequests.mockReturnValue({ data: [], loading: false, error: null });
    render(<CommunityRequestsPage />);
    expect(screen.getByText('ไม่พบข้อมูล')).toBeInTheDocument();
  });

  it('สามารถกรองข้อมูลผ่าน input ได้', async () => {
    mockUseCommunityRequests.mockReturnValue({ data: mockData, loading: false, error: null });
    render(<CommunityRequestsPage />);
    const nationalIdInput = screen.getByPlaceholderText('ค้นหารหัสประชาชน');
    fireEvent.change(nationalIdInput, { target: { value: '1234' } });
    expect(nationalIdInput).toHaveValue('1234');
  });

  it('สามารถกดปุ่ม Next/Prev ได้', async () => {
    mockUseCommunityRequests.mockReturnValue({ data: mockData, loading: false, error: null });
    render(<CommunityRequestsPage />);
    const nextBtn = screen.getByText('Next');
    const prevBtn = screen.getByText('Prev');
    fireEvent.click(nextBtn);
    fireEvent.click(prevBtn);
    expect(nextBtn).toBeInTheDocument();
    expect(prevBtn).toBeInTheDocument();
  });
});
