import { CallProvider } from "@/modules/call/context/CallContext";
import { PresenceProvider } from "@/modules/presence/context/PresenceContext";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <CallProvider>
      <PresenceProvider>{children}</PresenceProvider>
    </CallProvider>
  );
};
