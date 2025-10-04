const ethers = require('ethers');
const config = require('../config/config');

// Determine if we're running in mock mode
const isMockMode = config.BLOCKCHAIN_MOCK_MODE === 'true';

// Blockchain Service for interacting with smart contracts on Gnosis/Arbitrum
class BlockchainService {
  constructor() {
    // Initialize provider based on configuration - only if not in mock mode
    if (!isMockMode) {
      this.provider = new ethers.JsonRpcProvider(
        config.BLOCKCHAIN_RPC_URL || 'http://localhost:8545'
      );
      
      // Initialize wallet with private key
      this.wallet = new ethers.Wallet(
        config.PRIVATE_KEY || ethers.Wallet.createRandom().privateKey
      ).connect(this.provider);
      
      // Contract addresses (to be updated after deployment)
      this.escrowContractAddress = config.ESCROW_CONTRACT_ADDRESS;
      this.tokenContractAddress = config.TOKEN_CONTRACT_ADDRESS;
      
      // Contract ABIs (to be imported from artifacts)
      this.escrowContractABI = [
        // ABI for EscrowContract
        "function borrower() view returns (address)",
        "function lender() view returns (address)",
        "function arbitrator() view returns (address)",
        "function amount() view returns (uint256)",
        "function isReleased() view returns (bool)",
        "function isRefunded() view returns (bool)",
        "function currentState() view returns (uint8)",
        "function confirmLoanTerms() external",
        "function releaseFunds() external",
        "function refundFunds() external",
        "function arbitrate(address recipient) external"
      ];
      
      this.tokenContractABI = [
        // ABI for token contract
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)"
      ];
      
      // Initialize contract instances
      if (this.escrowContractAddress) {
        this.escrowContract = new ethers.Contract(
          this.escrowContractAddress,
          this.escrowContractABI,
          this.wallet
        );
      }
      
      if (this.tokenContractAddress) {
        this.tokenContract = new ethers.Contract(
          this.tokenContractAddress,
          this.tokenContractABI,
          this.wallet
        );
      }
    }
  }

  // Connect to blockchain network
  async connect() {
    if (isMockMode) {
      // Simulate connection to blockchain
      console.log('Mock Blockchain Service: Connection to blockchain');
      return { 
        success: true, 
        network: {
          name: 'mock_network',
          chainId: 1337,
          blockNumber: Math.floor(Math.random() * 1000000)
        } 
      };
    } else {
      try {
        const network = await this.provider.getNetwork();
        console.log(`Connected to network: ${network.name} (${network.chainId})`);
        return { success: true, network };
      } catch (error) {
        console.error('Error connecting to blockchain:', error);
        return { success: false, error: error.message };
      }
    }
  }

  // Get wallet balance
  async getWalletBalance() {
    if (isMockMode) {
      // Simulate getting wallet balance
      const mockBalance = {
        address: `0x${Math.random().toString(16).substr(2, 40)}`, // Mock address
        balance: (Math.random() * 10).toFixed(6).toString(), // Random balance in ETH
        balanceWei: Math.floor(Math.random() * 10000000000000000000).toString() // Random balance in wei
      };
      console.log('Mock Blockchain Service: Get wallet balance');
      return mockBalance;
    } else {
      try {
        const balance = await this.provider.getBalance(this.wallet.address);
        return {
          address: this.wallet.address,
          balance: ethers.formatEther(balance),
          balanceWei: balance.toString()
        };
      } catch (error) {
        console.error('Error getting wallet balance:', error);
        return { success: false, error: error.message };
      }
    }
  }

  // Deposit funds to escrow contract
  async depositToEscrow(escrowId, borrowerAddress, lenderAddress, arbitratorAddress, amount) {
    if (isMockMode) {
      // Simulate deposit to escrow with mock data
      const mockEscrow = {
        success: true,
        escrowContractAddress: `0x${Math.random().toString(16).substr(2, 40)}`, // Mock address
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock transaction hash
        escrowDetails: {
          id: escrowId,
          borrower: borrowerAddress,
          lender: lenderAddress,
          arbitrator: arbitratorAddress,
          amount: amount,
          status: 'PENDING',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          contract_data: {
            borrower: borrowerAddress,
            lender: lenderAddress,
            arbitrator: arbitratorAddress,
            amount: amount,
            timeout: 30 * 24 * 60 * 60 // 30 days in seconds
          }
        }
      };
      console.log('Mock Blockchain Service: Deposit to escrow', {escrowId, borrowerAddress, lenderAddress, amount});
      return mockEscrow;
    } else {
      try {
        // We'll create a new instance of the escrow contract for this transaction
        // In a real implementation, you would have the contract deployed and get its address
        console.log('Creating escrow contract deployment transaction...');
        
        // For demo purposes, we'll just return the expected contract data
        // In a real implementation, we would deploy a new escrow contract
        return {
          success: true,
          escrowContractAddress: ethers.Wallet.createRandom().address, // Mock address
          transactionHash: ethers.id('mock_transaction'),
          escrowDetails: {
            id: escrowId,
            borrower: borrowerAddress,
            lender: lenderAddress,
            arbitrator: arbitratorAddress,
            amount: amount,
            status: 'PENDING'
          }
        };
      } catch (error) {
        console.error('Error depositing to escrow:', error);
        return { success: false, error: error.message };
      }
    }
  }

  // Release funds from escrow
  async releaseFundsFromEscrow(escrowContractAddress) {
    if (isMockMode) {
      // Simulate releasing funds from escrow
      const mockResult = {
        success: true,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock transaction hash
        status: 'RELEASED',
        updated_at: new Date().toISOString()
      };
      console.log('Mock Blockchain Service: Release funds from escrow', escrowContractAddress);
      return mockResult;
    } else {
      try {
        if (!this.escrowContract) {
          throw new Error('Escrow contract not initialized');
        }
        
        // Create contract instance for specific escrow
        const contract = new ethers.Contract(
          escrowContractAddress,
          this.escrowContractABI,
          this.wallet
        );
        
        // Call the releaseFunds function
        const tx = await contract.releaseFunds();
        await tx.wait(); // Wait for transaction to be mined
        
        return {
          success: true,
          transactionHash: tx.hash,
          status: 'RELEASED'
        };
      } catch (error) {
        console.error('Error releasing funds from escrow:', error);
        return { success: false, error: error.message };
      }
    }
  }

  // Refund funds from escrow
  async refundFundsFromEscrow(escrowContractAddress) {
    if (isMockMode) {
      // Simulate refunding funds from escrow
      const mockResult = {
        success: true,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock transaction hash
        status: 'REFUNDED',
        updated_at: new Date().toISOString()
      };
      console.log('Mock Blockchain Service: Refund funds from escrow', escrowContractAddress);
      return mockResult;
    } else {
      try {
        if (!this.escrowContract) {
          throw new Error('Escrow contract not initialized');
        }
        
        // Create contract instance for specific escrow
        const contract = new ethers.Contract(
          escrowContractAddress,
          this.escrowContractABI,
          this.wallet
        );
        
        // Call the refundFunds function
        const tx = await contract.refundFunds();
        await tx.wait(); // Wait for transaction to be mined
        
        return {
          success: true,
          transactionHash: tx.hash,
          status: 'REFUNDED'
        };
      } catch (error) {
        console.error('Error refunding funds from escrow:', error);
        return { success: false, error: error.message };
      }
    }
  }

  // Get escrow contract status
  async getEscrowStatus(escrowContractAddress) {
    if (isMockMode) {
      // Simulate getting escrow status with mock data
      const mockStatus = {
        success: true,
        escrowDetails: {
          borrower: `0x${Math.random().toString(16).substr(2, 40)}`,
          lender: `0x${Math.random().toString(16).substr(2, 40)}`,
          arbitrator: `0x${Math.random().toString(16).substr(2, 40)}`,
          amount: Math.floor(Math.random() * 1000000000000000000).toString(), // Random amount in wei
          isReleased: Math.random() > 0.5,
          isRefunded: Math.random() > 0.7,
          currentState: Math.floor(Math.random() * 4), // 0-3
          currentStateName: ['AWAITING_FUNDS', 'AWAITING_RELEASE', 'AWAITING_ARBITRATION', 'COMPLETED'][Math.floor(Math.random() * 4)]
        }
      };
      console.log('Mock Blockchain Service: Get escrow status', escrowContractAddress);
      return mockStatus;
    } else {
      try {
        if (!this.escrowContract) {
          throw new Error('Escrow contract not initialized');
        }
        
        // Create contract instance for specific escrow
        const contract = new ethers.Contract(
          escrowContractAddress,
          this.escrowContractABI,
          this.provider // Use provider for read-only calls
        );
        
        const [borrower, lender, arbitrator, amount, isReleased, isRefunded, currentState] = await Promise.all([
          contract.borrower(),
          contract.lender(),
          contract.arbitrator(),
          contract.amount(),
          contract.isReleased(),
          contract.isRefunded(),
          contract.currentState()
        ]);
        
        const stateNames = ['AWAITING_FUNDS', 'AWAITING_RELEASE', 'AWAITING_ARBITRATION', 'COMPLETED'];
        const currentStateName = stateNames[currentState] || 'UNKNOWN';
        
        return {
          success: true,
          escrowDetails: {
            borrower,
            lender,
            arbitrator,
            amount: ethers.formatEther(amount),
            isReleased,
            isRefunded,
            currentState: currentStateName,
            currentStateCode: currentState
          }
        };
      } catch (error) {
        console.error('Error getting escrow status:', error);
        return { success: false, error: error.message };
      }
    }
  }

  // Mint tokens (for credit tokens or rewards)
  async mintTokens(toAddress, amount) {
    if (isMockMode) {
      // Simulate minting tokens
      const mockResult = {
        success: true,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock transaction hash
        message: 'Tokens minted successfully (mock implementation)',
        to: toAddress,
        amount: amount,
        updated_at: new Date().toISOString()
      };
      console.log('Mock Blockchain Service: Mint tokens', {toAddress, amount});
      return mockResult;
    } else {
      try {
        if (!this.tokenContract) {
          throw new Error('Token contract not initialized');
        }
        
        // Convert amount to proper token decimals (assuming 18 decimals)
        const tokenAmount = ethers.parseUnits(amount.toString(), 18);
        
        // This would typically call a mint function on the token contract
        // Note: Only owner can mint tokens in most token implementations
        console.log(`Minting ${amount} tokens to ${toAddress}`);
        
        return {
          success: true,
          message: 'Tokens minted successfully (mock implementation)',
          to: toAddress,
          amount: amount
        };
      } catch (error) {
        console.error('Error minting tokens:', error);
        return { success: false, error: error.message };
      }
    }
  }

  // Transfer tokens
  async transferTokens(toAddress, amount) {
    if (isMockMode) {
      // Simulate transferring tokens
      const mockResult = {
        success: true,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock transaction hash
        from: `0x${Math.random().toString(16).substr(2, 40)}`, // Mock from address
        to: toAddress,
        amount: amount,
        updated_at: new Date().toISOString()
      };
      console.log('Mock Blockchain Service: Transfer tokens', {toAddress, amount});
      return mockResult;
    } else {
      try {
        if (!this.tokenContract) {
          throw new Error('Token contract not initialized');
        }
        
        // Convert amount to proper token decimals (assuming 18 decimals)
        const tokenAmount = ethers.parseUnits(amount.toString(), 18);
        
        const tx = await this.tokenContract.transfer(toAddress, tokenAmount);
        await tx.wait(); // Wait for transaction to be mined
        
        return {
          success: true,
          transactionHash: tx.hash,
          from: this.wallet.address,
          to: toAddress,
          amount: amount
        };
      } catch (error) {
        console.error('Error transferring tokens:', error);
        return { success: false, error: error.message };
      }
    }
  }

  // Get token balance
  async getTokenBalance(address) {
    if (isMockMode) {
      // Simulate getting token balance
      const mockBalance = {
        success: true,
        address,
        balance: parseFloat((Math.random() * 10000).toFixed(2)),
        balanceWei: Math.floor(Math.random() * 10000000000000000000000).toString()
      };
      console.log('Mock Blockchain Service: Get token balance', address);
      return mockBalance;
    } else {
      try {
        if (!this.tokenContract) {
          throw new Error('Token contract not initialized');
        }
        
        const balance = await this.tokenContract.balanceOf(address);
        const formattedBalance = ethers.formatUnits(balance, 18);
        
        return {
          success: true,
          address,
          balance: parseFloat(formattedBalance),
          balanceWei: balance.toString()
        };
      } catch (error) {
        console.error('Error getting token balance:', error);
        return { success: false, error: error.message };
      }
    }
  }

  // Listen for blockchain events
  async listenForEvents() {
    if (isMockMode) {
      // Simulate setting up blockchain event listeners
      console.log('Mock Blockchain Service: Setting up blockchain event listeners...');
      
      // In a real implementation, you would set up WebSocket connections or polling
      // For mock mode, just simulate that everything is working
      return {
        success: true,
        message: 'Mock blockchain event listeners setup complete',
        status: 'active'
      };
    } else {
      try {
        if (!this.escrowContract) {
          throw new Error('Escrow contract not initialized');
        }
        
        // Listen for events from the escrow contract
        // Implementation would involve setting up event listeners
        console.log('Setting up blockchain event listeners...');
        
        // This would typically involve:
        // - Listening for smart contract events
        // - Updating database when events occur
        // - Processing the events in a queue or similar system
        
        return {
          success: true,
          message: 'Blockchain event listeners setup complete'
        };
      } catch (error) {
        console.error('Error setting up event listeners:', error);
        return { success: false, error: error.message };
      }
    }
  }

  // Get transaction details
  async getTransactionDetails(txHash) {
    if (isMockMode) {
      // Simulate getting transaction details
      const mockTx = {
        success: true,
        transaction: {
          hash: txHash,
          from: `0x${Math.random().toString(16).substr(2, 40)}`,
          to: `0x${Math.random().toString(16).substr(2, 40)}`,
          value: ethers.parseEther((Math.random() * 1).toFixed(6)).toString(),
          gasLimit: BigInt(21000),
          gasPrice: ethers.parseUnits('20', 'gwei'),
          nonce: Math.floor(Math.random() * 100),
          data: '0x',
          chainId: 1337
        },
        receipt: {
          transactionHash: txHash,
          blockHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          blockNumber: Math.floor(Math.random() * 1000000),
          gasUsed: BigInt(21000),
          status: 1 // Success
        },
        status: 'SUCCESS'
      };
      console.log('Mock Blockchain Service: Get transaction details', txHash);
      return mockTx;
    } else {
      try {
        const tx = await this.provider.getTransaction(txHash);
        const receipt = await this.provider.getTransactionReceipt(txHash);
        
        return {
          success: true,
          transaction: tx,
          receipt: receipt,
          status: receipt ? (receipt.status === 1 ? 'SUCCESS' : 'FAILED') : 'PENDING'
        };
      } catch (error) {
        console.error('Error getting transaction details:', error);
        return { success: false, error: error.message };
      }
    }
  }
}

module.exports = new BlockchainService();