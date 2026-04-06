import { appService } from "@/services/app.service";
import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export const useAppInit = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        await appService.initialize();
      } catch (error) {
        console.error("❌ Error inicializando app:", error);
      } finally {
        setIsLoading(false);
        await getCurrentWindow().show();
      }
    };
    init();
  }, []);

  return { isLoading };
};
