import { createClient } from "@supabase/supabase-js";

// Supabase plugin - klient, session timer, auth listener
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const supabase = createClient(
    config.public.supabaseUrl as string,
    config.public.supabaseKey as string,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    },
  );

  const SESSION_DURATION_MS = 60 * 60 * 1000;

  let sessionTimer: ReturnType<typeof setTimeout> | null = null;

  function resetSessionTimer() {
    if (sessionTimer) clearTimeout(sessionTimer);
    sessionTimer = setTimeout(async () => {
      await supabase.auth.signOut();
    }, SESSION_DURATION_MS);
  }

  supabase.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      resetSessionTimer();
    } else if (event === "SIGNED_OUT") {
      if (sessionTimer) {
        clearTimeout(sessionTimer);
        sessionTimer = null;
      }
    }
  });

  return {
    provide: {
      supabase,
    },
  };
});
