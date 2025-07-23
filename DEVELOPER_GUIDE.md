# Developer Guide for Wecare App

## 1. Project Overview

Wecare เป็นเว็บแอปสำหรับจัดการ Community Dashboard, ฟอร์มผู้ป่วย, และสรุปรายงานต่างๆ

## 2. Environment Setup

1. Clone repo
   ```bash
   git clone <repo_url>
   cd wecare-app
   ```
2. ติดตั้ง dependencies
   ```bash
   npm install
   ```
3. สร้างไฟล์ `.env.local` (next.js) หรือ `.env` ที่ root:
   ```env
   # Google Maps API key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your_key>

   # Database
   DATABASE_URL="postgresql://user:pass@localhost:5432/wecare"
   ```
4. สร้างฐานข้อมูลและ seed
   ```bash
   npx prisma migrate dev --name init
   npm run seed
   ```

## 3. Running Locally

```bash
npm run dev     # Next.js on http://localhost:3000
```  

## 4. Testing

### 4.1 Unit Tests (Vitest)

- รันเฉพาะ unit tests ชุมชน:
  ```bash
  npm run test:community-all
  ```
- รันเฉพาะ api:
  ```bash
  npm run test:community-api
  ```
- รัน component/page tests:
  ```bash
  npm run test:community-page
  ```

### 4.2 E2E Tests (Cypress)

```bash
npm run test:community-e2e
```  

### 4.3 Mock API

- ใช้ MSW (Mock Service Worker) หรือ test-utils ไหนที่กำหนดใน `src/test`  
- สามารถดูตัวอย่างใน `cypress` และ `vitest.setup.tsx`

## 5. Form Development Guidelines

- ใช้ **React Hook Form** + **Zod** สำหรับ validation
- สร้าง schema ที่ `src/schemas/community/*.schema.ts`
- ใน component ฟอร์ม ใช้ `zodResolver<typeof schema>` เพื่อ type-safe resolver
- Strip space & dash ก่อน validate เช่น nationalId
- แสดง inline error message
- Reset form หลัง submit สำเร็จ

## 6. Conventions & Folder Structure

```
├─ src/
│  ├─ components/
│  ├─ schemas/
│  ├─ hooks/
│  └─ test/              # custom test utils, mocks
├─ cypress/              # E2E tests
├─ prisma/               # schema + seed
├─ vitest.config.ts
└─ DEVELOPER_GUIDE.md
```

## 7. Next Steps

- เพิ่ม rate-limit/ACL ใน `/api` routes
- Refactor AddPatientModal typing
- เพิ่ม skeleton loader ใน Dashboard
- เตรียม Group 2 features (notifications, map, reports)
