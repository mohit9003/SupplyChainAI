import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    poNumber: "",
    supplierId: "",
    warehouseId: "",
  });

  const [items, setItems] = useState([]);

  const [itemForm, setItemForm] = useState({
    productId: "",
    quantity: 1,
    unitPrice: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ordersRes, suppliersRes, warehousesRes, productsRes] =
        await Promise.all([
          api.get("/purchase-orders"),
          api.get("/suppliers"),
          api.get("/warehouses"),
          api.get("/products"),
        ]);

      setOrders(ordersRes.data);
      setSuppliers(suppliersRes.data);
      setWarehouses(warehousesRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load purchase order data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (e) => {
    setItemForm({
      ...itemForm,
      [e.target.name]: e.target.value,
    });
  };

  const addItem = () => {
    if (
      !itemForm.productId ||
      !itemForm.quantity ||
      !itemForm.unitPrice
    ) {
      setError("Please fill product, quantity and unit price.");
      return;
    }

    const product = products.find(
      (p) => p.id === Number(itemForm.productId)
    );

    if (!product) return;

    const quantity = Number(itemForm.quantity);
    const unitPrice = Number(itemForm.unitPrice);

    const newItem = {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
    };

    setItems([...items, newItem]);

    setItemForm({
      productId: "",
      quantity: 1,
      unitPrice: "",
    });

    setError("");
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const grandTotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
  }, [items]);

  const createPurchaseOrder = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      setError("Add at least one product to the purchase order.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const orderResponse = await api.post("/purchase-orders", {
        poNumber: form.poNumber,
        supplierId: Number(form.supplierId),
        warehouseId: Number(form.warehouseId),
      });

      const orderId = orderResponse.data.id;

      for (const item of items) {
        await api.post(
          `/purchase-orders/${orderId}/items`,
          {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }
        );
      }

      setForm({
        poNumber: "",
        supplierId: "",
        warehouseId: "",
      });

      setItems([]);
      setShowForm(false);

      await fetchData();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Unable to create purchase order."
      );
    } finally {
      setSaving(false);
    }
  };

  const approveOrder = async (id) => {
    try {
      await api.put(`/purchase-orders/${id}/approve`);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Unable to approve purchase order."
      );
    }
  };

  const receiveOrder = async (id) => {
    try {
      await api.put(`/purchase-orders/${id}/receive`);
      await fetchData();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Unable to receive purchase order."
      );
    }
  };

  const getStatusClass = (status) => {
    if (status === "RECEIVED") return "healthy";
    if (status === "APPROVED") return "warning";
    if (status === "CANCELLED") return "low";
    return "neutral";
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">

        <header className="page-header">
          <div>
            <p className="eyebrow">PROCUREMENT</p>

            <h1>Purchase Orders</h1>

            <p className="welcome-text">
              Create, approve and receive supplier purchase orders.
            </p>
          </div>

          <button
            className="primary-button refresh-button"
            onClick={() => {
              setError("");
              setShowForm(true);
            }}
          >
            + Create Purchase Order
          </button>
        </header>

        {error && (
          <div className="product-error">
            {error}
          </div>
        )}

        <section className="inventory-stats">

          <div className="mini-stat">
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
          </div>

          <div className="mini-stat">
            <span>Draft Orders</span>
            <strong>
              {
                orders.filter(
                  (order) => order.status === "DRAFT"
                ).length
              }
            </strong>
          </div>

          <div className="mini-stat">
            <span>Approved</span>
            <strong>
              {
                orders.filter(
                  (order) => order.status === "APPROVED"
                ).length
              }
            </strong>
          </div>

          <div className="mini-stat">
            <span>Received</span>
            <strong>
              {
                orders.filter(
                  (order) => order.status === "RECEIVED"
                ).length
              }
            </strong>
          </div>

        </section>

        <section className="inventory-panel">

          <div className="inventory-toolbar">

            <div>
              <h2>Purchase Order Management</h2>
              <p>
                {orders.length} purchase orders
              </p>
            </div>

            <button
              className="secondary-button"
              onClick={fetchData}
            >
              ↻ Refresh
            </button>

          </div>

          {loading ? (
            <div className="table-state">
              Loading purchase orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="table-state">
              No purchase orders found.
            </div>
          ) : (
            <div className="table-wrapper">

              <table className="inventory-table">

                <thead>
                  <tr>
                    <th>PO NUMBER</th>
                    <th>SUPPLIER</th>
                    <th>WAREHOUSE</th>
                    <th>DATE</th>
                    <th>TOTAL</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>

                <tbody>

                  {orders.map((order) => (

                    <tr key={order.id}>

                      <td>
                        <div className="product-cell">

                          <div className="product-avatar">
                            PO
                          </div>

                          <div>
                            <strong>
                              {order.poNumber}
                            </strong>

                            <span>
                              Order #{order.id}
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        {order.supplier?.name || "-"}
                      </td>

                      <td>
                        {order.warehouse?.name || "-"}
                      </td>

                      <td>
                        {order.orderDate
                          ? new Date(
                              order.orderDate
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        ₹
                        {Number(
                          order.totalAmount || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td>

                        <div className="po-actions">

                          {order.status === "DRAFT" && (
                            <button
                              className="table-action-button"
                              onClick={() =>
                                approveOrder(order.id)
                              }
                            >
                              Approve
                            </button>
                          )}

                          {order.status === "APPROVED" && (
                            <button
                              className="table-action-button receive"
                              onClick={() =>
                                receiveOrder(order.id)
                              }
                            >
                              Receive
                            </button>
                          )}

                          {order.status === "RECEIVED" && (
                            <span className="completed-text">
                              Completed
                            </span>
                          )}

                        </div>

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

          <div className="product-modal po-modal">

            <div className="modal-header">

              <div>
                <p className="panel-label">
                  PROCUREMENT
                </p>

                <h2>Create Purchase Order</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>

            </div>

            <form onSubmit={createPurchaseOrder}>

              <div className="form-grid">

                <div className="input-group">
                  <label>PO Number</label>

                  <input
                    type="text"
                    name="poNumber"
                    placeholder="PO-2026-001"
                    value={form.poNumber}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Supplier</label>

                  <select
                    name="supplierId"
                    value={form.supplierId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">
                      Select supplier
                    </option>

                    {suppliers.map((supplier) => (
                      <option
                        key={supplier.id}
                        value={supplier.id}
                      >
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Warehouse</label>

                  <select
                    name="warehouseId"
                    value={form.warehouseId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">
                      Select warehouse
                    </option>

                    {warehouses.map((warehouse) => (
                      <option
                        key={warehouse.id}
                        value={warehouse.id}
                      >
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="po-item-section">

                <div className="po-section-header">

                  <div>
                    <p className="panel-label">
                      ORDER ITEMS
                    </p>

                    <h3>Add Products</h3>
                  </div>

                </div>

                <div className="po-item-form">

                  <select
                    name="productId"
                    value={itemForm.productId}
                    onChange={handleItemChange}
                  >
                    <option value="">
                      Select product
                    </option>

                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    placeholder="Quantity"
                    value={itemForm.quantity}
                    onChange={handleItemChange}
                  />

                  <input
                    type="number"
                    name="unitPrice"
                    min="0.01"
                    step="0.01"
                    placeholder="Unit price"
                    value={itemForm.unitPrice}
                    onChange={handleItemChange}
                  />

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={addItem}
                  >
                    + Add
                  </button>

                </div>

                {items.length > 0 && (

                  <div className="po-items-list">

                    {items.map((item, index) => (

                      <div
                        className="po-item-row"
                        key={`${item.productId}-${index}`}
                      >

                        <div>
                          <strong>
                            {item.productName}
                          </strong>

                          <span>
                            {item.sku}
                          </span>
                        </div>

                        <span>
                          × {item.quantity}
                        </span>

                        <span>
                          ₹
                          {item.unitPrice.toLocaleString(
                            "en-IN"
                          )}
                        </span>

                        <strong>
                          ₹
                          {item.totalPrice.toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <button
                          type="button"
                          className="remove-item"
                          onClick={() =>
                            removeItem(index)
                          }
                        >
                          ×
                        </button>

                      </div>

                    ))}

                  </div>

                )}

                <div className="po-total">

                  <span>Purchase Order Total</span>

                  <strong>
                    ₹
                    {grandTotal.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

              </div>

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
                    : "Create Purchase Order"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default PurchaseOrders;