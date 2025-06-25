"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { uploadSchema, UploadFormValues } from './schema'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

// Components & hooks
import FileInputGroup from './components/FileInputGroup'
import { usePreviewFiles } from './hooks/usePreviewFiles'

// Form schema and types
type FormValues = UploadFormValues

export default function UploadPatientDocsPage() {
  const router = useRouter()
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(uploadSchema) })

  // Preview state hook
  const previews = usePreviewFiles(watch)

  // Compute preview URLs and file names
  const fieldNames = ['certHead', 'certBed', 'appointment', 'other'] as const
  const watchedLists = watch(fieldNames) as FileList[]
  const fileNames: Record<string, string | undefined> = {}
  fieldNames.forEach((field, index) => {
    const fl = watchedLists[index]
    fileNames[field] = fl && fl.length > 0 ? fl[0].name : undefined
  })

  const onSubmit = async (data: FormValues) => {
    // Ensure at least one file selected
    const filesArray = Object.values(data) as FileList[]
    if (!filesArray.some((fl) => fl?.length > 0)) {
      toast.error('กรุณาเลือกอย่างน้อยหนึ่งไฟล์')
      return
    }
    // Build FormData
    const formData = new FormData();
    const keys = Object.keys(data) as Array<keyof FormValues>;
    keys.forEach((field: keyof FormValues) => {
      const files = data[field] as FileList
      if (files?.length) formData.append(field, files[0])
    })
    try {
      const res = await fetch('/api/patients/upload-docs', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      toast.success('อัปโหลดสำเร็จ')
      router.push('/dashboard/community/patients/review')
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการอัปโหลด')
    }
  }

  return (
  <div className="max-w-3xl mx-auto p-4">
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* File inputs for each document type */}
      <FileInputGroup
        label="หนังสือรับรอง กำนัน/ผู้ใหญ่บ้าน"
        name="certHead"
        register={register}
        error={errors.certHead?.message}
        previewUrl={previews.certHead}
        fileName={fileNames.certHead}
      />
      <FileInputGroup
        label="หนังสือรับรองผู้ป่วยติดเตียง"
        name="certBed"
        register={register}
        error={errors.certBed?.message}
        previewUrl={previews.certBed}
        fileName={fileNames.certBed}
      />
      <FileInputGroup
        label="สำเนาใบนัดแพทย์"
        name="appointment"
        register={register}
        error={errors.appointment?.message}
        previewUrl={previews.appointment}
        fileName={fileNames.appointment}
      />
      <FileInputGroup
        label="เอกสารอื่นๆ"
        name="other"
        register={register}
        error={errors.other?.message}
        previewUrl={previews.other}
        fileName={fileNames.other}
      />

      <div className="flex space-x-4 md:col-span-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isSubmitting ? 'กำลังส่ง...' : 'ส่งข้อมูล'}
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
        >
          รีเซ็ต
        </button>
      </div>
        </form>
  </div>
  )
}
