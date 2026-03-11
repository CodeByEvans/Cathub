import { AuthMode } from "../../constants/auth-form.constants";
import { CathubLogo } from "@/globals/components/atoms/logo";

export interface AuthFormLayoutProps {
  mode: AuthMode;
  children: React.ReactNode;
}

export const AuthFormLayout: React.FC<AuthFormLayoutProps> = ({
  mode,
  children,
}) => (
  <main
    className="w-[400px] rounded-2xl border border-border/50 shadow-2xl overflow-hidden"
    style={{ height: mode === "login" ? 600 : 700 }}
  >
    <div
      data-tauri-drag-region
      className="flex flex-col items-center gap-3 pt-8 pb-6 bg-gradient-to-b from-primary/10 to-transparent"
    >
      <CathubLogo size="lg" auth={true} />
      <h1 className="text-2xl font-bold text-foreground glass:text-primary-foreground">
        Cathub
      </h1>
      <p className="text-sm text-muted-foreground">
        {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
      </p>
    </div>

    <div className="px-8 pb-8">{children}</div>
  </main>
);
