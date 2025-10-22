// config.ts
import HasherArtifact from "./Hasher.json";
import RPSArtifact from "./RPS.json";

export const config = {
  hasherAddress: import.meta.env.VITE_HASHER_ADDRESS || null,
  networkName: import.meta.env.VITE_NETWORK_NAME || "localhost",
  timeoutMinutes: parseInt(import.meta.env.VITE_TIMEOUT_MINUTES || "5"),
  chainId: parseInt(import.meta.env.VITE_CHAIN_ID || "31337"),
};

export const CONTRACT_ABIS = {
  hasher: HasherArtifact.abi,
  rps: RPSArtifact.abi,
};

export const HASHER_BYTECODE = HasherArtifact.bytecode;
export const RPS_BYTECODE = RPSArtifact.bytecode;

export const MOVES = {
  NULL: 0,
  ROCK: 1,
  PAPER: 2,
  SCISSORS: 3,
  SPOCK: 4,
  LIZARD: 5,
};

export const MOVE_NAMES = {
  1: "Rock",
  2: "Paper",
  3: "Scissors",
  4: "Spock",
  5: "Lizard",
};

export const MOVE_DESCRIPTIONS = {
  1: "Rock defeats Scissors and Lizard",
  2: "Paper defeats Rock and Spock",
  3: "Scissors defeats Paper and Lizard",
  4: "Spock defeats Rock and Scissors",
  5: "Lizard defeats Paper and Spock",
};
