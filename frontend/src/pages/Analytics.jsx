import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function Analytics() {
  const [inventory, setInventory] = useState([]);
  const [movementAnalytics, setMovementAnalytics] = useState(null);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryRes,
        inventoryRes,
        movementRes,
      ] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/inventory"),
        api.get("/inventory-movements/analytics"),
      ]);

      setSummary(summaryRes.data);
      setInventory(inventoryRes.data);
      setMovementAnalytics(movementRes.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  /* ---------------- LOW STOCK ---------------- */

  const lowStockItems = useMemo(() => {
    return inventory.filter(
      (item) =>
        Number(item.quantity || 0) <=
        Number(item.reorderLevel || 0)
    );
  }, [inventory]);

  /* ---------------- INVENTORY VALUE ---------------- */

  const totalInventoryValue = useMemo(() => {
    return inventory.reduce((total, item) => {
      const price = Number(
        item.product?.price || 0
      );

      const quantity = Number(
        item.quantity || 0
      );

      return total + price * quantity;
    }, 0);
  }, [inventory]);

  /* ---------------- STOCK HEALTH ---------------- */

  const healthyStockCount = useMemo(() => {
    return inventory.filter(
      (item) =>
        Number(item.quantity || 0) >
        Number(item.reorderLevel || 0)
    ).length;
  }, [inventory]);

  const stockHealth = useMemo(() => {
    if (!inventory.length) return 0;

    return Math.round(
      (healthyStockCount / inventory.length) * 100
    );
  }, [inventory, healthyStockCount]);

  /* ---------------- NET MOVEMENT ---------------- */

  const netMovement = useMemo(() => {
    if (!movementAnalytics) return 0;

    return (
      Number(
        movementAnalytics.totalPurchaseQuantity || 0
      ) -
      Number(
        movementAnalytics.totalSaleQuantity || 0
      ) +
      Number(
        movementAnalytics.totalReturnQuantity || 0
      ) +
      Number(
        movementAnalytics.totalAdjustmentQuantity || 0
      )
    );
  }, [movementAnalytics]);

  /* ---------------- MOVEMENT CHART ---------------- */

  const movementChartData = useMemo(() => {
    return [
      {
        name: "Purchases",
        quantity:
          Number(
            movementAnalytics?.totalPurchaseQuantity
          ) || 0,
      },
      {
        name: "Sales",
        quantity:
          Number(
            movementAnalytics?.totalSaleQuantity
          ) || 0,
      },
      {
        name: "Returns",
        quantity:
          Number(
            movementAnalytics?.totalReturnQuantity
          ) || 0,
      },
      {
        name: "Adjustments",
        quantity:
          Number(
            movementAnalytics?.totalAdjustmentQuantity
          ) || 0,
      },
    ];
  }, [movementAnalytics]);

  /* ---------------- PIE CHART ---------------- */

  const stockHealthData = useMemo(() => {
    return [
      {
        name: "Healthy",
        value: healthyStockCount,
      },
      {
        name: "Low Stock",
        value: lowStockItems.length,
      },
    ];
  }, [healthyStockCount, lowStockItems]);

  const PIE_COLORS = [
    "#4ade80",
    "#f87171",
  ];

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <div className="table-state">
            Loading analytics...
          </div>
        </main>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">

        {/* HEADER */}

        <header className="page-header">

          <div>
            <p className="eyebrow">
              BUSINESS INTELLIGENCE
            </p>

            <h1>Analytics</h1>

            <p className="welcome-text">
              Monitor inventory health, movement activity
              and operational performance.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={fetchAnalytics}
          >
            ↻ Refresh
          </button>

        </header>

        {/* ERROR */}

        {error && (
          <div className="product-error">
            {error}
          </div>
        )}

        {/* ================= KPI CARDS ================= */}

        <section className="analytics-kpis">

          <div className="analytics-card">

            <div className="analytics-card-top">
              <span>Total Products</span>

              <div className="analytics-icon">
                P
              </div>
            </div>

            <strong>
              {summary?.totalProducts ?? 0}
            </strong>

            <p>
              Active products in catalog
            </p>

          </div>

          <div className="analytics-card">

            <div className="analytics-card-top">
              <span>Inventory Units</span>

              <div className="analytics-icon">
                I
              </div>
            </div>

            <strong>
              {summary?.totalInventoryUnits ?? 0}
            </strong>

            <p>
              Units currently in stock
            </p>

          </div>

          <div className="analytics-card">

            <div className="analytics-card-top">
              <span>Inventory Value</span>

              <div className="analytics-icon">
                ₹
              </div>
            </div>

            <strong>
              ₹
              {totalInventoryValue.toLocaleString(
                "en-IN"
              )}
            </strong>

            <p>
              Estimated current stock value
            </p>

          </div>

          <div className="analytics-card">

            <div className="analytics-card-top">
              <span>Stock Health</span>

              <div className="analytics-icon">
                %
              </div>
            </div>

            <strong>
              {stockHealth}%
            </strong>

            <p>
              {lowStockItems.length} items need attention
            </p>

          </div>

        </section>

        {/* ================= CHART GRID ================= */}

        <section className="analytics-grid">

          {/* STOCK HEALTH */}

          <div className="analytics-panel">

            <div className="analytics-panel-header">

              <div>
                <p className="panel-label">
                  INVENTORY
                </p>

                <h2>
                  Inventory Health
                </h2>
              </div>

              <span className="analytics-percent">
                {stockHealth}%
              </span>

            </div>

            <div className="health-chart">

              <ResponsiveContainer
                width="100%"
                height={240}
              >

                <PieChart>

                  <Pie
                    data={stockHealthData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={92}
                    paddingAngle={5}
                    stroke="none"
                  >

                    {stockHealthData.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            PIE_COLORS[index]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background:
                        "#111827",
                      border:
                        "1px solid rgba(255,255,255,0.1)",
                      borderRadius:
                        "10px",
                      color: "#ffffff",
                    }}
                  />

                </PieChart>

              </ResponsiveContainer>

              <div className="health-chart-center">

                <strong>
                  {stockHealth}%
                </strong>

                <span>
                  Healthy
                </span>

              </div>

            </div>

            <div className="health-stats">

              <div>
                <span>
                  Healthy Stock
                </span>

                <strong>
                  {healthyStockCount}
                </strong>
              </div>

              <div>
                <span>
                  Low Stock
                </span>

                <strong>
                  {lowStockItems.length}
                </strong>
              </div>

              <div>
                <span>
                  Total Records
                </span>

                <strong>
                  {inventory.length}
                </strong>
              </div>

            </div>

          </div>

          {/* MOVEMENT CHART */}

          <div className="analytics-panel">

            <div className="analytics-panel-header">

              <div>
                <p className="panel-label">
                  STOCK FLOW
                </p>

                <h2>
                  Movement Overview
                </h2>
              </div>

              <span className="net-movement">
                Net {netMovement}
              </span>

            </div>

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={280}
              >

                <BarChart
                  data={movementChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -15,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />

                  <Tooltip
                    cursor={{
                      fill:
                        "rgba(255,255,255,0.03)",
                    }}
                    contentStyle={{
                      background:
                        "#111827",
                      border:
                        "1px solid rgba(255,255,255,0.1)",
                      borderRadius:
                        "10px",
                      color: "#ffffff",
                    }}
                    formatter={(value) => [
                      value,
                      "Units",
                    ]}
                  />

                  <Bar
                    dataKey="quantity"
                    fill="#818cf8"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                    barSize={42}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

        </section>

        {/* ================= LOW STOCK ================= */}

        <section className="analytics-panel low-stock-panel">

          <div className="analytics-panel-header">

            <div>
              <p className="panel-label">
                ATTENTION REQUIRED
              </p>

              <h2>
                Low Stock Items
              </h2>
            </div>

            <span className="low-stock-count">
              {lowStockItems.length} items
            </span>

          </div>

          {lowStockItems.length === 0 ? (

            <div className="analytics-empty">
              All inventory levels are healthy.
            </div>

          ) : (

            <div className="low-stock-list">

              {lowStockItems
                .slice(0, 8)
                .map((item) => (

                  <div
                    className="low-stock-row"
                    key={item.id}
                  >

                    <div className="product-cell">

                      <div className="product-avatar">
                        {item.product?.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "P"}
                      </div>

                      <div>

                        <strong>
                          {item.product?.name}
                        </strong>

                        <span>
                          {item.product?.sku}
                        </span>

                      </div>

                    </div>

                    <div className="low-stock-warehouse">

                      <span>
                        Warehouse
                      </span>

                      <strong>
                        {item.warehouse?.name}
                      </strong>

                    </div>

                    <div className="stock-level">

                      <span>
                        Current
                      </span>

                      <strong>
                        {item.quantity}
                      </strong>

                    </div>

                    <div className="stock-level">

                      <span>
                        Reorder At
                      </span>

                      <strong>
                        {item.reorderLevel}
                      </strong>

                    </div>

                    <span className="status-badge low">
                      Low Stock
                    </span>

                  </div>

                ))}

            </div>

          )}

        </section>

        {/* ================= OPERATIONAL SUMMARY ================= */}

        <section className="analytics-grid">

          {/* NETWORK */}

          <div className="analytics-panel">

            <p className="panel-label">
              PROCUREMENT
            </p>

            <h2>
              Supplier & Warehouse Network
            </h2>

            <div className="network-stats">

              <div>
                <span>
                  Suppliers
                </span>

                <strong>
                  {summary?.totalSuppliers ?? 0}
                </strong>
              </div>

              <div>
                <span>
                  Warehouses
                </span>

                <strong>
                  {summary?.totalWarehouses ?? 0}
                </strong>
              </div>

            </div>

          </div>

          {/* TRANSACTIONS */}

          <div className="analytics-panel">

            <p className="panel-label">
              TRANSACTIONS
            </p>

            <h2>
              Movement Transactions
            </h2>

            <div className="network-stats">

              <div>
                <span>
                  Purchases
                </span>

                <strong>
                  {
                    movementAnalytics?.purchaseTransactions ??
                    0
                  }
                </strong>
              </div>

              <div>
                <span>
                  Sales
                </span>

                <strong>
                  {
                    movementAnalytics?.saleTransactions ??
                    0
                  }
                </strong>
              </div>

              <div>
                <span>
                  Returns
                </span>

                <strong>
                  {
                    movementAnalytics?.returnTransactions ??
                    0
                  }
                </strong>
              </div>

              <div>
                <span>
                  Adjustments
                </span>

                <strong>
                  {
                    movementAnalytics?.adjustmentTransactions ??
                    0
                  }
                </strong>
              </div>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default Analytics;