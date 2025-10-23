const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function saveGameToServer(
  contractAddress,
  player1,
  player2,
  encryptedData,
  stake
) {
  const res = await fetch(`${API_URL}/games/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contractAddress,
      player1,
      player2,
      encryptedData,
      stake,
    }),
  });
  if (!res.ok) throw new Error("Failed to save game");
  return res.json();
}

export async function loadGameFromServer(contractAddress, player1) {
  const res = await fetch(
    `${API_URL}/games/load/${contractAddress}/${player1}`
  );
  if (!res.ok) throw new Error("Game not found");
  return res.json();
}

export async function updateGameStatus(contractAddress, status, winner = null) {
  const res = await fetch(`${API_URL}/games/update-status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contractAddress, status, winner }),
  });
  return res.json();
}

export async function getGameHistory(address) {
  const res = await fetch(`${API_URL}/games/history/${address}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function clearGameFromServer(contractAddress) {
  const res = await fetch(`${API_URL}/games/clear/${contractAddress}`, {
    method: "DELETE",
  });
  return res.json();
}
