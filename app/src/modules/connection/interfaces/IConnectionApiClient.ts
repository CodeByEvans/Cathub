import { connection } from "../types/connection";

export interface IConnectionApiClient {
  generateConnectionRequestLink(): Promise<string>;
  createConnection(requestId: string): Promise<connection>;
  breakConnection(connectionId: string): Promise<boolean>;
  getConnectionRequestLink(): Promise<string | null>;
}
