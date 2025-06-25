import * as yup from 'yup';
import { InferType } from 'yup';

// Validation schema covering all form fields
export const schema = yup
  .object({
    prefix: yup.string().required('กรุณาเลือกคำนำหน้า'),
    firstName: yup.string().required('กรุณาใส่ชื่อ'),
    lastName: yup.string().required('กรุณาใส่นามสกุล'),
    email: yup.string().email('รูปแบบอีเมลไม่ถูกต้อง').required('กรุณาใส่อีเมล'),
    nationalId: yup
      .string()
      .length(13, 'บัตรประชาชนต้อง 13 หลัก')
      .required('กรุณาใส่เลขบัตรประชาชน'),
    phone: yup
      .string()
      .matches(/^[0-9]{10}$/, 'เบอร์โทรศัพท์ต้อง 10 หลัก')
      .required('กรุณาใส่เบอร์โทรศัพท์'),
    gender: yup.string().required('กรุณาเลือกเพศ'),
    bloodGroup: yup.string().required('กรุณาเลือกรุ๊ปเลือด'),
    dob: yup.date().required('กรุณาเลือกวันเกิด'),
    age: yup.number().min(0, 'อายุไม่ถูกต้อง').required('กรุณาใส่อายุ'),
    photo: yup.mixed<FileList>().nullable().optional(),
    addrNo: yup.string().required('กรุณาใส่บ้านเลขที่'),
    addrMoo: yup.string().required('กรุณาใส่หมู่ที่'),
    villageName: yup.string().required('กรุณาใส่ชื่อหมู่บ้าน'),
    copyAddr: yup.boolean(),
    currNo: yup.string().required('กรุณาใส่บ้านเลขที่'),
    currMoo: yup.string().required('กรุณาใส่หมู่ที่'),
    currVillageName: yup.string().required('กรุณาใส่ชื่อหมู่บ้าน'),
    currSub: yup.string().required('กรุณาเลือกตำบล'),
    currDist: yup.string().required('กรุณาเลือกอำเภอ'),
    currProv: yup.string().required('กรุณาเลือกจังหวัด'),
    patientGroup: yup.string().required('กรุณาเลือกกลุ่มผู้ป่วย'),
    otherGroup: yup.string().nullable(),
    statusHelpSelf: yup.boolean().required('กรุณาระบุสถานะการช่วยตนเอง'),
    statusCannotHelpSelf: yup.boolean().required('กรุณาระบุสถานะการช่วยตนเอง'),
    needTool: yup.boolean().required('กรุณาระบุความต้องการอุปกรณ์'),
    toolRemark: yup.string().nullable().optional(),
    remark: yup.string().nullable().optional(),
    docCertHead: yup.mixed<FileList>().nullable().optional(),
    docCertBed: yup.mixed<FileList>().nullable().optional(),
    docAppointment: yup.mixed<FileList>().nullable().optional(),
    docOther: yup.mixed<FileList>().nullable().optional(),
    latitude: yup.string().required('กรุณาเลือกตำแหน่งบนแผนที่'),
    longitude: yup.string().required('กรุณาเลือกตำแหน่งบนแผนที่'),
    locationLabel: yup.string().nullable().optional(),
  })
  .required();

// Infer form values type from schema
export type FormValues = InferType<typeof schema>;
