"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter as nextUseRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { confirmPatientData } from '@/lib/confirmPatientData';

export interface PatientReviewPageProps {
  router?: ReturnType<typeof nextUseRouter>;
}

export default function PatientReviewPage({ router = nextUseRouter() }: PatientReviewPageProps) {
  const params = useSearchParams();
  const { role } = useAuth();
  const routerNav = router;
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Map param keys to labels
  const labels: Record<string, string> = {
    prefix: 'คำนำหน้า', firstName: 'ชื่อ', lastName: 'สกุล', nationalId: 'เลขบัตรประชาชน',
    phone: 'เบอร์โทร', gender: 'เพศ', bloodGroup: 'กรุ๊ฟเลือด', dob: 'วันเกิด', age: 'อายุ',
    addrNo: 'บ้านเลขที่', addrMoo: 'หมู่ที่', villageName: 'หมู่บ้าน', copyAddr: 'คัดลอกที่อยู่',
    currNo: 'เลขที่ปัจจุบัน', currMoo: 'หมู่ที่ปัจจุบัน', currSub: 'ตำบล', currDist: 'อำเภอ', currProv: 'จังหวัด', currVillageName: 'หมู่บ้านปัจจุบัน',
    statusHelpSelf: 'ช่วยตัวเองได้', statusCannotHelpSelf: 'ไม่สามารถช่วยตัวเองได้',
    needTool: 'ต้องการอุปกรณ์', toolRemark: 'หมายเหตุอุปกรณ์พิเศษ',
    group: 'กลุ่มผู้ป่วย', otherGroup: 'กลุ่มอื่นๆ', remark: 'หมายเหตุ', lat: 'ละติจูด', lng: 'ลองจิจูด',
    docCertHead: 'หนังสือรับรอง กำนัน/ผู้ใหญ่บ้าน', docCertBed: 'หนังสือรับรองผู้ป่วยติดเตียง', docAppointment: 'สำเนาใบนัดแพทย์', docOther: 'เอกสารอื่นๆ'
  };

  // collect params into object
  const data: Record<string, string> = {};
  params?.forEach((value, key) => { data[key] = value; });

  // Thai month names
  const thaiMonths = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  // format date of birth
  let dobStr = 'ไม่มีข้อมูล';
  if (data.dob) {
    const d = new Date(data.dob);
    dobStr = `${d.getDate()} ${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
  }
  // address display
  const fixedLocation = { subdistrict: 'เวียง', district: 'ฝาง', province: 'เชียงใหม่' };
  const addrStr = data.copyAddr === 'true'
    ? `เลขที่ ${data.currNo} หมู่ที่ ${data.currMoo} หมู่บ้าน ${data.currVillageName} ตำบล ${data.currSub} อำเภอ ${data.currDist} จังหวัด ${data.currProv}`
    : `เลขที่ ${data.addrNo} หมู่ที่ ${data.addrMoo} หมู่บ้าน ${data.villageName} ตำบล ${fixedLocation.subdistrict} อำเภอ ${fixedLocation.district} จังหวัด ${fixedLocation.province}`;
  // self help status
  let selfHelp = '';
  if (data.statusHelpSelf === 'true') selfHelp = 'ช่วยตัวเองได้';
  else if (data.statusCannotHelpSelf === 'true') selfHelp = 'ไม่สามารถช่วยตัวเองได้';
  // tool remark
  const toolRemark = data.needTool === 'true' ? (data.toolRemark || 'ไม่มีข้อมูล') : null;
  // group
  const groupStr = data.patientGroup || data.group || data.otherGroup || '';
  // coords
  const coordStr = `พิกัดรับส่ง: ${data.lat}, ${data.lng}`;

  // redirect if not community role
  useEffect(() => {
    console.log('useEffect non-community, role:', role);
    if (role !== 'COMMUNITY') routerNav.push('/dashboard/community/patients');
  }, [role, routerNav]);

  // redirect to new form if no params
  useEffect(() => {
    if (!data.firstName) routerNav.push('/dashboard/community/patients/new');
  }, [routerNav, data.firstName]);

  // Confirm and save to DB
  const onConfirm = async () => {
    console.log('onConfirm start - patientGroup:', groupStr);
    setErrorMsg(null);
    setLoading(true);
    // 1. Validate patientGroup
    if (!groupStr) {
      alert('กรุณาเลือกกลุ่มผู้ป่วย');
      setLoading(false);
      return;
    }
    // 2. Build payload from data
    const payload: Record<string, any> = { ...data };
    // Override group and village
    payload.patientGroup = groupStr;
    payload.villageName = data.copyAddr === 'true' ? data.currVillageName : data.villageName;
    // Convert types
    payload.lat = parseFloat(data.lat);
    payload.lng = parseFloat(data.lng);
    payload.copyAddr = data.copyAddr === 'true';
    payload.needTool = data.needTool === 'true';
    payload.statusHelpSelf = data.statusHelpSelf === 'true';
    payload.statusCannotHelpSelf = data.statusCannotHelpSelf === 'true';
    // 3. Submit
    try {
      const res = await confirmPatientData(payload);
      console.log('confirmPatientData result:', res);
      if (res.ok) {
        toast.success('บันทึกสำเร็จ');
        routerNav.push('/dashboard/community/patients');
      } else {
        const errText = await res.text();
        console.log('confirmPatientData error text:', errText);
        setErrorMsg('เกิดข้อผิดพลาดในการบันทึก: ' + errText);
        toast.error('บันทึกไม่สำเร็จ');
      }
    } catch {
      console.log('confirmPatientData threw error');
      setErrorMsg('ไม่สามารถบันทึกข้อมูลได้');
      toast.error('บันทึกไม่สำเร็จ');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">ตรวจสอบข้อมูลผู้ป่วย</h1>
      {loading && <div role="status"><Spinner /></div>}
      {errorMsg && <p role="alert" className="text-red-600 mb-4">{errorMsg}</p>}
      <div className="space-y-2 mb-6">
        {/* Basic info */}
        <div className="flex"><span className="w-40 font-semibold">คำนำหน้า:</span><span>{data.prefix}</span></div>
        <div className="flex"><span className="w-40 font-semibold">ชื่อ:</span><span>{data.firstName}</span></div>
        <div className="flex"><span className="w-40 font-semibold">สกุล:</span><span>{data.lastName}</span></div>
        {/* Photo Status */}
        <div className="flex items-center space-x-2">
          <span className="w-40 font-semibold">รูปภาพผู้ป่วย:</span>
          {data.photo && data.photo !== 'null'
            ? <Image
                src={data.photo}
                loader={({ src }) => src}
                unoptimized
                alt="รูปภาพผู้ป่วย"
                width={128}
                height={128}
                className="object-cover rounded"
              />
            : <span className="text-red-500">ไม่มีรูปภาพผู้ป่วย</span>
          }
        </div>
        <div className="flex"><span className="w-40 font-semibold">เลขบัตรประชาชน:</span><span>{data.nationalId}</span></div>
        <div className="flex"><span className="w-40 font-semibold">เบอร์โทร:</span><span>{data.phone}</span></div>
        <div className="flex"><span className="w-40 font-semibold">เพศ:</span><span>{data.gender}</span></div>
        <div className="flex"><span className="w-40 font-semibold">กรุ๊ฟเลือด:</span><span>{data.bloodGroup}</span></div>
        <div className="flex"><span className="w-40 font-semibold">วันเกิด:</span><span>{dobStr}</span></div>
        <div className="flex"><span className="w-40 font-semibold">อายุ:</span><span>{data.age}</span></div>
        {/* Address */}
        <div className="flex"><span className="w-40 font-semibold">ที่อยู่:</span><span>{addrStr}</span></div>
        {/* Self-help status */}
        <div className="flex"><span className="w-40 font-semibold">สถานะการช่วยเหลือตัวเอง:</span><span>{selfHelp}</span></div>
        {/* Tool remark if needed */}
        {data.needTool === 'true' && (
          <div className="flex"><span className="w-40 font-semibold">หมายเหตุอุปกรณ์พิเศษ:</span><span>{toolRemark}</span></div>
        )}
        {/* Group if provided */}
        {groupStr && (
          <div className="flex"><span className="w-40 font-semibold">กลุ่มผู้ป่วย:</span><span>{groupStr}</span></div>
        )}
        {/* Additional remark */}
        {data.remark && (
          <div className="flex"><span className="w-40 font-semibold">หมายเหตุ:</span><span>{data.remark}</span></div>
        )}
        {/* Patient Documents */}
        <div className="space-y-2 mb-4">
          <div className="flex">
            <span className="w-40 font-semibold">หนังสือรับรอง กำนัน/ผู้ใหญ่บ้าน:</span>
            <span>
              {data.docCertHead && data.docCertHead !== 'null'
                ? <a href={data.docCertHead} target="_blank" className="text-blue-600 underline">ดูเอกสาร</a>
                : 'ไม่มีเอกสารแนบ'}
            </span>
          </div>
          <div className="flex">
            <span className="w-40 font-semibold">หนังสือรับรองผู้ป่วยติดเตียง:</span>
            <span>
              {data.docCertBed && data.docCertBed !== 'null'
                ? <a href={data.docCertBed} target="_blank" className="text-blue-600 underline">ดูเอกสาร</a>
                : 'ไม่มีเอกสารแนบ'}
            </span>
          </div>
          <div className="flex">
            <span className="w-40 font-semibold">สำเนาใบนัดแพทย์:</span>
            <span>
              {data.docAppointment && data.docAppointment !== 'null'
                ? <a href={data.docAppointment} target="_blank" className="text-blue-600 underline">ดูเอกสาร</a>
                : 'ไม่มีเอกสารแนบ'}
            </span>
          </div>
          <div className="flex">
            <span className="w-40 font-semibold">เอกสารอื่นๆ:</span>
            <span>
              {data.docOther && data.docOther !== 'null'
                ? <a href={data.docOther} target="_blank" className="text-blue-600 underline">ดูเอกสาร</a>
                : 'ไม่มีเอกสารแนบ'}
            </span>
          </div>
        </div>
        {/* Coordinates */}
        <div className="flex"><span className="w-40 font-semibold">พิกัดรับส่ง:</span><span>{coordStr}</span></div>
      </div>
      <div className="flex justify-end space-x-4">
        <button className="px-4 py-2 border rounded text-gray-700" onClick={() => window.history.back()}>แก้ไข</button>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={onConfirm} disabled={loading}>ยืนยันและบันทึก</button>
      </div>
    </div>
  );
}
