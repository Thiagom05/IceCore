import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Checkout() {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    // Formulario de Cliente
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        direccion: '',
        aclaraciones: ''
    });

    // Método de Pago seleccionado
    const [paymentMethod, setPaymentMethod] = useState(''); // 'mercadopago', 'transferencia', 'efectivo'
    const [loading, setLoading] = useState(false);

    if (cart.length === 0) {
        return <div className="p-10 text-center">No hay items en el carrito para pagar.</div>;
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMercadoPago = async () => {
        setLoading(true);
        // Aquí llamaremos al backend para crear la preferencia
        try {
            const res = await api.post('/payments/create_preference', cart);
            window.location.href = res.data.init_point;
        } catch (error) {
            console.error(error);
            alert("Error al iniciar pago con Mercado Pago");
        } finally {
            setLoading(false);
        }
    };

    const saveOrder = async (metodo) => {
        // Mapear carrito a DTO
        const itemsDTO = cart.map(item => ({
            tipoProductoId: item.product.id,
            gustoIds: item.gustos ? item.gustos.map(g => g.id) : [],
            cantidad: 1 // Asumimos 1 por item en el array del carrito
        }));

        const pedidoDTO = {
            nombreCliente: formData.nombre.split(' ')[0],
            apellidoCliente: formData.nombre.split(' ').slice(1).join(' ') || '',
            direccion: formData.direccion,
            telefono: formData.telefono,
            metodoPago: metodo,
            items: itemsDTO
        };

        const res = await api.post('/pedidos', pedidoDTO);
        return res.data;
    };

    const handleWhatsAppOrder = async (metodo) => {
        setLoading(true);
        try {
            // 1. Guardar en Base de Datos
            const pedidoGuardado = await saveOrder(metodo);

            // 2. Construir mensaje de WhatsApp
            let mensaje = `Hola! Quiero realizar un pedido en Pura Vida (Pedido #${pedidoGuardado.id})\n\n`;
            mensaje += `*Cliente:* ${formData.nombre}\n`;
            mensaje += `*Dirección:* ${formData.direccion}\n`;
            mensaje += `*Teléfono:* ${formData.telefono}\n\n`;
            mensaje += `*Pedido:*\n`;

            cart.forEach(item => {
                mensaje += `- ${item.product.nombre}`;
                if (item.gustos && item.gustos.length > 0) {
                    mensaje += ` (${item.gustos.map(g => g.nombre).join(', ')})`;
                }
                mensaje += ` - $${item.price}\n`;
            });

            mensaje += `\n*TOTAL: $${cartTotal}*\n`;
            mensaje += `*Forma de Pago:* ${metodo === 'transferencia' ? 'Transferencia (Envío comprobante)' : 'Efectivo contra entrega'}\n`;
            if (formData.aclaraciones) mensaje += `*Aclaraciones:* ${formData.aclaraciones}`;

            // 3. Redirigir
            const url = `https://wa.me/5492262485095?text=${encodeURIComponent(mensaje)}`;

            clearCart();
            window.open(url, '_blank');
            navigate('/');
        } catch (error) {
            console.error("Error al procesar pedido:", error);
            const msg = error.response?.data || "Hubo un error al procesar tu pedido.";
            alert("Error: " + msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!paymentMethod) {
            alert("Por favor selecciona un método de pago");
            return;
        }

        if (paymentMethod === 'mercadopago') {
            handleMercadoPago();
        } else {
            // Efectivo o Transferencia
            await handleWhatsAppOrder(paymentMethod);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Finalizar Compra</h2>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Datos del Cliente */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">1. Datos de Envío</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                            <input
                                required
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Teléfono / WhatsApp</label>
                            <input
                                required
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dirección de Entrega</label>
                            <input
                                required
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Aclaraciones (Opcional)</label>
                            <textarea
                                name="aclaraciones"
                                value={formData.aclaraciones}
                                onChange={handleChange}
                                rows="2"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                                placeholder="Ej: Timbre no anda, casa esquina verde..."
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Método de Pago */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">2. Forma de Pago</h3>
                    <div className="space-y-4">
                        {/* Mercado Pago */}
                        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${paymentMethod === 'mercadopago' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'hover:bg-gray-50'}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="mercadopago"
                                checked={paymentMethod === 'mercadopago'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <div className="ml-3">
                                <span className="block text-sm font-medium text-gray-900">Mercado Pago</span>
                                <span className="block text-xs text-gray-500">Tarjetas de Débito, Crédito o Dinero en cuenta.</span>
                            </div>
                            <img src="/src/assets/mercadopago.webp" alt="MP" className="h-8 ml-auto" />
                        </label>

                        {/* Transferencia */}
                        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${paymentMethod === 'transferencia' ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' : 'hover:bg-gray-50'}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="transferencia"
                                checked={paymentMethod === 'transferencia'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                            />
                            <div className="ml-3">
                                <span className="block text-sm font-medium text-gray-900">Transferencia Bancaria</span>
                                <span className="block text-xs text-gray-500">Alias: ICE.CORE.HELADOS / CBU: 0000123456789</span>
                                {paymentMethod === 'transferencia' && (
                                    <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                        Al confirmar, se abrirá WhatsApp para que envíes el comprobante.
                                    </div>
                                )}
                            </div>
                        </label>

                        {/* Efectivo */}
                        <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${paymentMethod === 'efectivo' ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'hover:bg-gray-50'}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="efectivo"
                                checked={paymentMethod === 'efectivo'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                            />
                            <div className="ml-3">
                                <span className="block text-sm font-medium text-gray-900">Efectivo contra entrega</span>
                                <span className="block text-xs text-gray-500">Pagas al recibir tu pedido.</span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Resumen Total */}
                <div className="flex items-center justify-between bg-gray-800 text-white p-6 rounded-xl shadow-lg">
                    <span className="text-xl">Total a Pagar:</span>
                    <span className="text-3xl font-bold">${cartTotal.toLocaleString('es-AR')}</span>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition shadow-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 hover:shadow-lg scale-100 hover:scale-[1.01]'}`}
                >
                    {loading ? 'Procesando...' :
                        paymentMethod === 'mercadopago' ? 'Pagar con Mercado Pago' :
                            paymentMethod === 'transferencia' ? 'Confirmar y Enviar Comprobante' :
                                'Confirmar Pedido'}
                </button>
            </form>
        </div>
    );
}
