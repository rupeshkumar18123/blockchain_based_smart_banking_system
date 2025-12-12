import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminStats = ({ contract }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalLoans: 0,
    activeLoanCount: 0
  });

  useEffect(() => {
    if (contract) fetchAllUserData();
  }, [contract]);

  const fetchAllUserData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch User List from MongoDB
      const response = await fetch('http://localhost:4000/api/users');
      const dbUsers = await response.json();
      
      const fullData = [];
      let totalDep = 0;
      let totalL = 0;
      let loanCount = 0;

      // 2. Loop through each user and check Blockchain Data
      for (let user of dbUsers) {
        if(user.role === 'admin') continue; // Skip admin

        // Get Balance
        const rawBal = await contract.balances(user.address);
        const bal = parseFloat(ethers.formatEther(rawBal));

        // Get Loan
        const loanData = await contract.getLoanStatus(user.address);
        const loanAmt = parseFloat(ethers.formatEther(loanData[0]));
        const hasLoan = loanData[1];

        // Stats Calc
        totalDep += bal;
        if (hasLoan) {
            totalL += loanAmt;
            loanCount++;
        }

        fullData.push({
            name: user.name,
            address: user.address,
            balance: bal,
            loan: loanAmt,
            hasLoan: hasLoan
        });
      }

      setUsers(fullData);
      setStats({
        totalUsers: dbUsers.length - 1, // Exclude admin
        totalDeposits: totalDep,
        totalLoans: totalL,
        activeLoanCount: loanCount
      });

    } catch (error) {
      console.error("Stats Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) return <p>🔄 Analyzing Blockchain Data...</p>;

  return (
    <div style={{marginTop: "20px"}}>
      
      {/* 1. KEY STATS CARDS */}
      <div style={styles.cardGrid}>
        <div style={styles.card}>
            <h4>👥 Total Users</h4>
            <h1>{stats.totalUsers}</h1>
        </div>
        <div style={styles.card}>
            <h4>💰 Total Liquidity</h4>
            <h1 style={{color: "#4CAF50"}}>{stats.totalDeposits.toFixed(2)} ETH</h1>
        </div>
        <div style={styles.card}>
            <h4>💸 Active Loans</h4>
            <h1 style={{color: "#F44336"}}>{stats.totalLoans} ETH</h1>
            <small>Taken by {stats.activeLoanCount} users</small>
        </div>
      </div>

      {/* 2. GRAPHS SECTION */}
      <div style={styles.graphGrid}>
        
        {/* Graph A: User Balances */}
        <div style={styles.graphBox}>
            <h4>User Wallet Overview</h4>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={users}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="balance" fill="#2196F3" name="Balance (ETH)" />
                    <Bar dataKey="loan" fill="#F44336" name="Loan (ETH)" />
                </BarChart>
            </ResponsiveContainer>
        </div>

        {/* Graph B: Loan Distribution */}
        <div style={styles.graphBox}>
            <h4>Funds Distribution</h4>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={[
                            { name: 'Available Liquidity', value: stats.totalDeposits },
                            { name: 'Given as Loans', value: stats.totalLoans }
                        ]}
                        cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label
                    >
                        <Cell key="cell-0" fill="#00C49F" />
                        <Cell key="cell-1" fill="#FF8042" />
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* 3. DETAILED USER TABLE */}
      <div style={styles.tableBox}>
        <h3>📋 Customer Database & Loan Status</h3>
        <table style={styles.table}>
            <thead>
                <tr style={{background: "#f5f5f5"}}>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Wallet Address</th>
                    <th style={styles.th}>Balance</th>
                    <th style={styles.th}>Loan Status</th>
                    <th style={styles.th}>Loan Amount</th>
                </tr>
            </thead>
            <tbody>
                {users.map((u, i) => (
                    <tr key={i} style={{borderBottom: "1px solid #eee"}}>
                        <td style={styles.td}>{u.name}</td>
                        <td style={{...styles.td, fontSize: "12px", color: "#666"}}>{u.address}</td>
                        <td style={{...styles.td, color: "green", fontWeight: "bold"}}>{u.balance} ETH</td>
                        <td style={styles.td}>
                            {u.hasLoan ? 
                                <span style={styles.badgeRed}>Active Debt</span> : 
                                <span style={styles.badgeGreen}>Debt Free</span>
                            }
                        </td>
                        <td style={{...styles.td, color: "red"}}>{u.hasLoan ? u.loan + " ETH" : "-"}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

    </div>
  );
};

const styles = {
  cardGrid: { display: "flex", gap: "20px", marginBottom: "30px" },
  card: { flex: 1, padding: "20px", background: "white", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", textAlign: "center" },
  graphGrid: { display: "flex", gap: "20px", marginBottom: "30px" },
  graphBox: { flex: 1, padding: "20px", background: "white", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  tableBox: { padding: "20px", background: "white", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px", textAlign: "left", color: "#555" },
  td: { padding: "12px" },
  badgeRed: { background: "#ffebee", color: "red", padding: "5px 10px", borderRadius: "15px", fontSize: "12px" },
  badgeGreen: { background: "#e8f5e9", color: "green", padding: "5px 10px", borderRadius: "15px", fontSize: "12px" }
};

export default AdminStats;