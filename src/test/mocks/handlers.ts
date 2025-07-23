import { rest } from 'msw';

export const handlers = [
  // Mock GET /api/patients
  rest.get('/api/patients', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, firstName: 'Test', lastName: 'User', nationalId: '1101700203451', gender: 'ชาย' }
      ])
    );
  }),
  // Add more handlers as needed
];
