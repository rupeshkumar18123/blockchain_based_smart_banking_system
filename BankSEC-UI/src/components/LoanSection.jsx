import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const LoanSection = ({ contract, account }) => {
  const [loanAmount, setLoanAmount] = useState("0");
  const [hasLoan, setHasLoan] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user already has a loan when component loads
  useEffect(() => {
    if (contract && account) checkLoanStatus();
  }, [contract, account]);

  const checkLoanStatus = async () => {
    try {
      // Call the helper function we made in Solidity
      const status = await contract.getLoanStatus(account);
      // status[0] is amount, status[1] is isActive (boolean)
      setLoanAmount(ethers.formatEther(status[0]));
      setHasLoan(status[1]);
    } catch (error) {
      console.error("Error fetching loan:", error);
    }
  };

  const takeLoan = async () => {
    if (!contract) return;
    const amountToBorrow = prompt("How much ETH do you want to borrow? (Max 5)");
    if (!amountToBorrow) return;

    try {
      setLoading(true);
      const tx = await contract.requestLoan(ethers.parseEther(amountToBorrow));
      await tx.wait();
      alert("💰 Loan Approved! Money sent to your wallet.");
      await checkLoanStatus();
    } catch (error) {
      console.error(error);
      alert("Loan Failed: " + (error.reason || "Check console"));
    } finally {
      setLoading(false);
    }
  };

  const repayLoan = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      // We must send the EXACT amount of ETH back
      const amountWei = ethers.parseEther(loanAmount);
      
      const tx = await contract.repayLoan({ value: amountWei });
      await tx.wait();
      
      alert("✅ Loan Repaid! You are debt-free.");
      await checkLoanStatus();
    } catch (error) {
      console.error(error);
      alert("Repayment Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3>🏦 Loan Department</h3>
      
      {!hasLoan ? (
        <div>
          <p>You are eligible for an instant loan.</p>
          <button onClick={takeLoan} disabled={loading} style={styles.borrowBtn}>
            {loading ? "Processing..." : "💸 Request Instant Loan"}
          </button>
        </div>
      ) : (
        <div style={styles.activeLoan}>
          <p style={{color: "red", fontWeight: "bold"}}>⚠️ Active Debt: {loanAmount} ETH</p>
          <button onClick={repayLoan} disabled={loading} style={styles.repayBtn}>
            {loading ? "Processing..." : "🔄 Repay Loan Now"}
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { marginTop: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "10px", backgroundColor: "#fff" },
  borrowBtn: { padding: "10px 20px", backgroundColor: "#673AB7", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
  repayBtn:  { padding: "10px 20px", backgroundColor: "#E91E63", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" },
  activeLoan: { backgroundColor: "#ffebee", padding: "15px", borderRadius: "5px" }
};

export default LoanSection;