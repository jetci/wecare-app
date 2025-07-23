import { describe, it, expect } from 'vitest';
import { isValidThaiID } from '@/schemas/community/patient.schema';

describe('isValidThaiID', () => {
  const validIds = [
    '1101700203451', // example valid ID
    '1101700-203451', // with dash
    '1 101700203451', // with space
    '1234567890128', // another valid example
  ];
  const invalidIds = [
    '1234567890123', // invalid checksum
    '1101700203450', // wrong last digit
    'abcdefghijklm', // non-numeric
    '123', // too short
    '12345678901234', // too long
  ];

  it('should return true for valid Thai national IDs', () => {
    validIds.forEach((id) => {
      expect(isValidThaiID(id)).toBe(true);
    });
  });

  it('should return false for invalid Thai national IDs', () => {
    invalidIds.forEach((id) => {
      expect(isValidThaiID(id)).toBe(false);
    });
  });
});
