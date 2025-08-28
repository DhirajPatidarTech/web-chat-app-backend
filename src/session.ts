import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";

import authRoutes from "./routes/auth";
import meetingRoutes from "./routes/meeting";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export const createServer = async () => {
  const app = express();
  app.use(express.json());

  // const FRONTEND_ORIGINS = ["http://localhost:3000"];
  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGINS,
      credentials: true,
    })
  );

  app.use(
    session({
      secret: "your_secret",
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl:process.env.MONGOURI!,
      }),
      cookie: {
        secure: false,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24,
      },
    })
  );

  // Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/meeting", meetingRoutes);

  await mongoose
    .connect(process.env.MONGOURI!)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB error:", err));

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_ORIGINS,
      credentials: true,
    },
  });

  const userSocketMap: Map<string, string> = new Map();
  interface RoomUsers {
    [roomId: string]: string[];
  }
  const rooms: RoomUsers = {};

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("set-user-id", (userId: string) => {
      userSocketMap.set(userId, socket.id);
      console.log(`🔗 Mapped userId ${userId} → socketId ${socket.id}`);
    });

    socket.on("join-room", ({ roomId, userId }) => {
      if (!userId) return;
      if (!rooms[roomId]) rooms[roomId] = [];

      socket.emit("all-users", rooms[roomId]);

      rooms[roomId].push(userId);
      socket.join(roomId);

      socket.to(roomId).emit("user-joined", userId);
    });

    socket.on("signal", ({ to, from, signal }) => {
      const toSocketId = userSocketMap.get(to);
      if (toSocketId) {
        io.to(toSocketId).emit("signal", { from, signal });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      const userId = Array.from(userSocketMap.entries()).find(
        ([_, sId]) => sId === socket.id
      )?.[0];
      if (userId) userSocketMap.delete(userId);

      for (const roomId in rooms) {
        if (userId) {
          rooms[roomId] = rooms[roomId].filter((uId) => uId !== userId);
          socket.to(roomId).emit("user-left", userId);
        }
      }
    });
  });

  return server;
};
