import { SupabaseClient } from "@supabase/supabase-js";

export class PartnerRepository {
  constructor(private readonly db: SupabaseClient) {}
  async getPartnerData(
    partnerId: string,
  ): Promise<{ username: string } | null> {
    try {
      const { data, error } = await this.db
        .from("profiles")
        .select("*")
        .eq("id", partnerId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("Error fetching partner data:", error);
      return null;
    }
  }
}
