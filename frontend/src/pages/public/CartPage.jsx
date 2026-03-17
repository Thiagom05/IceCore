import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function CartPage() {
    const { cart, removeFromCart, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-bg-primary flex flex-col justify-center items-center text-center px-6">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-3xl font-black text-[#2C1B18] mb-4 tracking-tight">TU CARRITO ESTÁ VACÍO</h2>
                <p className="text-text-secondary mb-8 max-w-sm">Parece que todavía no has elegido tus sabores favoritos.</p>
                <Link to="/pedido" className="bg-[#2C1B18] text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-xl shadow-[#2C1B18]/10">
                    Ir al Menú
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary pt-24 pb-16 px-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-12">
                    <Link to="/pedido" className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition text-text-secondary hover:text-[#2C1B18]">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black text-[#2C1B18] tracking-tighter">TU COMPRA</h1>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-2xl shadow-[#2C1B18]/5">
                    {/* Lista de Items estilo Ticket */}
                    <div className="space-y-8">
                        {cart.map((item) => (
                            <div key={item.cartId} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 border-dashed pb-8 last:border-0 last:pb-0 group">
                                <div className="flex-grow space-y-2">
                                    <div className="flex items-baseline gap-3">
                                        <h3 className="text-xl font-bold text-[#2C1B18]">
                                            {(item.quantity > 1 ? `${item.quantity}x ` : '') + item.product.nombre}
                                        </h3>
                                    </div>
                                    {(item.gustos && item.gustos.length > 0) ? (
                                        <p className="text-text-secondary text-sm leading-relaxed max-w-lg">
                                            {item.gustos.map(g => g.nombre).join(', ')}
                                        </p>
                                    ) : (
                                        <p className="text-gray-300 text-xs uppercase tracking-wider">Sin sabores seleccionados</p>
                                    )}
                                </div>

                                <div className="flex items-center mt-4 sm:mt-0 gap-6">
                                    <span className="text-lg font-bold text-[#2C1B18]">
                                        ${(item.price * (item.quantity || 1)).toLocaleString('es-AR')}
                                    </span>
                                    <button
                                        onClick={() => removeFromCart(item.cartId)}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-2 cursor-pointer"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Resumen Final */}
                    <div className="mt-12 pt-8 border-t-2 border-[#2C1B18]">
                        <div className="flex justify-between items-baseline mb-8">
                            <span className="text-sm font-bold uppercase tracking-widest text-text-secondary">Total Estimado</span>
                            <span className="text-4xl font-black text-[#2C1B18]">${cartTotal.toLocaleString('es-AR')}</span>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-[#2C1B18] text-white text-lg font-bold py-5 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 cursor-pointer"
                            >
                                Proceder al Pago
                            </button>
                            <button
                                onClick={clearCart}
                                className="w-full text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors py-2 cursor-pointer"
                            >
                                Vaciar Carrito
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
