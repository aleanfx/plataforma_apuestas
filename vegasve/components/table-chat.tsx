"use client";

import * as React from "react";
import type { Socket } from "socket.io-client";

import { Chat, Close } from "@/components/icons";

type Msg = { id: string; userId: string; name: string; text: string; ts: number };

/**
 * Chat de mesa como widget flotante (esquina inferior izquierda):
 * - Botón redondo; al hacer clic abre/cierra el panel.
 * - Mensajes nuevos con el panel cerrado aparecen como burbujas tipo notificación
 *   que se apilan y desaparecen a los 3 s; además un contador de no leídos.
 */
export function TableChat({
  socket,
  tableId,
  meId,
}: {
  socket: Socket | null;
  tableId: string;
  meId?: string;
}) {
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [open, setOpen] = React.useState(false);
  const [bubbles, setBubbles] = React.useState<Msg[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [text, setText] = React.useState("");
  const endRef = React.useRef<HTMLDivElement>(null);
  const openRef = React.useRef(false);
  openRef.current = open;

  React.useEffect(() => {
    if (!socket) return;
    const onMsg = (m: Msg) => {
      setMsgs((cur) => [...cur.slice(-49), m]);
      if (!openRef.current && m.userId !== meId) {
        setBubbles((cur) => [...cur.slice(-2), m]); // hasta 3 burbujas apiladas
        setUnread((u) => u + 1);
        setTimeout(() => setBubbles((cur) => cur.filter((b) => b.id !== m.id)), 3000);
      }
    };
    const onHistory = (arr: Msg[]) => setMsgs(Array.isArray(arr) ? arr : []);
    socket.on("table:message", onMsg);
    socket.on("table:messages", onHistory);
    return () => {
      socket.off("table:message", onMsg);
      socket.off("table:messages", onHistory);
    };
  }, [socket, meId]);

  React.useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "nearest" });
  }, [msgs, open]);

  function toggle() {
    setOpen((o) => {
      const next = !o;
      if (next) {
        setUnread(0);
        setBubbles([]);
      }
      return next;
    });
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    socket?.emit("table:chat", { tableId, text: t });
    setText("");
  }

  return (
    <div className="chat-fab-wrap">
      {/* Al tocar/clic fuera del recuadro del chat se cierra (PC y celular) */}
      {open && <div className="chat-backdrop" onClick={toggle} aria-hidden />}

      {!open && bubbles.length > 0 && (
        <div className="chat-bubbles">
          {bubbles.map((b) => (
            <div key={b.id} className="chat-bubble">
              <span className="chat-name">{b.name}:</span> {b.text}
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="chat-pop">
          <div className="chat-pop-head">
            <span>Chat de la mesa</span>
            <button type="button" onClick={toggle} aria-label="Cerrar chat">
              <Close width="1em" height="1em" />
            </button>
          </div>
          <div className="chat-msgs">
            {msgs.length === 0 ? (
              <div className="chat-empty">Saluda a la mesa 👋</div>
            ) : (
              msgs.map((m) => (
                <div key={m.id} className={`chat-msg${m.userId === meId ? " mine" : ""}`}>
                  <span className="chat-name">{m.name}:</span> {m.text}
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>
          <form className="chat-form" onSubmit={send}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe un mensaje…"
              maxLength={240}
            />
            <button className="btn btn-gold btn-sm" type="submit">Enviar</button>
          </form>
        </div>
      )}

      <button type="button" className="chat-fab" onClick={toggle} aria-label="Abrir chat">
        <Chat width="1em" height="1em" />
        {!open && unread > 0 && <span className="chat-fab-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>
    </div>
  );
}
