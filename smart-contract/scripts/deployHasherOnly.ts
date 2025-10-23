// scripts/deployHasherAmoy.ts
import { ethers } from "ethers";
import hre from "hardhat";
import "dotenv/config";

async function main() {
  // RPC for Polygon Amoy
  const provider = new ethers.JsonRpcProvider(
    "https://rpc-amoy.polygon.technology"
  );

  // Wallet from mnemonic (from .env)
  const mnemonic = process.env.MNEMONIC!;
  const deployer = ethers.Wallet.fromPhrase(mnemonic).connect(provider);

  console.log("Deployer:", deployer.address);

  const balance = await provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "MATIC");

  // Load Hasher contract artifact
  const hasherArtifact = await hre.artifacts.readArtifact("Hasher");

  // Deploy Hasher
  const HasherFactory = new ethers.ContractFactory(
    hasherArtifact.abi,
    hasherArtifact.bytecode,
    deployer
  );

  const hasher = await HasherFactory.deploy();
  await hasher.waitForDeployment();

  console.log("✅ Hasher deployed at:", await hasher.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
