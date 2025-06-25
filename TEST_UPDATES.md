# 🧪 Test Files Update Checklist

ปรับปรุงไฟล์ test ดังต่อไปนี้เพื่อให้สามารถรันผ่านได้ครบทุกกรณี โดยให้ดำเนินการตามเงื่อนไขที่กำหนดในแต่ละไฟล์:

---

## 📄 `src/app/dashboard/driver/page.test.tsx`

- Mock ระบบ authentication หรือ context ที่เกี่ยวข้อง เช่น `SessionProvider` หรือ `AuthContext` ให้ user มี role เป็น `"driver"`
- ให้สามารถเข้าถึงหน้า `DriverDashboardPage` โดยไม่โดนบล็อคด้วย `Access Denied`
- ทดสอบกรณี:
  - loading spinner
  - assigned rides
  - empty state

---

## 📄 `src/app/dashboard/community/page.test.tsx`

- Mock auth และ permissions context ให้ role `"community_staff"`
- ทดสอบการแสดง:
  - spinner
  - error
  - ข้อมูล summary และ table
  - modal `RideForm`
  - empty state ผู้ป่วย

---

## 📄 `src/app/dashboard/admin/page.test.tsx`

- Mock ผู้ใช้ role `"admin"`
- ทดสอบว่า export ปุ่ม `data-testid="admin-export-csv"` ถูกแสดงเมื่อมีข้อมูล และไม่แสดงเมื่อไม่มี

---

## 📄 `src/app/dashboard/admin/requests.test.tsx`

- Mock ผู้ใช้ role `"admin"` ให้เข้าถึงคำขอ
- แก้ปัญหา Jest `window.location.assign` ที่เป็น read-only โดยใช้:
  ```ts
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { assign: vi.fn() },
  });
  ```
- ทดสอบกรณี success และ error toast

---

## 📄 `src/app/dashboard/admin/logs.test.tsx`

- Mock สิทธิ์ admin เพื่อเข้าถึงหน้า logs ได้
- ใช้ `screen.getByRole('button', { name: /บันทึกกิจกรรม/ })` (เพิ่ม `hidden: true` หากจำเป็น)
- ทดสอบการแสดงปุ่ม "บันทึกกิจกรรม" และกรณี error

---

## 📄 `src/app/dashboard/executive/page.test.tsx`

- แก้ error `route is not defined` ใน `test-utils.tsx`
- Mock routing/context ให้เหมาะสมกับการใช้งาน `DashboardLayout`
- ทดสอบปุ่ม export `[data-testid="export-csv"]` และ fallback rendering

---

🔐 **ข้อกำหนดทั่วไป**

- ห้าม hardcoded ข้อมูล
- ให้ใช้ mock function หรือ mock API service สำหรับข้อมูลที่เกี่ยวข้อง
- ต้องสามารถรันผ่านได้ทุกกรณีที่ระบุไว้
