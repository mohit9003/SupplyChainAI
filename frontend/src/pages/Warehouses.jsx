import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    location: "",
    code: "",
    active: true,
  });

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/warehouses");
      setWarehouses(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load warehouses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const filteredWarehouses = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return warehouses;

    return warehouses.filter((warehouse) =>
      [
        warehouse.name,
        warehouse.location,
        warehouse.code,
      ]
        .filter(Boolean)
        .some((value) =>
          value.toLowerCase().includes(query)
        )
    );
  }, [warehouses, search]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await api.post("/warehouses", form);

      setForm({
        name: "",
        location: "",
        code: "",
        active: true,
      });

      setShowForm(false);

      await fetchWarehouses();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to create warehouse."
      );
    } finally {
      setSaving(false);
    }
  };

  const activeWarehouses = warehouses.filter(
    (warehouse) => warehouse.active
  ).length;

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">

        <header className="page-header">
          <div>
            <p className="eyebrow">OPERATIONS</p>

            <h1>Warehouses</h1>

            <p className="welcome-text">
              Manage storage locations and warehouse operations.
            </p>
          </div>

          <button
            className="primary-button refresh-button"
            onClick={() => {
              setError("");
              setShowForm(true);
            }}
          >
            + Add Warehouse
          </button>
        </header>

        {error && (
          <div className="product-error">
            {error}
          </div>
        )}

        <section className="inventory-stats">

          <div className="mini-stat">
            <span>Total Warehouses</span>
            <strong>{warehouses.length}</strong>
          </div>

          <div className="mini-stat">
            <span>Active Warehouses</span>
            <strong>{activeWarehouses}</strong>
          </div>

          <div className="mini-stat">
            <span>Locations</span>
            <strong>
              {
                new Set(
                  warehouses.map(
                    (warehouse) => warehouse.location
                  )
                ).size
              }
            </strong>
          </div>

        </section>

        <section className="inventory-panel">

          <div className="inventory-toolbar">

            <div>
              <h2>Warehouse Network</h2>

              <p>
                {filteredWarehouses.length} warehouses
              </p>
            </div>

            <div className="search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search warehouses..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

          </div>

          {loading ? (
            <div className="table-state">
              Loading warehouses...
            </div>
          ) : filteredWarehouses.length === 0 ? (
            <div className="table-state">
              No warehouses found.
            </div>
          ) : (
            <div className="table-wrapper">

              <table className="inventory-table">

                <thead>
                  <tr>
                    <th>WAREHOUSE</th>
                    <th>CODE</th>
                    <th>LOCATION</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredWarehouses.map(
                    (warehouse) => (

                      <tr key={warehouse.id}>

                        <td>
                          <div className="product-cell">

                            <div className="product-avatar">
                              {warehouse.name
                                ?.charAt(0)
                                ?.toUpperCase() || "W"}
                            </div>

                            <div>
                              <strong>
                                {warehouse.name}
                              </strong>

                              <span>
                                Warehouse #{warehouse.id}
                              </span>
                            </div>

                          </div>
                        </td>

                        <td>
                          <strong>
                            {warehouse.code}
                          </strong>
                        </td>

                        <td>
                          {warehouse.location}
                        </td>

                        <td>

                          <span
                            className={
                              warehouse.active
                                ? "status-badge healthy"
                                : "status-badge low"
                            }
                          >
                            {warehouse.active
                              ? "Active"
                              : "Inactive"}
                          </span>

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

      {showForm && (

        <div className="modal-overlay">

          <div className="product-modal">

            <div className="modal-header">

              <div>
                <p className="panel-label">
                  OPERATIONS
                </p>

                <h2>Add Warehouse</h2>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowForm(false)
                }
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="input-group">

                  <label>
                    Warehouse Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Central Distribution Center"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="input-group">

                  <label>
                    Warehouse Code
                  </label>

                  <input
                    type="text"
                    name="code"
                    placeholder="WH-LKO-01"
                    value={form.code}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="input-group">

                  <label>
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    placeholder="Lucknow, Uttar Pradesh"
                    value={form.location}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              <label className="checkbox-row">

                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                />

                <span>
                  Warehouse is active
                </span>

              </label>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="auth-submit modal-submit"
                  disabled={saving}
                >
                  {saving
                    ? "Creating..."
                    : "Create Warehouse"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Warehouses;