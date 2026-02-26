import { supabase } from "./supabaseClient";

const partnerService = {
  getPartnerData: async (partnerId: string) => {
    try {
      const { data, error } = await supabase
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
  },
};

export default partnerService;
