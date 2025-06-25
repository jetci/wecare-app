import React from 'react';

interface ProfileCardProps {
  name: string;
  nationalId: string;
  phone: string;
}

export default function ProfileCard({ name, nationalId, phone }: ProfileCardProps) {
  return (
    <div data-testid="profile-card" aria-label="Profile Card" className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold">{name}</h2>
      <p>National ID: {nationalId}</p>
      <p>Phone: {phone}</p>
    </div>
  );
}
