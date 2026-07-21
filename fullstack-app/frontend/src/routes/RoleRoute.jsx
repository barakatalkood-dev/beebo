import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <h2>Loading...</h2>;
  }

  // إذا لم يوجد مستخدم
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // إذا لم يكن الدور ضمن الأدوار المسموحة
  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default RoleRoute;