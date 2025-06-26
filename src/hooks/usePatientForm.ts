import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { compressImage, validateImage } from '../utils/image';
import { fetchData } from '../services/api';

export type PatientFormState = Record<string, unknown>;

export function usePatientForm(initialForm: PatientFormState = {}) {
  const router = useRouter();
  const [form, setForm] = useState<PatientFormState>(initialForm);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>('');

  const handle = <K extends keyof Omit<PatientFormState, 'photo'>>(key: K) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((f: PatientFormState) => ({ ...f, [key]: value }));
  };

  const handlePhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const err = validateImage(file);
      if (err) {
        setErrors((prev: Record<string,string>) => ({ ...prev, photo: err }));
        return;
      }
      setForm((f: PatientFormState) => ({ ...f, photo: file }));
      setPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, photo: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    // validate required
    const newErr: any = {};
    ['firstName','lastName','phone','dob'].forEach(k => {
      if (!form[k]) newErr[k] = 'กรุณากรอกข้อมูล';
    });
    if (Object.keys(newErr).length) return setErrors(newErr);

    // compress image
    let photoFile: File | null = null;
    if (form.photo instanceof File) {
      photoFile = await compressImage(form.photo);
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]:any) => {
      if (k === 'photo' && photoFile) fd.append('photo', photoFile);
      else if (v != null) fd.append(k, String(v));
    });

    setIsUploading(true);
    try {
      await fetchData();
      router.push('/dashboard/community/patients');
    } catch (err:any) {
      setErrors((prev: Record<string,string>) => ({ ...prev, submit: err.message || 'ผิดพลาด' }));
    } finally {
      setIsUploading(false);
    }
  };

  return { form, errors, isUploading, preview, handle, handlePhoto, handleSubmit };
}
