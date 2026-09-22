import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import api from "../services/api";
import AIAssistant from "../components/AIAssistant";

function Dashboard() {
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalSuppliers: 0,
    totalWarehouses: 0,
    totalInventoryUnits: 0,
    lowStockItems: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard/summary");

        setSummary(response.data);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="app-layout">

      <Sidebar />
      <AIAssistant />

      <main className="main-content">

        <header className="topbar">
          <div>
            <p className="eyebrow">OVERVIEW</p>

            <h1>Dashboard</h1>

            <p className="welcome-text">
              Welcome back. Here's what's happening across your supply chain.
            </p>
          </div>

          <div className="user-profile">
            <div className="avatar">M</div>

            <div>
              <strong>Mohit</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <section className="stats-grid">

          <StatCard
            title="Total Products"
            value={
              loading ? "..." : summary.totalProducts
            }
            icon="📦"
            description="Products in catalog"
          />

          <StatCard
            title="Inventory Units"
            value={
              loading
                ? "..."
                : summary.totalInventoryUnits.toLocaleString()
            }
            icon="◈"
            description="Units currently in stock"
          />

          <StatCard
            title="Suppliers"
            value={
              loading ? "..." : summary.totalSuppliers
            }
            icon="🤝"
            description="Active suppliers"
          />

          <StatCard
            title="Low Stock"
            value={
              loading ? "..." : summary.lowStockItems
            }
            icon="⚠"
            description="Items requiring attention"
          />

        </section>

        <section className="dashboard-grid">

          <div className="dashboard-panel large-panel">

            <div className="panel-header">
              <div>
                <p className="panel-label">INVENTORY</p>
                <h2>Inventory Overview</h2>
              </div>

              <button className="view-button">
                View Details →
              </button>
            </div>

            <div className="chart-placeholder">
              <div className="chart-line">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <p>Inventory movement analytics</p>
              <small>
                Detailed charts will appear here.
              </small>
            </div>

          </div>

          <div className="dashboard-panel">

            <div className="panel-header">
              <div>
                <p className="panel-label">WAREHOUSES</p>
                <h2>Warehouse Network</h2>
              </div>
            </div>

            <div className="warehouse-number">
              {loading ? "..." : summary.totalWarehouses}
            </div>

            <p className="warehouse-text">
              Active warehouse locations
            </p>

            <button className="primary-button">
              Manage Warehouses
            </button>

          </div>

        </section>

        <section className="dashboard-panel low-stock-panel">

          <div className="panel-header">

            <div>
              <p className="panel-label">INVENTORY ALERTS</p>
              <h2>Low Stock Items</h2>
            </div>

            <button className="view-button">
              View All →
            </button>

          </div>

          {summary.lowStockItems === 0 ? (
            <div className="empty-state">
              <div className="success-icon">✓</div>

              <div>
                <strong>Inventory levels look good</strong>

                <p>
                  No products are currently below their reorder level.
                </p>
              </div>
            </div>
          ) : (
            <div className="alert-message">
              ⚠ {summary.lowStockItems} items require attention.
            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;