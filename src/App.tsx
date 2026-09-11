import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./modules/auth";
import { ProtectedRoute } from "./common/routes/ProtectedRoute";
import { ProductListPage } from "./modules/product/pages/ProductListPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <div className="p-8 text-slate-100">Product page placeholder</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <ProductListPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;