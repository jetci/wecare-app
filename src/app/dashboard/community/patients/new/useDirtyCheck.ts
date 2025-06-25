import { useEffect } from 'react';

/**
 * Warns user on page unload if form is dirty (unsaved changes).
 * @param isDirty - whether the form has unsaved changes
 */
export function useDirtyCheck(isDirty: boolean) {
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
}
