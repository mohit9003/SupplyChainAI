import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "▦" },
    { name: "Inventory", path: "/inventory", icon: "📦" },
    { name: "Products", path: "/products", icon: "🏷" },
    { name: "Warehouses", path: "/warehouses", icon: "🏢" },
    { name: "Suppliers", path: "/suppliers", icon: "🤝" },
    { name: "Purchase Orders", path: "/purchase-orders", icon: "📋" },
    { name: "Stock Movements", path: "/movements", icon: "↕" },
    { name: "Analytics", path: "/analytics", icon: "◔" },
    { name: "AI Assistant", path: "/ai-assistant", icon: "✦" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand">
        <div className="brand-logo">S</div>

        <div>
          <h2>SupplyChainAI</h2>
          <span>Operations Platform</span>
        </div>
      </div>

      {/* Menu Label */}
      <div className="menu-label">MAIN MENU</div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <button className="settings-button">
          <span>⚙</span>
          Settings
        </button>

        <button className="logout-button" onClick={handleLogout}>
          <span>↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;