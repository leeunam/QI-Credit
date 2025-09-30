// scripts/deploy.js
async function main() {
  // Get the contract to deploy
  const EscrowContract = await ethers.getContractFactory("EscrowContract");
  
  // Deploy the contract
  // Parameters: borrower, lender, arbitrator, amount
  const escrowContract = await EscrowContract.deploy(
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // borrower address
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // lender address
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // arbitrator address
    ethers.utils.parseEther("1.0") // 1 ETH in wei
  );
  
  await escrowContract.deployed();
  
  console.log("EscrowContract deployed to:", escrowContract.address);
}

// Run the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });