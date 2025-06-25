"use client";

import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  // Wrapper แสดง children โดยตรง
  return <>{children}</>;
}

