import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { CreditCard, Banknote, Landmark, Loader2, ArrowLeft, Clock } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useBusinessHours } from '../hooks/HorariosPedidos';

// ─── Componentes fuera del padre para evitar re-mount en cada re-render ────────

const InputField = ({ label, name, type = "text", required = false, placeholder, formData, handleChange }) => (
    <div className="group">
        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 group-focus-within:text-[#2C1B18] transition-colors">{label}</label>
        <input
            required={required}
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2C1B18] focus:bg-white transition-all rounded-t-lg"
        />
    </div>
);

const PaymentOption = ({ value, label, subLabel, icon: Icon, paymentMethod, setPaymentMethod }) => (
    <label className={`
        cursor-pointer relative p-6 rounded-2xl border-2 transition-all duration-300 flex items-start gap-4 group
        ${paymentMethod === value
            ? 'border-[#2C1B18] bg-[#2C1B18] text-white shadow-xl shadow-[#2C1B18]/20 transform scale-[1.02]'
            : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
        }
    `}>
        <input
            type="radio"
            name="payment"
            value={value}
            checked={paymentMethod === value}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="sr-only"
        />
        <div className={`p-3 rounded-full ${paymentMethod === value ? 'bg-white/10' : 'bg-gray-100 group-hover:bg-white'} transition-colors`}>
            <Icon className={`w-6 h-6 ${paymentMethod === value ? 'text-white' : 'text-gray-400 group-hover:text-[#2C1B18]'}`} />
        </div>
        <div>
            <span className={`block font-bold text-lg mb-1 ${paymentMethod === value ? 'text-white' : 'text-[#2C1B18]'}`}>{label}</span>
            <span className={`block text-xs font-medium leading-relaxed ${paymentMethod === value ? 'text-white/70' : 'text-text-secondary'}`}>{subLabel}</span>
        </div>
    </label>
);

// ──────────────────────────────────────────────────────────────────────────────

export default function Checkout() {
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const { showError } = useUI();
    const { availableSlots, nextSlotLabel, isOpen } = useBusinessHours();

    // Formulario de Cliente
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        direccion: '',
        aclaraciones: ''
    });

    // Horario de entrega elegido por el cliente
    const [deliverySlot, setDeliverySlot] = useState('');

    // Pre-seleccionar el primer slot disponible cuando se carguen los datos
    useEffect(() => {
        if (availableSlots.length > 0 && !deliverySlot) {
            setDeliverySlot(availableSlots[0].value);
        }
    }, [availableSlots]);

    // Método de Pago seleccionado
    const [paymentMethod, setPaymentMethod] = useState('');
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
        const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';
        const paymentsEnabled = import.meta.env.VITE_ENABLE_PAYMENTS === 'true';

        if (isDemo || !paymentsEnabled) {
            showError("✨ MODO DEMO/PORTFOLIO: La pasarela de pagos está deshabilitada para esta demostración.");
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
            horaEntrega: deliverySlot,
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
            mensaje += `*Teléfono:* ${formData.telefono}\n`;
            mensaje += `*Hora de entrega:* ${deliverySlot}\n\n`;
            mensaje += `*Pedido:*\n`;

            cart.forEach(item => {
                mensaje += `- ${(item.quantity > 1 ? `${item.quantity}x ` : '') + item.product.nombre}`;
                if (item.gustos && item.gustos.length > 0) {
                    mensaje += ` (${item.gustos.map(g => g.nombre).join(', ')})`;
                }
                mensaje += ` - $${item.price * (item.quantity || 1)}\n`;
            });

            mensaje += `\n*TOTAL: $${cartTotal}*\n`;
            mensaje += `*Forma de Pago:* ${metodo === 'transferencia' ? 'Transferencia (Envío comprobante)' : 'Efectivo contra entrega'}\n`;
            if (formData.aclaraciones) mensaje += `*Aclaraciones:* ${formData.aclaraciones}`;

            const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "5492262485095";
            const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

            clearCart();

            if (isDemo) {
                showError("✨ MODO DEMO/PORTFOLIO: En un entorno real, esto abriría WhatsApp con tu pedido.\n\n" + mensaje, "Pedido Simulado Exitosamente");
            } else {
                const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
                window.open(url, '_blank');
            }

            navigate('/');
        } catch (error) {
            console.error("Error al procesar pedido:", error);
            const msg = error.response?.data || "Hubo un error al procesar tu pedido.";
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
            <div className="max-w-3xl mx-auto">
                <button onClick={() => navigate('/carrito')} className="flex items-center gap-2 text-text-secondary hover:text-[#2C1B18] mb-8 group transition-colors">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold underline underline-offset-4 cursor-pointer">Volver al Carrito</span>
                </button>

                <h1 className="text-4xl font-black text-[#2C1B18] tracking-tighter mb-2">FINALIZAR PEDIDO</h1>
                <p className="text-text-secondary mb-12">Completá tus datos para recibir tu pedido.</p>

                <form onSubmit={handleSubmit} className="space-y-12 animate-fade-in-up">

                    {/* 0. Hora de Entrega */}
                    <section>
                        <h3 className="text-xl font-bold text-[#2C1B18] mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-[#2C1B18] text-white flex items-center justify-center text-sm">1</span>
                            Hora de Entrega
                        </h3>

                        {!isOpen && (
                            <div className="mb-4 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
                                <Clock className="w-4 h-4 shrink-0 text-amber-600" />
                                <span>Estamos cerrados ahora. Tu pedido llegará en el horario que elijas.</span>
                            </div>
                        )}

                        <select
                            required
                            value={deliverySlot}
                            onChange={(e) => setDeliverySlot(e.target.value)}
                            className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 text-[#2C1B18] font-bold focus:outline-none focus:border-[#2C1B18] focus:bg-white transition-all rounded-t-lg appearance-none cursor-pointer"
                        >
                            <option value="" disabled>Elegí una franja horaria...</option>
                            {availableSlots.map((slot) => (
                                <option key={slot.value} value={slot.value}>{slot.label}</option>
                            ))}
                        </select>
                    </section>

                    {/* 1. Datos del Cliente */}
                    <section>
                        <h3 className="text-xl font-bold text-[#2C1B18] mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-[#2C1B18] text-white flex items-center justify-center text-sm">2</span>
                            Datos de Envío
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="Nombre Completo" name="nombre" required placeholder="Tu nombre" formData={formData} handleChange={handleChange} />
                            <InputField label="Teléfono / WhatsApp" name="telefono" type="tel" required placeholder="Para coordinar la entrega" formData={formData} handleChange={handleChange} />
                            <div className="md:col-span-2">
                                <InputField label="Dirección de Entrega" name="direccion" required placeholder="Calle, número, piso..." formData={formData} handleChange={handleChange} />
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
                            <span className="w-8 h-8 rounded-full bg-[#2C1B18] text-white flex items-center justify-center text-sm">3</span>
                            Forma de Pago
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <PaymentOption value="mercadopago" label="Mercado Pago" subLabel="Tarjetas, Débito o Dinero en cuenta." icon={CreditCard} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
                            <PaymentOption value="transferencia" label="Transferencia" subLabel="Te enviaremos los datos por WhatsApp." icon={Landmark} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
                            <PaymentOption value="efectivo" label="Efectivo" subLabel="Abonás al recibir tu pedido." icon={Banknote} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
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
                                <>Confirmar Pedido</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
