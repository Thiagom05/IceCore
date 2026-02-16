import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [showColdStartMessage, setShowColdStartMessage] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        setShowColdStartMessage(false);

        // Timer para mostrar mensaje de "Cold Start" si tarda más de 3 segundos
        const timer = setTimeout(() => {
            setShowColdStartMessage(true);
        }, 3000);

        try {
            const result = await login(username, password);
            clearTimeout(timer); // Cancelar timer si responde rápido

            if (result.success) {
                navigate('/admin/dashboard');
            } else {
                setError(result.error || 'Error desconocido');
            }
        } catch (err) {
            clearTimeout(timer);
            setError('Error de conexión');
        } finally {
            setIsLoading(false);
            setShowColdStartMessage(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col justify-center items-center px-4">
            <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl shadow-[#2C1B18]/10 border border-gray-100">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2C1B18] text-white mb-6 shadow-lg shadow-[#2C1B18]/20">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-[#2C1B18] tracking-tighter mb-2">
                        Pura Vida
                    </h2>
                    <p className="text-text-secondary text-sm font-medium tracking-wide uppercase">
                        Acceso Administrativo
                    </p>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div className="group">
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 group-focus-within:text-[#2C1B18] transition-colors">Usuario</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2C1B18] focus:bg-white transition-all rounded-t-lg"
                                placeholder="User"
                            />
                        </div>

                        <div className="group">
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 group-focus-within:text-[#2C1B18] transition-colors">Contraseña</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2C1B18] focus:bg-white transition-all rounded-t-lg"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-3 rounded-lg flex items-center justify-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white uppercase tracking-wider transition-all
                        ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2C1B18] hover:bg-black hover:scale-[1.02] shadow-[#2C1B18]/20'} 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C1B18] flex justify-center items-center gap-2 cursor-pointer`}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {showColdStartMessage ? 'Despertando servidor (puede demorar)...' : 'Verificando...'}
                            </>
                        ) : 'Ingresar al Panel'}
                    </button>

                    {showColdStartMessage && (
                        <p className="text-center text-xs text-amber-600 animate-pulse mt-2">
                            ⏳ El servidor gratuito entra en reposo por inactividad. <br />
                            Por favor espera unos segundos mientras se inicia.
                        </p>
                    )}
                </form>
            </div>

            <p className="mt-8 text-center text-xs text-gray-400">
                &copy; 2026 IceCore System
            </p>
        </div>
    );
}
