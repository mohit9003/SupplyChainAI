import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    active: true,
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/suppliers");
      setSuppliers(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return suppliers;

    return suppliers.filter((supplier) =>
      [
        supplier.name,
        supplier.email,
        supplier.phone,
        supplier.address,
      ]
        .filter(Boolean)
        .some((value) =>
          value.toLowerCase().includes(query)
        )
    );
  }, [suppliers, search]);

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

      await api.post("/suppliers", form);

      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        active: true,
      });

      setShowForm(false);
      await fetchSuppliers();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Unable to create supplier."
      );
    } finally {
      setSaving(false);
    }
  };

  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.active
  ).length;

  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <header className="page-header">

          <div>
            <p className="eyebrow">PROCUREMENT</p>

            <h1>Suppliers</h1>

            <p className="welcome-text">
              Manage your supplier network and procurement partners.
            </p>
          </div>

          <button
            className="primary-button refresh-button"
            onClick={() => setShowForm(true)}
          >
            + Add Supplier
          </button>

        </header>

        {error && (
          <div className="product-error">
            {error}
          </div>
        )}

        <section className="inventory-stats">

          <div className="mini-stat">
            <span>Total Suppliers</span>
            <strong>{suppliers.length}</strong>
          </div>

          <div className="mini-stat">
            <span>Active Suppliers</span>
            <strong>{activeSuppliers}</strong>
          </div>

          <div className="mini-stat">
            <span>Supplier Records</span>
            <strong>{filteredSuppliers.length}</strong>
          </div>

        </section>

        <section className="inventory-panel">

          <div className="inventory-toolbar">

            <div>
              <h2>Supplier Network</h2>

              <p>
                {filteredSuppliers.length} suppliers
              </p>
            </div>

            <div className="search-box">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>

          </div>

          {loading ? (
            <div className="table-state">
              Loading suppliers...
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="table-state">
              No suppliers found.
            </div>
          ) : (

            <div className="table-wrapper">

              <table className="inventory-table">

                <thead>
                  <tr>
                    <th>SUPPLIER</th>
                    <th>EMAIL</th>
                    <th>PHONE</th>
                    <th>ADDRESS</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredSuppliers.map((supplier) => (

                    <tr key={supplier.id}>

                      <td>
                        <div className="product-cell">

                          <div className="product-avatar">
                            {supplier.name
                              ?.charAt(0)
                              ?.toUpperCase() || "S"}
                          </div>

                          <div>
                            <strong>
                              {supplier.name}
                            </strong>

                            <span>
                              Supplier #{supplier.id}
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>{supplier.email}</td>

                      <td>{supplier.phone}</td>

                      <td>{supplier.address || "-"}</td>

                      <td>
                        <span
                          className={
                            supplier.active
                              ? "status-badge healthy"
                              : "status-badge low"
                          }
                        >
                          {supplier.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                    </tr>

                  ))}

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
                  PROCUREMENT
                </p>

                <h2>Add Supplier</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="input-group">
                  <label>Supplier Name</label>

                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. TechSource Electronics"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Email</label>

                  <input
                    type="email"
                    name="email"
                    placeholder="supplier@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Phone</label>

                  <input
                    type="tel"
                    name="phone"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Address</label>

                  <input
                    type="text"
                    name="address"
                    placeholder="Lucknow, Uttar Pradesh"
                    value={form.address}
                    onChange={handleChange}
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

                <span>Supplier is active</span>

              </label>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
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
                    : "Create Supplier"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Suppliers;