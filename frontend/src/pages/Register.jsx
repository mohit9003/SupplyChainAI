import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ANALYST",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/register", formData);

      setSuccess("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (err) {
      console.error("REGISTER ERROR:", err);

      setError(
        err.response?.data?.message ||
        "Unable to create account"
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

      <div className="auth-card register-card">

        <div className="auth-brand">
          <div className="auth-logo">S</div>

          <div>
            <h1>SupplyChainAI</h1>
            <span>Operations Platform</span>
          </div>
        </div>

        <div className="auth-heading">
          <h2>Create your account</h2>

          <p>
            Start managing your supply chain smarter.
          </p>
        </div>

        <form onSubmit={handleRegister}>

          <div className="input-group">
            <label>Full name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Email address</label>

            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <div className="input-group">
            <label>Role</label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="ANALYST">Analyst</option>
              <option value="WAREHOUSE_MANAGER">
                Warehouse Manager
              </option>
              <option value="PROCUREMENT_MANAGER">
                Procurement Manager
              </option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success">
              {success}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </form>

        <div className="auth-divider">
          <span>Already have an account?</span>
        </div>

        <Link
          to="/login"
          className="register-link"
        >
          Back to Sign In
        </Link>

        <p className="auth-footer">
          © 2026 SupplyChainAI. Intelligent supply chain management.
        </p>

      </div>

    </div>
  );
}

export default Register;