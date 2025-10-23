import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  contractAddress: { type: String, required: true, unique: true, index: true },
  player1: { type: String, required: true },
  player2: { type: String, required: true },
  encryptedData: { type: String, required: true },
  stake: { type: String, required: true },
  status: {
    type: String,
    enum: ["waiting", "playing", "revealed", "timeout"],
    default: "waiting",
  },
  winner: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

gameSchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { status: { $in: ["waiting", "playing"] } },
  }
);
export default mongoose.model("Game", gameSchema);
