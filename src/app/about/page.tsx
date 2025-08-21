import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about WeCare\'s mission and team.',
};

export default function AboutPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">About WeCare</h1>
      <p className="mt-4">This is the about us page.</p>
    </div>
  );
}
