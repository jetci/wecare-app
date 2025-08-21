import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently Asked Questions about the WeCare platform.',
};

export default function FAQPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
      <p className="mt-4">This is the FAQ page.</p>
    </div>
  );
}
