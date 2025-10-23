import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import gamesRouter from "./routes/game.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.use("/api/games", gamesRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
