import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoute.js";
import path from "path";
import contactsRoutes from "./routes/ContactRoutes.js";
const __dirname = path.resolve();

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const databaseUrl = process.env.DATABASE_URL;

app.use(
  cors({
    origin: [process.env.ORIGIN],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// app.use("/uploads/profiles", express.static("/uploads/profiles"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);

app.listen(port, () => {
  console.log(`The Server is running on ${port}`);
});

mongoose
  .connect(databaseUrl)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => console.log(err.message));
