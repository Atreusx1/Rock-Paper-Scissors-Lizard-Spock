import { ethers } from "ethers";

export function generateSecureSalt() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return ethers.hexlify(array);
}

export async function encryptWithSignature(signer, data) {
  const message = "Sign to encrypt your game data";
  const signature = await signer.signMessage(message);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    ethers.getBytes(ethers.keccak256(signature)),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: ethers.getBytes(ethers.keccak256(ethers.toUtf8Bytes("rpsls"))),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(JSON.stringify(data));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedData
  );

  return {
    ciphertext: ethers.hexlify(new Uint8Array(encrypted)),
    iv: ethers.hexlify(iv),
  };
}

export async function decryptWithSignature(signer, encryptedData) {
  const message = "Sign to encrypt your game data";
  const signature = await signer.signMessage(message);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    ethers.getBytes(ethers.keccak256(signature)),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: ethers.getBytes(ethers.keccak256(ethers.toUtf8Bytes("rpsls"))),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ethers.getBytes(encryptedData.iv) },
    key,
    ethers.getBytes(encryptedData.ciphertext)
  );

  return JSON.parse(new TextDecoder().decode(decrypted));
}

export function downloadGameData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rpsls_backup_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function uploadGameData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!data.move || !data.salt) {
          reject(new Error("Invalid backup file - missing move or salt"));
          return;
        }

        const contractAddress = data.contractAddress || data.commitment;
        if (!contractAddress) {
          reject(new Error("Missing contract address in backup file"));
          return;
        }

        resolve({
          ...data,
          contractAddress,
          salt:
            typeof data.salt === "string" ? data.salt : data.salt.toString(),
        });
      } catch (err) {
        reject(new Error(`Failed to parse backup file: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
