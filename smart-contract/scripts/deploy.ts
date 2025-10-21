// scripts/deploy.ts
import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  // Connect to localhost provider
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // Get deployer account
  const deployer = await provider.getSigner(0);
  console.log("Deployer:", await deployer.getAddress());

  const balance = await provider.getBalance(await deployer.getAddress());
  console.log("Balance:", ethers.formatEther(balance), "ETH");

  // Example parameters
  const player2 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const stake = ethers.parseEther("0.01");
  const move = 1;
  const salt = ethers.randomBytes(32);

  // Read compiled contracts
  const hasherArtifact = await hre.artifacts.readArtifact("Hasher");
  const rpsArtifact = await hre.artifacts.readArtifact("RPS");

  // Deploy Hasher
  const HasherFactory = new ethers.ContractFactory(
    hasherArtifact.abi,
    hasherArtifact.bytecode,
    deployer
  );
  const hasher = await HasherFactory.deploy();
  await hasher.waitForDeployment();
  console.log("Hasher deployed at:", await hasher.getAddress());

  // Commitment hash
  const commitment = await hasher.hash(move, ethers.toBigInt(salt));
  console.log("Commitment:", commitment);

  // Deploy RPS
  const RPSFactory = new ethers.ContractFactory(
    rpsArtifact.abi,
    rpsArtifact.bytecode,
    deployer
  );
  const rps = await RPSFactory.deploy(commitment, player2, { value: stake });
  await rps.waitForDeployment();
  console.log("RPS deployed at:", await rps.getAddress());

  // Private data summary
  console.log("\n--- Private Data (SAVE THIS) ---");
  console.log("Move:", move);
  console.log("Salt:", ethers.hexlify(salt));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
