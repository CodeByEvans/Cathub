import { connection } from "../types/connection";

export class ConnectionApiClient {
  constructor(
    private readonly userId: string,
    private readonly acesssToken: string,
    private readonly apiUrl: string,
  ) {}

  async generateConnectionRequestLink(): Promise<string | null> {
    try {
      const response = await fetch(`${this.apiUrl}/create_connection_request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.acesssToken}`,
        },
        body: JSON.stringify({ sender_id: this.userId }),
      });
      const data = await response.json();
      return data.invitation;
    } catch (err) {
      console.error("Error generating link:", err);
      return null;
    }
  }

  async createConnection(requestId: string): Promise<connection | null> {
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

      const data = await response.json();
      return data.connection[0];
    } catch (err) {
      console.error("Error creating connection:", err);
      return null;
    }
  }

  async getConnectionRequestLink(): Promise<string | null> {
    try {
      const response = await fetch(
        `${this.apiUrl}/get_connection_request?user_id=${this.userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.acesssToken}`,
          },
        },
      );

      const data = await response.json();
      const connectionId = data.id;
      return connectionId
        ? `${this.apiUrl}/create_connection?request_id=${connectionId}`
        : null;
    } catch (err) {
      console.error("Error getting connection request:", err);
      return null;
    }
  }
}
