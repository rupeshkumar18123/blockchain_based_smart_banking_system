import React, { useState } from 'react';

const Signup = ({ account, onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' // Default to User
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send data to your Node.js Backend
      const response = await fetch('http://localhost:4000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: account,
          name: formData.name,
          email: formData.email,
          role: formData.role
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert("✅ Account Created Successfully!");
        onSignupSuccess(data.user); // Tell App.jsx we are done
      } else {
        alert("Signup Failed: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Server Error. Is your Node backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{color: "#333"}}>📝 Create Account</h2>
      <p style={{fontSize: "12px", color: "#666"}}>Wallet: {account}</p>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <input 
          placeholder="Full Name" 
          required 
          style={styles.input}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        <input 
          placeholder="Email Address" 
          type="email" 
          required 
          style={styles.input}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        
        <div style={{textAlign: "left", marginBottom: "15px"}}>
          <label style={{fontWeight: "bold", marginRight: "10px"}}>Select Role:</label>
          <select 
            style={styles.select}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
          >
            <option value="user">Customer</option>
            <option value="admin">Bank Administrator</option>
          </select>
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Creating Profile..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { maxWidth: "400px", margin: "50px auto", padding: "30px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" },
  input: { padding: "12px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" },
  select: { padding: "10px", borderRadius: "5px", border: "1px solid #ccc" },
  button: { padding: "12px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "5px", fontSize: "16px", cursor: "pointer" }
};

export default Signup;