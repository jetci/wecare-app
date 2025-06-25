/// <reference types="vitest" />
import React from 'react';

import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import useSWR, { SWRConfig } from 'swr';
import { vi } from 'vitest';
import CommunityNotificationsPage, { Notification } from './page';

// Mock SWR to include SWRConfig and default hook
vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swr')>();
  return {
    ...actual,
    SWRConfig: actual.SWRConfig,
    default: vi.fn(),
  };
});

const useSWRMock = useSWR as unknown as { mockReturnValue: (arg:any) => void; mockReset: ()=> void };

describe('CommunityNotificationsPage', () => {
  beforeEach(() => {
    useSWRMock.mockReset();
  });

  it('renders heading and filters', () => {
    useSWRMock.mockReturnValue({ data: [], error: null, isLoading: false });
    render(<CommunityNotificationsPage params={{ communityId: '1' }} />);
    expect(screen.getByRole('heading', { name: 'การแจ้งเตือนย้อนหลัง' })).toBeInTheDocument();
    expect(screen.getByLabelText('ประเภทการแจ้งเตือน')).toBeInTheDocument();
    expect(screen.getByLabelText('ค้นหา')).toBeInTheDocument();
  });

  it('shows loading spinner', () => {
    useSWRMock.mockReturnValue({ data: undefined, error: null, isLoading: true });
    render(<CommunityNotificationsPage params={{ communityId: '1' }} />);
    expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
  });

  it('shows error message', () => {
    useSWRMock.mockReturnValue({ data: undefined, error: new Error(), isLoading: false });
    render(<CommunityNotificationsPage params={{ communityId: '1' }} />);
    // Use flexible matcher for toast/error text
    expect(
      screen.getByText((content) => content.includes('เกิดข้อผิดพลาดในการโหลดการแจ้งเตือน'))
    ).toBeInTheDocument();
  });

  it('shows no notifications when list is empty', () => {
    useSWRMock.mockReturnValue({ data: [], error: null, isLoading: false });
    render(<CommunityNotificationsPage params={{ communityId: '1' }} />);
    expect(screen.getByTestId('no-notifications')).toBeInTheDocument();
  });

  it('renders notifications list with badges', () => {
    const items: Notification[] = [
      { id: '1', date: '2025-06-01', sender: 'Alice', type: 'info', message: 'Info msg' },
      { id: '2', date: '2025-06-02', sender: 'Bob', type: 'warning', message: 'Warn msg' },
    ];
    useSWRMock.mockReturnValue({ data: items, error: null, isLoading: false });
    render(<CommunityNotificationsPage params={{ communityId: '1' }} />);
    expect(screen.getByText('2025-06-01 by Alice')).toBeInTheDocument();
    expect(screen.getByText('Info msg')).toBeInTheDocument();
    expect(screen.getByText('INFO')).toBeInTheDocument();
    expect(screen.getByText('2025-06-02 by Bob')).toBeInTheDocument();
    expect(screen.getByText('Warn msg')).toBeInTheDocument();
    expect(screen.getByText('WARNING')).toBeInTheDocument();
  });

  it('filters by type', () => {
    const items: Notification[] = [
      { id: '1', date: '2025-06-01', sender: 'Alice', type: 'info', message: 'Info msg' },
      { id: '2', date: '2025-06-02', sender: 'Bob', type: 'warning', message: 'Warn msg' },
    ];
    useSWRMock.mockReturnValue({ data: items, error: null, isLoading: false });
    render(<CommunityNotificationsPage params={{ communityId: '1' }} />);
    fireEvent.change(screen.getByLabelText('ประเภทการแจ้งเตือน'), { target: { value: 'warning' } });
    expect(screen.queryByText('Info msg')).toBeNull();
    expect(screen.getByText('Warn msg')).toBeInTheDocument();
  });

  it('filters by keyword', () => {
    const items: Notification[] = [
      { id: '1', date: '2025-06-01', sender: 'Alice', type: 'info', message: 'Hello world' },
      { id: '2', date: '2025-06-02', sender: 'Bob', type: 'info', message: 'Another message' },
    ];
    useSWRMock.mockReturnValue({ data: items, error: null, isLoading: false });
    render(<CommunityNotificationsPage params={{ communityId: '1' }} />);
    fireEvent.change(screen.getByLabelText('ค้นหา'), { target: { value: 'another' } });
    expect(screen.queryByText('Hello world')).toBeNull();
    expect(screen.getByText('Another message')).toBeInTheDocument();
  });

  it('renders all notifications as list items by default', () => {
    const items: Notification[] = [
      { id: '1', date: '2025-06-01', sender: 'Alice', type: 'info', message: 'Info msg' },
      { id: '2', date: '2025-06-02', sender: 'Bob', type: 'warning', message: 'Warn msg' },
    ];
    useSWRMock.mockReturnValue({ data: items, error: null, isLoading: false });
    render(<CommunityNotificationsPage params={{ communityId: '1' }} />);
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(items.length);
  });

  it('filters by type and keyword together correctly', () => {
    const items: Notification[] = [
      { id: '1', date: '2025-06-01', sender: 'Alice', type: 'info', message: 'Hello World' },
      { id: '2', date: '2025-06-02', sender: 'Bob', type: 'warning', message: 'Another Test' },
      { id: '3', date: '2025-06-03', sender: 'Carol', type: 'info', message: 'HELLO AGAIN' },
    ];
    useSWRMock.mockReturnValue({ data: items, error: null, isLoading: false });
    render(<CommunityNotificationsPage params={{ communityId: '1' }} />);
    // filter to info type
    fireEvent.change(screen.getByLabelText('ประเภทการแจ้งเตือน'), { target: { value: 'info' } });
    // keyword filter case-insensitive
    fireEvent.change(screen.getByLabelText('ค้นหา'), { target: { value: 'hello' } });
    const filtered = screen.getAllByRole('listitem');
    expect(filtered).toHaveLength(2);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('HELLO AGAIN')).toBeInTheDocument();
  });
});
