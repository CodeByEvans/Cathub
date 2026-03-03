import { ZodType } from "zod";
import { FieldValues } from "react-hook-form";

export interface AuthField<T extends FieldValues> {
  name: keyof T;
  label: string;
  type: "text" | "email" | "password";
  placeholder?: string;
}

export interface AuthSecondaryAction {
  label: string;
  onClick: () => void;
}

export interface AuthFormConfig<T extends FieldValues> {
  title: string;
  subtitle?: string;
  fields: AuthField<T>[];
  submitText: string;
  schema: ZodType<T>; // 🔥 ESTE ES EL FIX REAL
  secondaryAction?: AuthSecondaryAction;
}

export interface AuthFormTemplateProps<T extends FieldValues> {
  config: AuthFormConfig<T>;
  onSubmit: (data: T) => void;
  isLoading?: boolean;
}
