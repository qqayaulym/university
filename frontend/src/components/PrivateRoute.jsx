import { Navigate } from "react-router-dom";
import { clearAuth, getCurrentUserFromToken, isTokenExpired } from "../utils/auth";

const PrivateRoute = ({ children, roles }) => {
  const token = localStorage.getItem("token");
  const user = getCurrentUserFromToken();

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (isTokenExpired()) {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    if (!user || !roles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute;