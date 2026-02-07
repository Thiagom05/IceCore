import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

export default function CartPage() {
    const { cart, removeFromCart, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Tu carrito está vacío</h2>
                <p className="text-gray-600 mb-8">¡Corre a elegir tus sabores favoritos!</p>
                <Link to="/pedido" className="bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition">
                    Ver Menú
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
                Tu Carrito
            </h2>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 space-y-6">
                    {cart.map((item) => (
                        <div key={item.cartId} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex-grow">
                                <h3 className="text-xl font-bold text-gray-900">{item.product.nombre}</h3>
                                {(item.gustos && item.gustos.length > 0) ? (
                                    <p className="text-gray-600 text-sm mt-1">
                                        {item.gustos.map(g => g.nombre).join(', ')}
                                    </p>
                                ) : (
                                    <p className="text-gray-400 text-xs italic mt-1">Sin selección de gustos (Individual)</p>
                                )}
                            </div>

                            <div className="flex items-center mt-4 sm:mt-0 gap-4">
                                <span className="text-lg font-bold text-primary-600">
                                    ${item.price.toLocaleString('es-AR')}
                                </span>
                                <button
                                    onClick={() => removeFromCart(item.cartId)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition"
                                    title="Eliminar"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                        onClick={clearCart}
                        className="text-gray-500 hover:text-red-600 text-sm font-semibold underline"
                    >
                        Vaciar Carrito
                    </button>

                    <div className="flex flex-col items-end">
                        <span className="text-gray-600">Total a Pagar</span>
                        <span className="text-3xl font-bold text-gray-900">${cartTotal.toLocaleString('es-AR')}</span>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={() => navigate('/checkout')}
                    className="bg-primary-600 text-white text-xl font-bold px-8 py-4 rounded-xl hover:bg-primary-700 hover:scale-101 transition flex items-center gap-2"
                >
                    Finalizar Compra
                </button>
            </div>
        </div>
    );
}
