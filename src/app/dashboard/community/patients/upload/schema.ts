import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

// User-friendly field labels
const FIELD_LABELS: Record<string, string> = {
  certHead: 'หนังสือรับรอง กำนัน/ผู้ใหญ่บ้าน',
  certBed: 'หนังสือรับรองผู้ป่วยติดเตียง',
  appointment: 'สำเนาใบนัดแพทย์',
  other: 'เอกสารอื่นๆ',
}

// Schema for upload form per field
export const uploadSchema = z.object({
  certHead: z
    .instanceof(FileList)
    .refine(files => files.length === 1, { message: `โปรดเลือก${FIELD_LABELS.certHead}` })
    .refine(files => files.item(0) != null && ACCEPTED_TYPES.includes(files.item(0)!.type), { message: `ไฟล์ใน${FIELD_LABELS.certHead} รองรับเฉพาะ JPEG, PNG หรือ PDF` })
    .refine(files => files.item(0) != null && files.item(0)!.size <= MAX_FILE_SIZE, { message: `ขนาดไฟล์ใน${FIELD_LABELS.certHead} ต้องไม่เกิน 5MB` }),
  certBed: z
    .instanceof(FileList)
    .refine(files => files.length === 1, { message: `โปรดเลือก${FIELD_LABELS.certBed}` })
    .refine(files => files.item(0) != null && ACCEPTED_TYPES.includes(files.item(0)!.type), { message: `ไฟล์ใน${FIELD_LABELS.certBed} รองรับเฉพาะ JPEG, PNG หรือ PDF` })
    .refine(files => files.item(0) != null && files.item(0)!.size <= MAX_FILE_SIZE, { message: `ขนาดไฟล์ใน${FIELD_LABELS.certBed} ต้องไม่เกิน 5MB` }),
  appointment: z
    .instanceof(FileList)
    .refine(files => files.length === 1, { message: `โปรดเลือก${FIELD_LABELS.appointment}` })
    .refine(files => files.item(0) != null && ACCEPTED_TYPES.includes(files.item(0)!.type), { message: `ไฟล์ใน${FIELD_LABELS.appointment} รองรับเฉพาะ JPEG, PNG หรือ PDF` })
    .refine(files => {
      const ok = files.item(0) != null && files.item(0)!.size <= MAX_FILE_SIZE;
      if (!ok) console.log('🚨 oversize error triggered for appointment, size:', files.item(0)?.size);
      return ok;
    }, { message: `ขนาดไฟล์ใน${FIELD_LABELS.appointment} ต้องไม่เกิน 5MB` }),
  other: z
    .instanceof(FileList)
    .optional()
    .refine(files => !files || files.length === 0 || (files.item(0) != null && files.item(0)!.size <= MAX_FILE_SIZE), { message: `ขนาดไฟล์ใน${FIELD_LABELS.other} ต้องไม่เกิน 5MB` })
    .refine(files => !files || files.length === 0 || (files.item(0) != null && ACCEPTED_TYPES.includes(files.item(0)!.type)), { message: `ไฟล์ใน${FIELD_LABELS.other} รองรับเฉพาะ JPEG, PNG หรือ PDF` }),
})

export type UploadFormValues = z.infer<typeof uploadSchema>
