import ReactDOM from "react-dom/client";
import App from "./App";

import { ToastProvider } from "./components/ui/sonner";
import DeepLinkListener from "./modules/deep-link/DeepLinkListener";
import { themeService } from "@/modules/settings/services/theme.service";
import { platform } from "@tauri-apps/plugin-os";
import { windowService } from "./modules/settings/services/window.service";
import { initAutostart } from "./services/autostart.service";
import { AuthGuard } from "./modules/auth/AuthGuard";
import { AppProviders } from "./providers/AppProdivers";

async function bootstrap() {
  await initAutostart();

  Promise.all([
    themeService.getTheme(),
    windowService.getBehavior(),
    themeService.getColor(),
  ]).catch(console.error);

  const os = await platform();
  if (os === "windows") {
    document.documentElement.setAttribute("data-platform", "windows");
  }

  // 2️⃣ Ahora renderiza React
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <>
      <DeepLinkListener />
      <AuthGuard>
        <AppProviders>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AppProviders>
      </AuthGuard>
    </>,
  );
}

bootstrap();
