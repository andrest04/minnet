"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function useAuthenticatedUser() {
  const router = useRouter();
  const supabase = createClient();

  const checkAuth = useCallback(async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return null;
      }

      return user;
    } catch (error) {
      console.error("Error al verificar autenticación:", error);
      router.push("/login");
      return null;
    }
  }, [router, supabase]);

  return { checkAuth };
}
