import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../auth.css";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_URL}/api/auth/signup`, { username, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="apple-card auth-card">
        <div className="auth-header">
          <div className="auth-logo">TM</div>
          <h1 className="auth-title">Join TaskMaster</h1>
          <p className="auth-subtitle">Create an account to start managing tasks</p>
        </div>

        <form className="auth-form" onSubmit={handleSignup}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="auth-input-group">
            <label className="auth-label">Full Name</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              className="auth-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;