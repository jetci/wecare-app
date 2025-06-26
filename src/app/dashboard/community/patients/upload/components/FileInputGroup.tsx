import React from 'react'
import { UseFormRegister } from 'react-hook-form'
import { PreviewInfo } from '../hooks/usePreviewFiles' 

interface FileInputGroupProps {
  label: string
  name: string
  accept?: string
  register: UseFormRegister<any>
  error?: string
  previewInfo?: PreviewInfo
}

export default function FileInputGroup({ label, name, accept, register, error, previewInfo }: FileInputGroupProps) {
  console.log(`[FileInputGroup] ${name} error:`, error);
  return (
    <div role="group" aria-label={label} className="mb-4">
      <label htmlFor={name} className="block font-medium mb-1">{label}</label>
      <input
          id={name}
          type="file"
          accept={accept}
          aria-label={label}
          data-testid={`${name}-input`}
          {...register(name)}
        />
      {previewInfo ? (
        previewInfo.error ? (
          <p role="alert" data-testid={`${name}-error`}>{previewInfo.error}</p>
        ) : previewInfo.url ? (
          <img
            src={previewInfo.url}
            data-testid={`${name}-preview`}
            alt={`${name}-preview`}
            className="mt-2 w-24 h-24 object-cover rounded"
          />
        ) : (
          <div role="group" aria-label="file-info">
            <p data-testid={`${name}-name`}>{previewInfo.name}</p>
            <p data-testid={`${name}-size`}>{previewInfo.size} bytes</p>
            <p data-testid={`${name}-type`}>{previewInfo.type}</p>
          </div>
        )
      ) : null}

      {error && <p role="alert" data-testid={`${name}-error`} className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  )
}
