"use client";

import * as React from "react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";

// Client ID de Google (público; puede ir en el código). Se puede sobreescribir
// con NEXT_PUBLIC_GOOGLE_CLIENT_ID en Vercel si algún día cambia.
const CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "218078853182-ui9cp46ca9li4t73tqq9v82rraf8027g.apps.googleusercontent.com";

type GsiId = {
  initialize: (cfg: { client_id: string; callback: (r: { credential: string }) => void }) => void;
  renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
};
type WindowWithGoogle = Window & { google?: { accounts?: { id?: GsiId } } };

/**
 * Botón "Continuar con Google" (Google Identity Services). Si no hay
 * NEXT_PUBLIC_GOOGLE_CLIENT_ID configurado, muestra un aviso de "pronto".
 */
export function GoogleSignIn({ onSuccess }: { onSuccess: (name: string) => void }) {
  const { loginWithGoogle } = useAuth();
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!CLIENT_ID || !ref.current) return;
    let cancelled = false;

    function init() {
      const w = window as WindowWithGoogle;
      if (cancelled || !w.google?.accounts?.id || !ref.current) return;
      w.google.accounts.id.initialize({
        client_id: CLIENT_ID as string,
        callback: async (resp) => {
          try {
            const user = await loginWithGoogle(resp.credential);
            onSuccess(user.name);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "No se pudo entrar con Google");
          }
        },
      });
      w.google.accounts.id.renderButton(ref.current, {
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: 300,
      });
    }

    const existing = document.getElementById("gsi-script") as HTMLScriptElement | null;
    if ((window as WindowWithGoogle).google?.accounts?.id) {
      init();
    } else if (existing) {
      existing.addEventListener("load", init);
    } else {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.defer = true;
      s.id = "gsi-script";
      s.onload = init;
      document.head.appendChild(s);
    }
    return () => {
      cancelled = true;
    };
  }, [loginWithGoogle, onSuccess]);

  if (!CLIENT_ID) {
    return (
      <button type="button" onClick={() => toast("El acceso con Google estará disponible muy pronto.")}>
        Google
      </button>
    );
  }
  return <div ref={ref} className="gsi-btn" />;
}
