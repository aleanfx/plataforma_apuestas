"use client";

import * as React from "react";
import type { Socket } from "socket.io-client";

type Msg = { id: string; userId: string; name: string; text: string; ts: number };

/** Chat de mesa (en vivo) para bingo/dominó/póker. */
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
  const [text, setText] = React.useState("");
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!socket) return;
    const onMsg = (m: Msg) => setMsgs((cur) => [...cur.slice(-49), m]);
    const onHistory = (arr: Msg[]) => setMsgs(Array.isArray(arr) ? arr : []);
    socket.on("table:message", onMsg);
    socket.on("table:messages", onHistory);
    return () => {
      socket.off("table:message", onMsg);
      socket.off("table:messages", onHistory);
    };
  }, [socket]);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [msgs]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    socket?.emit("table:chat", { tableId, text: t });
    setText("");
  }

  return (
    <div className="game-panel chat-panel">
      <h3 className="chat-title">Chat de la mesa</h3>
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
        <button className="btn btn-gold btn-sm" type="submit">
          Enviar
        </button>
      </form>
    </div>
  );
}
