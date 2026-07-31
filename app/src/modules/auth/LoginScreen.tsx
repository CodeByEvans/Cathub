import { getCurrentWindow } from "@tauri-apps/api/window";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/sonner";

import Introduction from "@/modules/introduction/Introduction";

import { AuthTemplate } from "./components/templates/AuthTemplate";
import { AuthMode } from "./constants/auth-form.constants";
import { loginSchema, registerSchema } from "./schemas/authSchema";
import { authService } from "./services/auth.service";
import { handleAuthError } from "./helpers/authErrorHandler";
import { AppError } from "@/shared/errors/AppError";
import { logger } from "@/shared/logger";
import { onboardingRepository } from "@/shared/infrastructure/repositories/onboarding.repository";
import { WINDOW_SIZES } from "@/constants/window.constants";

type LoginForm = {
  email: string;
  username?: string;
  password: string;
  confirmPassword?: string;
};

export const LoginScreen = () => {
  const [introductionCompleted, setIntroductionCompleted] = useState<
    boolean | null
  >(null);
  const [mode, setMode] = useState<AuthMode>("login");

  const appWindow = getCurrentWindow();

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
        const completed = await onboardingRepository.isIntroductionCompleted();
        setIntroductionCompleted(completed);
      } catch (error) {
        logger.warn("auth", "No se pudo leer introduction_completed", error);
      }
    };
    loadStore();
  }, []);

  useEffect(() => {
    const resizeWindow = async () => {
      if (introductionCompleted === false) {
        await appWindow.setSize(WINDOW_SIZES.main);
        return;
      }

      if (introductionCompleted === true) {
        await appWindow.setSize(WINDOW_SIZES[mode]);
      }
    };

    resizeWindow();
  }, [introductionCompleted, mode]);

  useEffect(() => {
    reset({});
  }, [mode]);

  const completeIntroduction = () => {
    setIntroductionCompleted(true);
    onboardingRepository
      .completeIntroduction()
      .catch((error) =>
        logger.warn("auth", "No se pudo guardar introduction_completed", error),
      );
  };

  const handleRegister = async (data: LoginForm) => {
    try {
      if (!data.username) throw new AppError("auth/username-required");
      if (data.password !== data.confirmPassword)
        throw new AppError("auth/passwords-do-not-match");
      await authService.register(data.username, data.email, data.password);
      toast.success(
        "Registrado con exito, confirme su correo para activar su cuenta",
      );
      reset();
      setMode("login");
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleLogin = async (data: LoginForm) => {
    try {
      await authService.login(data.email, data.password);
      toast.success("Inicio de sesion exitoso");
      reset({});
      await appWindow.setSize(WINDOW_SIZES.main);
    } catch (error) {
      handleAuthError(error);
    }
  };

  const onSubmit = async (data: LoginForm) => {
    if (mode === "login") await handleLogin(data);
    else await handleRegister(data);
  };

  const toggleMode = () =>
    setMode((prev) => (prev === "login" ? "register" : "login"));

  if (introductionCompleted === null) return null;
  if (introductionCompleted === false) {
    return <Introduction onComplete={completeIntroduction} />;
  }

  return (
    <>
      <AuthTemplate
        mode={mode}
        register={register}
        errors={errors}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        onToggleMode={toggleMode}
      />
    </>
  );
};
