import { SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/shared/errors/AppError";

/** Código de PostgREST cuando `.single()` no encuentra filas. */
const NO_ROWS = "PGRST116";

export class PartnerRepository {
  constructor(private readonly db: SupabaseClient) {}

  /**
   * `null` = el partner no existe. Un fallo de la consulta lanza `AppError`.
   */
  async getPartnerData(
    partnerId: string,
  ): Promise<{ username: string } | null> {
    const { data, error } = await this.db
      .from("profiles")
      .select("*")
      .eq("id", partnerId)
      .single();

    if (error) {
      if (error.code === NO_ROWS) return null;
      throw new AppError("connection/fetch-failed", { cause: error });
    }

    return data ?? null;
  }
}
