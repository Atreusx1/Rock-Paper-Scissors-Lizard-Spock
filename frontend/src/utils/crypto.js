import { ethers } from "ethers";

export function generateSecureSalt() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return ethers.hexlify(array);
}

const STORAGE_KEY = "rpsls_games";

function getStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function setStorage(data) {
  try {
    const jsonString = JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );
    localStorage.setItem(STORAGE_KEY, jsonString);
  } catch (err) {
    console.error("Storage failed:", err);
  }
}

export function saveGameData(contractAddress, move, salt) {
  const key = contractAddress.toLowerCase();
  const storage = getStorage();
  storage[key] = {
    move,
    salt: typeof salt === "bigint" ? salt.toString() : salt,
    timestamp: Date.now(),
    contractAddress,
  };
  setStorage(storage);
  return storage[key];
}

export function loadGameData(contractAddress) {
  const key = contractAddress.toLowerCase();
  const storage = getStorage();
  const data = storage[key];

  if (!data) return null;

  return {
    ...data,
    salt: data.salt,
  };
}

export function clearGameData(contractAddress) {
  const key = contractAddress.toLowerCase();
  const storage = getStorage();
  delete storage[key];
  setStorage(storage);
}

export function downloadGameData(data) {
  const downloadData = {
    ...data,
    salt: typeof data.salt === "bigint" ? data.salt.toString() : data.salt,
  };

  const blob = new Blob([JSON.stringify(downloadData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rpsls_game_${data.contractAddress}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function uploadGameData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.move || !data.salt || !data.contractAddress) {
          reject(new Error("Invalid backup file"));
          return;
        }
        saveGameData(data.contractAddress, data.move, data.salt);
        resolve(data);
      } catch {
        reject(new Error("Parse failed"));
      }
    };
    reader.onerror = () => reject(new Error("Read failed"));
    reader.readAsText(file);
  });
}
