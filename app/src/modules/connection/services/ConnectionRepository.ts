import { connection } from "../types/connection";
import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/shared/errors/AppError";

/** Código de PostgREST cuando `.single()` no encuentra filas. */
const NO_ROWS = "PGRST116";

export class ConnectionRepository {
  constructor(
    private readonly db: SupabaseClient,
    private readonly userId: string,
  ) {}

  /**
   * `null` = no existe conexión (estado legítimo).
   * Un fallo de la consulta lanza `AppError` — nunca se confunde con "no hay".
   */
  async getConnection(): Promise<connection | null> {
    const { data, error } = await this.db
      .from("connections")
      .select("*")
      .or(`user_a.eq.${this.userId},user_b.eq.${this.userId}`)
      .single();
    if (error) {
      if (error.code === NO_ROWS) return null;
      throw new AppError("connection/fetch-failed", { cause: error });
    }
    return data ?? null;
  }

  /**
   * `null` = no existe solicitud (estado legítimo).
   * Un fallo de la consulta lanza `AppError`.
   */
  async getConnectionRequest(): Promise<connection | null> {
    const { data, error } = await this.db
      .from("connection_requests")
      .select("*")
      .eq("sender_id", this.userId)
      .single();
    if (error) {
      if (error.code === NO_ROWS) return null;
      throw new AppError("connection/request-failed", { cause: error });
    }
    return data ?? null;
  }
}
