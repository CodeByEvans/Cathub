import { connection } from "../types/connection";
import { SupabaseClient } from "@supabase/supabase-js";

export class ConnectionRepository {
  constructor(
    private readonly db: SupabaseClient,
    private readonly userId: string,
  ) {}

  async getConnection(): Promise<connection | null> {
    try {
      const { data, error } = await this.db
        .from("connections")
        .select("*")
        .or(`user_a.eq.${this.userId},user_b.eq.${this.userId}`)
        .single();
      if (error) throw error;
      return data ?? null;
    } catch (error) {
      console.error("❌ Error en getConnectionId:", error);
      return null;
    }
  }

  async getConnectionRequest(): Promise<connection | null> {
    try {
      const { data, error } = await this.db
        .from("connection_requests")
        .select("*")
        .eq("sender_id", this.userId)
        .single();
      if (error) throw error;
      return data ?? null;
    } catch (error) {
      console.error("❌ Error en getConnectionRequestId:", error);
      return null;
    }
  }
}
