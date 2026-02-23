import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SmoothScroll from './components/SmoothScroll';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Order from './pages/Order';
import Catalog from './pages/Catalog';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/admin/LoginPage';
import Dashboard from './pages/admin/Dashboard';
import BillingConfig from './pages/admin/BillingConfig';
import ProtectedRoute from './components/ProtectedRoute';

import { Instagram, MapPin } from 'lucide-react';

import { UIProvider } from './context/UIContext';

// Placeholder para otras páginas
const NotFound = () => <div className="text-center p-10 text-2xl text-gray-500">Página no encontrada 🍦</div>;

function App() {
  return (
    <SmoothScroll>
      <AuthProvider>
        <UIProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Rutas Públicas con Navbar */}
                <Route path="/*" element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/catalogo" element={<Catalog />} />
                        <Route path="/pedido" element={<Order />} />
                        <Route path="/carrito" element={<CartPage />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>

                    {/* Footer Minimalista Rediseñado */}
                    <footer className="bg-bg-inverse text-white pt-16 pb-8 border-t border-white/10">
                      <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                          {/* Marca */}
                          <div className="space-y-2">
                            <h2 className="text-4xl font-black tracking-tighter">ICE CORE</h2>
                            <p className="text-gray-400 text-sm max-w-xs">
                              Cremas heladas de autor. <br /> Elaboración diaria sin conservantes.
                            </p>
                          </div>

                          {/* Redes / Iconos */}
                          <div className="flex gap-4">
                            <a href="#" className="p-3 rounded-full bg-white/5 hover:bg-white hover:text-[#2C1B18] transition-all group">
                              <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-3 rounded-full bg-white/5 hover:bg-white hover:text-[#2C1B18] transition-all group">
                              <MapPin className="w-5 h-5" />
                            </a>
                          </div>
                        </div>

                        {/* Línea divisora sutil */}
                        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                          <p>&copy; {new Date().getFullYear()} Pura Vida IceCore. Todos los derechos reservados.</p>
                          <a href="https://wa.me/5492262485095" className="hover:text-white transition-colors">
                            Developed by Thiago Masson
                          </a>
                        </div>
                      </div>
                    </footer>
                  </div>
                } />

                {/* Rutas Admin (Sin Navbar pública) */}
                <Route path="/admin/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route path="/admin/facturacion" element={<BillingConfig />} />
                  {/* Redirección por defecto admin */}
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                </Route>
              </Routes>
            </Router>
          </CartProvider>
        </UIProvider>
      </AuthProvider>
    </SmoothScroll>
  );
}

export default App;
