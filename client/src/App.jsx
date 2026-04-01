import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Layout from "./components/Layout";
import Login       from "./pages/Login";
import Dashboard   from "./pages/Dashboard";
import POS         from "./pages/POS";
import Orders      from "./pages/Orders";
import Inventory   from "./pages/Inventory";
import Schedule    from "./pages/Schedule";
import Employees   from "./pages/Employees";

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh" }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<PrivateRoute roles={["admin","manager"]}><Dashboard /></PrivateRoute>} />
              <Route path="pos"       element={<POS />} />
              <Route path="orders"    element={<PrivateRoute roles={["admin","manager"]}><Orders /></PrivateRoute>} />
              <Route path="inventory" element={<PrivateRoute roles={["admin","manager"]}><Inventory /></PrivateRoute>} />
              <Route path="schedule"  element={<Schedule />} />
              <Route path="employees" element={<PrivateRoute roles={["admin"]}><Employees /></PrivateRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
