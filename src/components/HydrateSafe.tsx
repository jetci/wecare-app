"use client";
import { ReactNode } from "react";

export default function HydrateSafe({ children }: { children: ReactNode }) {
  return <div suppressHydrationWarning>{children}</div>;
}
