import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) return <div className="p-10 text-center">Cargando...</div>;

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
}
