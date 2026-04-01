import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="apple-card auth-card">
        <div className="auth-header">
          <div className="auth-logo">TM</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue to TaskMaster</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          {error && <div className="error-message">{error}</div>}
          
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;