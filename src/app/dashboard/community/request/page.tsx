"use client";

import React from "react";
import RoleGuard from "@/components/RoleGuard";
import CommunityLayout from "../layout";
import CommunityRequestForm from "@/components/CommunityRequestForm";
import { Role } from "@/types/roles";

export default function CommunityRequestPage() {
  return (
    <RoleGuard allowedRoles={[Role.COMMUNITY]}>
      <CommunityLayout>
        <main className="container mx-auto px-4 py-8">
          <CommunityRequestForm />
        </main>
      </CommunityLayout>
    </RoleGuard>
  );
}
