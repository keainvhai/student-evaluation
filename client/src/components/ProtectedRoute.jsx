// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";

export default function ProtectedRoute({ children, role }) {
  const { token, user } = useAuthStore();

  // 没登录 → 跳转登录页
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 如果要求角色（比如 instructor / student），检查是否匹配
  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  // 否则渲染子组件
  return children;
}
