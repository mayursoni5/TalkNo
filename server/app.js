import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import multer from "multer";
import authRoutes from "./routes/AuthRoute.js";
import path from "path";
import contactsRoutes from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";
import MessagesRoutes from "./routes/MessagesRoute.js";
import channelRoutes from "./routes/ChannelRoutes.js";

const __dirname = path.resolve();

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const databaseUrl = process.env.DATABASE_URL;

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

// app.use("/uploads/profiles", express.static("/uploads/profiles"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ msg: "Hello TalkNo" });
});
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", MessagesRoutes);
app.use("/api/channel", channelRoutes);

app.use((error, req, res, next) => {
  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      error: "File too large",
      message: "File size exceeds the allowed limit",
    });
  }
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      error: "Upload error",
      message: error.message,
    });
  }
  next(error);
});

const server = app.listen(port, () => {
  console.log(`The Server is running on ${port}`);
});

setupSocket(server);

mongoose
  .connect(databaseUrl)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => console.log(err.message));
