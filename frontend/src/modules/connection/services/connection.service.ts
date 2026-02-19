import { envs } from "@/config/envs";
import partnerService from "@/services/partner.service";
import { setValue } from "@/services/store.service";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";

const SUPABASE_FUNCTIONS_URL = `${envs.supabaseUrl}/functions/v1`;

const getSession = async () => {
  const session = (await supabase.auth.getSession()).data.session;
  if (!session) throw new Error("User is not authenticated");
  return session;
};

class ConnectionService {
  private userId: string | null = null;

  async generateLink() {
    const session = await getSession();
    this.userId = session.user.id;

    try {
      const response = await fetch(
        `${SUPABASE_FUNCTIONS_URL}/create_connection_request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sender_id: this.userId }),
        },
      );
      const data = await response.json();
      return data.invitation;
    } catch (err) {
      console.error("Error generating link:", err);
      return null;
    }
  }

  async createConnection(requestId: string) {
    const session = await getSession();
    this.userId = session.user.id;

    try {
      const response = await fetch(
        `${SUPABASE_FUNCTIONS_URL}/create_connection?request_id=${requestId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ request_id: requestId }),
        },
      );

      const data = await response.json();

      await setValue("connection_id", data.connection[0].id);
      const partnerId =
        data.connection[0].user_a === this.userId
          ? data.connection[0].user_b
          : data.connection[0].user_a;

      const partnerData = await partnerService.getPartnerData(partnerId);
      await setValue("partner_name", partnerData.nickname);
      await setValue("partner_id", partnerId);

      toast.success("Conexión creada exitosamente");
      return {
        id: data.connection[0].id,
        partnerName: partnerData.nickname,
      };
    } catch (err) {
      console.error("Error creating connection:", err);
      toast.error("Error creating connection");
      return null;
    }
  }

  async getConnection() {
    const session = await getSession();
    this.userId = session.user.id;

    try {
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .or(`user_a.eq.${this.userId},user_b.eq.${this.userId}`)
        .single();

      if (error || !data) return null;

      const partnerId = data.user_a === this.userId ? data.user_b : data.user_a;
      const partnerData = await partnerService.getPartnerData(partnerId);

      await setValue("partner_name", partnerData.nickname);
      await setValue("partner_id", partnerId);

      return {
        id: data.id,
        partnerName: partnerData.nickname,
      };
    } catch (err) {
      console.error("Error getting connection:", err);
      return null;
    }
  }

  async getConnectionRequestLink() {
    const session = await getSession();
    this.userId = session.user.id;

    try {
      const { data, error } = await supabase
        .from("connection_requests")
        .select("*")
        .eq("sender_id", this.userId)
        .single();

      if (error || !data) return null;

      return `${SUPABASE_FUNCTIONS_URL}/create_connection?request_id=${data.id}`;
    } catch (err) {
      console.error("Error getting connection request:", err);
      return null;
    }
  }
}

// Export singleton
export const connectionService = new ConnectionService();
