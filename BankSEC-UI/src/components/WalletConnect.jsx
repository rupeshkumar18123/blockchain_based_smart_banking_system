import React from 'react';

const WalletConnect = ({ onConnect }) => {
  return (
    <div style={styles.container}>
      <h1 style={{color: "#333"}}>Welcome to BankSEC</h1>
      <p style={{color: "#666", marginBottom: "30px"}}>Secure Decentralized Banking System</p>
      
      <button onClick={onConnect} style={styles.button}>
        🦊 Connect MetaMask Wallet
      </button>
    </div>
  );
};

const styles = {
  container: { textAlign: "center", padding: "50px", backgroundColor: "white", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", maxWidth: "500px", margin: "50px auto" },
  button: { padding: "15px 30px", fontSize: "18px", backgroundColor: "#f6851b", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }
};

export default WalletConnect;