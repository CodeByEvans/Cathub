import { IAuthProvider } from "@/interfaces/IAuthProvider";
import { supabase } from "@/services/supabaseClient";

export const authProvider: IAuthProvider = {
  getUserId: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user?.id) throw new Error("No user");
    return data.user.id;
  },
  getAccessToken: async () => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) throw new Error("User is not authenticated");
    return session.access_token;
  },
};
