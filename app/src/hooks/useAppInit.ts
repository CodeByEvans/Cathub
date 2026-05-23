import { appService } from "@/services/app.service";
import { useEffect, useState } from "react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";

const MAIN_SIZE = new LogicalSize(700, 200);

export const useAppInit = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        await appService.initialize();
        await getCurrentWindow().setSize(MAIN_SIZE);
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
