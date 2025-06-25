import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  dataTestId?: string;
}

export default function Skeleton({ width = '100%', height = '1rem', dataTestId }: SkeletonProps) {
  return (
    <div
      data-testid={dataTestId}
      style={{
        width,
        height,
        backgroundColor: '#E0E0E0',
        borderRadius: '4px',
        marginBottom: '0.5rem',
      }}
      className="skeleton"
    />
  );
}
