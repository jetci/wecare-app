This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🧪 การทดสอบและการตรวจสอบความถูกต้องของเอกสารอัปโหลด

### 🔹 แนวทางการรีแฟคเตอร์

- Validation ถูกแยกออกจาก Component และย้ายไปไว้ที่ `uploadSchema.ts` ด้วย Zod
- ใช้ `.refine()` เพื่อตรวจสอบ:
  - ประเภทไฟล์ (เฉพาะ `application/pdf`)
  - ขนาดไฟล์ (ต้องไม่เกิน 5MB)

### 🔹 ไฟล์ที่เกี่ยวข้อง

- `uploadSchema.ts` – Logic validation ทั้งหมด
- `formSubmissionSchema.test.ts` – ทดสอบ schema validation
- ไฟล์ UI tests เช่น `page.test.tsx`, `page.submit.test.tsx` ถูก skip ชั่วคราว

### 🔹 การรันเฉพาะ Unit Test schema

```bash
node --max-old-space-size=512 node_modules/vitest/vitest.mjs run src/app/dashboard/community/patients/upload/formSubmissionSchema.test.ts
```
