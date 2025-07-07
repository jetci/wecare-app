import { useState, useEffect } from 'react'
import { UseFormWatch } from 'react-hook-form'

/**
 * Detailed preview information for a file input
 */
export interface PreviewInfo {
  url: string
  name: string
  size: number
  type: string
  error?: string
}

/**
 * Hook to generate detailed preview info for file inputs with validation
 * @param watch - react-hook-form's watch function
 * @returns Record of field name to PreviewInfo
 */
export function usePreviewFiles<T extends Record<string, any>>(watch: UseFormWatch<T>) {
  const fields = ['certHead', 'certBed', 'appointment', 'other'] as const
  const watchedLists = watch(fields as any) as FileList[]
  const [previews, setPreviews] = useState<Record<string, PreviewInfo>>({})
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB

  useEffect(() => {
    const names = watchedLists.map(fl => fl?.[0]?.name).filter(Boolean) as string[]
    const duplicateNames = names.filter((n, i) => names.indexOf(n) !== i)

    fields.forEach((field, index) => {
      const files = watchedLists[index]
      if (files?.length) {
        const file = files[0]
        const { name, size, type } = file
        let error: string | undefined
        if (size > MAX_SIZE) error = 'File size exceeds limit'
        else if (duplicateNames.includes(name)) error = 'Duplicate file name'

        const url = !error && type.startsWith('image/') ? URL.createObjectURL(file) : ''
        setPreviews(prev => ({ ...prev, [field]: { url, name, size, type, error } }))
      } else {
        setPreviews(prev => {
          const copy = { ...prev }
          delete copy[field]
          return copy
        })
      }
    })
  }, [watchedLists])

  return previews
}
