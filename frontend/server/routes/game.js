import express from "express";
import Game from "../models/Game.js";

const router = express.Router();

router.post("/save", async (req, res) => {
  try {
    const { contractAddress, player1, player2, encryptedData, stake } =
      req.body;

    const expiresAt = new Date(Date.now() + 20 * 60 * 1000); // 20 min for active games

    // Normalize addresses to lowercase
    const game = await Game.findOneAndUpdate(
      { contractAddress: contractAddress.toLowerCase() },
      {
        contractAddress: contractAddress.toLowerCase(),
        player1: player1.toLowerCase(),
        player2: player2.toLowerCase(),
        encryptedData,
        stake,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, game });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/load/:contractAddress/:player1", async (req, res) => {
  try {
    const { contractAddress, player1 } = req.params;

    // Case-insensitive search
    const game = await Game.findOne({
      contractAddress: contractAddress.toLowerCase(),
      player1: player1.toLowerCase(),
    });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json({ success: true, encryptedData: game.encryptedData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/update-status", async (req, res) => {
  try {
    const { contractAddress, status, winner } = req.body;

    const updateData = {
      status,
      winner: winner ? winner.toLowerCase() : null,
    };

    // 30 days in history
    if (status === "revealed" || status === "timeout") {
      updateData.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }

    const game = await Game.findOneAndUpdate(
      { contractAddress: contractAddress.toLowerCase() },
      updateData,
      { new: true }
    );

    res.json({ success: true, game });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/history/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const addr = address.toLowerCase();

    const games = await Game.find({
      $or: [{ player1: addr }, { player2: addr }],
      status: { $in: ["revealed", "timeout"] },
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, games });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/clear/:contractAddress", async (req, res) => {
  try {
    await Game.deleteOne({
      contractAddress: req.params.contractAddress.toLowerCase(),
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
