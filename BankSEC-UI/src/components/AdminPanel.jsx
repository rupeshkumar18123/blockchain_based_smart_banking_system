import React, { useState } from 'react';
import { ethers } from 'ethers';
import AdminStats from './AdminStats';

const AdminPanel = ({ contract, account }) => {
  const [targetUser, setTargetUser] = useState("");
  const [creditAmount, setCreditAmount] = useState(""); // For depositing money

  // NEW: Admin Deposits money to User
  const handleCredit = async () => {
    if(!targetUser || !creditAmount) return;
    try {
        // Admin sends ETH along with the transaction to fund the system
        const value = ethers.parseEther(creditAmount);
        const tx = await contract.creditUser(targetUser, value, { value: value });
        await tx.wait();
        alert(`✅ Successfully Credited ${creditAmount} ETH to ${targetUser}`);
    } catch (err) { alert("Error: " + (err.reason || err.message)); }
  }

  const freezeUser = async () => {
    try {
        const tx = await contract.freezeAccount(targetUser);
        await tx.wait();
        alert(`❄️ Account Frozen!`);
    } catch (err) { alert("Error: " + (err.reason || err.message)); }
  }

  const unfreezeUser = async () => {
    try {
        const tx = await contract.unfreezeAccount(targetUser);
        await tx.wait();
        alert(`☀️ Account Unfrozen!`);
    } catch (err) { alert("Error: " + (err.reason || err.message)); }
  }

  return (
    <div style={styles.container}>
      <h2 style={{color: "#D32F2F", borderBottom: "2px solid red", paddingBottom: "10px"}}>👮‍♂️ Admin Bank Teller</h2>
      <p style={{fontSize: "12px", color: "#555"}}>Logged in as: {account}</p>
      
      <div style={styles.grid}>
          {/* BOX 1: CASH DEPOSIT (The New Feature) */}
          <div style={styles.box}>
            <h3>💰 Deposit Cash (Credit User)</h3>
            <input 
                placeholder="User Address (0x...)" 
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                style={styles.input}
            />
            <input 
                placeholder="Amount (ETH)" 
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                style={styles.input}
            />
            <button onClick={handleCredit} style={{...styles.btn, backgroundColor: "#2E7D32"}}>
                Confirm Deposit
            </button>
          </div>

          {/* BOX 2: SECURITY CONTROL */}
          <div style={styles.box}>
            <h3>🛡️ Security Control</h3>
            <input 
                placeholder="Suspect Address (0x...)" 
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                style={styles.input}
            />
            <div style={{display: "flex", gap: "10px", marginTop: "10px"}}>
                <button onClick={freezeUser} style={{...styles.btn, backgroundColor: "red", flex: 1}}>
                    ❄️ Freeze
                </button>
                <button onClick={unfreezeUser} style={{...styles.btn, backgroundColor: "#FF9800", flex: 1}}>
                    ☀️ Unfreeze
                </button>
            </div>
          </div>
      </div>
      <AdminStats contract={contract} />
    </div>
  );
};

const styles = {
  container: { padding: "20px", backgroundColor: "#ffebee", maxWidth: "900px", margin: "30px auto", borderRadius: "10px", border: "1px solid red" },
  grid: { display: "flex", gap: "20px", marginTop: "20px" },
  box: { flex: 1, backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" },
  input: { padding: "10px", width: "90%", border: "1px solid #ccc", borderRadius: "5px", marginBottom: "10px", display: "block" },
  btn: { padding: "10px 20px", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", width: "100%", fontWeight: "bold" }
};

export default AdminPanel;