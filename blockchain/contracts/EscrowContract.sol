// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EscrowContract
 * @dev A simple escrow contract for holding funds during P2P credit transactions
 */
contract EscrowContract {
    address public borrower;
    address public lender;
    address public arbitrator;
    uint256 public amount;
    bool public isReleased;
    bool public isRefunded;
    
    // Contract states
    enum State { AWAITING_FUNDS, AWAITING_RELEASE, AWAITING_ARBITRATION, COMPLETED }
    State public currentState;
    
    modifier onlyLender() {
        require(msg.sender == lender, "Only lender can call this function");
        _;
    }
    
    modifier onlyBorrower() {
        require(msg.sender == borrower, "Only borrower can call this function");
        _;
    }
    
    modifier onlyArbitrator() {
        require(msg.sender == arbitrator, "Only arbitrator can call this function");
        _;
    }
    
    modifier inState(State state) {
        require(currentState == state, "Invalid state for this operation");
        _;
    }
    
    constructor(
        address _borrower,
        address _lender,
        address _arbitrator,
        uint256 _amount
    ) payable {
        require(_borrower != address(0), "Borrower cannot be zero address");
        require(_lender != address(0), "Lender cannot be zero address");
        require(_arbitrator != address(0), "Arbitrator cannot be zero address");
        require(msg.value == _amount, "Sent value must match specified amount");
        
        borrower = _borrower;
        lender = _lender;
        arbitrator = _arbitrator;
        amount = _amount;
        currentState = State.AWAITING_FUNDS;
    }
    
    /**
     * @dev Function for the borrower to confirm the loan terms and move to release phase
     */
    function confirmLoanTerms() external onlyBorrower inState(State.AWAITING_FUNDS) {
        currentState = State.AWAITING_RELEASE;
    }
    
    /**
     * @dev Release funds to the borrower
     */
    function releaseFunds() external onlyLender inState(State.AWAITING_RELEASE) {
        require(!isReleased, "Funds already released");
        require(!isRefunded, "Funds already refunded");
        
        isReleased = true;
        currentState = State.COMPLETED;
        
        (bool success, ) = borrower.call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Refund funds to the lender
     */
    function refundFunds() external onlyArbitrator {
        require(!isReleased, "Funds already released");
        require(!isRefunded, "Funds already refunded");
        
        isRefunded = true;
        currentState = State.COMPLETED;
        
        (bool success, ) = lender.call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Arbitrator can make the final decision
     * @param recipient The address to receive the funds (borrower or lender)
     */
    function arbitrate(address recipient) external onlyArbitrator {
        require(recipient == borrower || recipient == lender, "Invalid recipient");
        require(!isReleased, "Funds already released");
        require(!isRefunded, "Funds already refunded");
        
        if (recipient == borrower) {
            isReleased = true;
        } else {
            isRefunded = true;
        }
        
        currentState = State.COMPLETED;
        
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Get the current status of the escrow
     * @return The current state, release status, and refund status
     */
    function getStatus() external view returns (State, bool, bool) {
        return (currentState, isReleased, isRefunded);
    }
    
    /**
     * @dev Fallback function to receive Ether
     */
    receive() external payable {
        require(msg.value > 0, "Value must be greater than 0");
    }
    
    /**
     * @dev Contract balance
     * @return The current balance of the contract
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
