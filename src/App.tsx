import { Routes, Route } from "react-router-dom";
import type { ReactNode } from "react";
import { LoginPage } from "./modules/auth";
import { ProductListPage } from "./modules/product/pages/ProductListPage";
import { UserManagementPage } from "./modules/user/pages/UserManagementPage";
import { ProtectedRoute } from "./common/routes/ProtectedRoute";
import { Layout } from "./common/components/Layout";

// Combines two separate concerns without changing either one's own file:
// ProtectedRoute decides WHETHER you're allowed to see the page at all;
// Layout decides WHAT visual chrome (header/footer) wraps it once you are.
function ProtectedPage({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/products"
        element={
          <ProtectedPage>
            <ProductListPage />
          </ProtectedPage>
        }
      />
      <Route
        path="/user-management"
        element={
          <ProtectedPage>
            <UserManagementPage />
          </ProtectedPage>
        }
      />
    </Routes>
  );
}

export default App;