import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createConnectionService } from "../services";

type ConnectionContextType = {
  isLinked: boolean;
  partnerName: string;
  connectionRequestLink: string | null;
  createConnection: (connectionRequestId: string) => Promise<void>;
};

const ConnectionContext = createContext<ConnectionContextType | null>(null);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [connectionRequestLink, setConnectionRequestLink] = useState<
    string | null
  >(null);
  const [isLinked, setIsLinked] = useState(false);
  const [ready, setReady] = useState(false);
  const moduleRef = useRef<Awaited<
    ReturnType<typeof createConnectionService>
  > | null>(null);
  useEffect(() => {
    createConnectionService().then((service) => {
      moduleRef.current = service;
      service.connection.start().then(({ connection, link }) => {
        if (connection) {
          setPartnerName(connection.partnerName);
          setConnectionRequestLink(null);
          setIsLinked(true);
          setReady(true);
        } else {
          setPartnerName(null);
          setConnectionRequestLink(link);
          setIsLinked(false);
          setReady(true);
        }
      });

      service.events.onConnectionAccepted((data: { partnerName: string }) => {
        setPartnerName(data.partnerName);
        setConnectionRequestLink(null);
        setIsLinked(true);
      });

      service.events.onConnectionRevoked(() => {
        setPartnerName(null);
        setConnectionRequestLink(null);
        setIsLinked(false);
      });

      service.events.onConnectionUpdated((data: { partnerName: string }) => {
        setPartnerName(data.partnerName);
      });
    });

    return () => {
      moduleRef.current?.connection.stop();
    };
  }, []);

  if (!ready || !moduleRef.current) return null;

  return (
    <ConnectionContext.Provider
      value={{
        isLinked: isLinked,
        partnerName: partnerName || "",
        connectionRequestLink,
        createConnection: async (connectionRequestId: string) => {
          if (!moduleRef.current) return;
          const result =
            await moduleRef.current.connection.createConnection(
              connectionRequestId,
            );
          if (result) {
            setPartnerName(result.partnerName);
            setConnectionRequestLink(null);
            setIsLinked(true);
          }
        },
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
};
