import { useEffect } from "react";
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { toast } from "sonner";
import { handleDeepLink } from "./handlers/deepLink.handler";

const DeepLinkListener = () => {
  useEffect(() => {
    // Captura al iniciar
    getCurrent()
      .then((urls) => {
        if (urls && urls.length > 0) {
          handleDeepLink(urls[0]);
        }
      })
      .catch((err) => {
        toast.error(`Error al obtener la URL inicial: ${err}`);
      });

    const unlisten = onOpenUrl((urls) => {
      handleDeepLink(urls[0]);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return null;
};

export default DeepLinkListener;
