import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ROUTE_ROLES = {
    "/teachers": ["admin"],
    "/classes": ["admin"],
    "/students": ["admin", "teacher"],
    "/subjects": ["admin", "teacher"],
    "/analytics": ["admin", "teacher"],
    "/reports": ["admin", "teacher"],
    "/parents": ["admin"]
};

function ProtectedRoute({ children }) {

    const { token, user } = useContext(AuthContext);
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const allowedRoles = ROUTE_ROLES[location.pathname];

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    return children;

}

export default ProtectedRoute;