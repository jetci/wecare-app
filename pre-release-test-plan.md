# Pre-release Test Plan (wecare-app)

## 1. Test Objectives
- ตรวจสอบความเสถียรของระบบ (stability)
- ยืนยันความถูกต้องของฟีเจอร์หลัก (functional correctness)
- ตรวจสอบ readiness สำหรับ production deployment

## 2. Test Scope
- Patient Flow: สร้าง → แสดง → แก้ไขข้อมูลผู้ป่วย
- File Upload: PDF/JPG ไฟล์ขนาดต่างๆ, preview, error-handling
- Role Access: หน้าจอ Dashboard ตามสิทธิ์ (Admin, Driver, Executive, Health Officer)

## 3. Test Case Summary
### E2E Test
1. สร้างผู้ป่วยใหม่ (กรอกฟอร์ม → submit) → ตรวจใน list
2. อัปโหลดเอกสาร (Upload Page) → ดู preview → submit → ตรวจสถานะ
3. แก้ไขข้อมูลผู้ป่วย (Edit Form) → ตรวจค่าที่แก้ไข

### Integration Test
- Upload API: return status, error code
- Database schema: record insertion & retrieval
- usePatients hook: fetch & caching behavior

### Smoke Test
- ตรวจ `/api/health` → HTTP 200
- โหลด `/dashboard` แต่ละ role → หน้าโหลดสำเร็จ

## 4. Environment Matrix
| Environment  | URL                                   | Auth         | Seed Data      |
|--------------|---------------------------------------|--------------|----------------|
| Development  | https://wecare-dev.vercel.app         | dev-token    | sample-patients.json |
| Staging      | https://wecare-staging.vercel.app     | staging-token| staging-seed.sql    |
| Production   | https://wecare.vercel.app             | production-token| n/a           |

## 5. Acceptance Criteria
- ไม่มี Blocker/Sev-1 bugs
- E2E tests ผ่าน 100%
- Smoke tests HTTP status 200 & response < 500ms

## 6. Exit Criteria
- ผ่าน QA review ทุก Test Case
- ได้รับ approval จาก SA หรือ PO ใน GitHub PR

## 7. Test Data
- ผู้ป่วยปลอม:
  - ชื่อ: นางสาวสายฝน ทองดี, เลขบัตร: 1234567890123, อายุ: 30
  - ชื่อ: นายสมชาย ใจดี, เลขบัตร: 9876543210987, อายุ: 45
- เอกสารแนบ:
  - PDF (200KB, valid), JPG (2MB), ไฟล์ invalid (gif)

## 8. Test Schedule
| Date       | Environment | Responsible    | Deploy Time | Monitor Period |
|------------|-------------|----------------|-------------|----------------|
| 2025-06-18 | Staging     | QA Team        | 10:00       | 10:00–12:00    |
| 2025-06-19 | Production  | QA Team & Dev  | 09:00       | 09:00–11:00    |

## 9. Bug Tracking
- ใช้ GitHub Issues / Jira
- Tags:
  - `qa-blocker`
  - `ui-glitch`
  - `minor-ux`
  - `perf-lag`
- ทุก issue ต้องระบุ Steps to Reproduce, Severity, Assignee
