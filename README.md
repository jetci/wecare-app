# WeCare Application

This project is a reboot of the WeCare application, built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

Refer to `DETAILED_HANDBOOK.md` for full project details, architecture, and developer guidelines.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables by copying `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
