import { connection } from "../types/connection";

export interface IConnectionRepository {
  getConnection(): Promise<connection | null>;
  getConnectionRequest(): Promise<connection | null>;
}
