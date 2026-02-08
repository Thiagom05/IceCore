import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useCart } from '../context/CartContext';
import { ChevronRight, Check } from 'lucide-react';

export default function Order() {
    const { addToCart } = useCart();
    const [tiposProducto, setTiposProducto] = useState([]);
    const [gustos, setGustos] = useState([]);
    const [step, setStep] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedGustos, setSelectedGustos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tiposRes, gustosRes] = await Promise.all([
                    api.get('/tipos-producto'),
                    api.get('/gustos/activos')
                ]);
                setTiposProducto(tiposRes.data);
                setGustos(gustosRes.data);
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleProductSelect = (producto) => {
        setSelectedProduct(producto);
        if (producto.esPorPeso) {
            setStep(2);
        } else {
            setStep(3);
        }
    };

    const toggleGusto = (gusto) => {
        if (!gusto.hayStock) return;

        if (selectedGustos.some(g => g.id === gusto.id)) {
            setSelectedGustos(selectedGustos.filter(g => g.id !== gusto.id));
        } else {
            if (selectedGustos.length < selectedProduct.maxGustos) {
                setSelectedGustos([...selectedGustos, gusto]);
            } else {
                alert(`Máximo ${selectedProduct.maxGustos} gustos permitidos.`);
            }
        }
    };

    const resetOrder = () => {
        setStep(1);
        setSelectedProduct(null);
        setSelectedGustos([]);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-bg-primary text-text-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2C1B18]"></div>
                <p className="mt-4 text-sm font-medium tracking-widest uppercase animate-pulse">Cargando Opciones...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary pt-24 pb-16 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header & Steps */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <span className="text-xs font-bold tracking-[0.3em] uppercase text-text-secondary">
                        Paso {step} de 3
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mt-4 mb-2 text-[#2C1B18]">
                        {step === 1 && "ELIGE TU PORCIÓN"}
                        {step === 2 && "SELECCIÓN DE SABORES"}
                        {step === 3 && "RESUMEN DEL PEDIDO"}
                    </h1>
                </div>

                {/* Content */}
                <div key={step} className="animate-fade-in-up">
                    {step === 1 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                            {tiposProducto.map(prod => (
                                <button
                                    key={prod.id}
                                    onClick={() => handleProductSelect(prod)}
                                    className="group flex flex-col items-center bg-white border border-gray-100 p-8 rounded-3xl hover:border-[#2C1B18] transition-all duration-300 hover:shadow-xl hover:shadow-[#2C1B18]/10 text-left w-full cursor-pointer"
                                >
                                    <h4 className="text-2xl font-bold text-[#2C1B18] mb-2">{prod.nombre}</h4>
                                    {prod.esPorPeso && (
                                        <p className="text-text-secondary text-sm mb-6">
                                            Hasta {prod.maxGustos} sabores
                                        </p>
                                    )}
                                    <span className="mt-auto inline-block bg-gray-50 text-[#2C1B18] px-6 py-2 rounded-full font-bold group-hover:bg-[#2C1B18] group-hover:text-white transition-colors">
                                        ${prod.precio}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 2 && selectedProduct && (
                        <div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 border-b border-gray-100 pb-6 gap-4">
                                <h3 className="text-xl font-bold">
                                    {selectedProduct.nombre}
                                </h3>
                                <span className={`text-sm font-bold px-4 py-2 rounded-full w-full md:w-auto text-center ${selectedGustos.length === selectedProduct.maxGustos ? 'bg-[#2C1B18] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {selectedGustos.length} / {selectedProduct.maxGustos} seleccionados
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {gustos.map(gusto => {
                                    const isSelected = selectedGustos.some(g => g.id === gusto.id);
                                    return (
                                        <button
                                            key={gusto.id}
                                            disabled={!gusto.hayStock}
                                            onClick={() => toggleGusto(gusto)}
                                            className={`
                                                relative p-6 rounded-2xl text-left transition-all duration-200 border
                                                ${isSelected
                                                    ? 'bg-[#2C1B18] text-text-inverse border-[#2C1B18] shadow-lg shadow-[#2C1B18]/20'
                                                    : 'bg-white text-text-primary border-gray-100 hover:border-gray-300'
                                                }
                                                ${!gusto.hayStock ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''} cursor-pointer
                                            `}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className={`font-bold text-sm md:text-base leading-tight ${isSelected ? 'text-white' : 'text-[#2C1B18]'}`}>{gusto.nombre}</h4>
                                                {isSelected && <Check className="w-4 h-4 text-white" />}
                                                {!gusto.hayStock && <span className="text-[10px] font-bold text-red-500 uppercase">Agotado</span>}
                                            </div>
                                            <span className={`text-xs uppercase tracking-wider font-medium ${isSelected ? 'text-white/60' : 'text-text-secondary'}`}>
                                                {gusto.categoria}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-16 flex flex-col-reverse md:flex-row justify-between items-center gap-6">
                                <button
                                    onClick={resetOrder}
                                    className="text-text-secondary hover:text-text-secondary font-medium underline underline-offset-4 transition cursor-pointer py-3"
                                >
                                    Volver atrás
                                </button>
                                <button
                                    disabled={selectedGustos.length === 0}
                                    onClick={() => setStep(3)}
                                    className={`
                                        w-full md:w-auto flex justify-center items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all cursor-pointer
                                        ${selectedGustos.length > 0
                                            ? 'bg-[#2C1B18] text-white hover:scale-105 shadow-xl shadow-[#2C1B18]/20'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                                    `}
                                >
                                    Continuar <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && selectedProduct && (
                        <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl border border-gray-100 shadow-xl shadow-[#2C1B18]/5">
                            <div className="flex justify-between items-baseline border-b border-gray-100 pb-6 mb-8">
                                <span className="text-2xl font-black text-[#2C1B18]">{selectedProduct.nombre}</span>
                                <span className="text-3xl font-bold text-[#2C1B18]">${selectedProduct.precio}</span>
                            </div>

                            <div className="mb-12">
                                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary mb-6">Sabores Elegidos</h4>
                                {selectedGustos.length > 0 ? (
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {selectedGustos.map(g => (
                                            <li key={g.id} className="flex items-center gap-3 text-[#2C1B18] font-medium bg-gray-50 p-3 rounded-lg">
                                                <div className="w-2 h-2 bg-[#2C1B18] rounded-full"></div>
                                                {g.nombre}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-text-secondary italic">Sin selección de sabores (Producto por unidad)</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    className="w-full bg-[#2C1B18] text-white font-bold py-4 rounded-full hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#2C1B18]/20 cursor-pointer"
                                    onClick={() => {
                                        const item = {
                                            product: selectedProduct,
                                            gustos: selectedGustos,
                                            price: selectedProduct.precio
                                        };
                                        addToCart(item);
                                        resetOrder();
                                    }}
                                >
                                    Agregar al Carrito
                                </button>
                                <button
                                    onClick={resetOrder}
                                    className="w-full bg-white text-text-secondary font-bold py-4 rounded-full border border-gray-200 hover:border-[#2C1B18] hover:text-[#2C1B18] transition-all cursor-pointer"
                                >
                                    Reiniciar Pedido
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
