import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { zodResolver } from "@hookform/resolvers/zod";
import { load } from "@tauri-apps/plugin-store";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import Introduction from "@/modules/introduction/Introduction";

import { AuthTemplate } from "./components/templates/AuthTemplate";
import { AuthMode } from "./constants/auth-form.constants";
import { loginSchema, registerSchema } from "./schemas/authSchema";
import { authService } from "./services/auth.service";
import { handleAuthError } from "./helpers/authErrorHandler";
import { getValue, hasValue } from "@/services/store.service";

type LoginForm = {
  email: string;
  username?: string;
  password: string;
  confirmPassword?: string;
};

const WINDOW_SIZES: Record<string, LogicalSize> = {
  login: new LogicalSize(400, 600),
  register: new LogicalSize(400, 700),
  intro: new LogicalSize(700, 200),
};

export const LoginScreen = () => {
  const [introductionCompleted, setIntroductionCompleted] = useState<
    boolean | null
  >(null);
  const [mode, setMode] = useState<AuthMode>("login");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginForm>({
    resolver: zodResolver(mode === "login" ? loginSchema : registerSchema),
  });

  useEffect(() => {
    const loadStore = async () => {
      try {
        const completed = await hasValue("introduction_completed");
        setIntroductionCompleted(completed === true);
      } catch (error) {
        console.error(error);
      }
    };
    loadStore();
  }, []);

  useEffect(() => {
    if (introductionCompleted === true) {
      getCurrentWindow().setSize(WINDOW_SIZES[mode]);
    } else if (introductionCompleted === false) {
      getCurrentWindow().setSize(WINDOW_SIZES.intro);
    }
  }, [introductionCompleted, mode]);

  useEffect(() => {
    reset();
  }, [mode]);

  const completeIntroduction = () => setIntroductionCompleted(true);

  const handleRegister = async (data: LoginForm) => {
    try {
      if (!data.username) throw new Error("Username is required");
      if (data.password !== data.confirmPassword)
        throw new Error("Passwords do not match");
      await authService.register(data.username, data.email, data.password);
      toast.success(
        "Registrado con exito, confirme su correo para activar su cuenta",
      );
      reset();
      setMode("login");
    } catch (error) {
      console.error(error);
      handleAuthError(error);
    }
  };

  const handleLogin = async (data: LoginForm) => {
    try {
      await authService.login(data.email, data.password);
      toast.success("Inicio de sesion exitoso");
      reset();
      getCurrentWindow().setSize(WINDOW_SIZES.intro);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const onSubmit = (data: LoginForm) => {
    if (mode === "login") handleLogin(data);
    else handleRegister(data);
  };

  const toggleMode = () =>
    setMode((prev) => (prev === "login" ? "register" : "login"));

  if (introductionCompleted === null) return null;
  if (introductionCompleted === false) {
    return <Introduction onComplete={completeIntroduction} />;
  }

  return (
    <AuthTemplate
      mode={mode}
      register={register}
      errors={errors}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      onToggleMode={toggleMode}
    />
  );
};
