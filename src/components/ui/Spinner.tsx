import React from 'react';

export function Spinner(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex items-center justify-center h-full">
      <div role="status" {...props} className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 ${props.className || ''}`} />
    </div>
  );
}
