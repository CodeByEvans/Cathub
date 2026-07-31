import { AppError, isAppError } from "@/shared/errors/AppError";
import { sessionRepository } from "@/shared/infrastructure/repositories/session.repository";
import { connection } from "../types/connection";

export class ConnectionApiClient {
  constructor(
    private readonly acesssToken: string,
    private readonly apiUrl: string,
  ) {}

  async generateConnectionRequestLink(): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/create_connection_request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.acesssToken}`,
        },
      });
      if (!response.ok) {
        throw new AppError("connection/link-failed", {
          message: `create_connection_request respondió HTTP ${response.status}`,
        });
      }
      const data = await response.json();
      const link = `${this.apiUrl}/accept-connection/${data.id}`;
      await sessionRepository.setConnectionRequestLink(link);
      return link;
    } catch (err) {
      if (isAppError(err)) throw err;
      throw new AppError("connection/link-failed", { cause: err });
    }
  }

  async createConnection(requestId: string): Promise<connection> {
    try {
      const response = await fetch(
        `${this.apiUrl}/create_connection?request_id=${requestId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.acesssToken}`,
          },
          body: JSON.stringify({ request_id: requestId }),
        },
      );

      if (!response.ok) {
        throw new AppError("connection/create-failed", {
          message: `create_connection respondió HTTP ${response.status}`,
        });
      }

      const data = await response.json();
      const created = data.connection?.[0];
      if (!created) {
        throw new AppError("connection/create-failed", {
          message: "La respuesta de create_connection no incluye la conexión",
        });
      }
      return created;
    } catch (err) {
      if (isAppError(err)) throw err;
      throw new AppError("connection/create-failed", { cause: err });
    }
  }

  /**
   * `false` = el servidor respondió pero no rompió la conexión.
   * Un fallo de red lanza `AppError`.
   */
  async breakConnection(connectionId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/break_connection?connection_id=${connectionId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.acesssToken}`,
          },
        },
      );
      return response.ok;
    } catch (err) {
      throw new AppError("connection/break-failed", { cause: err });
    }
  }

  /**
   * `null` = no existe una solicitud de conexión previa (estado legítimo).
   * Un fallo de red/servidor lanza `AppError`.
   */
  async getConnectionRequestLink(): Promise<string | null> {
    try {
      const response = await fetch(`${this.apiUrl}/get_connection_request`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.acesssToken}`,
        },
      });

      if (!response.ok) {
        throw new AppError("connection/request-failed", {
          message: `get_connection_request respondió HTTP ${response.status}`,
        });
      }

      const data = await response.json();
      const connectionId = data.id;
      return connectionId
        ? `${this.apiUrl}/accept-connection/${connectionId}`
        : null;
    } catch (err) {
      if (isAppError(err)) throw err;
      throw new AppError("connection/request-failed", { cause: err });
    }
  }
}
