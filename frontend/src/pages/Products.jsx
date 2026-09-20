import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    price: "",
    categoryId: "",
    active: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);

      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err) {
      console.error("Products error:", err);
      setError("Unable to load product data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return products;
    }

    return products.filter((product) =>
      [
        product.name,
        product.sku,
        product.category?.name,
      ]
        .filter(Boolean)
        .some((value) =>
          value.toString().toLowerCase().includes(query)
        )
    );
  }, [products, search]);

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

      await api.post("/products", {
        name: form.name,
        sku: form.sku,
        description: form.description,
        price: Number(form.price),
        active: form.active,
        category: {
          id: Number(form.categoryId),
        },
      });

      setForm({
        name: "",
        sku: "",
        description: "",
        price: "",
        categoryId: "",
        active: true,
      });

      setShowForm(false);

      await fetchData();

    } catch (err) {
      console.error("Create product error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to create product."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-content">

        <header className="page-header">

          <div>
            <p className="eyebrow">CATALOG MANAGEMENT</p>

            <h1>Products</h1>

            <p className="welcome-text">
              Manage products, SKUs and product categories.
            </p>
          </div>

          <button
            className="primary-button refresh-button"
            onClick={() => setShowForm(true)}
          >
            + Add Product
          </button>

        </header>

        {error && (
          <div className="product-error">
            {error}
          </div>
        )}

        <section className="inventory-panel">

          <div className="inventory-toolbar">

            <div>
              <h2>Product Catalog</h2>

              <p>
                {filteredProducts.length} products
              </p>
            </div>

            <div className="search-box">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search product, SKU or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>

          </div>

          {loading ? (
            <div className="table-state">
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="table-state">
              No products found.
            </div>
          ) : (

            <div className="table-wrapper">

              <table className="inventory-table">

                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>SKU</th>
                    <th>CATEGORY</th>
                    <th>PRICE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredProducts.map((product) => (

                    <tr key={product.id}>

                      <td>
                        <div className="product-cell">

                          <div className="product-avatar">
                            {product.name
                              ?.charAt(0)
                              ?.toUpperCase() || "P"}
                          </div>

                          <div>
                            <strong>
                              {product.name}
                            </strong>

                            <span>
                              Product #{product.id}
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="sku">
                          {product.sku}
                        </span>
                      </td>

                      <td>
                        {product.category?.name || "-"}
                      </td>

                      <td>
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </td>

                      <td>
                        <span
                          className={
                            product.active
                              ? "status-badge healthy"
                              : "status-badge low"
                          }
                        >
                          {product.active
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
                  PRODUCT CATALOG
                </p>

                <h2>Add Product</h2>
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
                  <label>Product Name</label>

                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Wireless Mouse"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>SKU</label>

                  <input
                    type="text"
                    name="sku"
                    placeholder="e.g. WM-001"
                    value={form.sku}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Price</label>

                  <input
                    type="number"
                    name="price"
                    min="0.01"
                    step="0.01"
                    placeholder="499.00"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Category</label>

                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}

                  </select>

                </div>

              </div>

              <div className="input-group">

                <label>Description</label>

                <textarea
                  name="description"
                  placeholder="Describe the product..."
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                />

              </div>

              <label className="checkbox-row">

                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                />

                <span>Product is active</span>

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
                    : "Create Product"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Products;