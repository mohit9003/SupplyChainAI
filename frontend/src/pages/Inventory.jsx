import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/inventory");
      setInventory(response.data);
    } catch (err) {
      console.error("Inventory error:", err);
      setError("Unable to load inventory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return inventory;
    }

    return inventory.filter((item) =>
      [
        item.product?.name,
        item.product?.sku,
        item.warehouse?.name,
        item.warehouse?.code,
      ]
        .filter(Boolean)
        .some((value) =>
          value.toString().toLowerCase().includes(query)
        )
    );
  }, [inventory, search]);

  const totalUnits = inventory.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  const lowStockCount = inventory.filter(
    (item) => item.quantity <= item.reorderLevel
  ).length;

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">

        <header className="page-header">
          <div>
            <p className="eyebrow">INVENTORY MANAGEMENT</p>

            <h1>Inventory</h1>

            <p className="welcome-text">
              Monitor stock levels across your warehouse network.
            </p>
          </div>

          <button
            className="primary-button refresh-button"
            onClick={fetchInventory}
          >
            ↻ Refresh
          </button>
        </header>

        <section className="inventory-stats">

          <div className="mini-stat">
            <span>Total Records</span>
            <strong>{inventory.length}</strong>
          </div>

          <div className="mini-stat">
            <span>Total Units</span>
            <strong>{totalUnits.toLocaleString()}</strong>
          </div>

          <div className="mini-stat warning-stat">
            <span>Low Stock</span>
            <strong>{lowStockCount}</strong>
          </div>

        </section>

        <section className="inventory-panel">

          <div className="inventory-toolbar">

            <div>
              <h2>Stock Inventory</h2>
              <p>
                {filteredInventory.length} inventory records
              </p>
            </div>

            <div className="search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search product, SKU or warehouse..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

          </div>

          {loading ? (
            <div className="table-state">
              Loading inventory...
            </div>
          ) : error ? (
            <div className="table-state error-state">
              {error}
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="table-state">
              No inventory records found.
            </div>
          ) : (
            <div className="table-wrapper">

              <table className="inventory-table">

                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>SKU</th>
                    <th>WAREHOUSE</th>
                    <th>QUANTITY</th>
                    <th>REORDER LEVEL</th>
                    <th>STATUS</th>
                    <th>UPDATED</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredInventory.map((item) => {

                    const isLowStock =
                      item.quantity <= item.reorderLevel;

                    return (
                      <tr key={item.id}>

                        <td>
                          <div className="product-cell">
                            <div className="product-avatar">
                              {item.product?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "P"}
                            </div>

                            <div>
                              <strong>
                                {item.product?.name || "Unknown Product"}
                              </strong>

                              <span>
                                Product #{item.product?.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="sku">
                            {item.product?.sku || "-"}
                          </span>
                        </td>

                        <td>
                          <div className="warehouse-cell">
                            <strong>
                              {item.warehouse?.name || "-"}
                            </strong>

                            <span>
                              {item.warehouse?.code || ""}
                            </span>
                          </div>
                        </td>

                        <td>
                          <strong className="quantity">
                            {item.quantity}
                          </strong>
                        </td>

                        <td>
                          {item.reorderLevel}
                        </td>

                        <td>
                          <span
                            className={
                              isLowStock
                                ? "status-badge low"
                                : "status-badge healthy"
                            }
                          >
                            {isLowStock
                              ? "Low Stock"
                              : "Healthy"}
                          </span>
                        </td>

                        <td>
                          <span className="updated-date">
                            {item.updatedAt
                              ? new Date(
                                  item.updatedAt
                                ).toLocaleDateString()
                              : "-"}
                          </span>
                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default Inventory;