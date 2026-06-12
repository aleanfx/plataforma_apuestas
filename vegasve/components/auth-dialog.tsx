"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Mail, Lock, User, Google } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";

export function AuthDialog({
  children,
  defaultTab = "login",
}: {
  children: React.ReactNode;
  defaultTab?: "login" | "register";
}) {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"login" | "register">(defaultTab);
  const [busy, setBusy] = React.useState(false);
  const router = useRouter();
  const { login, register } = useAuth();

  // reset to the requested tab each time it opens
  React.useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  function enter(name: string) {
    setOpen(false);
    toast.success(`¡Bienvenido${name ? ", " + name.split(" ")[0] : ""}!`);
    setTimeout(() => router.push("/lobby"), 250);
  }

  // submit del formulario: respeta la validación nativa (required, type, minLength)
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      if (tab === "login") {
        const user = await login(
          String(form.get("email")),
          String(form.get("password")),
        );
        enter(user.name);
      } else {
        const user = await register(
          String(form.get("name")),
          String(form.get("email")),
          String(form.get("password")),
        );
        enter(user.name);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo completar la operación");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <div className="modal-top">
          <div className="eyebrow">BetmarPlay</div>
          <DialogTitle className="serif" style={{ fontSize: 30, fontWeight: 600 }}>
            {tab === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
          </DialogTitle>
          <DialogDescription className="msub">
            {tab === "login"
              ? "Ingresa para continuar tu juego."
              : "Regístrate en menos de un minuto y recibe tu bono."}
          </DialogDescription>
        </div>

        <div className="modal-body">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "register")}>
            <TabsList>
              <TabsTrigger value="login">Ingresar</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={onSubmit}>
                <div className="field">
                  <label htmlFor="login-email">Correo o usuario</label>
                  <div className="input-wrap">
                    <Mail />
                    <input
                      id="login-email"
                      name="email"
                      type="text"
                      placeholder="tu@correo.com"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="login-pass">Contraseña</label>
                  <div className="input-wrap">
                    <Lock />
                    <input
                      id="login-pass"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="hint" style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="gold"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      onClick={() => toast("Te enviaremos un enlace de recuperación a tu correo.")}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-gold btn-block" style={{ marginTop: 8 }} disabled={busy}>
                  {busy ? "Ingresando…" : "Ingresar"}
                </button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={onSubmit}>
                <div className="field">
                  <label htmlFor="reg-name">Nombre completo</label>
                  <div className="input-wrap">
                    <User />
                    <input
                      id="reg-name"
                      name="name"
                      type="text"
                      placeholder="Rafael Méndez"
                      autoComplete="name"
                      required
                      minLength={3}
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="reg-email">Correo electrónico</label>
                  <div className="input-wrap">
                    <Mail />
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      placeholder="tu@correo.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="reg-pass">Contraseña</label>
                  <div className="input-wrap">
                    <Lock />
                    <input
                      id="reg-pass"
                      name="password"
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="hint">Debes ser mayor de 18 años para registrarte.</div>
                </div>
                <button type="submit" className="btn btn-gold btn-block" style={{ marginTop: 8 }} disabled={busy}>
                  {busy ? "Creando cuenta…" : "Crear cuenta y reclamar bono"}
                </button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="divider-or">o continúa con</div>
          <div className="social-row">
            <button
              type="button"
              onClick={() => toast("El acceso con Google llegará pronto.")}
            >
              <Google /> Google
            </button>
          </div>
        </div>
        <DialogClose className="sr-only">Cerrar</DialogClose>
      </DialogContent>
    </Dialog>
  );
}
