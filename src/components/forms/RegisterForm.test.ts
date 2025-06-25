import { describe, it, expect } from 'vitest'
import { registerSchema } from './RegisterForm'

const validData = {
  prefix: 'Mr',
  firstName: 'John',
  lastName: 'Doe',
  nationalId: '1234567890123',
  password: 'secret1',
  confirmPassword: 'secret1',
  role: 'COMMUNITY' as const
}

describe('RegisterForm validation', () => {
  it('accepts valid data', () => {
    expect(() => registerSchema.parse(validData)).not.toThrow()
  })

  it('rejects empty prefix', () => {
    expect(() => registerSchema.parse({ ...validData, prefix: '' })).toThrow()
  })

  it('rejects invalid nationalId length', () => {
    expect(() => registerSchema.parse({ ...validData, nationalId: '123' })).toThrow()
  })

  it('rejects mismatched passwords', () => {
    expect(() => registerSchema.parse({ ...validData, confirmPassword: 'other' })).toThrow()
  })

  it('rejects missing role', () => {
    // @ts-expect-error
    expect(() => registerSchema.parse({ ...validData, role: '' })).toThrow()
  })
})
