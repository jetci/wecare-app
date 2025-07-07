// src/test-utils.tsx
import React from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '@/context/AuthContext'
import RoleGuard from '@/components/RoleGuard'
import { Role } from '@/types/roles'

export function render(ui: React.ReactElement, options?: RenderOptions) {
  return rtlRender(
    <AuthProvider>
      <RoleGuard allowedRoles={[Role.COMMUNITY, Role.ADMIN, Role.DEVELOPER]}>{ui}</RoleGuard>
    </AuthProvider>,
    options
  )
}

export * from '@testing-library/react'
export { userEvent }
