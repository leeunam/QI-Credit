// blockchain/tests/EscrowContract.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EscrowContract", function () {
  let EscrowContract;
  let escrow;
  let borrower;
  let lender;
  let arbitrator;
  let amount;

  beforeEach(async function () {
    // Get signers
    [borrower, lender, arbitrator, other] = await ethers.getSigners();
    
    // Deploy the contract
    EscrowContract = await ethers.getContractFactory("EscrowContract");
    amount = ethers.utils.parseEther("1.0"); // 1 ETH
    
    escrow = await EscrowContract.deploy(
      borrower.address,
      lender.address, 
      arbitrator.address,
      amount
    );
    
    await escrow.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right borrower", async function () {
      expect(await escrow.borrower()).to.equal(borrower.address);
    });

    it("Should set the right lender", async function () {
      expect(await escrow.lender()).to.equal(lender.address);
    });

    it("Should set the right arbitrator", async function () {
      expect(await escrow.arbitrator()).to.equal(arbitrator.address);
    });

    it("Should set the right amount", async function () {
      expect(await escrow.amount()).to.equal(amount);
    });
  });

  describe("confirmLoanTerms", function () {
    it("Should allow borrower to confirm loan terms", async function () {
      await escrow.connect(borrower).confirmLoanTerms();
      expect(await escrow.currentState()).to.equal(1); // AWAITING_RELEASE state
    });

    it("Should not allow non-borrower to confirm loan terms", async function () {
      await expect(
        escrow.connect(other).confirmLoanTerms()
      ).to.be.revertedWith("Only borrower can call this function");
    });
  });
});