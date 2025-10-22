// scripts/fundAccount.ts
import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  // Connect to localhost provider
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

  // Get sender account (first account)
  const sender = await provider.getSigner(0);
  const recipient = "0x3a8BDe0800f7CE5699dF2F89383f90638Dc8E413";

  console.log(`Sender address: ${await sender.getAddress()}`);
  console.log(
    `Sender balance: ${ethers.formatEther(
      await provider.getBalance(await sender.getAddress())
    )} ETH`
  );

  const code = await provider.getCode(recipient);
  console.log("Contract code at recipient:", code);

  if (code === "0x") {
    const tx = await sender.sendTransaction({
      to: recipient,
      value: ethers.parseEther("100.0"),
    });
    await tx.wait();
    console.log("✅ Sent 100 ETH successfully!");
    console.log(`Transaction hash: ${tx.hash}`);

    // Check recipient balance after
    const recipientBalance = await provider.getBalance(recipient);
    console.log(
      `Recipient balance: ${ethers.formatEther(recipientBalance)} ETH`
    );
  } else {
    console.log("⚠️ Recipient is a contract");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
