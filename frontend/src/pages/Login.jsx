import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));

      navigate("/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        err.response?.data?.message ||
        "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-background">
        <div className="glow glow-one"></div>
        <div className="glow glow-two"></div>
      </div>

      <div className="auth-card">

        <div className="auth-brand">
          <div className="auth-logo">S</div>

          <div>
            <h1>SupplyChainAI</h1>
            <span>Operations Platform</span>
          </div>
        </div>

        <div className="auth-heading">
          <h2>Welcome back</h2>

          <p>
            Sign in to manage your supply chain operations.
          </p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="input-group">
            <label>Email address</label>

            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <div className="password-label">
              <label>Password</label>
              <span>Forgot password?</span>
            </div>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <div className="auth-divider">
          <span>New to SupplyChainAI?</span>
        </div>

        <Link
          to="/register"
          className="register-link"
        >
          Create an account
        </Link>

        <p className="auth-footer">
          © 2026 SupplyChainAI. Intelligent supply chain management.
        </p>

      </div>

    </div>
  );
}

export default Login;