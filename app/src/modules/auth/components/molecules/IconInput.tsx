import { Input } from "@/globals/components/atoms/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

export interface IconInputProps {
  id: string;
  type: "text" | "email" | "password";
  placeholder: string;
  Icon: React.ElementType;
  isPassword?: boolean;
  error?: string;
  registration: UseFormRegisterReturn;
}

export const IconInput: React.FC<IconInputProps> = ({
  id,
  type,
  placeholder,
  Icon,
  isPassword,
  error,
  registration,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1">
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id={id}
          type={resolvedType}
          placeholder={placeholder}
          className="pl-10 bg-input/50"
          {...registration}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};
