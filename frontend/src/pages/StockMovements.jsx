import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filter, setFilter] = useState("ALL");

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [inventoryRes, analyticsRes] = await Promise.all([
        api.get("/inventory"),
        api.get("/inventory-movements/analytics"),
      ]);

      setInventory(inventoryRes.data);
      setAnalytics(analyticsRes.data);

      // Fetch movements for every inventory record
      const movementRequests = inventoryRes.data.map((item) =>
        api.get(`/inventory-movements/inventory/${item.id}`)
      );

      const movementResponses =
        await Promise.all(movementRequests);

      const allMovements = [];

      movementResponses.forEach((response, index) => {
        const inventoryItem = inventoryRes.data[index];

        response.data.forEach((movement) => {
          allMovements.push({
            ...movement,
            inventory: inventoryItem,
          });
        });
      });

      allMovements.sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );

      setMovements(allMovements);
    } catch (err) {
      console.error(err);
      setError("Unable to load stock movements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMovements = useMemo(() => {
    if (filter === "ALL") {
      return movements;
    }

    return movements.filter(
      (movement) => movement.type === filter
    );
  }, [movements, filter]);

  const getMovementClass = (type) => {
    switch (type) {
      case "PURCHASE":
        return "healthy";

      case "SALE":
        return "low";

      case "RETURN":
        return "warning";

      default:
        return "neutral";
    }
  };

  const getMovementSymbol = (type) => {
    switch (type) {
      case "PURCHASE":
        return "+";

      case "SALE":
        return "-";

      case "RETURN":
        return "↩";

      default:
        return "±";
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">

        <header className="page-header">

          <div>
            <p className="eyebrow">
              INVENTORY OPERATIONS
            </p>

            <h1>Stock Movements</h1>

            <p className="welcome-text">
              Track inventory purchases, sales, returns and adjustments.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={fetchData}
          >
            ↻ Refresh
          </button>

        </header>

        {error && (
          <div className="product-error">
            {error}
          </div>
        )}

        {/* Analytics */}

        <section className="inventory-stats">

          <div className="mini-stat">
            <span>Purchased Units</span>

            <strong>
              {analytics?.totalPurchaseQuantity ?? 0}
            </strong>
          </div>

          <div className="mini-stat">
            <span>Sold Units</span>

            <strong>
              {analytics?.totalSaleQuantity ?? 0}
            </strong>
          </div>

          <div className="mini-stat">
            <span>Returned Units</span>

            <strong>
              {analytics?.totalReturnQuantity ?? 0}
            </strong>
          </div>

          <div className="mini-stat">
            <span>Adjustments</span>

            <strong>
              {analytics?.totalAdjustmentQuantity ?? 0}
            </strong>
          </div>

        </section>

        <section className="inventory-panel">

          <div className="inventory-toolbar">

            <div>
              <h2>Movement History</h2>

              <p>
                {filteredMovements.length} transactions
              </p>
            </div>

            <div className="movement-filters">

              {[
                "ALL",
                "PURCHASE",
                "SALE",
                "RETURN",
                "ADJUSTMENT",
              ].map((type) => (

                <button
                  key={type}
                  className={
                    filter === type
                      ? "movement-filter active"
                      : "movement-filter"
                  }
                  onClick={() => setFilter(type)}
                >
                  {type}
                </button>

              ))}

            </div>

          </div>

          {loading ? (
            <div className="table-state">
              Loading stock movements...
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="table-state">
              No stock movements found.
            </div>
          ) : (
            <div className="table-wrapper">

              <table className="inventory-table">

                <thead>
                  <tr>
                    <th>TYPE</th>
                    <th>PRODUCT</th>
                    <th>WAREHOUSE</th>
                    <th>QUANTITY</th>
                    <th>REFERENCE</th>
                    <th>DATE</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredMovements.map(
                    (movement) => (

                      <tr key={movement.id}>

                        <td>

                          <span
                            className={`movement-type ${getMovementClass(
                              movement.type
                            )}`}
                          >
                            <span className="movement-icon">
                              {getMovementSymbol(
                                movement.type
                              )}
                            </span>

                            {movement.type}
                          </span>

                        </td>

                        <td>

                          <div className="product-cell">

                            <div className="product-avatar">
                              {movement.inventory?.product?.name
                                ?.charAt(0)
                                ?.toUpperCase() || "P"}
                            </div>

                            <div>

                              <strong>
                                {
                                  movement.inventory
                                    ?.product
                                    ?.name
                                }
                              </strong>

                              <span>
                                {
                                  movement.inventory
                                    ?.product
                                    ?.sku
                                }
                              </span>

                            </div>

                          </div>

                        </td>

                        <td>
                          {
                            movement.inventory
                              ?.warehouse
                              ?.name
                          }
                        </td>

                        <td>

                          <strong
                            className={
                              movement.type === "SALE"
                                ? "quantity-negative"
                                : "quantity-positive"
                            }
                          >
                            {movement.type === "SALE"
                              ? "-"
                              : "+"}
                            {movement.quantity}
                          </strong>

                        </td>

                        <td>
                          {movement.reference || "-"}
                        </td>

                        <td>
                          {movement.createdAt
                            ? new Date(
                                movement.createdAt
                              ).toLocaleString()
                            : "-"}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default StockMovements;