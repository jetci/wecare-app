import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const areaSchema = z.object({
  province: z.string().nonempty('กรุณากรอกจังหวัด'),
  district: z.string().nonempty('กรุณากรอกอำเภอ'),
  subdistrict: z.string().nonempty('กรุณากรอกตำบล'),
  active: z.boolean(),
});
type AreaSchema = z.infer<typeof areaSchema>;

type AreaFormProps = {
  area?: Partial<AreaSchema> & { id?: string };
  onSuccess: () => void;
};

export default function AreaForm({ area, onSuccess }: AreaFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AreaSchema>({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      province: area?.province ?? 'เชียงใหม่',
      district: area?.district ?? 'ฝาง',
      subdistrict: area?.subdistrict ?? 'เวียง',
      active: area?.active ?? true,
    },
  });

  useEffect(() => {
    if (area) {
      reset({
        province: area.province ?? 'เชียงใหม่',
        district: area.district ?? 'ฝาง',
        subdistrict: area.subdistrict ?? 'เวียง',
        active: area.active ?? true,
      });
    }
  }, [area, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const method = area?.id ? 'PUT' : 'POST';
      const url = '/api/admin/areas';
      const payload = area?.id ? { ...data, id: area.id } : data;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Request failed');
      toast.success(area?.id ? 'อัปเดตพื้นที่สำเร็จ' : 'เพิ่มพื้นที่สำเร็จ');
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาด');
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="province" className="block mb-1">จังหวัด</label>
        <input
          id="province"
          {...register('province')}
          className="border p-2 w-full"
        />
        {errors.province && <p className="text-red-500 text-sm">{errors.province.message}</p>}
      </div>
      <div>
        <label htmlFor="district" className="block mb-1">อำเภอ</label>
        <input
          id="district"
          {...register('district')}
          className="border p-2 w-full"
        />
        {errors.district && <p className="text-red-500 text-sm">{errors.district.message}</p>}
      </div>
      <div>
        <label htmlFor="subdistrict" className="block mb-1">ตำบล</label>
        <input
          id="subdistrict"
          {...register('subdistrict')}
          className="border p-2 w-full"
        />
        {errors.subdistrict && <p className="text-red-500 text-sm">{errors.subdistrict.message}</p>}
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('active')}
          id="active"
          className="mr-2"
        />
        <label htmlFor="active">เปิดใช้งาน</label>
      </div>
      <div className="text-right">
        <Button type="submit" disabled={isSubmitting}>
          {area?.id ? 'อัปเดต' : 'สร้าง'}
        </Button>
      </div>
    </form>
  );
}
