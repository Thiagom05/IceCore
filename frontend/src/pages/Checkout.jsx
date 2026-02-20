import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { CreditCard, Banknote, Landmark, Loader2, ArrowLeft } from 'lucide-react';
import ErrorModal from '../components/ErrorModal';


const InputField = ({ label, name, type = "text", required = false, placeholder, value, onChange }) => (
    <div className="group">
        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 group-focus-within:text-[#2C1B18] transition-colors">{label}</label>
        <input
            required={required}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2C1B18] focus:bg-white transition-all rounded-t-lg"
        />
    </div>
);

const PaymentOption = ({ value, label, subLabel, icon: Icon, selectedValue, onChange }) => (
    <label className={`
        cursor-pointer relative p-6 rounded-2xl border-2 transition-all duration-300 flex items-start gap-4 group
        ${selectedValue === value
            ? 'border-[#2C1B18] bg-[#2C1B18] text-white shadow-xl shadow-[#2C1B18]/20 transform scale-[1.02]'
            : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
        }
    `}>
        <input
            type="radio"
            name="payment"
            value={value}
            checked={selectedValue === value}
            onChange={() => onChange(value)}
            className="sr-only"
        />
        <div className={`p-3 rounded-full ${selectedValue === value ? 'bg-white/10' : 'bg-gray-100 group-hover:bg-white'} transition-colors`}>
            <Icon className={`w-6 h-6 ${selectedValue === value ? 'text-white' : 'text-gray-400 group-hover:text-[#2C1B18]'}`} />
        </div>
        <div>
            <span className={`block font-bold text-lg mb-1 ${selectedValue === value ? 'text-white' : 'text-[#2C1B18]'}`}>{label}</span>
            <span className={`block text-xs font-medium leading-relaxed ${selectedValue === value ? 'text-white/70' : 'text-text-secondary'}`}>{subLabel}</span>
        </div>
    </label>
);

export default function Checkout() {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    // Estado para el Modal de Error
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

    // Helper para mostrar errores
    const showError = (msg) => {
        setErrorModal({ isOpen: true, message: msg });
    };
    const closeError = () => {
        setErrorModal({ ...errorModal, isOpen: false });
    };

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
        return (
            <div className="min-h-screen flex items-center justify-center text-text-secondary">
                <p>No hay items en el carrito para pagar.</p>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMercadoPago = async () => {
        const paymentsEnabled = import.meta.env.VITE_ENABLE_PAYMENTS === 'true';

        if (!paymentsEnabled) {
            showError("✨ MODO PORTFOLIO: El pago con Mercado Pago está deshabilitado en esta demostración para evitar transacciones reales.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/payments/create_preference', cart);
            window.location.href = res.data.init_point;
        } catch (error) {
            console.error(error);
            showError("Error al iniciar pago con Mercado Pago");
        } finally {
            setLoading(false);
        }
    };

    const saveOrder = async (metodo) => {
        const itemsDTO = cart.map(item => ({
            tipoProductoId: item.product.id,
            gustoIds: item.gustos ? item.gustos.map(g => g.id) : [],
            cantidad: item.quantity || 1
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
            const pedidoGuardado = await saveOrder(metodo);

            let mensaje = `Hola! Quiero realizar un pedido en Pura Vida (Pedido #${pedidoGuardado.id})\n\n`;
            mensaje += `*Cliente:* ${formData.nombre}\n`;
            mensaje += `*Dirección:* ${formData.direccion}\n`;
            mensaje += `*Teléfono:* ${formData.telefono}\n\n`;
            mensaje += `*Pedido:*\n`;

            cart.forEach(item => {
                mensaje += `- ${item.quantity > 1 ? item.quantity + 'x ' : ''}${item.product.nombre}`;
                if (item.gustos && item.gustos.length > 0) {
                    mensaje += ` (${item.gustos.map(g => g.nombre).join(', ')})`;
                }
                mensaje += ` - $${item.price * (item.quantity || 1)}\n`;
            });

            mensaje += `\n*TOTAL: $${cartTotal}*\n`;
            mensaje += `*Forma de Pago:* ${metodo === 'transferencia' ? 'Transferencia (Envío comprobante)' : 'Efectivo contra entrega'}\n`;
            if (formData.aclaraciones) mensaje += `*Aclaraciones:* ${formData.aclaraciones}`;

            if (formData.aclaraciones) mensaje += `*Aclaraciones:* ${formData.aclaraciones}`;

            const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

            clearCart();

            if (whatsappNumber) {
                const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
                window.open(url, '_blank');
            } else {
                // MODO PORTFOLIO / DEMO
                showError("✨ MODO PORTFOLIO: En un entorno real, esto abriría WhatsApp con tu pedido.\n\n" + mensaje);
            }

            navigate('/');
        } catch (error) {
            console.error("Error al procesar pedido:", error);
            const msg = error.response?.data || "Hubo un error al procesar tu pedido."; // Fix error msg access
            showError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!paymentMethod) {
            showError("Por favor selecciona un método de pago");
            return;
        }

        if (paymentMethod === 'mercadopago') {
            handleMercadoPago();
        } else {
            await handleWhatsAppOrder(paymentMethod);
        }
    };





    return (
        <div className="min-h-screen bg-bg-primary pt-24 pb-16 px-6">
            <ErrorModal
                isOpen={errorModal.isOpen}
                onClose={closeError}
                message={errorModal.message}
                title="Atención"
            />

            <div className="max-w-3xl mx-auto">
                <button onClick={() => navigate('/carrito')} className="flex items-center gap-2 text-text-secondary hover:text-[#2C1B18] mb-8 group transition-colors">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold underline underline-offset-4 cursor-pointer">Volver al Carrito</span>
                </button>

                <h1 className="text-4xl font-black text-[#2C1B18] tracking-tighter mb-2">FINALIZAR PEDIDO</h1>
                <p className="text-text-secondary mb-12">Completa tus datos para recibir tu pedido.</p>

                <form onSubmit={handleSubmit} className="space-y-12 animate-fade-in-up">
                    {/* 1. Datos del Cliente */}
                    <section>
                        <h3 className="text-xl font-bold text-[#2C1B18] mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-[#2C1B18] text-white flex items-center justify-center text-sm">1</span>
                            Datos de Envío
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Nombre Completo" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Tu nombre" />
                            <InputField label="Teléfono / WhatsApp" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} required placeholder="Para coordinar la entrega" />
                            <div className="md:col-span-2">
                                <InputField label="Dirección de Entrega" name="direccion" value={formData.direccion} onChange={handleChange} required placeholder="Calle, número, piso..." />
                            </div>
                            <div className="md:col-span-2">
                                <div className="group">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 group-focus-within:text-[#2C1B18] transition-colors">Aclaraciones (Opcional)</label>
                                    <textarea
                                        name="aclaraciones"
                                        value={formData.aclaraciones}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2C1B18] focus:bg-white transition-all rounded-t-lg resize-none"
                                        placeholder="Ej: Timbre no anda, casa esquina verde..."
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. Método de Pago */}
                    <section>
                        <h3 className="text-xl font-bold text-[#2C1B18] mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-[#2C1B18] text-white flex items-center justify-center text-sm">2</span>
                            Forma de Pago
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <PaymentOption
                                value="mercadopago"
                                label="Mercado Pago"
                                subLabel="Tarjetas, Débito o Dinero en cuenta."
                                icon={CreditCard}
                                selectedValue={paymentMethod}
                                onChange={setPaymentMethod}
                            />
                            <PaymentOption
                                value="transferencia"
                                label="Transferencia"
                                subLabel="Te enviaremos los datos por WhatsApp."
                                icon={Landmark}
                                selectedValue={paymentMethod}
                                onChange={setPaymentMethod}
                            />
                            <PaymentOption
                                value="efectivo"
                                label="Efectivo"
                                subLabel="Abonás al recibir tu pedido."
                                icon={Banknote}
                                selectedValue={paymentMethod}
                                onChange={setPaymentMethod}
                            />
                        </div>
                    </section>

                    {/* Resumen y Botón */}
                    <div className="pt-8 border-t border-gray-200">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <p className="text-text-secondary text-sm mb-1">Total a Pagar</p>
                                <p className="text-4xl font-black text-[#2C1B18] tracking-tight">${cartTotal.toLocaleString('es-AR')}</p>
                            </div>
                            <span className="text-xs text-text-secondary bg-gray-100 px-3 py-1 rounded-full">{cart.length} items</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`
                                w-full py-5 px-6 rounded-2xl font-bold text-white text-lg transition-all shadow-xl
                                ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-[#2C1B18] hover:bg-black hover:scale-[1.01] hover:shadow-2xl shadow-[#2C1B18]/20'}
                                flex items-center justify-center gap-3 cursor-pointer
                            `}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin w-6 h-6" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    Confirmar Pedido
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
