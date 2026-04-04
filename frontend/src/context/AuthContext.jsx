import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar si hay credenciales guardadas al cargar
        const token = localStorage.getItem('icecore_jwt');
        const userData = localStorage.getItem('icecore_user');
        if (token && userData) {
            const { username } = JSON.parse(userData);
            // Configurar el header globalmente para axios usando Bearer Token
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser({ username });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            // Intentar hacer una petición al nuevo backend JWT
            const response = await api.post('/auth/login', { username, password });
            const { token } = response.data;

            // Si es exitoso, guardamos el Token y NO la contraseña en texto plano
            localStorage.setItem('icecore_jwt', token);
            localStorage.setItem('icecore_user', JSON.stringify({ username }));
            
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser({ username });
            return { success: true };
        } catch (error) {
            console.error("Login fallido:", error);
            let msg = 'Credenciales incorrectas';
            if (error.response) {
                if (error.response.status === 404) msg = 'Error 404: El servicio de login no responde. (Reinicie Backend)';
                else if (error.response.status === 401 || error.response.status === 403) msg = 'Usuario o contraseña incorrectos';
                else msg = `Error ${error.response.status}: ${error.response.statusText}`;
            } else if (error.request) {
                msg = 'No hay respuesta del servidor. Verifique que el Backend esté corriendo.';
            }
            return { success: false, error: msg };
        }
    };

    const logout = () => {
        localStorage.removeItem('icecore_jwt');
        localStorage.removeItem('icecore_user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
