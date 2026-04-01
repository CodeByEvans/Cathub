import { connection } from "../types/connection";

export interface IConnectionApiClient {
  generateConnectionRequestLink(): Promise<string | null>;
  createConnection(requestId: string): Promise<connection | null>;
  getConnectionRequestLink(): Promise<string | null>;
}
