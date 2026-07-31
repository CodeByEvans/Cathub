import { useEffect, useState } from "react";

import { Session } from "@supabase/supabase-js";
import { supabase } from "@/services/supabaseClient";
import { LoginScreen } from "./LoginScreen";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch(() => {
        // Sin red (p. ej. autoinicio al arrancar el PC): degradar a login
        // en lugar de quedarse en "Loading..." infinito.
        setSession(null);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <LoginScreen />;
  }

  return children;
};
