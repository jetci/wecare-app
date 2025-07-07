import dotenv from 'dotenv';
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : undefined });

import express, { Request, Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import RealRedis from 'ioredis';
import RedisMock from 'ioredis-mock';

// Load env vars
const {
  PORT = '4000',
  REDIS_URL = 'redis://localhost:6379',
  JWT_SECRET,
  CORS_ORIGIN = 'http://localhost:3000',
  NODE_ENV = 'development',
} = process.env;

if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET');
  process.exit(1);
}

// Init Redis: mock in non-prod
const redis = NODE_ENV === 'production'
  ? new RealRedis(REDIS_URL)
  : new RedisMock();
redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.warn('Redis error:', err));

// Setup Express
const app = express();
app.use(helmet());
app.use(
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
);
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Auth routes
import authRouter from './routes/auth';
app.use('/api/auth', authRouter);



export default app;
