// auth/components/molecules/AuthField.tsx

import React from "react";

import { Input } from "@/globals/components/atoms/input";

interface AuthFieldProps {
  label: string;

  name: string;

  type?: string;

  placeholder?: string;

  register: any;

  error?: string;
}

export const AuthField: React.FC<AuthFieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>

      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!error}
        {...register(name)}
      />

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
};
