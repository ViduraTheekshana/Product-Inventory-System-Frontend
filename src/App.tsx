import { Routes, Route } from "react-router-dom";
import { LoginPage } from "./modules/auth";
import { ProductListPage } from "./modules/product/pages/ProductListPage";
import { ProtectedRoute } from "./common/routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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