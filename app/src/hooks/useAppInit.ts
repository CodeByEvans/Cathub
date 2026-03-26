import { appService } from "@/services/app.service";
import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export const useAppInit = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userLinked, setUserLinked] = useState<boolean>(true);
  const [partnerName, setPartnerName] = useState<string>("Amor");

  useEffect(() => {
    const init = async () => {
      try {
        const state = await appService.initialize();
        setUserLinked(state.isLinked);
        setPartnerName(state.partnerName);
      } catch (error) {
        console.error("❌ Error inicializando app:", error);
        setUserLinked(false);
      } finally {
        setIsLoading(false);
        await getCurrentWindow().show();
      }
    };
    init();
  }, []);

  return { isLoading, userLinked, partnerName };
};
