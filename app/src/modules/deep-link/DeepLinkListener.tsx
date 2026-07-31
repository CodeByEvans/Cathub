import { useEffect } from "react";
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { handleAppError } from "@/shared/errors/appErrorHandler";
import { handleDeepLink } from "./handlers/deepLink.handler";

const DeepLinkListener = () => {
  useEffect(() => {
    // Captura al iniciar
    getCurrent()
      .then((urls) => {
        if (urls && urls.length > 0) {
          return handleDeepLink(urls[0]);
        }
      })
      .catch((err) => handleAppError(err, "deeplink", "deeplink/failed"));

    const unlisten = onOpenUrl((urls) => {
      handleDeepLink(urls[0]).catch((err) =>
        handleAppError(err, "deeplink", "deeplink/failed"),
      );
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return null;
};

export default DeepLinkListener;
