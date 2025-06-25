import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

// User-friendly field names
const FIELD_LABELS: Record<string, string> = {
  doc1: 'หนังสือรับรอง กำนัน/ผู้ใหญ่บ้าน',
  doc2: 'หนังสือรับรองผู้ป่วยติดเตียง',
  doc3: 'สำเนาใบนัดแพทย์',
  doc4: 'เอกสารอื่นๆ',
}

export const uploadSchema = z.object({
  doc1: z
    .instanceof(FileList)
    .refine(files => files.length === 1, `โปรดเลือก${FIELD_LABELS.doc1}`)
    .refine(
      files => files.item(0)!.size <= MAX_FILE_SIZE,
      `ขนาดไฟล์ใน${FIELD_LABELS.doc1} ต้องไม่เกิน 5MB`,
    )
    .refine(
      files => ACCEPTED_FILE_TYPES.includes(files.item(0)!.type),
      `ไฟล์ใน${FIELD_LABELS.doc1} รองรับเฉพาะ JPEG, PNG หรือ PDF`,
    ),
  doc2: z
    .instanceof(FileList)
    .refine(files => files.length === 1, `โปรดเลือก${FIELD_LABELS.doc2}`)
    .refine(
      files => files.item(0)!.size <= MAX_FILE_SIZE,
      `ขนาดไฟล์ใน${FIELD_LABELS.doc2} ต้องไม่เกิน 5MB`,
    )
    .refine(
      files => ACCEPTED_FILE_TYPES.includes(files.item(0)!.type),
      `ไฟล์ใน${FIELD_LABELS.doc2} รองรับเฉพาะ JPEG, PNG หรือ PDF`,
    ),
  doc3: z
    .instanceof(FileList)
    .refine(files => files.length === 1, `โปรดเลือก${FIELD_LABELS.doc3}`)
    .refine(
      files => files.item(0)!.size <= MAX_FILE_SIZE,
      `ขนาดไฟล์ใน${FIELD_LABELS.doc3} ต้องไม่เกิน 5MB`,
    )
    .refine(
      files => ACCEPTED_FILE_TYPES.includes(files.item(0)!.type),
      `ไฟล์ใน${FIELD_LABELS.doc3} รองรับเฉพาะ JPEG, PNG หรือ PDF`,
    ),
  doc4: z
    .instanceof(FileList)
    .optional()
    .refine(
      files => !files || files.length === 0 || files.item(0)!.size <= MAX_FILE_SIZE,
      `ขนาดไฟล์ใน${FIELD_LABELS.doc4} ต้องไม่เกิน 5MB`,
    )
    .refine(
      files => !files || files.length === 0 || ACCEPTED_FILE_TYPES.includes(files.item(0)!.type),
      `ไฟล์ใน${FIELD_LABELS.doc4} รองรับเฉพาะ JPEG, PNG หรือ PDF`,
    ),
})

export type UploadSchema = z.infer<typeof uploadSchema>
