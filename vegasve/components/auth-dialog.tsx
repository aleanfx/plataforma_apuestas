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
import { Mail, Lock, User, Google, Facebook } from "@/components/icons";

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
              <div className="field">
                <label>Correo o usuario</label>
                <div className="input-wrap">
                  <Mail />
                  <input type="text" placeholder="tu@correo.com" />
                </div>
              </div>
              <div className="field">
                <label>Contraseña</label>
                <div className="input-wrap">
                  <Lock />
                  <input type="password" placeholder="••••••••" />
                </div>
                <div className="hint" style={{ textAlign: "right" }}>
                  <a className="gold" style={{ cursor: "pointer" }}>
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>
              <button className="btn btn-gold btn-block" style={{ marginTop: 8 }} onClick={doAuth}>
                Ingresar
              </button>
            </TabsContent>

            <TabsContent value="register">
              <div className="field">
                <label>Nombre completo</label>
                <div className="input-wrap">
                  <User />
                  <input type="text" placeholder="Rafael Méndez" />
                </div>
              </div>
              <div className="field">
                <label>Correo electrónico</label>
                <div className="input-wrap">
                  <Mail />
                  <input type="email" placeholder="tu@correo.com" />
                </div>
              </div>
              <div className="field">
                <label>Contraseña</label>
                <div className="input-wrap">
                  <Lock />
                  <input type="password" placeholder="Mínimo 8 caracteres" />
                </div>
                <div className="hint">Debes ser mayor de 18 años para registrarte.</div>
              </div>
              <button className="btn btn-gold btn-block" style={{ marginTop: 8 }} onClick={doAuth}>
                Crear cuenta y reclamar bono
              </button>
            </TabsContent>
          </Tabs>

          <div className="divider-or">o continúa con</div>
          <div className="social-row">
            <button onClick={doAuth}>
              <Google /> Google
            </button>
            <button onClick={doAuth}>
              <Facebook /> Facebook
            </button>
          </div>
        </div>
        <DialogClose className="sr-only">Cerrar</DialogClose>
      </DialogContent>
    </Dialog>
  );
}
