// Cliente Socket.IO del frontend (singleton). El núcleo de tiempo real se usa en
// los juegos (Bingo/Dominó/Póker). El token JWT viaja en el handshake.
"use client";

import { io, type Socket } from "socket.io-client";
import { getToken } from "@/lib/api";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";

let socket: Socket | null = null;

/** Devuelve el socket (lo crea en el primer uso). No conecta hasta llamar connect(). */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
      auth: (cb) => cb({ token: getToken() }),
    });
  }
  return socket;
}

/** Asegura que el socket esté conectado (refresca el token del handshake). */
export function connectSocket(): Socket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
