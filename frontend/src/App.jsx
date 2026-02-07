import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';

// Placeholder para otras páginas
const NotFound = () => <div className="text-center p-10 text-2xl text-gray-500">Página no encontrada 🍦</div>;

function App() {
  return (
    <AuthProvider>
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
                <footer className="bg-primary-600 text-white p-4 text-center">
                  &copy; {new Date().getFullYear()} IceCore - Sistema de Gestión de Heladerías
                  <br />
                  <a href="https://wa.me/5492262485095" className="text-sm hover:text-primary-200 transition hover:scale-101">Developed by Thiago Masson</a>
                </footer>
              </div>
            } />

            {/* Rutas Admin (Sin Navbar pública) */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              {/* Redirección por defecto admin */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
