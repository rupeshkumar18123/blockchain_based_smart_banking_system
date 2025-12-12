const hre = require("hardhat");

async function main() {
  // 1. Get the account we are using (Simulated Admin)
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 2. Load the contract
  const BankSEC = await hre.ethers.getContractFactory("BankSEC");
  
  // 3. Deploy the contract
  const bank = await BankSEC.deploy();
  await bank.waitForDeployment(); // Updated for newer Ethers/Hardhat versions

  console.log("BankSEC deployed to:", await bank.getAddress());

  // --- SIMULATION ---
  // Let's pretend we are the AI or Admin checking functionality
  const bankAddress = await bank.getAddress();
  console.log("Initial Balance of Contract:", await hre.ethers.provider.getBalance(bankAddress));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});