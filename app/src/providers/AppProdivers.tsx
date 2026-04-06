import { CallProvider } from "@/modules/call/context/CallContext";
import { ConnectionProvider } from "@/modules/connection/contexts/ConnectionContext";
import { PresenceProvider } from "@/modules/presence/context/PresenceContext";
import { useConnection } from "@/modules/connection/contexts/ConnectionContext";
import { NotesProvider } from "@/modules/notes/context/NotesContext";

const InnerProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isLinked } = useConnection();

  if (!isLinked) return <>{children}</>;

  return (
    <CallProvider>
      <PresenceProvider>
        <NotesProvider>{children}</NotesProvider>
      </PresenceProvider>
    </CallProvider>
  );
};

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ConnectionProvider>
    <InnerProviders>{children}</InnerProviders>
  </ConnectionProvider>
);
