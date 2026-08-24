import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastProvider } from "./components/ui/sonner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import DeepLinkListener from "./modules/deep-link/DeepLinkListener";
import { themeService } from "@/modules/settings/services/theme.service";
import { platform } from "@tauri-apps/plugin-os";
import { windowService } from "./modules/settings/services/window.service";
import { initAutostart } from "./services/autostart.service";
import { AuthGuard } from "./modules/auth/AuthGuard";
import { AppProviders } from "./providers/AppProdivers";
import { logger } from "@/shared/logger";

document.documentElement.style.backgroundColor = "#080808";
document.documentElement.style.borderRadius = "0.75rem";
document.documentElement.style.overflow = "hidden";
document.body.style.margin = "0";

async function bootstrap() {
  try {
    await initAutostart();
  } catch (error) {
    // Un fallo del store/autostart no debe impedir que la app renderice.
    logger.error("bootstrap", "autostart init failed", error);
  }

  Promise.all([
    themeService.getTheme(),
    windowService.getBehaviorState(),
    themeService.getColor(),
    windowService.loadControlsPosition(),
  ]).catch((error) => logger.error("bootstrap", "init settings failed", error));

  const os = await platform();
  if (os === "windows") {
    document.documentElement.setAttribute("data-platform", "windows");
  }

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <>
      <DeepLinkListener />
      <AuthGuard>
        <AppProviders>
          <ToastProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </ToastProvider>
        </AppProviders>
      </AuthGuard>
    </>,
  );
}

bootstrap();
