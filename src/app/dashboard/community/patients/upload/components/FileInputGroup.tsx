import React from 'react'
import { UseFormRegister } from 'react-hook-form'

interface FileInputGroupProps {
  label: string
  name: string
  accept?: string
  register: UseFormRegister<any>
  error?: string
  previewUrl?: string
  fileName?: string
}

export default function FileInputGroup({ label, name, accept, register, error, previewUrl, fileName }: FileInputGroupProps) {
  console.log(`[FileInputGroup] ${name} error:`, error);
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block font-medium mb-1">{label}</label>
      <input id={name} type="file" accept={accept} {...register(name)} />
      {previewUrl ? (
        <img src={previewUrl} data-testid={`${name}-preview`} alt={`${name}-preview`} className="mt-2 w-24 h-24 object-cover rounded" />
      ) : (
        fileName && <p className="mt-2 truncate">{fileName}</p>
      )}
      {error && <p role="alert" data-testid={`${name}-error`} className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  )
}
