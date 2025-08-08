import React from 'react';
import { CubeTransparentIcon } from '@heroicons/react/24/outline';

interface ComingSoonProps {
  title: string;
  description: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
  return (
    <div className="text-center bg-white p-12 rounded-lg shadow-md border border-gray-200">
      <CubeTransparentIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h2 className="mt-6 text-2xl font-bold text-gray-800">{title}</h2>
      <p className="mt-2 text-base text-gray-600">{description}</p>
      <p className="mt-4 text-sm text-blue-600 font-semibold">Coming Soon - Stay Tuned!</p>
    </div>
  );
};

export default ComingSoon;
