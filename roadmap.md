# Roadmap โครงการ wecare-app

## สถานะปัจจุบัน

### ✅ เสร็จแล้ว
- Patient List (แสดงรายการผู้ป่วยพร้อม filter & pagination)
- New Patient Form (ฟอร์มสร้างผู้ป่วยใหม่ พร้อม schema validation)
- Edit Patient Form (ฟอร์มแก้ไขข้อมูลผู้ป่วย)
- Review Submissions (หน้ารีวิวเอกสารที่อัปโหลด)

### 🟡 ยังไม่สมบูรณ์
- Upload Files Page: 
  - Error handling tests for upload (T05)
  - Preview component/UX flow (T06)
  - Accessibility tests for FileInputGroup (T07)
  - Integration test schema→preview→API→UI (T08)

### ⏳ ยังไม่เริ่ม
- Role-based access control UI (T09)
- Driver dashboard (T10)
- Executive dashboard (T11)
- Health-officer dashboard (T12)
- E2E tests for main flows (T13)

### 🔧 ต้องปรับปรุงเพิ่มเติม
- Refactor usePreviewFiles hook (T14)
- Add loading state & disable submit buttons (T15)
- Add form reset/default values (T16)
- Client-side file duplicate & size validation (T17)
- Debounce/throttle filter functions (T18)

## แผนพัฒนา (Sprint Plan)
- **Sprint 1 (17–23 มิ.ย. 2025):** เสร็จ UI Upload & Tests (T05–T08)
- **Sprint 2 (24 มิ.ย.–7 ก.ค. 2025):** Access Control & New Dashboards (T09–T12)
- **Sprint 3 (8–21 ก.ค. 2025):** E2E tests และ Performance Tuning (T13–T18)

> ดูรายละเอียดตารางงานเพิ่มเติมในไฟล์ `tasks.csv`, `tasks.json` และรายละเอียด Sprint ใน `sprint-plan.md`
