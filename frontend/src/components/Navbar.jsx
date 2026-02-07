import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IceCream, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { cartCount } = useCart();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-bg-inverse text-white shadow-lg sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 font-bold text-2xl tracking-tighter hover:opacity-90 transition">
                        <IceCream className="h-8 w-8" />
                        <span>Pura Vida</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-8">
                        <Link to="/" className="hover:text-gray-300 transition-colors font-medium">Inicio</Link>
                        <Link to="/catalogo" className="hover:text-gray-300 transition-colors font-medium">Sabores</Link>
                        <Link to="/pedido" className="hover:text-gray-300 transition-colors font-medium">Hacer Pedido</Link>
                    </div>

                    {/* Icons & Mobile Toggle */}
                    <div className="flex items-center space-x-4">
                        <Link to="/admin" className="p-2 hover:bg-white/10 rounded-full transition hidden sm:block">
                            <User className="h-6 w-6" />
                        </Link>

                        <Link to="/carrito" className="p-2 hover:bg-white/10 rounded-full transition relative">
                            <ShoppingCart className="h-6 w-6" />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 hover:bg-white/10 rounded-md focus:outline-none"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden bg-bg-inverse border-t border-white/10 pb-4 px-4 pt-2 shadow-inner transition-all duration-300 ease-in-out">
                    <div className="flex flex-col space-y-2">
                        <Link
                            to="/"
                            className="block px-3 py-2 rounded-md hover:bg-white/10 hover:text-white font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            Inicio
                        </Link>
                        <Link
                            to="/catalogo"
                            className="block px-3 py-2 rounded-md hover:bg-white/10 hover:text-white font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            Sabores
                        </Link>
                        <Link
                            to="/pedido"
                            className="block px-3 py-2 rounded-md hover:bg-white/10 hover:text-white font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            Hacer Pedido
                        </Link>
                        <Link
                            to="/admin"
                            className="block px-3 py-2 rounded-md hover:bg-white/10 hover:text-white flex items-center gap-2 font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            <User className="h-4 w-4" /> Admin
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
