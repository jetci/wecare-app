/// <reference types="vitest" />
import { vi } from 'vitest'
// Mock route params
vi.mock('next/navigation', () => ({ __esModule: true, useParams: () => ({ id: '123' }) }))
// Mock custom hook
vi.mock('../../../../hooks/useCommunityHistory', () => ({ __esModule: true, useCommunityHistory: vi.fn() }))
vi.mock('../../../../components/ui/Spinner', () => {
  const React = require('react');
  return { __esModule: true, Spinner: (props: any) => <div role="status" {...props} /> };
})
vi.mock('../../../../components/dashboard/community/Timeline', () => {
  const React = require('react');
  return { __esModule: true, default: ({ data }: any) => data.length ? <ul data-testid="timeline-list" /> : <p data-testid="timeline-empty" /> };
})

import { useCommunityHistory } from '../../../../hooks/useCommunityHistory'
import React from 'react'
import { CacheStats, JobStats, DeploymentStats, SystemHealth, HealthPoint, Notification, Community, Patient } from '@/types/dashboard'
import { render, screen, fireEvent, waitFor, act, within, waitForElementToBeRemoved, cleanup, renderHook } from '@/app/dashboard/test-utils'
import CommunityHistoryPage from './page'

// Create a typed mock for useCommunityHistory
const useCommunityHistoryMockTyped = useCommunityHistory as unknown as { mockReset: () => void; mockReturnValue: (arg: any) => void };

describe('CommunityHistoryPage', () => {
  beforeEach(() => {
    useCommunityHistoryMockTyped.mockReset()
    useCommunityHistoryMockTyped.mockReturnValue({ itemsList: [], error: null, isLoading: false, loadMore: () => {} })
  })

  it('renders title for COMMUNITY role', async () => {
    render(<CommunityHistoryPage />, { role: 'COMMUNITY', route: '/dashboard/community/history' })
    expect(await screen.findByRole('heading', { name: 'ประวัติการแจ้ง' })).toBeInTheDocument()
  })

  it('shows loading spinner', () => {
    useCommunityHistoryMockTyped.mockReturnValue({ itemsList: [], error: null, isLoading: true, loadMore: () => {} })
    render(<CommunityHistoryPage />, { role: 'COMMUNITY', route: '/dashboard/community/history' })
    const statuses = screen.getAllByRole('status')
    expect(statuses.length).toBeGreaterThan(0)
  })

  it('shows error message', () => {
    useCommunityHistoryMockTyped.mockReturnValue({ itemsList: [], error: new Error(), isLoading: false, loadMore: () => {} })
    render(<CommunityHistoryPage />, { role: 'COMMUNITY', route: '/dashboard/community/history' })
    expect(screen.getByRole('alert')).toHaveTextContent('เกิดข้อผิดพลาดในการโหลดประวัติ')
  })

  it('renders empty timeline and date filters', () => {
    render(<CommunityHistoryPage />, { role: 'COMMUNITY', route: '/dashboard/community/history' })
    expect(screen.getByTestId('timeline-empty')).toBeInTheDocument()
    expect(screen.getByLabelText('จากวันที่')).toBeInTheDocument()
    expect(screen.getByLabelText('ถึงวันที่')).toBeInTheDocument()
  })

  it('renders items in table and load more button', () => {
    useCommunityHistoryMockTyped.mockReturnValue({ itemsList: [{ id: '1', date: '2025-05-30', event: 'e', caretaker: 'c' }], error: null, isLoading: false, loadMore: () => {} })
    render(<CommunityHistoryPage />, { role: 'COMMUNITY', route: '/dashboard/community/history' })
    expect(screen.getByRole('table', { name: 'History Table' })).toBeInTheDocument()
    expect(screen.getByText('2025-05-30')).toBeInTheDocument()
    expect(screen.getByText('e')).toBeInTheDocument()
    expect(screen.getByText('c')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'โหลดเพิ่มเติม' })).toBeInTheDocument()
  })

  it('redirects non-COMMUNITY role to /dashboard', async () => {
    render(<CommunityHistoryPage />, { role: 'GUEST', route: '/dashboard/community/history' })
    await waitFor(() => expect(window.location.pathname).toBe('/dashboard'))
  })
})
