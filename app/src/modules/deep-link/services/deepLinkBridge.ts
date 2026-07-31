import { AppError } from "@/shared/errors/AppError";

type CreateConnectionFn = (requestId: string) => Promise<void>;

let acceptHandler: CreateConnectionFn | null = null;

/**
 * Puente entre el listener de deep links (montado fuera de los providers de
 * React) y el módulo de conexión. `ConnectionProvider` registra aquí su
 * `createConnection`; así `deepLink.handler` deja de necesitar `useConnection()`
 * fuera de un componente (violación de las rules of hooks).
 */
export const registerConnectionAcceptHandler = (
  fn: CreateConnectionFn | null,
) => {
  acceptHandler = fn;
};

export const acceptConnectionRequest = async (
  requestId: string,
): Promise<void> => {
  if (!acceptHandler) {
    throw new AppError("deeplink/failed", {
      message:
        "Enlace de conexión recibido sin el módulo de conexión inicializado (¿sesión iniciada?)",
    });
  }
  await acceptHandler(requestId);
};
