import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");

  // 1. If no token, kick out
  if (!token || token === "undefined" || token === "null") {
    toast.error("Please login to access this page!");
    return <Navigate to="/" replace />;
  }

  try {
    // 2. Check token format
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        throw new Error("Invalid token format");
    }

    // 3. FIX: Safely decode the token (Handles special characters properly!)
    const base64Url = tokenParts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );

    const payload = JSON.parse(jsonPayload);
    const userRole = payload.role;

    // 4. Check permissions
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      toast.error("Access Denied: You don't have permission for this page.");
      if (userRole === "admin") return <Navigate to="/admin" replace />;
      if (userRole === "madam") return <Navigate to="/madam" replace />;
      return <Navigate to="/home" replace />;
    }

    // 5. Success! Let them in.
    return children;

  } catch (error) {
    console.error("Token Error:", error);
    localStorage.removeItem("token");
    toast.error("Session invalid. Please login again.");
    return <Navigate to="/" replace />;
  }
}