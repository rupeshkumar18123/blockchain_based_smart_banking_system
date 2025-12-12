import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const TransactionHistory = ({ contract, account }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contract && account) {
      fetchHistory();
    }
  }, [contract, account]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      
      // 1. Define the filters (What logs are we looking for?)
      // We want logs where "user" or "from" matches OUR account
      const filterDeposit = contract.filters.Deposit(account);
      const filterLoan = contract.filters.LoanTaken(account);
      
      // 2. Query the Blockchain (Get all past logs)
      const depositLogs = await contract.queryFilter(filterDeposit);
      const loanLogs = await contract.queryFilter(filterLoan);

      // 3. Format the data to look nice
      const formattedDeposits = depositLogs.map(log => ({
        type: "Deposit 💰",
        amount: ethers.formatEther(log.args[1]), // Amount is the 2nd argument
        hash: log.transactionHash,
        block: log.blockNumber
      }));

      const formattedLoans = loanLogs.map(log => ({
        type: "Loan Taken 💸",
        amount: ethers.formatEther(log.args[1]),
        hash: log.transactionHash,
        block: log.blockNumber
      }));

      // 4. Merge and Sort (Newest first)
      const allHistory = [...formattedDeposits, ...formattedLoans];
      allHistory.sort((a, b) => b.block - a.block);

      setHistory(allHistory);

    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3>📜 Transaction Statement</h3>
      {loading ? (
        <p>Loading Blockchain Data...</p>
      ) : (
        <div style={styles.list}>
          {history.length === 0 ? (
            <p style={{color: "#888"}}>No transactions found.</p>
          ) : (
            <table style={{width: "100%", textAlign: "left", borderCollapse: "collapse"}}>
              <thead>
                <tr style={{borderBottom: "1px solid #ddd"}}>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx, index) => (
                  <tr key={index} style={{borderBottom: "1px solid #eee"}}>
                    <td style={{padding: "10px"}}>{tx.type}</td>
                    <td style={{fontWeight: "bold", color: "#2E7D32"}}>{tx.amount} ETH</td>
                    <td style={{fontSize: "12px", color: "#666"}}>
                      {tx.hash.slice(0, 10)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { marginTop: "20px", padding: "20px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" },
  list: { maxHeight: "200px", overflowY: "auto" }
};

export default TransactionHistory;