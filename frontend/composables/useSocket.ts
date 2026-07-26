import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/** Composable trả về 1 instance Socket.IO duy nhất (singleton) cho toàn app.
 * Chỉ nên gọi trong onMounted (phía client), tránh gọi lúc SSR. */
export function useSocket(): Socket {
  if (!socket) {
    const config = useRuntimeConfig();
    socket = io(config.public.socketUrl as string, {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
}
