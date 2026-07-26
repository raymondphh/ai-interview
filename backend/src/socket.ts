import { Server as SocketIOServer } from "socket.io";
import http from "http";

let io: SocketIOServer | null = null;

/** Khởi tạo Socket.IO gắn vào HTTP server hiện có của Express */
export function initSocket(server: http.Server): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: { origin: process.env.CORS_ORIGIN || "*" },
  });

  io.on("connection", (socket) => {
    socket.on("join-interview", (interviewId: string) => {
      socket.join(`interview:${interviewId}`);
    });

    socket.on("leave-interview", (interviewId: string) => {
      socket.leave(`interview:${interviewId}`);
    });
  });

  return io;
}

/** Lấy instance Socket.IO đã khởi tạo, dùng trong controllers để emit sự kiện */
export function getIO(): SocketIOServer {
  if (!io) throw new Error("Socket.io chưa được khởi tạo");
  return io;
}
