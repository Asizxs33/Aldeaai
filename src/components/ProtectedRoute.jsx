import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login page but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role check
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = (user.role || user.subscription_plan || 'free').toLowerCase();
        if (!allowedRoles.includes(userRole)) {
            // If user is logged in but doesn't have the right role, redirect to subscription
            return <Navigate to="/subscription" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
