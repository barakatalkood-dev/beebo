import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // أثناء تحميل بيانات المستخدم
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        Loading...
      </div>
    );
  }

  // إذا لم يكن المستخدم مسجل دخول
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // إذا كان مسجل دخول
  return children;
}

export default ProtectedRoute;