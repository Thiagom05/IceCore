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
        const storedAuth = localStorage.getItem('icecore_auth');
        if (storedAuth) {
            const { username, password } = JSON.parse(storedAuth);
            // Configurar el header globalmente para axios
            api.defaults.headers.common['Authorization'] = 'Basic ' + btoa(username + ':' + password);
            setUser({ username });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            // Intentar hacer una petición autenticada para verificar credenciales
            const basicAuth = 'Basic ' + btoa(username + ':' + password);

            // Usamos una instancia temporal o configuramos el header para probar
            await api.get('/auth/check', {
                headers: { 'Authorization': basicAuth }
            });

            // Si es exitoso, guardamos
            localStorage.setItem('icecore_auth', JSON.stringify({ username, password }));
            api.defaults.headers.common['Authorization'] = basicAuth;
            setUser({ username });
            return { success: true };
        } catch (error) {
            console.error("Login fallido:", error);
            let msg = 'Credenciales incorrectas';
            if (error.response) {
                if (error.response.status === 404) msg = 'Error 404: El servicio de login no responde. (Reinicie Backend)';
                else if (error.response.status === 401) msg = 'Usuario o contraseña incorrectos';
                else msg = `Error ${error.response.status}: ${error.response.statusText}`;
            } else if (error.request) {
                msg = 'No hay respuesta del servidor. Verifique que el Backend esté corriendo.';
            }
            return { success: false, error: msg };
        }
    };

    const logout = () => {
        localStorage.removeItem('icecore_auth');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
