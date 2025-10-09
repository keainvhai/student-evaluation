// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // ✅ 支持多个角色
  if (Array.isArray(role) && !role.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  // ✅ 兼容旧逻辑（单字符串）
  if (typeof role === "string" && user.role !== role) {
    return <Navigate to="/login" />;
  }

  return children;
}
