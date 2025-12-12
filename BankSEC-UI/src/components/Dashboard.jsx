import React, { useState } from 'react';
import { ethers } from 'ethers';
import LoanSection from './LoanSection';
import TransactionHistory from './TransactionHistory';
import Transfer from './Transfer'; 

const Dashboard = ({ account, balance, contract, updateBalance }) => {
  const [loading, setLoading] = useState(false);

  // Deposit Logic
//   const depositMoney = async () => {
//     if (!contract) return;
//     try {
//       setLoading(true);
//       // Send 1 ETH
//       const tx = await contract.deposit({ value: ethers.parseEther("1.0") });
//       await tx.wait();
//       alert("✅ Deposit Successful!");
//       await updateBalance();
//     } catch (error) { 
//       console.error(error); 
//       alert("Deposit Failed: " + (error.reason || "Check console"));
//     } finally { 
//       setLoading(false); 
//     }
//   };

  return (
    <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
            <span style={styles.badge}>✅ Identity Verified</span>
            <span style={{color: "#888", fontSize: "12px"}}>{account}</span>
        </div>

        {/* BALANCE CARD */}
        <div style={styles.balanceCard}>
            <p style={{marginBottom: "5px", color: "#ccc"}}>Total Bank Balance</p>
            <h1 style={{fontSize: "48px", margin: "0", color: "#fff"}}>
                {balance} <span style={{fontSize: "20px"}}>ETH</span>
            </h1>
            <div style={{marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center"}}>
                {/* <button onClick={depositMoney} disabled={loading} style={styles.depositBtn}>
                    {loading ? "Processing..." : "➕ Deposit 1 ETH"}
                </button> */}
                {/* <p style={{color: "#aaa", fontSize: "14px"}}>Visit Branch to Deposit </p>
                <button disabled style={{...styles.depositBtn, opacity: 0.5, cursor: "not-allowed"}}>
                    Withdraw
                </button> */}
            </div>
        </div>

        {/* MAIN GRID */}
        <div style={styles.grid}>
            {/* Left Column: Transfer Module */}
            <div style={{flex: 1, minWidth: "300px"}}>
                <Transfer contract={contract} account={account} updateBalance={updateBalance} />
            </div>

            {/* Right Column: Loan Module */}
            <div style={{flex: 1, minWidth: "300px"}}>
                <LoanSection contract={contract} account={account} />
            </div>
        </div>

        {/* HISTORY (Bottom) */}
        <TransactionHistory contract={contract} account={account} />
    </div>
  );
};

const styles = {
  container: { maxWidth: "1000px", margin: "30px auto", padding: "20px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  badge: { backgroundColor: "#e8f5e9", color: "green", padding: "5px 15px", borderRadius: "20px", fontWeight: "bold" },
  
  balanceCard: { background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", color: "white", padding: "40px", borderRadius: "15px", textAlign: "center", boxShadow: "0 10px 20px rgba(0,0,0,0.2)" },
  depositBtn: { padding: "10px 25px", fontSize: "16px", backgroundColor: "rgba(255,255,255,0.2)", color: "white", border: "1px solid white", borderRadius: "5px", cursor: "pointer" },
  
  grid: { display: "flex", gap: "20px", marginTop: "30px", flexDirection: "row", flexWrap: "wrap" }
};

export default Dashboard;


// import React, { useState } from 'react';
// import { ethers } from 'ethers';
// import LoanSection from './LoanSection';
// import TransactionHistory from './TransactionHistory';
// import Transfer from './Transfer';

// const Dashboard = ({ account, balance, contract, updateBalance }) => {
//     const [loading, setLoading] = useState(false);

//     const depositMoney = async () => {
//         if (!contract) return;
//         try {
//             setLoading(true);
//             const tx = await contract.deposit({ value: ethers.parseEther("1.0") });
//             await tx.wait();
//             alert("✅ Deposit Successful!");
//             await updateBalance(); // Refresh balance
//         } catch (error) {
//             console.error(error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // NEW: AI-Protected Transfer
//     const handleTransferWithAI = async () => {
//         if (!contract) return;

//         const amount = prompt("Enter amount to Transfer (Try > 50 ETH to trigger AI Fraud Alert):");
//         if (!amount) return;

//         try {
//             setLoading(true);

//             // 1. ASK THE AI SERVER
//             const response = await fetch('http://127.0.0.1:5000/predict', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ amount: amount })
//             });

//             const aiData = await response.json();

//             // 2. CHECK AI DECISION
//             if (aiData.result === "FRAUD") {
//                 alert(`🚨 TRANSACTION BLOCKED BY AI!\nReason: ${aiData.message}`);
//                 setLoading(false);
//                 return; // STOP! Do not open MetaMask.
//             }

//             // 3. IF SAFE, PROCEED TO BLOCKCHAIN
//             // (Using deposit here as a demo action)
//             const tx = await contract.deposit({ value: ethers.parseEther(amount) });
//             await tx.wait();

//             alert("✅ Verified by AI & Transaction Successful!");
//             await updateBalance();

//         } catch (error) {
//             console.error(error);
//             alert("Transaction failed.");
//         } finally {
//             setLoading(false);
//         }
//     };


//     return (
//         <div style={styles.container}>
//             <div style={styles.header}>
//                 <span style={styles.badge}>✅ Identity Verified</span>
//                 <span style={{ color: "#888" }}>{account.slice(0, 6)}...{account.slice(-4)}</span>
//             </div>

//             <h1 style={{ fontSize: "40px", margin: "30px 0", color: "#2E7D32" }}>
//                 {balance} <span style={{ fontSize: "20px", color: "#666" }}>ETH</span>
//             </h1>

//             <div style={styles.actions}>
//                 <button onClick={depositMoney} disabled={loading} style={styles.button}>
//                     {loading ? "Processing..." : "Deposit 1 ETH"}
//                 </button>
//                 <button style={{ ...styles.button, backgroundColor: "#ddd", color: "#666", cursor: "not-allowed" }}>
//                     Withdraw
//                 </button>

//                 <button
//                     onClick={handleTransferWithAI}
//                     style={{ ...styles.button, backgroundColor: "#673AB7", marginLeft: "10px" }}
//                 >
//                     🤖 AI Secure Transfer
//                 </button>
//             </div>

//             {/* Placeholder for future Modules */}
//             <div style={{ marginTop: "30px", padding: "20px", border: "1px dashed #ccc", borderRadius: "10px" }}>
//                 {/* Loan Module */}
//                 <LoanSection contract={contract} account={account} />
//                 {/* <p style={{color: "#aaa"}}>Loan Module & AI Graphs coming here...</p> */}
//             </div>
//             {/* Previous Code... */}

//             <div style={{ marginTop: "30px" }}>
//                 {/* Loan Module */}
//                 <LoanSection contract={contract} account={account} />
//             </div>

//             {/* NEW: Transaction History */}
//             <TransactionHistory contract={contract} account={account} />
//         </div>
//     );
// };

// const styles = {
//     container: { textAlign: "center", padding: "40px", backgroundColor: "white", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", maxWidth: "600px", margin: "50px auto" },
//     header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
//     badge: { backgroundColor: "#e8f5e9", color: "green", padding: "5px 10px", borderRadius: "15px", fontSize: "12px" },
//     actions: { display: "flex", gap: "15px", justifyContent: "center" },
//     button: { padding: "12px 24px", fontSize: "16px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }
// };

// export default Dashboard;