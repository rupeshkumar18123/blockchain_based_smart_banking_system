import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import BankSEC_ABI from './abis/BankSEC.json';

// Components
import WalletConnect from './components/WalletConnect';
import Signup from './components/Signup';
import BiometricAuth from './components/BiometricAuth';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

const CONTRACT_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707"; // Check this!

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState("0");
  
  const [userData, setUserData] = useState(null);
  const [needsSignup, setNeedsSignup] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 1. AUTO-DETECT ACCOUNT CHANGE
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        window.location.reload(); // Force reload if user switches in MetaMask
      });
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // --- CRITICAL FIX: RESET STATE ---
        setIsAuthenticated(false);
        setNeedsSignup(false);
        setUserData(null);

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0].toLowerCase(); // <--- FORCE LOWERCASE
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const tempContract = new ethers.Contract(CONTRACT_ADDRESS, BankSEC_ABI.abi, signer);
        
        setAccount(userAddress);
        setContract(tempContract);

        // Debugging Logs
        console.log("🔗 Connected:", userAddress);

        // Check DB
        await checkDatabase(userAddress);

        // Check Blockchain
        await checkIdentity(tempContract, userAddress);
        await updateBalance(tempContract, userAddress);

      } catch (error) {
        console.error("Connection failed:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const checkDatabase = async (address) => {
    try {
      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address }) // Send lowercase address
      });
      const data = await response.json();
      
      console.log("📡 Backend Response:", data); // Check this in Console!

      if (data.exists) {
        console.log("✅ User found in DB");
        setUserData(data.user);
        setNeedsSignup(false);
      } else {
        console.log("⚠️ User NOT found. Redirecting to Signup...");
        setNeedsSignup(true);
      }
    } catch (error) {
      console.error("Backend Error:", error);
      alert("Could not connect to Backend. Is 'node server.js' running?");
    }
  };

  const handleSignupSuccess = (newUser) => {
    setUserData(newUser);
    setNeedsSignup(false);
  };

  const checkIdentity = async (contractInstance, userAddress) => {
    try {
      const hash = await contractInstance.biometricHashes(userAddress);
      if (hash && hash !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
        setIsRegistered(true);
      } else {
        setIsRegistered(false);
      }
    } catch (e) { console.log("Identity check failed:", e); }
  };

  const updateBalance = async (contractInst = contract, userAddr = account) => {
    if(contractInst && userAddr) {
        const userBalance = await contractInst.balances(userAddr);
        setBalance(ethers.formatEther(userBalance));
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5", fontFamily: "Arial" }}>
      
      {!account && <WalletConnect onConnect={connectWallet} />}

      {/* SIGNUP SCREEN (High Priority) */}
      {account && needsSignup && (
        <Signup account={account} onSignupSuccess={handleSignupSuccess} />
      )}

      {/* BIOMETRIC SCREEN (Only if NOT signing up) */}
      {account && !needsSignup && !isAuthenticated && (
        <BiometricAuth 
            account={account} 
            contract={contract} 
            isRegistered={isRegistered}
            onAuthenticated={() => setIsAuthenticated(true)} 
        />
      )}

      {isAuthenticated && userData && (
        <>
          <div style={{padding: "10px 20px", background: "white", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.1)"}}>
             <h3 style={{margin: 0}}>BankSEC</h3>
             <div>
                <span style={{marginRight: "15px", fontWeight: "bold"}}>{userData.name} ({userData.role.toUpperCase()})</span>
                <button onClick={() => window.location.reload()} style={{padding: "5px 10px", cursor: "pointer"}}>Logout</button>
             </div>
          </div>

          {userData.role === 'admin' ? (
             <AdminPanel contract={contract} account={account} />
          ) : (
             <Dashboard 
                account={account} 
                balance={balance} 
                contract={contract}
                updateBalance={updateBalance}
             />
          )}
        </>
      )}

    </div>
  );
}

export default App;









// import { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import BankSEC_ABI from './abis/BankSEC.json';

// // Components
// import WalletConnect from './components/WalletConnect';
// import BiometricAuth from './components/BiometricAuth';
// import Dashboard from './components/Dashboard';

// const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

// function App() {
//   // Global State
//   const [account, setAccount] = useState(null);
//   const [contract, setContract] = useState(null);
//   const [balance, setBalance] = useState("0");
  
//   // App Flow State
//   const [isRegistered, setIsRegistered] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
// // DEBUGGING: Check if React sees the Loan function
//   useEffect(() => {
//     console.log("Contract Address:", CONTRACT_ADDRESS);
//     if (contract) {
//         console.log("Contract Functions:", contract);
//         // If this prints "undefined", the ABI is WRONG.
//         console.log("Loan Function Check:", contract.getLoanStatus); 
//     }
//   }, [contract]);
//   // 1. Connect Wallet Logic
//   const connectWallet = async () => {
//     if (window.ethereum) {
//       try {
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         const provider = new ethers.BrowserProvider(window.ethereum);
//         const signer = await provider.getSigner();
//         const tempContract = new ethers.Contract(CONTRACT_ADDRESS, BankSEC_ABI.abi, signer);
        
//         setAccount(accounts[0]);
//         setContract(tempContract);

//         // Check Registration Status immediately
//         await checkIdentity(tempContract, accounts[0]);
//         await updateBalance(tempContract, accounts[0]);

//       } catch (error) {
//         console.error("Connection failed:", error);
//       }
//     } else {
//       alert("Please install MetaMask!");
//     }
//   };

//   // Helper: Check Identity
//   const checkIdentity = async (contractInstance, userAddress) => {
//     const hash = await contractInstance.biometricHashes(userAddress);
//     // Check if hash is not empty
//     if (hash && hash !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
//       setIsRegistered(true);
//     } else {
//       setIsRegistered(false);
//     }
//   };

//   // Helper: Update Balance
//   const updateBalance = async (contractInst = contract, userAddr = account) => {
//     if(contractInst && userAddr) {
//         const userBalance = await contractInst.balances(userAddr);
//         setBalance(ethers.formatEther(userBalance));
//     }
//   };

//   // --- RENDER LOGIC (The "Switch") ---
//   return (
//     <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5", fontFamily: "Arial", overflow: "hidden" }}>
      
//       {/* 1. If no wallet connected, show WalletConnect */}
//       {!account && (
//         <WalletConnect onConnect={connectWallet} />
//       )}

//       {/* 2. If connected but NOT authenticated, show Biometrics */}
//       {account && !isAuthenticated && (
//         <BiometricAuth 
//             account={account} 
//             contract={contract} 
//             isRegistered={isRegistered}
//             onAuthenticated={() => setIsAuthenticated(true)} 
//         />
//       )}

//       {/* 3. If Authenticated, show Dashboard */}
//       {isAuthenticated && (
//         <Dashboard 
//             account={account} 
//             balance={balance} 
//             contract={contract}
//             updateBalance={updateBalance}
//         />
//       )}

//     </div>
//   );
// }

// export default App;
















// import { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import BankSEC_ABI from './abis/BankSEC.json'; // Importing the ABI Map

// // NOTE: We will fill this with the real address later!
// const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; //0x5FbDB2315678afecb367f032d93F642f64180aa3


// import { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import BankSEC_ABI from './abis/BankSEC.json';

// // ⚠️ IMPORTANT: Paste your DEPLOYED contract address here!
// // (The one you got from "npx hardhat run scripts/deploy.js --network localhost")
// const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

// function App() {
//   const [account, setAccount] = useState(null);
//   const [balance, setBalance] = useState("0");
//   const [contract, setContract] = useState(null);
//   const [loading, setLoading] = useState(false); // To show "Processing..."

//   // 1. Connect Wallet
//   const connectWallet = async () => {
//     if (window.ethereum) {
//       try {
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         setAccount(accounts[0]);
        
//         // Connect to Blockchain
//         const provider = new ethers.BrowserProvider(window.ethereum);
//         const signer = await provider.getSigner();
//         const tempContract = new ethers.Contract(CONTRACT_ADDRESS, BankSEC_ABI.abi, signer);
//         setContract(tempContract);

//         // Fetch initial bank balance
//         updateBalance(tempContract, accounts[0]);
        
//       } catch (error) {
//         console.error("Connection failed:", error);
//       }
//     } else {
//       alert("Please install MetaMask!");
//     }
//   };

//   // 2. Helper to fetch balance from Blockchain
//   const updateBalance = async (contractInstance, userAddress) => {
//     if(contractInstance) {
//        // Call the "balances" mapping in your Solidity contract
//        const userBalance = await contractInstance.balances(userAddress);
//        // Convert from "Wei" (tiny unit) to "ETH" (readable unit)
//        setBalance(ethers.formatEther(userBalance));
//     }
//   }

//   // 3. DEPOSIT FUNCTION
//   const depositMoney = async () => {
//     if (!contract) return;
//     try {
//       setLoading(true);
      
//       // Call the "deposit" function in your Smart Contract
//       // We send 1.0 ETH along with the transaction
//       const tx = await contract.deposit({ value: ethers.parseEther("1.0") });
      
//       console.log("Transaction Sent:", tx.hash);
      
//       // Wait for the blockchain to confirm it
//       await tx.wait();
      
//       alert("✅ Deposit Successful!");
      
//       // Refresh the balance on screen
//       await updateBalance(contract, account);
      
//     } catch (error) {
//       console.error("Deposit Error:", error);
//       alert("Transaction Failed! (Check console)");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: "40px", fontFamily: "Arial", textAlign: "center" }}>
//       <h1>🏦 BankSEC Dashboard</h1>
      
//       {!account ? (
//         <button 
//           onClick={connectWallet}
//           style={{ padding: "15px 30px", fontSize: "18px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
//         >
//           Connect MetaMask Wallet
//         </button>
//       ) : (
//         <div style={{ border: "1px solid #ddd", padding: "30px", borderRadius: "10px", maxWidth: "500px", margin: "0 auto" }}>
//           <p><strong>User:</strong> {account.slice(0,6)}...{account.slice(-4)}</p>
          
//           <hr />
          
//           <h2>💰 Bank Balance</h2>
//           <h1 style={{ color: "#2E7D32" }}>{balance} ETH</h1>
          
//           <div style={{ marginTop: "30px", display: "flex", gap: "10px", justifyContent: "center" }}>
//             <button 
//               onClick={depositMoney}
//               disabled={loading}
//               style={{ padding: "12px 24px", fontSize: "16px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "5px", cursor: loading ? "not-allowed" : "pointer" }}
//             >
//               {loading ? "Processing..." : "Deposit 1 ETH"}
//             </button>

//             <button disabled style={{ padding: "12px 24px", fontSize: "16px", backgroundColor: "#ddd", color: "#666", border: "none", borderRadius: "5px" }}>
//               Withdraw (Coming Soon)
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;





















// function App() {
//   const [account, setAccount] = useState(null);
//   const [balance, setBalance] = useState("0");
//   const [contract, setContract] = useState(null);

//   // 1. Connect to MetaMask
//   const connectWallet = async () => {
//     if (window.ethereum) {
//       try {
//         // Request account access
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         setAccount(accounts[0]);
        
//         // Setup Ethers provider
//         const provider = new ethers.BrowserProvider(window.ethereum);
//         const signer = await provider.getSigner();

//         // Connect to the Contract
//         const tempContract = new ethers.Contract(CONTRACT_ADDRESS, BankSEC_ABI.abi, signer);
//         setContract(tempContract);
        
//         console.log("Wallet Connected:", accounts[0]);
//       } catch (error) {
//         console.error("Connection failed:", error);
//       }
//     } else {
//       alert("Please install MetaMask!");
//     }
//   };

//   return (
//     <div style={{ padding: "20px", fontFamily: "Arial" }}>
//       <h1>BankSEC - Secure Decentralized Banking</h1>
      
//       {!account ? (
//         <button 
//           onClick={connectWallet}
//           style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px" }}
//         >
//           Connect MetaMask
//         </button>
//       ) : (
//         <div>
//           <h3>✅ Wallet Connected</h3>
//           <p><strong>Address:</strong> {account}</p>
//           <hr />
          
//           {/* We will build these next */}
//           <div style={{ marginTop: "20px" }}>
//             <h2>Your Dashboard</h2>
//             <p>Balance: {balance} ETH</p>
            
//             <button style={{ marginRight: "10px", padding: "10px" }}>Deposit 1 ETH</button>
//             <button style={{ padding: "10px" }}>Check Balance</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;