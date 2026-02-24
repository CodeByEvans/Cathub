import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AuthGuard from "./modules/auth/components/AuthGuard";
import { Toaster } from "./components/ui/sonner";
import DeepLinkListener from "./modules/deep-link/DeepLinkListener";
import { themeService } from "./services/theme.service";
import { platform } from "@tauri-apps/plugin-os";

async function bootstrap() {
  // 1️⃣ Espera a que se cargue el theme
  await themeService.getTheme(); // Esto ya aplica la clase en document.documentElement

  const os = await platform();
  if (os === "windows") {
    document.documentElement.setAttribute("data-platform", "windows");
  }

  // 2️⃣ Ahora renderiza React
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <DeepLinkListener />
      <Toaster />
      <AuthGuard>
        <App />
      </AuthGuard>
    </React.StrictMode>,
  );
}

bootstrap();
