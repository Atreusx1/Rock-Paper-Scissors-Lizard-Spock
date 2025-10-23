# Rock Paper Scissors Lizard Spock

## Game Rules

This game extends the classic Rock Paper Scissors with two additional moves. Each move defeats two others and loses to two others.

- Rock defeats Scissors and Lizard
- Paper defeats Rock and Spock
- Scissors defeats Paper and Lizard
- Lizard defeats Paper and Spock
- Spock defeats Rock and Scissors
- Both players must move within the time limit of 5 mins or risk forfeiting their stake.
- After Player 2 plays, Player 1 has 5 mins to reveal their move or Player 2 can claim both stakes.

Both players bet the same amount of ETH. The winner takes the entire pot.

## How to Play

### Player 1: Create a Game

1. Click Create Game
2. Enter the opponent's wallet address
3. Set the stake amount in ETH
4. Choose your move
5. Click Generate Commitment to lock in your hidden move
6. Click Deploy Contract to create the game on-chain
7. Download and save the backup file securely (optional as a failsafe, server saves your data)
8. Copy the contract address and send it to your opponent

Your move is now committed to the blockchain but remains hidden until you reveal it.

### Player 2: Join a Game

1. Receive the contract address from Player 1
2. Click Join Game
3. Paste the contract address
4. Choose your move
5. Send the transaction with the same stake amount
6. Wait for Player 1 to reveal their move

### Player 1: Reveal the Winner

1. Click Reveal Move
2. Enter the contract address
3. Click Load Game to decrypt your hidden move
4. After Player 2 has played, click Reveal Move
5. The smart contract automatically sends ETH to the winner

## Technical Overview

### Commitment Scheme

Player 1 cannot simply submit their move to the blockchain. If they did, Player 2 could see it before choosing their own move. Instead, Player 1 uses a commitment scheme.

When you create a game, the system generates a random 256-bit salt. Your move and this salt are combined and hashed using keccak256. Only this hash is stored on the blockchain.

Player 2 cannot reverse the hash to determine your move. When you reveal, the contract verifies that your move and salt produce the same hash. If they do not match, the transaction fails.

### Data Storage

Your game data is stored in two places.

**Server Storage**

Your move and salt are encrypted using your MetaMask signature before being sent to the server. The server cannot decrypt this data without your signature. This allows you to access your game from any device or browser.

Games expire after 10 minutes if not completed. Finished games are stored for 30 days in the history.

**Backup File**

When you create a commitment and deploy, you have an option to download JSON file. This file contains your move, salt, and contract address in plain text.

The backup file is not encrypted because it stays on your device. You already know your own move. The salt is needed to reveal later. If you lose access to the server, you can upload this file to recover your game.

### Why the Salt Matters

Without a salt, someone could try all five possible moves and compare the hashes. With only five options, this would take milliseconds.

A 256-bit salt means there are 2^256 possible combinations. This is more than the number of atoms in the observable universe. Brute forcing is impossible.

## Timeouts

### If Player 2 Never Joins

After 5 minutes, Player 1 can call the timeout function to retrieve their stake.

### If Player 1 Never Reveals

After Player 2 submits their move, Player 1 has 5 minutes to reveal. If they do not, Player 2 can call the timeout function and claim both stakes.

## Security

**Can Player 2 see Player 1's move before playing?**

No. Only the hash is visible on the blockchain. The hash cannot be reversed without knowing the salt.

**Can Player 1 change their move after seeing Player 2's choice?**

No. The commitment hash is stored in the smart contract. If Player 1 tries to reveal a different move, the hash will not match and the transaction will fail.

**What if the server is compromised?**

The server stores encrypted data. Without your MetaMask signature, the data cannot be decrypted. You also have your backup file as a fallback.

**Can the server operator cheat?**

The server operator can delete data or shut down the server, but they cannot view or modify your move. This is why the backup file exists.

## Common Issues

**Invalid address error**

Verify that the address starts with 0x and contains 42 hexadecimal characters.

**Game not found**

The server may not have your data. Try uploading your backup file instead.

**Not enough ETH**

You need enough ETH for both the stake and the gas fees for the transaction.

**Cannot reveal**

Ensure that Player 2 has already submitted their move. You cannot reveal before they play.

## Best Practices

- Test on a testnet before using real money
- Keep your backup file in a secure location
- Never share your backup file with anyone
- Double-check the opponent's address before deploying
- Start with small stakes until you understand the game mechanics
- Remember that you have only 5 minutes to reveal after Player 2 plays
