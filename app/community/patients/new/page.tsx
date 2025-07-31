"use client";

import React from "react";
import { useState } from "react";
import { AddPatientModal } from "@/components/community/AddPatientModal";

export default function NewPatientPage() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <AddPatientModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => {
          setIsOpen(false);
          // redirect or show toast as needed
        }}
      />
  );
}
