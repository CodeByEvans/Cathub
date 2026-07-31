import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createConnectionService } from "../services";
import { registerConnectionAcceptHandler } from "@/modules/deep-link/services/deepLinkBridge";
import { logger } from "@/shared/logger";

type ConnectionContextType = {
  isLinked: boolean;
  partnerName: string;
  connectionRequestLink: string | null;
  createConnection: (connectionRequestId: string) => Promise<void>;
  breakConnection: () => Promise<boolean>;
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
  const breakConnectionRef = useRef<(() => Promise<boolean>) | null>(null);
  useEffect(() => {
    createConnectionService()
      .then((service) => {
        moduleRef.current = service;
        breakConnectionRef.current = service.breakConnection;

        service.connection
          .start()
          .then(({ connection, link }) => {
            if (connection) {
              setPartnerName(connection.partnerName);
              setConnectionRequestLink(null);
              setIsLinked(true);
            } else {
              setPartnerName(null);
              setConnectionRequestLink(link);
              setIsLinked(false);
            }
          })
          .catch((error) => {
            logger.error("connection", "start failed", error);
          })
          .finally(() => {
            setReady(true);
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
      })
      .catch((error) => {
        // Sin red o sin sesión (p. ej. autoinicio): renderizar igualmente
        // en estado "sin conexión" en lugar de no montar la app.
        logger.error("connection", "init failed", error);
        setReady(true);
      });

    return () => {
      moduleRef.current?.connection.stop();
    };
  }, []);

  const createConnection = useCallback(async (connectionRequestId: string) => {
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
  }, []);

  // El listener de deep links vive fuera de los providers: se registra aquí
  // el handler para aceptar conexiones desde cathub://accept-connection/:id
  useEffect(() => {
    registerConnectionAcceptHandler(createConnection);
    return () => registerConnectionAcceptHandler(null);
  }, [createConnection]);

  if (!ready) return null;

  return (
    <ConnectionContext.Provider
      value={{
        isLinked: isLinked,
        partnerName: partnerName || "",
        connectionRequestLink,
        createConnection,
        breakConnection: async () => {
          if (!breakConnectionRef.current) return false;
          const result = await breakConnectionRef.current();
          if (result) {
            setPartnerName(null);
            setConnectionRequestLink(null);
            setIsLinked(false);
          }
          return result;
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
