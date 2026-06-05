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

export function AuthDialog({
  children,
  defaultTab = "login",
}: {
  children: React.ReactNode;
  defaultTab?: "login" | "register";
}) {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<"login" | "register">(defaultTab);
  const router = useRouter();

  // reset to the requested tab each time it opens
  React.useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  function doAuth() {
    setOpen(false);
    toast.success("Sesión iniciada — ¡bienvenido!");
    setTimeout(() => router.push("/lobby"), 250);
  }

  // submit del formulario: respeta la validación nativa (required, type, minLength)
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    doAuth();
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
                <button type="submit" className="btn btn-gold btn-block" style={{ marginTop: 8 }}>
                  Ingresar
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
                <button type="submit" className="btn btn-gold btn-block" style={{ marginTop: 8 }}>
                  Crear cuenta y reclamar bono
                </button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="divider-or">o continúa con</div>
          <div className="social-row">
            <button onClick={doAuth}>
              <Google /> Google
            </button>
          </div>
        </div>
        <DialogClose className="sr-only">Cerrar</DialogClose>
      </DialogContent>
    </Dialog>
  );
}
