import { Button } from "@/globals/components/atoms/button";
import { UseFormHandleSubmit, UseFormRegister, FieldErrors } from "react-hook-form";
import { AUTH_FIELDS, AuthMode } from "../../constants/auth-form.constants";
import { IconInput } from "../molecules/IconInput";
import { AuthFormLayout } from "../organisms/AuthFormLayout";

type LoginForm = {
  email: string;
  username?: string;
  password: string;
  confirmPassword?: string;
};

export interface AuthTemplateProps {
  mode: AuthMode;
  register: UseFormRegister<LoginForm>;
  errors: FieldErrors<LoginForm>;
  handleSubmit: UseFormHandleSubmit<LoginForm>;
  onSubmit: (data: LoginForm) => void;
  onToggleMode: () => void;
}

export const AuthTemplate: React.FC<AuthTemplateProps> = ({
  mode,
  register,
  errors,
  handleSubmit,
  onSubmit,
  onToggleMode,
}) => {
  const visibleFields = AUTH_FIELDS.filter(
    (field) => !field.showOnMode || field.showOnMode === mode,
  );

  return (
    <AuthFormLayout mode={mode}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {visibleFields.map((field) => (
          <IconInput
            key={field.id}
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            Icon={field.Icon}
            isPassword={field.isPassword}
            error={errors[field.name]?.message}
            registration={register(field.name)}
          />
        ))}

        <Button
          type="submit"
          className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
        >
          {mode === "login" ? "Iniciar sesion" : "Crear cuenta"}
        </Button>

        {mode === "login" && (
          <button
            type="button"
            className="w-full text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Olvidaste tu contraseña?
          </button>
        )}

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 text-muted-foreground">o</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleMode}
          className="w-full text-sm text-foreground hover:text-primary transition-colors"
        >
          {mode === "login" ? (
            <div className="flex flex-row items-center justify-center gap-1">
              <p className="text-sm text-muted-foreground">No tienes cuenta?</p>
              <span className="font-semibold text-foreground">Registrate</span>
            </div>
          ) : (
            <div className="flex flex-row items-center justify-center gap-1">
              <p className="text-sm text-muted-foreground">Ya tienes una cuenta?</p>
              <span className="font-semibold text-foreground">Inicia sesion</span>
            </div>
          )}
        </button>
      </form>
    </AuthFormLayout>
  );
};
