import React from "react";

type Props = {
  value?: string;
  options: string[];
  onChange: (type?: string) => void;
};

export const RideTypeSelect: React.FC<Props> = ({ value, options, onChange }) => (
  <select
    className="p-2 border rounded"
    value={value || ""}
    onChange={(e) => onChange(e.target.value || undefined)}
    aria-label="เลือกประเภท Ride"
  >
    <option value="">ทั้งหมด</option>
    {options.map((type) => (
      <option key={type} value={type}>
        {type}
      </option>
    ))}
  </select>
);
