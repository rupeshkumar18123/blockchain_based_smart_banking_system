// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BankSEC {
    address public admin;

    mapping(address => uint256) public balances;
    mapping(address => bytes32) public biometricHashes;
    mapping(address => bool) public isFrozen;

    struct Loan {
        uint256 amount;
        uint256 timestamp;
        bool isActive;
    }
    mapping(address => Loan) public loans;

    // Events
    event Deposit(address indexed user, uint256 amount);
    event TransferMade(address indexed from, address indexed to, uint256 amount);
    event LoanTaken(address indexed user, uint256 amount);
    event LoanRepaid(address indexed user, uint256 amount);
    event AccountFrozen(address indexed user);
    event AccountUnfrozen(address indexed user);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyActive() {
        require(!isFrozen[msg.sender], "Account is Frozen!");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Admin only");
        _;
    }

    // 1. ADMIN DEPOSIT (Teller)
    function creditUser(address _user, uint256 _amount) public payable onlyAdmin {
        balances[_user] += _amount;
        emit Deposit(_user, _amount);
    }

    // 2. TRANSFER (P2P)
    function transfer(address _to, uint256 _amount) public onlyActive {
        require(balances[msg.sender] >= _amount, "Insufficient Bank Balance");
        require(_to != address(0), "Invalid Receiver");

        balances[msg.sender] -= _amount;
        balances[_to] += _amount;

        emit TransferMade(msg.sender, _to, _amount);
    }

    // 3. LOANS (FIXED: Credits Bank Balance now)
    function requestLoan(uint256 _amount) public onlyActive {
        require(!loans[msg.sender].isActive, "Existing loan active");
        
        // Update the user's internal bank balance so they can see/use it
        balances[msg.sender] += _amount;
        
        // Mark the loan as active
        loans[msg.sender] = Loan(_amount, block.timestamp, true);

        // We removed "payable(msg.sender).transfer(_amount)" 
        // Money now stays in the system so you can Transfer it P2P.

        emit LoanTaken(msg.sender, _amount);
    }

    function repayLoan() public payable onlyActive {
        require(loans[msg.sender].isActive, "No active loan");
        require(msg.value >= loans[msg.sender].amount, "Not enough sent");

        loans[msg.sender].isActive = false;
        loans[msg.sender].amount = 0;

        emit LoanRepaid(msg.sender, msg.value);
    }

    // 4. ADMIN & IDENTITY
    function registerIdentity(bytes32 _biometricHash) public {
        biometricHashes[msg.sender] = _biometricHash;
    }

    function freezeAccount(address _user) public onlyAdmin {
        isFrozen[_user] = true;
        emit AccountFrozen(_user);
    }

    function unfreezeAccount(address _user) public onlyAdmin {
        isFrozen[_user] = false;
        emit AccountUnfrozen(_user);
    }

    function getLoanStatus(address _user) public view returns (uint256, bool) {
        return (loans[_user].amount, loans[_user].isActive);
    }

    receive() external payable {}
}