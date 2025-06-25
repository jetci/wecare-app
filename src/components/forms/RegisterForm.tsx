import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'

export const registerSchema = z.object({
  prefix: z.string().nonempty('Prefix is required'),
  firstName: z.string().nonempty('First name is required'),
  lastName: z.string().nonempty('Last name is required'),
  nationalId: z.string().regex(/^\d{13}$/, 'National ID must be 13 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['COMMUNITY', 'DRIVER', 'HEALTH_OFFICER', 'ADMIN']),
}).refine(data => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: "Passwords don't match",
})

type RegisterData = z.infer<typeof registerSchema>

export default function RegisterForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  })

  const [reviewData, setReviewData] = useState<RegisterData | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  // ขั้นตอนแรก: แค่ validate และเซ็ตข้อมูลสำหรับรีวิว
  const onSubmit = (data: RegisterData) => {
    setReviewData(data)
  }

  // ขั้นตอนสุดท้าย: ยืนยันแล้ว POST จริง
  const handleConfirm = async () => {
    if (!reviewData) return
    setIsConfirming(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message || 'Registration failed')
      alert('Registration successful')
      setReviewData(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Registration error')
    } finally {
      setIsConfirming(false)
    }
  }

  // ถ้ามี reviewData ให้แสดงหน้ารีวิวก่อน
  if (reviewData) {
    return (
      <div className="space-y-4 p-6 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold">Review Your Information</h2>
        <ul className="space-y-2">
          <li><strong>Prefix:</strong> {reviewData.prefix}</li>
          <li><strong>First Name:</strong> {reviewData.firstName}</li>
          <li><strong>Last Name:</strong> {reviewData.lastName}</li>
          <li><strong>National ID:</strong> {reviewData.nationalId}</li>
          <li><strong>Role:</strong> {reviewData.role}</li>
        </ul>
        <div className="flex space-x-4">
          <Button onClick={() => setReviewData(null)} disabled={isConfirming}>
            Edit
          </Button>
          <Button onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? 'Registering...' : 'Confirm'}
          </Button>
        </div>
      </div>
    )
  }

  // ปกติ: แสดงฟอร์มกรอกข้อมูล
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/** fields **/}
      <div>
        <label className="block">Prefix</label>
        <input {...register('prefix')} disabled={isSubmitting} className="border p-1 rounded w-full" />
        {errors.prefix && <p className="text-red-500">{errors.prefix.message}</p>}
      </div>
      <div>
        <label className="block">First Name</label>
        <input {...register('firstName')} disabled={isSubmitting} className="border p-1 rounded w-full" />
        {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}
      </div>
      <div>
        <label className="block">Last Name</label>
        <input {...register('lastName')} disabled={isSubmitting} className="border p-1 rounded w-full" />
        {errors.lastName && <p className="text-red-500">{errors.lastName.message}</p>}
      </div>
      <div>
        <label className="block">National ID</label>
        <input {...register('nationalId')} disabled={isSubmitting} className="border p-1 rounded w-full" />
        {errors.nationalId && <p className="text-red-500">{errors.nationalId.message}</p>}
      </div>
      <div>
        <label className="block">Password</label>
        <input type="password" {...register('password')} disabled={isSubmitting} className="border p-1 rounded w-full" />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
      </div>
      <div>
        <label className="block">Confirm Password</label>
        <input type="password" {...register('confirmPassword')} disabled={isSubmitting} className="border p-1 rounded w-full" />
        {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword.message}</p>}
      </div>
      <div>
        <label className="block">Role</label>
        <select {...register('role')} disabled={isSubmitting} className="border p-1 rounded w-full">
          <option value="COMMUNITY">Community</option>
          <option value="DRIVER">Driver</option>
          <option value="HEALTH_OFFICER">Health Officer</option>
          <option value="ADMIN">Admin</option>
        </select>
        {errors.role && <p className="text-red-500">{errors.role.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Register'}
      </Button>
    </form>
  )
}