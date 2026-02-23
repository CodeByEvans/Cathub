import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AuthGuard from "./modules/auth/components/AuthGuard";
import { Toaster } from "./components/ui/sonner";
import DeepLinkListener from "./modules/deep-link/DeepLinkListener";
import { themeService } from "./services/theme.service";

async function bootstrap() {
  // 1️⃣ Espera a que se cargue el theme
  await themeService.getTheme(); // Esto ya aplica la clase en document.documentElement

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
