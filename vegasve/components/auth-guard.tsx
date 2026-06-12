"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

/** Protege una página: si no hay sesión, redirige a "/". Si `admin` y el usuario
 *  no es admin, redirige al lobby. Mientras carga muestra un loader simple. */
export function AuthGuard({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
    } else if (admin && user.role !== "admin") {
      router.replace("/lobby");
    }
  }, [loading, user, admin, router]);

  const allowed = !!user && (!admin || user.role === "admin");
  if (loading || !allowed) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-2)",
        }}
      >
        Cargando…
      </div>
    );
  }

  return <>{children}</>;
}
