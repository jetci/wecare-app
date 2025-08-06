import { Role } from '@prisma/client';

export interface AuthSession {
  userId: string;
  name: string;

  role: Role;
  iat: number;
  exp: number;
}
