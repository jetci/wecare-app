'use client';

import React from 'react';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/apiFetch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Terminal, Loader2 } from 'lucide-react';
import { patientFormSchema } from '@/schemas/patient.schema';

interface PatientFormProps {
  initialData?: z.infer<typeof patientFormSchema> & { id: string };
  onSuccess: () => void;
  onCancel: () => void;
}

export const PatientForm = ({ initialData, onSuccess, onCancel }: PatientFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<z.infer<typeof patientFormSchema>>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: initialData || {
      name: '',
      age: 0,
      gender: 'Other',
      condition: '',
      address: '',
      phoneNumber: '',
    },
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    reset(initialData || {
      name: '',
      age: 0,
      gender: 'Other',
      condition: '',
      address: '',
      phoneNumber: '',
    });
  }, [initialData, reset]);

  const isEditMode = !!initialData;

  const processSubmit = async (data: z.infer<typeof patientFormSchema>) => {
    setFormError(null);
    try {
      const endpoint = isEditMode ? `/api/patients/${initialData!.id}` : '/api/patients';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await apiFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'An unknown error occurred.');
      }
      
      onSuccess();

    } catch (error) {
      console.error('Submission failed:', error);
      setFormError(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-100';
  const errorClass = 'text-red-500 text-sm mt-1';

  return (
    <form onSubmit={handleSubmit(processSubmit)} className="space-y-4">
       {formError && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Operation Failed</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
        <input id="name" {...register('name')} className={inputClass} disabled={isSubmitting} />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Age</label>
        <input id="age" type="number" {...register('age')} className={inputClass} disabled={isSubmitting} />
        {errors.age && <p className={errorClass}>{errors.age.message}</p>}
      </div>

      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
        <select id="gender" {...register('gender')} className={inputClass} disabled={isSubmitting}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        {errors.gender && <p className={errorClass}>{errors.gender.message}</p>}
      </div>

      <div>
        <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label>
        <input id="condition" {...register('condition')} className={inputClass} disabled={isSubmitting} />
        {errors.condition && <p className={errorClass}>{errors.condition.message}</p>}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
        <input id="address" {...register('address')} className={inputClass} disabled={isSubmitting} />
        {errors.address && <p className={errorClass}>{errors.address.message}</p>}
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
        <input id="phoneNumber" {...register('phoneNumber')} className={inputClass} disabled={isSubmitting} />
        {errors.phoneNumber && <p className={errorClass}>{errors.phoneNumber.message}</p>}
      </div>

      <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Save Changes' : 'Create Patient'}
          </Button>
        </div>
    </form>
  );
};

export default PatientForm;
