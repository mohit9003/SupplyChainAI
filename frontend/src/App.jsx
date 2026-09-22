import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Inventory from "./pages/Inventory";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import PurchaseOrders from "./pages/PurchaseOrders";
import Warehouses from "./pages/Warehouses";
import StockMovements from "./pages/StockMovements";
import Analytics from "./pages/Analytics";
import AIAssistantPage from "./pages/AIAssistantPage";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />
        <Route
        path="/register"
        element={<Register />}
          />
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
        path="/inventory"
        element={<Inventory />}
        />
      <Route
      path="/products"
      element={<Products />}
      />
      <Route
        path="/suppliers"
       element={<Suppliers />}
      />
      <Route
       path="/purchase-orders"
      element={<PurchaseOrders />}
      />
      <Route
        path="/warehouses"
        element={<Warehouses />}
      />
      <Route
        path="/movements"
        element={<StockMovements />}
        />
      <Route
        path="/analytics"
        element={<Analytics />}
        />
      <Route
      path="/ai-assistant"
      element={<AIAssistantPage />}
      />

      
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;