import React from 'react';
// Mock auth context to simulate admin user
import { vi, type Mock } from 'vitest';
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ isAdmin: true }) }));
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationsPage from './page';

vi.mock('../../hooks/useNotifications');
const mockUseNotifications = useNotifications as unknown as Mock;

describe('NotificationsPage', () => {
  it('แสดง spinner ขณะโหลด', () => {
    mockUseNotifications.mockReturnValue({ notifications: [], isLoading: true, error: null, deleteNotification: vi.fn(), refetch: vi.fn() });
    render(<NotificationsPage />);
    expect(screen.getByTestId('notifications-loading')).toBeInTheDocument();
  });

  it('แสดงข้อความ error เมื่อโหลดล้มเหลว', () => {
    mockUseNotifications.mockReturnValue({ notifications: [], isLoading: false, error: new Error(), deleteNotification: vi.fn(), refetch: vi.fn() });
    render(<NotificationsPage />);
    expect(screen.getByTestId('notifications-error')).toBeInTheDocument();
  });

  it('แสดงข้อความไม่มีแจ้งเตือนเมื่อ data ว่าง', () => {
    mockUseNotifications.mockReturnValue({ notifications: [], isLoading: false, error: null, deleteNotification: vi.fn(), refetch: vi.fn() });
    render(<NotificationsPage />);
    expect(screen.getByTestId('no-notifications')).toBeInTheDocument();
  });

  it('แสดงรายการแจ้งเตือนเมื่อมี data', () => {
    const items = [{ id: '1', message: 'ข้อความทดสอบ' }];
    mockUseNotifications.mockReturnValue({ notifications: items, isLoading: false, error: null, deleteNotification: vi.fn(), refetch: vi.fn() });
    render(<NotificationsPage />);
    const container = screen.getByTestId('notifications-container');
    expect(container).toHaveClass('flex', 'flex-wrap');
    const cards = screen.getAllByTestId('notification-card');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent('ข้อความทดสอบ');
    expect(screen.getByTestId('notification-view-1')).toHaveAttribute('aria-label', 'View notification');
    expect(screen.getByTestId('notification-delete-1')).toHaveAttribute('aria-label', 'Delete notification');
  });

  it('แสดงไม่มีแจ้งเตือนเมื่อ data เป็น empty array', () => {
    mockUseNotifications.mockReturnValue({ notifications: [], isLoading: false, error: null, deleteNotification: vi.fn(), refetch: vi.fn() });
    render(<NotificationsPage />);
    expect(screen.getByTestId('no-notifications')).toBeInTheDocument();
  });

  it('เปิด view modal และปิดได้', () => {
    const items = [{ id: '1', message: 'ข้อความดูรายละเอียด' }];
    mockUseNotifications.mockReturnValue({ notifications: items, isLoading: false, error: null, deleteNotification: vi.fn(), refetch: vi.fn() });
    render(<NotificationsPage />);
    act(() => {
      fireEvent.click(screen.getByTestId('notification-view-1'));
    });
    expect(screen.getByTestId('view-modal')).toBeInTheDocument();
    expect(screen.getByTestId('view-message')).toHaveTextContent('ข้อความดูรายละเอียด');
    act(() => {
      fireEvent.click(screen.getByTestId('view-close'));
    });
    expect(screen.queryByTestId('view-modal')).toBeNull();
  });

  it('delete notification success triggers hook and toast', async () => {
    const mockDelete = vi.fn().mockResolvedValue(true);
    mockUseNotifications.mockReturnValue({ notifications: [{ id: '1', message: 'ลบสำเร็จ' }], isLoading: false, error: null, deleteNotification: mockDelete, refetch: vi.fn() });
    render(<NotificationsPage />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('notification-delete-1'));
    });
    expect(mockDelete).toHaveBeenCalledWith('1');
  });

  it('delete failure triggers hook return false', async () => {
    const mockDelete = vi.fn().mockResolvedValue(false);
    mockUseNotifications.mockReturnValue({ notifications: [{ id: '1', message: 'ลบล้มเหลว' }], isLoading: false, error: null, deleteNotification: mockDelete, refetch: vi.fn() });
    render(<NotificationsPage />);
    await act(async () => {
      fireEvent.click(screen.getByTestId('notification-delete-1'));
    });
    expect(mockDelete).toHaveBeenCalledWith('1');
  });
});
