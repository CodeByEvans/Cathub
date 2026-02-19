import { Button } from "@/globals/components/atoms/button";
import { Input } from "@/globals/components/atoms/input";
import { CathubLogo } from "@/globals/components/atoms/logo";

import Introduction from "@/modules/introduction/Introduction";
import { Label } from "@radix-ui/react-label";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { zodResolver } from "@hookform/resolvers/zod";

import { load } from "@tauri-apps/plugin-store";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, registerSchema } from "../loginSchema";
import { authService } from "../services/auth.service";
import { toast } from "sonner";
import { handleAuthError } from "../helpers/authErrorHandler";

type AuthMode = "login" | "register";

type LoginForm = {
  email: string;
  username?: string;
  password: string;
  confirmPassword?: string;
};

export const LoginScreen = () => {
  const [introduction_completed, setIntroductionCompleted] = useState<
    boolean | null
  >(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm>({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema),
  });
  useEffect(() => {
    const store = async () => {
      try {
        const store = await load("store.json");
        const introduction_completed = await store.get<boolean>(
          "introduction_completed",
        );
        setIntroductionCompleted(
          introduction_completed === true ? true : false,
        );
        const theme = await store.get<string>("theme");
        document.documentElement.classList.remove("light", "dark", "glass");
        if (theme && theme !== "light") {
          document.documentElement.classList.add(theme);
        }
      } catch (error) {
        console.error(error);
      }
    };
    store();
  }, []);

  useEffect(() => {
    if (introduction_completed === true) {
      getCurrentWindow().setSize(new LogicalSize(400, 600));
    } else {
      getCurrentWindow().setSize(new LogicalSize(800, 200));
    }
  }, [introduction_completed]);

  const completeIntroduction = async () => {
    setIntroductionCompleted(true);
  };

  const goToRegister = async (data: LoginForm) => {
    try {
      if (!data.username) {
        throw new Error("Username is required");
      }
      await authService
        .register(data.username, data.email, data.password)
        .then(() => {
          toast.success(
            "Registrado con exito, confirme su correo para activar su cuenta",
          );
          reset();
          setMode("login");
        });
    } catch (error) {
      console.error(error);
    }
  };

  const goToLogin = async (data: LoginForm) => {
    try {
      await authService.login(data.email, data.password);
      toast.success("Inicio de sesion exitoso");
      reset();
      getCurrentWindow().setSize(new LogicalSize(800, 200));
    } catch (error) {
      handleAuthError(error);
    }
  };

  const onSubmit = async (data: LoginForm) => {
    if (mode === "login") {
      goToLogin(data);
    } else if (mode === "register") {
      await goToRegister(data);
    }
  };

  const toggleMode = () => {
    const changeToRegister = () => {
      getCurrentWindow().setSize(new LogicalSize(400, 700));
      setMode("register");
    };
    const changeToLogin = () => {
      getCurrentWindow().setSize(new LogicalSize(400, 600));
      setMode("login");
    };
    mode === "login" ? changeToRegister() : changeToLogin();
  };

  const revealPassword = (
    state: boolean,
    setState: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    return (
      <button
        type="button"
        onClick={() => setState(!state)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {state ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    );
  };

  if (introduction_completed === null) {
    return null;
  }

  if (introduction_completed === false) {
    return <Introduction onComplete={completeIntroduction} />;
  }
  return (
    <main
      className="w-[400px] rounded-2xl border border-border/50 shadow-2xl overflow-hidden "
      style={{ height: mode === "login" ? 600 : 700 }}
      data-color={mode === "login" ? "blue" : "purple"}
    >
      {/* Header with logo */}
      <div
        data-tauri-drag-region
        className="flex flex-col items-center gap-3 pt-8 pb-6 bg-gradient-to-b from-primary/10 to-transparent"
      >
        <CathubLogo size="lg" mode={mode} />
        <h1 className="text-2xl font-bold text-foreground">Cathub</h1>
        <p className="text-sm text-muted-foreground">
          {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-4">
        {mode === "register" && (
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="Tu nombre"
                {...register("username")}
                className="pl-10 bg-input/50"
                {...(errors.username && (
                  <p className="text-xs text-destructive">
                    {errors.username.message}
                  </p>
                ))}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Correo electronico
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register("email")}
              className="pl-10 bg-input/50"
              {...(errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              ))}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Contraseña
          </Label>
          <div className="relative">
            <Lock className=" absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              {...register("password")}
              className="pl-10 bg-input/50"
              {...(errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              ))}
            />
            {revealPassword(showPassword, setShowPassword)}
          </div>
        </div>

        {mode === "register" && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="********"
                className="pl-10 bg-input/50"
                {...register("confirmPassword")}
                {...(errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                ))}
              />
              {revealPassword(showConfirmPassword, setShowConfirmPassword)}
            </div>
          </div>
        )}

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
          <div className="relative flex justify-center text-xs ">
            <span className="px-2 text-muted-foreground">o</span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleMode}
          className="w-full text-sm text-foreground hover:text-primary transition-colors"
        >
          {mode === "login" ? (
            <>
              No tienes cuenta?{" "}
              <span className="font-semibold text-primary">Registrate</span>
            </>
          ) : (
            <>
              Ya tienes cuenta?{" "}
              <span className="font-semibold text-primary">Inicia sesion</span>
            </>
          )}
        </button>
      </form>
    </main>
  );
};
