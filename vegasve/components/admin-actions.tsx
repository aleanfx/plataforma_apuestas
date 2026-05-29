"use client";

import { toast } from "sonner";

import { Check, Close, User, Shield } from "@/components/icons";

export function QueueActions({ label }: { label: string }) {
  return (
    <div className="act-row">
      <button
        className="icon-btn approve"
        title="Aprobar"
        onClick={() => toast.success(`Aprobado: ${label}`)}
      >
        <Check strokeWidth={2} />
      </button>
      <button
        className="icon-btn reject"
        title="Rechazar"
        onClick={() => toast(`Rechazado: ${label}`)}
      >
        <Close strokeWidth={2} />
      </button>
    </div>
  );
}

export function UserRowActions({ name }: { name: string }) {
  return (
    <div className="act-row">
      <button
        className="icon-btn"
        title="Ver perfil"
        onClick={() => toast(`Abriendo perfil de ${name}…`)}
      >
        <User />
      </button>
      <button
        className="icon-btn reject"
        title="Suspender"
        onClick={() => toast(`Usuario ${name} suspendido`)}
      >
        <Shield />
      </button>
    </div>
  );
}
