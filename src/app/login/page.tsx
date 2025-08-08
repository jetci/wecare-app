"use client";

import React from 'react';
import LoginForm from './LoginForm';

/**
 * LoginPage Component
 * Renders a two-column layout for the login screen.
 * - The left column displays a responsive illustration.
 * - The right column contains the login form.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <main className="flex w-full max-w-6xl shadow-xl rounded-lg overflow-hidden">
        {/* Left Column: Image */}
        <div className="w-1/2 bg-white p-6 flex items-center justify-center overflow-hidden">
          {/* Using standard <img> tag as per SA's specific instruction (X-Command) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/login-illustration.png"
            alt="A doctor and a patient reviewing information on a tablet."
            className="object-contain max-w-full h-auto"
          />
        </div>

        {/* Right Column: Login Form */}
        <div className="w-1/2 p-6 flex items-center justify-center">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}