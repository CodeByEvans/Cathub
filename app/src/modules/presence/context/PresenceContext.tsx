import { createContext, useContext, useEffect, useState } from "react";
import { createPresenceService } from "../services";

type PresenceContextType = {
  isOnline: boolean;
  lastSeen: Date | null;
};

export const PresenceContext = createContext<PresenceContextType | null>(null);

export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let module: Awaited<ReturnType<typeof createPresenceService>> | null = null;

    const init = async () => {
      module = await createPresenceService();

      module.events.onStatusChange(({ isOnline, lastSeen }) => {
        setIsOnline(isOnline);
        setLastSeen(lastSeen);
      });

      module.events.onLastSeen((lastSeen) => {
        setLastSeen(lastSeen);
      });

      await module.presence.start();

      setIsReady(true);
    };

    init();

    return () => {
      module?.presence.stop();
    };
  }, []);

  if (!isReady) return null;

  return (
    <PresenceContext.Provider value={{ isOnline, lastSeen }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error("usePresence must be used within a PresenceProvider");
  }
  return context;
};
