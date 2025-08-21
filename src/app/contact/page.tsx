import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the WeCare support team.',
};

export default function ContactPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p className="mt-4">This is the contact page.</p>
    </div>
  );
}
