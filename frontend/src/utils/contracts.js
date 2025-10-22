import { ethers } from "ethers";
import {
  config,
  CONTRACT_ABIS,
  HASHER_BYTECODE,
  RPS_BYTECODE,
} from "../config/config";

let cachedHasherAddress = null;

export async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const network = await provider.getNetwork();
  if (Number(network.chainId) !== config.chainId) {
    throw new Error(`Wrong network. Expected chain ID ${config.chainId}`);
  }
  const signer = await provider.getSigner();
  return { provider, signer, account: accounts[0] };
}

export async function deployHasherContract(signer) {
  const factory = new ethers.ContractFactory(
    CONTRACT_ABIS.hasher,
    HASHER_BYTECODE,
    signer
  );
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  cachedHasherAddress = address;
  localStorage.setItem("hasherAddress", address);
  console.log("Hasher deployed at:", address);
  return address;
}

export async function getHasherContract(signer) {
  let address =
    config.hasherAddress ||
    cachedHasherAddress ||
    localStorage.getItem("hasherAddress");

  // Verify contract exists
  if (address) {
    try {
      const code = await signer.provider.getCode(address);
      if (code === "0x") {
        console.log("No contract at stored address, redeploying...");
        address = null;
        localStorage.removeItem("hasherAddress");
        cachedHasherAddress = null; // Clear cache too
      }
    } catch (err) {
      console.log("Error checking contract:", err);
      address = null;
      cachedHasherAddress = null; // Clear cache too
    }
  }

  // Deploy if needed
  if (!address) {
    console.log("Deploying Hasher contract...");
    address = await deployHasherContract(signer);
  }

  return new ethers.Contract(address, CONTRACT_ABIS.hasher, signer);
}

export function getRPSContract(address, signer) {
  return new ethers.Contract(address, CONTRACT_ABIS.rps, signer);
}

export async function deployRPSContract(
  signer,
  commitment,
  j2Address,
  stakeAmount
) {
  const factory = new ethers.ContractFactory(
    CONTRACT_ABIS.rps,
    RPS_BYTECODE,
    signer
  );

  // Pass constructor arguments directly
  const contract = await factory.deploy(
    commitment, // bytes32 _c1Hash
    j2Address, // address _j2
    {
      value: ethers.parseEther(stakeAmount), // payable amount
    }
  );

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("RPS deployed at:", address);
  return address;
}

export async function checkTimeout(rpsContract) {
  const lastAction = await rpsContract.lastAction();
  const now = Math.floor(Date.now() / 1000);
  const timeoutSeconds = config.timeoutMinutes * 60;
  return now > Number(lastAction) + timeoutSeconds;
}
