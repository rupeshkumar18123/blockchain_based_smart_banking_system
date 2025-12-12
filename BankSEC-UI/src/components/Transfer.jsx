import React, { useState } from 'react';
import { ethers } from 'ethers';

const Transfer = ({ contract, account, updateBalance }) => {
  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!contract) return;
    if (!ethers.isAddress(receiver)) {
      alert("❌ Invalid Ethereum Address");
      return;
    }

    try {
      setLoading(true);

      // --- STEP 1: AI FRAUD CHECK ---
      console.log("🤖 Asking AI for permission...");
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount })
      });
      
      const aiData = await response.json();

      if (aiData.result === "FRAUD") {
        alert(`🚨 BLOCKED BY AI!\nReason: ${aiData.message}`);
        setLoading(false);
        return; // STOP TRANSACTION
      }

      // --- STEP 2: BLOCKCHAIN EXECUTION ---
      console.log("✅ AI Approved. Sending to Blockchain...");
      
      // Convert Amount to Wei (1 ETH = 10^18 Wei)
      const value = ethers.parseEther(amount);
      
      // Call the "transfer" function in Smart Contract
      const tx = await contract.transfer(receiver, value);
      
      console.log("Tx Hash:", tx.hash);
      await tx.wait(); // Wait for confirmation

      alert(`💸 Successfully sent ${amount} ETH to ${receiver.slice(0,6)}...`);
      setReceiver("");
      setAmount("");
      
      // Refresh Balance
      await updateBalance();

    } catch (error) {
      console.error(error);
      // Nice error handling
      if (error.reason) alert("Transfer Failed: " + error.reason);
      else alert("Transaction Failed. Check Console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={{borderBottom: "1px solid #eee", paddingBottom: "10px"}}>💸 Send Money (P2P)</h3>
      
      <form onSubmit={handleTransfer} style={styles.form}>
        <div style={styles.inputGroup}>
            <label style={styles.label}>Receiver Address (0x...)</label>
            <input 
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder="0x123..."
              required
              style={styles.input}
            />
        </div>

        <div style={styles.inputGroup}>
            <label style={styles.label}>Amount (ETH)</label>
            <input 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              type="number"
              step="0.01"
              required
              style={styles.input}
            />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "🤖 AI Analyzing..." : "Send Securely"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { marginTop: "20px", padding: "20px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
  form: { display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" },
  inputGroup: { textAlign: "left" },
  label: { fontSize: "12px", color: "#666", fontWeight: "bold", marginBottom: "5px", display: "block" },
  input: { width: "95%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "14px" },
  button: { padding: "12px", backgroundColor: "#673AB7", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", transition: "0.3s" }
};

export default Transfer;