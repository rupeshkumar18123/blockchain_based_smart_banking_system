# 🏦 BankSEC - Secure AI-Powered Decentralized Banking

> **A Hybrid Fintech Platform combining Blockchain Security, Web2 Flexibility, and AI Fraud Prevention.**

![BankSEC Banner](https://via.placeholder.com/1000x300?text=BankSEC+-+Secure+Decentralized+Banking)
*(Replace with your actual dashboard screenshot)*

---

## 📖 Overview
**BankSEC** is a robust banking prototype designed to solve the security flaws of traditional and decentralized finance. It uses a **"Teller Model"** where Admins control liquidity, while customers enjoy secure, private banking features.

The system integrates an **Isolation Forest AI Model** that acts as a firewall, analyzing every P2P transfer request. If the AI detects an anomaly (e.g., unusual amount or rapid frequency), it blocks the transaction *before* it reaches the Blockchain.

### 🌟 Key Features
* **🔐 Decentralized Identity (DID):** Biometric hashes stored on-chain for password-less, secure login.
* **🤖 AI Security Layer:** Python-based AI engine intercepts and blocks fraudulent transactions in real-time.
* **💰 Smart Banking:**
    * **P2P Transfers:** Instant, secure money transfers between users.
    * **Loans:** Automated loan issuance based on smart contract liquidity.
    * **Withdrawals:** Seamless movement of funds from Bank Balance to Web3 Wallet.
* **👮 Admin Teller Panel:**
    * **Liquidity Management:** Admin deposits cash (ETH) to credit user accounts.
    * **Freeze/Unfreeze:** Emergency controls to lock suspicious accounts.
    * **Live Analytics:** Real-time graphs showing bank liquidity and loan risk.

---

## 🏗️ System Architecture

The following diagram illustrates the hybrid flow between the React Frontend, Python AI, MongoDB Database, and Ethereum Blockchain.

```mermaid
graph TD
    %% --- INITIAL ACCESS ---
    Start([User Opens Web App]) --> Connect[Connect MetaMask Wallet]
    Connect --> DB_Check{Address exists in MongoDB?}

    %% --- AUTHENTICATION ---
    DB_Check -- No --> SignupForm[Show Signup Form]
    SignupForm --> InputData[Enter Name, Email, Role]
    InputData --> SaveDB[(Save to MongoDB)]
    SaveDB --> RegBio[Register Biometric Hash on Chain]
    RegBio --> LoginProcess

    DB_Check -- Yes --> LoginProcess[Retrieve User Role]
    LoginProcess --> BioScan[Biometric Fingerprint Scan]
    BioScan --> BioVerify{Hash Matches Blockchain?}
    
    BioVerify -- No --> AccessDenied([Access Denied])
    BioVerify -- Yes --> FrozenCheck{Is Account Frozen?}
    
    FrozenCheck -- Yes --> LockedScreen([Show 'Account Frozen' Alert])
    FrozenCheck -- No --> RoleSwitch{Check Role}

    %% --- ADMIN PANEL ---
    RoleSwitch -- Admin --> AdminDash[Admin Panel]
    
    subgraph Admin_Controls [Admin Features]
        AdminDash --> TellerMod[Teller Module: Credit User]
        TellerMod --> SendCash[Deposit Cash/ETH to User]
        AdminDash --> SecurityMod[Freeze / Unfreeze Account]
        AdminDash --> AnalyticsMod[View Real-time Graphs]
    end

    %% --- CUSTOMER DASHBOARD ---
    RoleSwitch -- User --> UserDash[Customer Dashboard]
    
    subgraph Banking_Features [User Features]
        %% P2P with AI
        UserDash --> P2P[P2P Transfer]
        P2P --> InputTx[Enter Receiver & Amount]
        InputTx --> AICheck[Send to Python AI Engine]
        
        AICheck --> AI_Result{AI Prediction?}
        AI_Result -- Fraud --> BlockTx([Block & Alert User])
        AI_Result -- Safe --> ChainTx[Call Smart Contract 'transfer']
        
        %% Loans & Withdraw
        UserDash --> Loan[Request Loan]
        UserDash --> Withdraw[Withdraw to Wallet]
    end

    %% --- DATA LAYER ---
    SaveDB -.-> MongoDB[(MongoDB Atlas)]
    RegBio -.-> SmartContract[(Ethereum Blockchain)]
    BioVerify -.-> SmartContract
    ChainTx -.-> SmartContract
    AICheck -.-> PythonServer[[Python AI Server]]
