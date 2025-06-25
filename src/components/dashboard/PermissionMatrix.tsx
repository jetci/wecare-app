import React from 'react';

interface PermissionMatrixProps {}

export default function PermissionMatrix({}: PermissionMatrixProps) {
  return (
    <div
      data-testid="permission-matrix"
      className="p-4 bg-white rounded shadow"
      aria-label="Permission Matrix Placeholder"
    >
      <h2 className="text-lg font-semibold">Permission Matrix</h2>
      <p className="text-sm text-gray-500">Placeholder for permission matrix component.</p>
    </div>
  );
}
