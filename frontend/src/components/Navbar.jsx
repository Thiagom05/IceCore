import React from 'react';
import { Link } from 'react-router-dom';
import { IceCream, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { cartCount } = useCart();

    return (
        <nav className="bg-primary-600 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/" className="flex items-center space-x-2 font-bold text-2xl">
                        <IceCream className="h-8 w-8" />
                        <span>Pura Vida</span>
                    </Link>

                    <div className="hidden md:flex space-x-8">
                        <Link to="/" className="hover:text-primary-200 transition">Inicio</Link>
                        <Link to="/catalogo" className="hover:text-primary-200 transition">Sabores</Link>
                        <Link to="/pedido" className="hover:text-primary-200 transition">Hacer Pedido</Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link to="/admin" className="p-2 hover:bg-primary-700 rounded-full transition">
                            <User className="h-6 w-6" />
                        </Link>
                        <Link to="/carrito" className="p-2 hover:bg-primary-700 rounded-full transition relative">
                            <ShoppingCart className="h-6 w-6" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-secondary-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
