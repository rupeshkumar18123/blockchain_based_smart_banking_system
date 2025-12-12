import React, { useState } from 'react';
import { ethers } from 'ethers';

const BiometricAuth = ({ account, contract, isRegistered, onAuthenticated }) => {
  const [loading, setLoading] = useState(false);

  // Function to Register Identity on Blockchain
  const register = async () => {
    if (!contract) return;
    try {
      setLoading(true);
      // Simulate Fingerprint Hash
      const mockFingerprintData = "user_fingerprint_" + account; 
      const biometricsHash = ethers.id(mockFingerprintData);

      const tx = await contract.registerIdentity(biometricsHash);
      await tx.wait();

      alert("✅ Identity Registered!");
      // Automatically log them in after registration
      onAuthenticated(); 
    } catch (error) {
      console.error(error);
      alert("Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  // Function to Simulate Scanning
  const scanFingerprint = () => {
    setLoading(true);
    setTimeout(() => {
        onAuthenticated(); // Unlock the App
        setLoading(false);
    }, 1500);
  };

  return (
    <div style={styles.container}>
      <p style={{color: "#666"}}>Wallet: {account.slice(0,6)}...{account.slice(-4)}</p>
      <hr style={{margin: "20px 0"}}/>
      
      {!isRegistered ? (
        <div>
          <h3 style={{color: "orange"}}>⚠️ Account Not Verified</h3>
          <p>Please register your Biometric Identity to continue.</p>
          <button onClick={register} disabled={loading} style={{...styles.button, backgroundColor: "#ff9800"}}>
            {loading ? "Registering on Chain..." : "👆 Register Fingerprint"}
          </button>
        </div>
      ) : (
        <div>
          <h3 style={{color: "#2196F3"}}>🔒 Biometric Lock</h3>
          <p>Identity found. Scan to access funds.</p>
          <button onClick={scanFingerprint} disabled={loading} style={styles.button}>
            {loading ? "Verifying..." : "👆 Scan Fingerprint"}
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { textAlign: "center", padding: "40px", backgroundColor: "white", borderRadius: "15px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", maxWidth: "400px", margin: "50px auto" },
  button: { padding: "12px 24px", fontSize: "16px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }
};

export default BiometricAuth;