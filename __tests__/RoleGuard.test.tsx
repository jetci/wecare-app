import '@testing-library/jest-dom/vitest';
import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest'

// Mock next/router
const replaceMock = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock }) }))

// Mock AuthContext
const mockUseAuth = vi.fn()
vi.mock('@/context/AuthContext', () => ({ useAuth: () => mockUseAuth() }))

import RoleGuard from '@/components/RoleGuard'
import { Role } from '@/types/roles'

function TestChild() {
  return <div data-testid="child">Allowed Content</div>
}

describe('RoleGuard', () => {
  beforeEach(() => {
    replaceMock.mockClear()
    mockUseAuth.mockReset()
  })
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders children for allowed role', () => {
    mockUseAuth.mockReturnValue({ user: { nationalId: '123' }, role: 'COMMUNITY', isAuthenticated: true })
    const { getByTestId } = render(
      <RoleGuard allowedRoles={[Role.COMMUNITY]}>
        <TestChild />
      </RoleGuard>
    )
    expect(getByTestId('child')).toBeInTheDocument()
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it('redirects when role not allowed', () => {
    mockUseAuth.mockReturnValue({ user: { nationalId: '123' }, role: 'DRIVER', isAuthenticated: true })
    render(
      <RoleGuard allowedRoles={[Role.COMMUNITY]}>
        <TestChild />
      </RoleGuard>
    )
    expect(replaceMock).toHaveBeenCalledWith('/dashboard')
  })

  it('bypasses for developer nationalId', () => {
    mockUseAuth.mockReturnValue({ user: { nationalId: '3500200461028' }, role: 'DEVELOPER', isAuthenticated: true })
    const { getByTestId } = render(
      <RoleGuard allowedRoles={[]}>
        <TestChild />
      </RoleGuard>
    )
    expect(getByTestId('child')).toBeInTheDocument()
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it('does not render or redirect when not authenticated yet', () => {
    mockUseAuth.mockReturnValue({ user: null, role: null, isAuthenticated: false })
    const { queryByTestId } = render(
      <RoleGuard allowedRoles={[Role.ADMIN]}>
        <TestChild />
      </RoleGuard>
    )
    expect(queryByTestId('child')).to.be.null()
    expect(replaceMock).not.toHaveBeenCalled()
  })
})

