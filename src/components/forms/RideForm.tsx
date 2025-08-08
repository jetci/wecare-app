import React from 'react'
import useSWR from 'swr'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const fetcher = (url: string) => fetch(url).then(res => res.json())

const formSchema = z.object({
  patientId: z.string().nonempty('กรุณาเลือกผู้ป่วย'),
  date: z.string().refine(val => new Date(val).getTime() > Date.now(), { message: 'กรุณาเลือกวันเวลาที่อยู่ในอนาคต' }),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof formSchema>

interface RideFormProps {
  onClose: () => void
  /** เรียกเมื่อ submit สำเร็จ (optional) */
  onSuccess?: () => void
} 

export function RideForm({ onSuccess, onClose }: RideFormProps) {
  // ดึงข้อมูล patients จาก API ที่ส่งกลับ { patients: Patient[] }
  const { data } = useSWR<{ patients: { id: string; firstName: string; lastName: string; villageName: string }[] }>(
    '/api/patients?approved=true',
    fetcher,
  )
  // สร้างรายการสำหรับ select
  const patients = data?.patients.map(p => ({
    id: p.id,
    fullName: `${p.firstName} ${p.lastName}`,
    village: p.villageName,
  })) || []
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(formSchema) })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/rides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: data.patientId, date: data.date, notes: data.notes }),
      })
      if (!res.ok) throw new Error('การร้องขอล้มเหลว')
      window.alert('ส่งคำขอสำเร็จ')
      onSuccess?.()
    } catch (err: unknown) {
      if (err instanceof Error) {
        window.alert(err.message)
      } else {
        window.alert('การร้องขอผู้ป่วยล้มเหลว')
      }
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="ride-form-title" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-4"
      >
        <h2 id="ride-form-title" className="text-xl font-semibold">ขอรับจ้างรับส่งผู้ป่วย</h2>
        <div>
          <label htmlFor="patientId" className="block text-sm">ผู้ป่วย</label>
          <select
            id="patientId"
            {...register('patientId')}
            className="mt-1 w-full border rounded px-2 py-1"
          >
            <option value="">-- เลือกผู้ป่วย --</option>
            {patients?.map(p => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.village})
              </option>
            ))}
          </select>
          {errors.patientId && <p className="text-red-500 text-sm">{errors.patientId.message}</p>}
        </div>
        <div>
          <label htmlFor="date" className="block text-sm">วันและเวลานัดหมาย</label>
          <input
            id="date"
            type="datetime-local"
            {...register('date')}
            className="mt-1 w-full border rounded px-2 py-1"
          />
          {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
        </div>
        <div>
          <label className="block text-sm">หมายเหตุ (ไม่บังคับ)</label>
          <textarea
            {...register('notes')}
            className="mt-1 w-full border rounded px-2 py-1"
            rows={3}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onSuccess}
            className="px-4 py-2 bg-gray-200 rounded"
            disabled={isSubmitting}
            aria-label="ยกเลิก"
          >ยกเลิก</button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
            disabled={isSubmitting}
            aria-label="ส่งคำขอผู้ป่วย"
          >
            {isSubmitting ? <span className="loader mr-2"></span> : null}
            ส่งคำขอ
          </button>
        </div>
      </form>
    </div>
  )
}

export default RideForm
