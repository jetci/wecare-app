# Roadmap Dashboard

เอกสารนี้สรุปแผนพัฒนาฟีเจอร์ Dashboard แยกตามกลุ่มผู้ใช้งาน พร้อม Sprint Goals, Deliverables, ทีมงานที่รับผิดชอบ และความเสี่ยงกับแนวทางบรรเทา

---

## Sprint 1: Core Stability & Coverage (2 สัปดาห์)

### Goals
- เพิ่มความเสถียรของระบบและความครอบคลุมการทดสอบ
- รองรับ responsive และ accessibility
- ปรับปรุง error-handling และ UX polish

### Deliverables
- Unit/UI tests ครอบคลุม error & loading state
- Snapshot tests ที่ทันสมัย
- ARIA labels และ keyboard navigation รองรับ
- Responsive layout สำหรับ mobile/tablet
- Skeleton loaders / spinners สำหรับ loading state

### ทีมงาน
- FE Dev: เขียนและปรับปรุง tests, responsive, accessibility
- QA/SA: รันและตรวจสอบ coverage, audit accessibility

---

## Sprint 2: Advanced Interaction & Integration (2 สัปดาห์)

### Goals
- เพิ่มฟีเจอร์ interactive และ integration
- เริ่ม E2E tests เพื่อจำลองการใช้งานจริง

### Deliverables
- Pagination / Lazy-load ใน list และ filter
- Modals & Drill-down flows พร้อม focus trap
- Real-time updates ผ่าน WebSocket และ toast notifications
- E2E test suite ด้วย Cypress / Playwright

### ทีมงาน
- FE Dev: พัฒนา pagination, modals, real-time
- BE Dev: จัดเตรียม API endpoints (pagination, WebSocket)
- QA/SA: เขียนและรัน E2E tests

---

## Sprint 3: Reporting & Admin Tools (2 สัปดาห์)

### Goals
- สร้างฟีเจอร์การรายงานและเครื่องมือสำหรับผู้ดูแลระบบ
- ตรวจสอบ performance และ security audit

### Deliverables
- Export PDF/CSV, filter reports ตามวันที่และภูมิภาค
- Admin UI สำหรับ user/role management พร้อม validation tests
- Performance tuning (bundle analysis, code-splitting)
- Security review (OWASP, auth guards)

### ทีมงาน
- FE Dev: Reports UI, export features, admin forms
- BE Dev: APIs สำหรับ export, auth/permission
- DevOps/Security: Audit และปรับแต่ง performance

---

## ความเสี่ยงและการบรรเทา (Risk & Mitigation)

| ความเสี่ยง                             | แนวทางบรรเทา                                            |
|---------------------------------------|---------------------------------------------------------|
| การทดสอบไม่ครอบคลุม / flaky tests      | เขียน test matrix, เพิ่ม retry mechanism, CI integration |
| ปัญหา accessibility ไม่ผ่าน audit     | ใช้ axe-core, จัด schedule audit ประจำ                 |
| การเชื่อมต่อ real-time ล้มเหลว        | เพิ่ม fallback retry, ประกาศสถานะ network ชัดเจน       |
| Performance ผิดพลาดบน device ต่ำ      | ทำ bundle analysis, ใช้ code-splitting, lazy-loading   |
| Security vulnerability (XSS, CSRF)      | ทำ penetration test, ใช้ dependency scanning tool      |

---

> **หมายเหตุ:** แผนนี้สามารถปรับเปลี่ยนได้ตาม priority และสถานะของทีมงานในแต่ละ Sprint
