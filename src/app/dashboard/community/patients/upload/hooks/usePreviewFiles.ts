import { useState, useEffect } from 'react'
import { UseFormWatch } from 'react-hook-form'

/**
 * Hook to generate preview URLs for file inputs
 * @param watch - react-hook-form's watch function
 * @returns Record of field name to preview URL
 */
export function usePreviewFiles<T extends Record<string, any>>(watch: UseFormWatch<T>) {
  const fields = ['certHead', 'certBed', 'appointment', 'other'] as const
  const watchedLists = watch(fields as any) as FileList[]
  const [previews, setPreviews] = useState<Record<string, string>>({})

  useEffect(() => {
    fields.forEach((field, index) => {
    
      const files = watchedLists[index]
      if (files?.length) {
        const file = files[0]
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file)
          setPreviews((prev) => ({ ...prev, [field]: url }))
        } else {
          setPreviews((prev) => ({ ...prev, [field]: '' }))
        }
      }
    })
    }, [watchedLists])

  return previews
}
