"use client";

import React, { ChangeEvent } from "react";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export default function SearchInput({ placeholder = "", value, onChange, onSearch }: SearchInputProps) {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <input
        type="text"
        className="border rounded p-2 flex-1"
        placeholder={placeholder}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white rounded px-4 py-2"
        onClick={onSearch}
      >
        ค้นหา
      </button>
    </div>
  );
}
