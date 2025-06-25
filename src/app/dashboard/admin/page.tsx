"use client";

import React from 'react';
import { useState, useEffect } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import SearchInput from "@/components/ui/SearchInput";
import { Table } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import AreaForm from "@/components/admin/AreaForm";
import { Card } from "@/components/ui/Card";
import ReportsChart from './ReportsChart';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { th } from 'date-fns/locale/th';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { exportCSV, exportPDF } from '@/lib/export';
import RoleGuard from '@/components/RoleGuard';
import Image from 'next/image';
import { useRequests } from '@/lib/hooks/useRequests';
import { useLogs } from '@/lib/hooks/useLogs';
import { useRoles } from '@/lib/hooks/useRoles';
import { Role } from '@/types/roles';

// register Thai locale
registerLocale('th', th);

// Generic fetcher and response types
async function fetcher<T>(url: string): Promise<T> {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return (await res.json()) as T;
  } catch (e) {
    console.error('fetcher error:', e);
    throw e;
  }
}

interface ReportsResp { usersByGroup: { group: string; count: number }[]; pendingRequests: number; totalRides: number; weeklyTrends: { week: string; count: number }[]; }
interface RidesResp { rides: { id: string; date: string; group: string; status: string; details: string }[]; }
interface RequestsResp { users: { id: string; prefix: string; firstName: string; lastName: string; role: string }[]; total: number; }
interface UsersResp { users: { id: string; code?: string; prefix: string; firstName: string; lastName: string; phone: string; role: string }[]; total: number; }
interface LogsResp { logs: { id: string; user?: string; userCode?: string; userId?: string; action: string; timestamp: string; detail: string }[]; total: number; }
interface RolesResp { roles: { id: string; name: string; permissions: string[] }[]; }
interface ProfileResp { user: { prefix: string; firstName: string; lastName: string; phone: string; address?: { houseNumber: string; village: string; subdistrict: string; district: string; province: string }; avatarUrl?: string; nationalId?: string } };
interface AreasResp { areas: { id: string; province: string; district: string; subdistrict: string; active: boolean }[]; }

const TABS = ["สรุปรายงาน", "รายละเอียดการจอง", "ผู้ใช้งาน", "คำขอใช้งาน", "บันทึกกิจกรรม", "บทบาทและสิทธิ์", "ตั้งค่าระบบ", "ข้อมูลส่วนตัว"] as const;

// Inner component with original logic
function AdminDashboardContent() {
  const [tab, setTab] = useState<typeof TABS[number]>(TABS[0]);
  // Tab2: filters
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [groupFilter, setGroupFilter] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const [selectedRide, setSelectedRide] = useState<RidesResp['rides'][0] | null>(null);

  // Audit Log state
  const [logPage, setLogPage] = useState<number>(1);
  const logPageSize = 10;
  const [logDateFrom, setLogDateFrom] = useState<string>("");
  const [logDateTo, setLogDateTo] = useState<string>("");

  const [userPage, setUserPage] = useState<number>(1);

  const { data: reports, error: reportsError, isLoading: rLoad } = useSWR<ReportsResp>(tab === "สรุปรายงาน" ? "/api/reports" : null, fetcher);
  const { data: riders, error: rideError, isLoading: rideLoad } = useSWR<RidesResp>(
    tab === "รายละเอียดการจอง"
      ? `/api/rides?from=${dateFrom}&to=${dateTo}&status=${statusFilter}&group=${groupFilter}&page=${page}&limit=${pageSize}`
      : null,
    fetcher
  );
  const { data: requests, isLoading: reqLoad, error: reqError, mutate: mutateReq } = useRequests(tab === "คำขอใช้งาน");
  useEffect(() => {
    if (reqError) console.error('Requests fetch error:', reqError);
  }, [reqError]);
  const [rejectingUser, setRejectingUser] = useState<RequestsResp['users'][0] | null>(null);
  // Advanced filters for ผู้ใช้งาน tab
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("");
  const [userDateFrom, setUserDateFrom] = useState<string>("");
  const [userDateTo, setUserDateTo] = useState<string>("");
  // Fetch approved users for "ผู้ใช้งาน" tab
  const { data: users, error: usersError, isLoading: usersLoad, mutate: mutateUsers } = useSWR<UsersResp>(
    tab === "ผู้ใช้งาน"
      ? `/api/admin/users?approved=true&q=${encodeURIComponent(searchQuery)}&role=${userRoleFilter}&status=${userStatusFilter}&from=${userDateFrom}&to=${userDateTo}&page=${userPage}&limit=${pageSize}`
      : null,
    fetcher
  );
  // Fetch audit logs for "บันทึกกิจกรรม" tab
  const { data: logs, error: logsError, isLoading: logLoad } = useLogs(tab === "บันทึกกิจกรรม", logDateFrom, logDateTo, logPage, logPageSize);
  // RBAC: roles and permissions for 'บทบาทและสิทธิ์' tab
  const [selectedRole, setSelectedRole] = useState<RolesResp['roles'][0] | null>(null);
  const [rolePerms, setRolePerms] = useState<string[]>([]);
  const { data: rolesData, isLoading: rolesLoad, mutate: mutateRoles } = useRoles(tab === "บทบาทและสิทธิ์");
  // Format user ID with group prefix and chunked representation
  const formatUserId = (u: UsersResp['users'][0]) => {
    // Prefer external code if provided, else use UUID
    const rawCode = u.code ? u.code.replace(/-/g, '') : u.id.replace(/-/g, '');
    // Prefix derived from role or from code segments
    const prefixMap: Record<string, string> = { [Role.COMMUNITY]: 'Cmy', [Role.ADMIN]: 'Adm', [Role.DRIVER]: 'Drv' };
    const prefix = u.code ? u.code.split('-')[0] : (prefixMap[u.role] || 'Usr');
    // Chunk into 4-character groups
    const chunks = rawCode.match(/.{1,4}/g) || [rawCode];
    return `${prefix}-${chunks.join('-')}`;
  };
  // SWR สำหรับโปรไฟล์ผู้ใช้ปัจจุบัน
  const { data: profileData, error: profileError, isLoading: profileLoad, mutate: mutateProfile } = useSWR<ProfileResp>(
    tab === "ข้อมูลส่วนตัว" ? "/api/auth/profile" : null,
    fetcher
  );
  // SWR สำหรับตั้งค่าระบบ (Areas)
  const { data: areas, error: areasError, isLoading: areasLoad, mutate: mutateAreas } = useSWR<AreasResp>(
    tab === "ตั้งค่าระบบ" ? "/api/admin/areas" : null,
    fetcher
  );
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [editingArea, setEditingArea] = useState<AreasResp['areas'][0] | undefined>(undefined);

  // Profile form schema & form
  const profileSchema = z.object({
    prefix: z.string().nonempty("กรุณาเลือกคำนำหน้า"),
    firstName: z.string().nonempty("กรุณากรอกชื่อ"),
    lastName: z.string().nonempty("กรุณากรอกนามสกุล"),
    phone: z.string().min(9, "เบอร์โทรศัพท์ไม่ถูกต้อง"),
    houseNumber: z.string().min(1, "กรุณาระบุบ้านเลขที่"),
    village: z.enum([
      "หมู่ 1","หมู่ 2","หมู่ 3","หมู่ 4","หมู่ 5","หมู่ 6","หมู่ 7","หมู่ 8","หมู่ 9","หมู่ 10",
      "หมู่ 11","หมู่ 12","หมู่ 13","หมู่ 14","หมู่ 15","หมู่ 16","หมู่ 17","หมู่ 18","หมู่ 19","หมู่ 20"
    ], { required_error: "กรุณาเลือกหมู่ที่", invalid_type_error: "กรุณาเลือกหมู่ที่" }),
    subDistrict: z.string().min(1, "กรุณาระบุตำบล"),
    district: z.string().min(1, "กรุณาระบุอำเภอ"),
    province: z.string().min(1, "กรุณาระบุจังหวัด"),
    avatar: z.unknown().optional(),
  });
  type ProfileForm = z.infer<typeof profileSchema>;
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      prefix: "",
      firstName: "",
      lastName: "",
      phone: "",
      houseNumber: "",
      village: "หมู่ 1",
      subDistrict: "เวียง",
      district: "ฝาง",
      province: "เชียงใหม่",
      avatar: undefined,
    },
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (profileData?.user) {
      reset({
        prefix: profileData.user.prefix || "",
        firstName: profileData.user.firstName || "",
        lastName: profileData.user.lastName || "",
        phone: profileData.user.phone || "",
        houseNumber: profileData.user.address?.houseNumber || "",
        village: (profileData.user.address?.village as ProfileForm['village']) ?? "หมู่ 1",
        subDistrict: profileData.user.address?.subdistrict || "เวียง",
        district: profileData.user.address?.district || "ฝาง",
        province: profileData.user.address?.province || "เชียงใหม่",
        avatar: undefined,
      });
      if (profileData.user.avatarUrl) setAvatarPreview(profileData.user.avatarUrl);
    }
  }, [profileData, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'avatar' && (value as FileList)?.[0]) {
          formData.append('avatar', (value as FileList)[0]);
        } else if (value != null) {
          formData.append(key, value.toString());
        }
      });
      const res = await fetch("/api/auth/profile", {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        body: formData
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Update failed');
      }
      toast.success("บันทึกโปรไฟล์สำเร็จ");
      await mutateProfile();
      setIsEditingProfile(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "บันทึกโปรไฟล์ไม่สำเร็จ";
      toast.error(message);
    }
  });

  // edit mode for profile
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Handlers for request actions
  const handleApprove = async (id?: string) => {
    if (!id) return;
    await fetch(`/api/admin/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approved: true }) });
    toast.success('อนุมัติแล้ว');
    // Optimistically clear requests without revalidation
    mutateReq({ users: [], total: 0 }, false);
  };
  const handleReject = (id?: string) => {
    if (!id || !requests) return;
    const user = requests.users.find((u) => u.id === id);
    setRejectingUser(user || null);
  };
  const handleConfirmReject = async () => {
    if (!rejectingUser) return;
    await fetch(`/api/admin/users/${rejectingUser.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approved: false }) });
    toast.error('ปฏิเสธคำขอแล้ว');
    // Optimistically clear requests without revalidation
    mutateReq({ users: [], total: 0 }, false);
    setRejectingUser(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard ผู้ดูแลระบบ</h1>
      {/* Tabs */}
      <div className="flex space-x-4 border-b mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            data-testid={`tab-${t}`}
            className={`pb-2 ${t === tab ? "border-b-2 border-blue-600" : "text-gray-600"}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "สรุปรายงาน" && (
        <div>
          {rLoad ? (
            <Spinner />
          ) : reportsError ? (
            <p className="text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูลสรุปรายงาน</p>
          ) : reports ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card title="ผู้ใช้ตามกลุ่ม">
                  <ul>
                    {(reports?.usersByGroup || []).map((g) => (
                      <li key={g.group} className="flex justify-between">
                        <span>{g.group}</span>
                        <span>{g.count}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card title="คำขอรออนุมัติ">
                  <p className="text-2xl font-bold">{reports?.pendingRequests}</p>
                </Card>
                <Card title="การจองทั้งหมด">
                  <p className="text-2xl font-bold">{reports?.totalRides}</p>
                </Card>
              </div>
              <ReportsChart data={reports} />
              <div className="space-x-2 mt-4">
                <Button data-testid="admin-export-csv" onClick={() => exportCSV(reports)} size="sm">ส่งออก CSV</Button>
                <Button data-testid="admin-export-pdf" onClick={() => exportPDF(reports)} size="sm">ส่งออก PDF</Button>
              </div>
            </>
          ) : null}
        </div>
      )}

      {tab === "รายละเอียดการจอง" && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <DatePicker
              selected={dateFrom ? new Date(dateFrom) : null}
              onChange={(d: Date | null) => setDateFrom(d ? d.toISOString().split('T')[0] : '')}
              locale="th"
              dateFormat="dd-MM-yyyy"
              placeholderText="จาก"
              className="border p-1"
            />
            <DatePicker
              selected={dateTo ? new Date(dateTo) : null}
              onChange={(d: Date | null) => setDateTo(d ? d.toISOString().split('T')[0] : '')}
              locale="th"
              dateFormat="dd-MM-yyyy"
              placeholderText="ถึง"
              className="border p-1"
            />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border p-1">
              <option value="">สถานะทั้งหมด</option>
              <option value="PENDING">รออนุมัติ</option>
              <option value="APPROVED">อนุมัติแล้ว</option>
              <option value="CANCELLED">ยกเลิก</option>
            </select>
            <input type="text" placeholder="กลุ่ม" value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="border p-1" />
          </div>
          {/* Table + Modal */}
          {rideLoad ? (
            <Spinner />
          ) : rideError ? (
            <p className="text-red-500">โหลดข้อมูลรายการการจองล้มเหลว</p>
          ) : (
            <>
              <Table
                rowTestIdKey="id"
                rowTestIdPrefix="ride-row"
                
                columns={[
                  { key: "id", label: "รหัสการจอง" },
                  { key: "date", label: "วันที่" },
                  { key: "group", label: "กลุ่ม" },
                  { key: "status", label: "สถานะ" },
                  { key: "actions", label: "จัดการ" },
                ]}
                data={(riders?.rides || []).map((r: RidesResp['rides'][0]) => ({
                  id: r.id,
                  date: new Date(r.date).toLocaleDateString(),
                  group: r.group,
                  status: <span className={`px-2 py-1 rounded text-white ${r.status === 'PENDING' ? 'bg-yellow-500' : r.status === 'APPROVED' ? 'bg-green-500' : 'bg-red-500'}`}>{r.status}</span>,
                  actions: <Button aria-label="ดูรายละเอียด" size="sm" onClick={() => setSelectedRide(r)}>ดูรายละเอียด</Button>,
                }))}
              />
              {/* Pagination */}
              <div className="flex justify-end mt-2 space-x-2">
                <Button aria-label="ก่อนหน้า" size="sm" onClick={() => setPage(p => Math.max(p-1,1))} disabled={page<=1}>ก่อนหน้า</Button>
                <span>หน้า {page}</span>
                <Button aria-label="ถัดไป" size="sm" onClick={() => setPage(p => p+1)} disabled={(riders?.rides.length ?? 0) < pageSize}>ถัดไป</Button>
              </div>
              {/* Modal Details */}
              <Modal open={!!selectedRide} onClose={() => setSelectedRide(null)} title="รายละเอียดการจอง">
                {selectedRide && (
                  <div className="space-y-1">
                    <p>รหัสการจอง: {selectedRide.id}</p>
                    <p>วันที่: {new Date(selectedRide.date).toLocaleString()}</p>
                    <p>กลุ่ม: {selectedRide.group}</p>
                    <p>สถานะ: {selectedRide.status}</p>
                    <p>รายละเอียดเพิ่มเติม: {selectedRide.details}</p>
                  </div>
                )}
              </Modal>
            </>
          )}
        </div>
      )}

      {tab === "ผู้ใช้งาน" && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <SearchInput placeholder="ค้นหาผู้ใช้งาน" value={searchQuery} onChange={setSearchQuery} onSearch={() => mutateUsers()} />
            <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)} className="border p-1">
              <option value="">ทุกบทบาท</option>
              <option value={Role.ADMIN}>ผู้ดูแลระบบ</option>
              <option value={Role.DRIVER}>พนักงานขับรถ</option>
              <option value={Role.COMMUNITY}>สมาชิกชุมชน</option>
            </select>
            <select value={userStatusFilter} onChange={e => setUserStatusFilter(e.target.value)} className="border p-1">
              <option value="">สถานะทั้งหมด</option>
              <option value="ACTIVE">ใช้งาน</option>
              <option value="DISABLED">ไม่ใช้งาน</option>
            </select>
            <DatePicker
              selected={userDateFrom ? new Date(userDateFrom) : null}
              onChange={(d: Date | null) => setUserDateFrom(d ? d.toISOString().split('T')[0] : '')}
              locale="th"
              dateFormat="dd-MM-yyyy"
              placeholderText="จาก"
              className="border p-1"
            />
            <DatePicker
              selected={userDateTo ? new Date(userDateTo) : null}
              onChange={(d: Date | null) => setUserDateTo(d ? d.toISOString().split('T')[0] : '')}
              locale="th"
              dateFormat="dd-MM-yyyy"
              placeholderText="ถึง"
              className="border p-1"
            />
          </div>
          {usersLoad ? (
            <Spinner />
          ) : usersError ? (
            <p className="text-red-500">โหลดข้อมูลผู้ใช้งานล้มเหลว</p>
          ) : (
            <>
              <Table
                rowTestIdKey="id"
                rowTestIdPrefix="user-row"
                
                columns={[
                  { key: 'id', label: 'รหัสผู้ใช้' },
                  { key: 'name', label: 'ชื่อ' },
                  { key: 'phone', label: 'เบอร์โทร' },
                  { key: 'role', label: 'บทบาท' },
                  { key: 'actions', label: 'จัดการ' },
                ]}
                data={(users?.users || []).map((u: UsersResp['users'][0]) => ({
                  id: formatUserId(u),
                  name: `${u.firstName} ${u.lastName}`,
                  phone: u.phone,
                  role: u.role,
                  actions: (
                    <Button aria-label="ลบผู้ใช้งาน" variant="danger" size="sm" onClick={async () => {
                      if (window.confirm(`ลบผู้ใช้งาน ${u.firstName} ${u.lastName}?`)) {
                        await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
                        mutateUsers();
                        toast.success('ลบผู้ใช้งานเรียบร้อย');
                      }
                    }}>
                      ลบ
                    </Button>
                  ),
                }))}
              />
              <div className="flex justify-between mt-4">
                <Button aria-label="ก่อนหน้า" size="sm" onClick={() => setUserPage(p => Math.max(p-1,1))} disabled={userPage<=1}>ก่อนหน้า</Button>
                <span>หน้า {userPage}</span>
                <Button aria-label="ถัดไป" size="sm" onClick={() => setUserPage(p => p+1)} disabled={(users?.users.length ?? 0) < pageSize}>ถัดไป</Button>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "คำขอใช้งาน" && (
        <div>
          {reqLoad ? (
            <Spinner aria-label="loading-patients" />
          ) : (
            <Table
              rowTestIdKey="id"
              rowTestIdPrefix="request-row"
              
              columns={[
                { key: 'id', label: 'รหัสคำขอ' },
                { key: 'name', label: 'ชื่อ' },
                { key: 'actions', label: 'จัดการ', render: (_value, row) => {
                  if (!row) return null;
                  return (
                    <div className="space-x-2">
                      <button
                        data-testid="approve-button"
                        role="button"
                        onClick={() => row.id && handleApprove(row.id)}
                      >อนุมัติ</button>
                      <button
                        data-testid="reject-button"
                        role="button"
                        onClick={() => row.id && handleReject(row.id)}
                      >ไม่อนุมัติ</button>
                    </div>
                  );
                }}
              ]}
              data={requests?.users.map(u => ({
                ...u,
                name: `${u.firstName} ${u.lastName}`,
              })) ?? []}
            />
          )}
          <Modal data-testid="reject-modal" open={!!rejectingUser} onClose={() => setRejectingUser(null)} title="ไม่อนุมัติคำขอใช้งาน">
            {rejectingUser && (
              <div className="space-y-4">
                <p>คุณแน่ใจหรือไม่ที่จะปฏิเสธคำขอใช้งานของ {rejectingUser.firstName} {rejectingUser.lastName}?</p>
                <div className="flex space-x-2 justify-end">
                  <button
                    data-testid="confirm-reject"
                    role="button"
                    aria-label="ยืนยันไม่อนุมัติ"
                    onClick={handleConfirmReject}
                  >ตกลง</button>
                  <button role="button" aria-label="ยกเลิก" onClick={() => setRejectingUser(null)}>ยกเลิก</button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}

      {tab === "บันทึกกิจกรรม" && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <DatePicker
              selected={logDateFrom ? new Date(logDateFrom) : null}
              onChange={(d: Date | null) => setLogDateFrom(d ? d.toISOString().split('T')[0] : '')}
              locale="th"
              dateFormat="dd-MM-yyyy"
              placeholderText="จาก"
              className="border p-1"
            />
            <DatePicker
              selected={logDateTo ? new Date(logDateTo) : null}
              onChange={(d: Date | null) => setLogDateTo(d ? d.toISOString().split('T')[0] : '')}
              locale="th"
              dateFormat="dd-MM-yyyy"
              placeholderText="ถึง"
              className="border p-1"
            />
          </div>
          {logLoad ? (
            <Spinner />
          ) : logsError ? (
            <p className="text-red-500">โหลดบันทึกกิจกรรมล้มเหลว</p>
          ) : (
            <Table
              rowTestIdKey="id"
              rowTestIdPrefix="log-row"
              
              columns={[
                { key: 'timestamp', label: 'เวลา' },
                { key: 'user', label: 'ผู้ใช้งาน' },
                { key: 'action', label: 'กิจกรรม' },
                { key: 'detail', label: 'รายละเอียด' },
              ]}
              data={(logs?.logs || []).map((l: LogsResp['logs'][0]) => ({
                timestamp: new Date(l.timestamp).toLocaleString(),
                user: l.userCode ?? l.userId ?? l.user ?? '',
                action: l.action,
                detail: l.detail,
              }))}
            />
          )}
          <div className="flex justify-end space-x-2 mt-2">
            <Button aria-label="ก่อนหน้า" size="sm" onClick={() => setLogPage(p => Math.max(p-1,1))} disabled={logPage<=1}>ก่อนหน้า</Button>
            <span>หน้า {logPage}</span>
            <Button aria-label="ถัดไป" size="sm" onClick={() => setLogPage(p => p+1)} disabled={(logs?.logs.length ?? 0) < logPageSize}>ถัดไป</Button>
          </div>
        </div>
      )}

      {tab === "บทบาทและสิทธิ์" && (
        <RoleGuard allowedRoles={[Role.ADMIN]}>
          <div>
            {rolesLoad ? <Spinner /> : (
              <>
                <Table
                  rowTestIdKey="id"
                  rowTestIdPrefix="role-row"
                  
                  columns={[
                    { key: 'name', label: 'บทบาท' },
                    { key: 'permissions', label: 'สิทธิ์' },
                    { key: 'actions', label: 'จัดการ' },
                  ]}
                  data={(rolesData?.roles || []).map((r: RolesResp['roles'][0]) => ({
                    name: r.name,
                    // Ensure permissions is an array before joining
                    permissions: (r.permissions || []).join(', '),
                    actions: <Button aria-label="แก้ไข" size="sm" onClick={() => { setSelectedRole(r); setRolePerms(r.permissions); }}>แก้ไข</Button>
                  }))}
                />
                <Modal
                  open={!!selectedRole}
                  onClose={() => setSelectedRole(null)}
                  title="แก้ไขสิทธิ์บทบาท"
                >
                  {selectedRole && (
                    <form className="space-y-4">
                      <p>บทบาท: {selectedRole.name}</p>
                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
                        {['view_users','edit_users','delete_users','view_reports','edit_reports','view_logs'].map(p => (
                          <label key={p} className="inline-flex items-center">
                            <input type="checkbox" className="mr-2" value={p}
                              checked={rolePerms.includes(p)}
                              onChange={e => {
                                const v = e.target.value;
                                setRolePerms(prev => prev.includes(v) ? prev.filter(x=>x!==v) : [...prev, v]);
                              }}
                            />{p}
                          </label>
                        ))}
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button aria-label="บันทึก" size="sm" onClick={async e => {
                          e.preventDefault();
                          await fetch(`/api/admin/roles/${selectedRole.id}`, {
                            method: 'PUT', headers: {'Content-Type':'application/json'},
                            body: JSON.stringify({ permissions: rolePerms })
                          });
                          mutateRoles(); setSelectedRole(null);
                          toast.success('อัปเดตสิทธิ์เรียบร้อย');
                        }}>บันทึก</Button>
                        <Button aria-label="ยกเลิก" size="sm" variant="outline" onClick={() => setSelectedRole(null)}>ยกเลิก</Button>
                      </div>
                    </form>
                  )}
                </Modal>
              </>
            )}
          </div>
        </RoleGuard>
      )}

      {tab === "ตั้งค่าระบบ" && (
        <div>
          <Button aria-label="เพิ่มพื้นที่" onClick={() => { setEditingArea(undefined); setShowAreaModal(true); }} size="sm">เพิ่มพื้นที่</Button>
          {areasLoad ? <Spinner /> : areasError ? <p className="text-red-500">โหลดพื้นที่ล้มเหลว</p> : (
            <Table
              rowTestIdKey="id"
              rowTestIdPrefix="area-row"
              
              columns={[
                { key: 'province', label: 'จังหวัด' },
                { key: 'district', label: 'อำเภอ' },
                { key: 'subdistrict', label: 'ตำบล' },
                { key: 'active', label: 'สถานะ' },
                { key: 'actions', label: 'จัดการ' }
              ]}
              data={(areas?.areas || []).map((a: AreasResp['areas'][0]) => ({
                province: a.province,
                district: a.district,
                subdistrict: a.subdistrict,
                active: a.active ? 'Active' : 'Inactive',
                actions: (
                  <div className="space-x-2">
                    <Button aria-label="แก้ไข" size="sm" onClick={() => { setEditingArea(a); setShowAreaModal(true); }}>แก้ไข</Button>
                    <Button aria-label="ลบ" size="sm" onClick={async () => {
                      await fetch('/api/admin/areas', { method: 'DELETE', body: JSON.stringify({ id: a.id }) });
                      mutateAreas();
                    }}>ลบ</Button>
                  </div>
                )
              }))}
            />
          )}
          {/* Modal for add/edit area */}
          <Modal open={showAreaModal} onClose={() => setShowAreaModal(false)} title={editingArea ? 'แก้ไขพื้นที่' : 'เพิ่มพื้นที่'}>
            <AreaForm area={editingArea} onSuccess={() => { mutateAreas(); setShowAreaModal(false); }} />
          </Modal>
        </div>
      )}

      {tab === "ข้อมูลส่วนตัว" && (
        <Card className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
          {profileLoad ? (
            <Spinner />
          ) : profileError ? (
            <p className="text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์</p>
          ) : profileData?.user ? (
            !isEditingProfile ? (
              <div className="space-y-6">
                <div className="flex items-start space-x-6">
                  <div>
                    {profileData.user.avatarUrl ? (
                      <Image src={profileData.user.avatarUrl} alt="Avatar" width={128} height={128} className="w-32 h-32 rounded-full object-cover" />
                    ) : (
                      <Image src="/wiangfang.jpg" alt="Placeholder" width={128} height={128} className="w-32 h-32 rounded-full object-cover" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <p><strong>คำนำหน้า:</strong> {profileData.user.prefix || '-'}</p>
                    <p><strong>ชื่อ:</strong> {profileData.user.firstName}</p>
                    <p><strong>นามสกุล:</strong> {profileData.user.lastName}</p>
                    <p><strong>เบอร์โทร:</strong> {profileData.user.phone || '-'}</p>
                    <p><strong>บ้านเลขที่:</strong> {profileData.user.address?.houseNumber || '-'}</p>
                    <p><strong>หมู่ที่:</strong> {profileData.user.address?.village || '-'}</p>
                    <p><strong>ตำบล:</strong> {profileData.user.address?.subdistrict || '-'}</p>
                    <p><strong>อำเภอ:</strong> {profileData.user.address?.district || '-'}</p>
                    <p><strong>จังหวัด:</strong> {profileData.user.address?.province || '-'}</p>
                    <p><strong>เลขบัตรประชาชน:</strong> {profileData.user.nationalId}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button aria-label="แก้ไขโปรไฟล์" onClick={() => setIsEditingProfile(true)}>แก้ไขโปรไฟล์</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label>คำนำหน้า</label>
                  <select {...register('prefix')} className="border w-full p-2 rounded">
                    <option value="">เลือก</option>
                    <option value="นาย">นาย</option>
                    <option value="นางสาว">นางสาว</option>
                    <option value="นาง">นาง</option>
                  </select>
                  {errors.prefix && <p className="text-red-500 text-sm">{errors.prefix.message}</p>}
                </div>
                <div className="flex space-x-4 col-span-2">
                  <div className="flex-1">
                    <label>ชื่อ</label>
                    <input {...register('firstName')} className="border w-full p-2 rounded" />
                    <p className="text-red-500 text-sm">{errors.firstName?.message}</p>
                  </div>
                  <div className="flex-1">
                    <label>นามสกุล</label>
                    <input {...register('lastName')} className="border w-full p-2 rounded" />
                    <p className="text-red-500 text-sm">{errors.lastName?.message}</p>
                  </div>
                </div>
                <div><label>เบอร์โทร</label><input {...register('phone')} className="border w-full p-2 rounded" /><p className="text-red-500 text-sm">{errors.phone?.message}</p></div>
                <div><label>บ้านเลขที่</label><input {...register('houseNumber')} className="border w-full p-2 rounded" /><p className="text-red-500 text-sm">{errors.houseNumber?.message}</p></div>
                <div><label>หมู่ที่</label><select {...register('village')} className="border w-full p-2 rounded">
                  <option value="">เลือกหมู่ที่</option>
                  {[...Array(20)].map((_, i) => (
                    <option key={i+1} value={`หมู่ ${i+1}`}>หมู่ {i+1}</option>
                  ))}
                </select><p className="text-red-500 text-sm">{errors.village?.message}</p></div>
                <div><label>ตำบล</label><input {...register('subDistrict')} className="border w-full p-2 rounded" /><p className="text-red-500 text-sm">{errors.subDistrict?.message}</p></div>
                <div><label>อำเภอ</label><input {...register('district')} className="border w-full p-2 rounded" /><p className="text-red-500 text-sm">{errors.district?.message}</p></div>
                <div><label>จังหวัด</label><input {...register('province')} className="border w-full p-2 rounded" /><p className="text-red-500 text-sm">{errors.province?.message}</p></div>
                <div>
                  <label className="block">รูปประจำตัว</label>
                  {avatarPreview && <Image src={avatarPreview} alt="Avatar" width={96} height={96} className="w-24 h-24 rounded-full mb-2" />}
                  <input type="file" accept="image/*" {...register('avatar')} onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setAvatarPreview(URL.createObjectURL(file));
                  }} />
                </div>
                <div><label>เลขบัตรประชาชน</label><input value={profileData.user.nationalId} disabled className="border w-full p-2 rounded bg-gray-100" /></div>
                <div className="col-span-2 flex justify-end space-x-4 mt-4">
                  <Button aria-label="ยกเลิก" type="button" variant="outline" onClick={() => setIsEditingProfile(false)} disabled={isSubmitting}>ยกเลิก</Button>
                  <Button aria-label="บันทึก" type="submit" disabled={isSubmitting}>บันทึก</Button>
                </div>
              </form>
            )
          ) : (
            <p className="text-center text-gray-500">ไม่พบข้อมูลโปรไฟล์</p>
          )}
        </Card>
      )}
    </div>
  );
}

// Wrapper with RoleGuard
export default function AdminDashboardPage() {
  return (
    <RoleGuard allowedRoles={[Role.ADMIN]}>
      <AdminDashboardContent />
    </RoleGuard>
  );
}
