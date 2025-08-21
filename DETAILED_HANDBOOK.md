# 📘 WeCare DETAILED HANDBOOK

> คู่มือนี้จัดทำขึ้นเพื่อให้ **SA (System Analyst)**, **Dev (Developer)** และ **QA (Tester)**  
> สามารถทำงานร่วมกันได้อย่างมีประสิทธิภาพ เข้าใจตรงกัน และลดความสับสนระหว่างทีม

---

## 1. ภาพรวมระบบ (System Overview)

### 1.1 Feature Map & สถานะ

| Feature                   | Status         | Description                                           |
|--------------------------|----------------|-------------------------------------------------------|
| **User Management**       | ✅ Completed   | ลงทะเบียน, เข้าสู่ระบบ, จัดการโปรไฟล์               |
| **Patient Management**    | ✅ Completed   | ลงทะเบียน/แก้ไขข้อมูลผู้ป่วย                         |
| **Ride Request**          | ✅ Completed   | ประชาชน/เจ้าหน้าที่ร้องขอการเดินทางให้ผู้ป่วย       |
| **Admin Ride Management** | ✅ Completed   | แอดมินจัดการ/อนุมัติ/จ่ายงานการเดินทาง              |
| **Driver Dashboard**      | 🚧 In-Progress| คนขับดูงาน, อัปเดตสถานะการเดินทาง                   |
| **Executive Dashboard**   | 📝 Planned     | แดชบอร์ดสำหรับผู้บริหารดูสถิติภาพรวม                |

### 1.2 สถาปัตยกรรม (Architecture)

- **Framework**: Next.js 14 (App Router)  
- **Language**: TypeScript  
- **Styling**: Tailwind CSS  
- **Database**: PostgreSQL  
- **ORM**: Prisma  
- **Authentication**: JWT (httpOnly cookie)  
- **Deployment**: Vercel  
- **CI/CD**: GitHub Actions

---

## 2. โครงสร้างและการตั้งค่า (App Structure & Setup)

### 2.1 โครงสร้างโฟลเดอร์หลัก


/
├── .github/workflows/ # GitHub Actions (CI/CD)
├── prisma/ # Prisma schema + seed
├── public/ # Static assets
├── src/
│ ├── app/ # Next.js App Router
│ │ ├── (auth)/ # Login/Register
│ │ ├── (dashboard)/ # Role-based dashboards
│ │ ├── api/ # API Routes
│ │ └── admin/ # Admin pages
│ ├── components/ # React components
│ ├── context/ # React Context
│ ├── lib/ # Helper functions (e.g., prisma.ts)
│ ├── schemas/ # Zod validation schemas
│ └── tests/ # Vitest tests
├── DEVELOPER_GUIDE.md
└── vercel.json

### 2.2 Environment Variables

| Variable          | Scope         | Description                        |
|------------------|---------------|------------------------------------|
| `DATABASE_URL`   | Server-Only   | PostgreSQL connection string       |
| `JWT_SECRET`     | Server-Only   | Secret key สำหรับ JWT              |
| `NEXT_PUBLIC_*`  | Client-Safe   | ตัวแปรที่อนุญาตให้ฝั่ง client ใช้ |

---

## 3. การใช้งานตามบทบาท (RBAC Mapping)

| Role        | Main Pages              | สิทธิ์สำคัญ                                        |
|-------------|--------------------------|----------------------------------------------------|
| `ADMIN`     | `/admin/**`              | Full access                                        |
| `OFFICER`   | `/community/**`          | จัดการ Ride, Patient (ยกเว้นลบ)                  |
| `DRIVER`    | `/driver/dashboard`      | ดู/อัปเดต Ride ที่มอบหมาย                         |
| `COMMUNITY` | `/community/dashboard`   | สร้าง Patient + Ride (เฉพาะของตัวเอง)            |
| `EXECUTIVE` | `/executive/dashboard`   | ดูข้อมูลสรุป Read-only                            |
| `DEVELOPER` | ทุกเส้นทางที่เกี่ยวข้อง | สร้าง/ดูแล/ทดสอบโมดูล, เขียน API, พัฒนา UI       |

---

## 4. การทำงานของแต่ละ Module

- **Auth Module** → Login / Register / JWT  
- **Patient Module** → CRUD ข้อมูลผู้ป่วย  
- **Ride Module** → CRUD การเดินทาง, Assign driver  
- **Audit Module** → เก็บ Log การเปลี่ยนแปลง Ride  
- **Dashboard Module** → แสดงข้อมูลตาม Role  

---

## 5. Environment & CI/CD

- **Dev** → ใช้ `.env.local` + PostgreSQL local  
- **Staging** → Deploy Preview บน Vercel  
- **Production** → Merge main → Deploy อัตโนมัติ  

---

## 6. Test Plan Matrix

| Module   | Test Case                                | Role                             | Expected Result                                |
|----------|-------------------------------------------|----------------------------------|------------------------------------------------|
| Auth     | Login ด้วย credentials ถูกต้อง           | All                              | เข้าสู่ระบบได้และ redirect ตาม Role           |
| Auth     | Login ด้วย password ผิด                  | All                              | แสดง error                                     |
| Patient  | สร้าง Patient ใหม่                       | ADMIN, OFFICER, COMMUNITY        | Patient ถูกบันทึกใน DB                         |
| Ride     | ADMIN สร้าง Ride                         | ADMIN                            | Ride แสดงในตาราง                              |
| Ride     | Driver อัปเดตสถานะเป็น `COMPLETED`      | DRIVER                           | Ride status เปลี่ยนและบันทึก Log              |
| Dashboard| Executive dashboard แสดงสถิติ            | EXECUTIVE                        | ข้อมูลรวมถูกต้องตาม DB                        |
| Dev Tools| สร้าง middleware ตรวจ RBAC               | DEVELOPER                        | middleware คืน 401 เมื่อ role ไม่ถูกต้อง        |

---

## 7. Developer Guide (สำหรับนักพัฒนา)

### 7.1 ติดตั้งและรันโปรเจกต์ (Local Setup)

```bash
git clone https://github.com/jetci/wecare-app.git
cd wecare-app
npm install
cp .env.example .env.local
npx prisma migrate dev
npx prisma db seed
npm run dev

# เข้าใช้งานผ่าน http://localhost:3000

7.2 การรัน Test
npm test
npm test -- --coverage

7.3 Workflow นักพัฒนา
git checkout -b feature/ride-dashboard
# ทำงาน > commit > push
git add .
git commit -m "feat(ride): add driver dashboard"
git push origin feature/ride-dashboard
# เปิด PR → GitHub สร้าง Preview URL สำหรับ QA/SA

7.4 Code Style & Linting
npm run lint
# ใช้ ESLint + Prettier

7.5 จุดที่ควรรู้ของสถาปัตยกรรม
API Routes → src/app/api/
Prisma Client → src/lib/prisma.ts
Zod Schema → src/schemas/
RBAC Middleware → ตรวจสอบ role ก่อนเข้า API
7.6 Debug & Logs
npx prisma studio
# หรือใช้ console.log / src/lib/logger.ts



---

หากคุณต้องการ export เป็น `.md` จริงในระบบไฟล์ หรือให้ผมใส่ commit message สำหรับ push เข้า repo ก็สามารถแจ้งได้ครับ
