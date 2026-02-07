import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { useCart } from '../context/CartContext';

export default function Order() {
    const { addToCart } = useCart();
    const [tiposProducto, setTiposProducto] = useState([]);
    const [gustos, setGustos] = useState([]);
    const [step, setStep] = useState(1); // 1: Tipos, 2: Gustos, 3: Resumen
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
        if (!gusto.hayStock) return; // No permitir seleccionar si no hay stock

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

    if (loading) return <div className="text-center p-20 text-xl animate-pulse">Cargando opciones... 🍦</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Arma tu Pedido</h2>

            {/* Steps Indicator */}
            <div className="flex justify-center mb-8">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>1</div>
                <div className="w-16 h-1 bg-gray-200 self-center mx-2">
                    <div className={`h-full ${step >= 2 ? 'bg-primary-600' : ''}`}></div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>2</div>
                <div className="w-16 h-1 bg-gray-200 self-center mx-2">
                    <div className={`h-full ${step >= 3 ? 'bg-primary-600' : ''}`}></div>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>3</div>
            </div>

            {step === 1 && (
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-center">Elige tu envase o porción</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {tiposProducto.map(prod => (
                            <div
                                key={prod.id}
                                onClick={() => handleProductSelect(prod)}
                                className="bg-white p-6 rounded-xl shadow-md  hover:shadow-xl transition cursor-pointer border-2 border-transparent hover:border-primary-500"
                            >
                                <h4 className="text-xl font-bold text-center text-gray-800">{prod.nombre}</h4>
                                {prod.esPorPeso && (
                                    <p className="text-center text-gray-500 mt-2">
                                        Hasta {prod.maxGustos} sabores
                                    </p>
                                )}
                                <div className="mt-4 text-center">
                                    <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full">
                                        ${prod.precio}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && selectedProduct && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">
                            Eligiendo sabores para {selectedProduct.nombre}
                        </h3>
                        <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full font-bold">
                            {selectedGustos.length} / {selectedProduct.maxGustos}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {gustos.map(gusto => {
                            const isSelected = selectedGustos.some(g => g.id === gusto.id);
                            return (
                                <div
                                    key={gusto.id}
                                    onClick={() => toggleGusto(gusto)}
                                    className={`
                                        p-4 rounded-lg cursor-pointer transition relative overflow-hidden
                                        ${isSelected ? 'bg-primary-600 text-white shadow-lg transform scale-105' : 'bg-white hover:bg-gray-50 text-gray-800 shadow'}
                                    `}
                                >
                                    <h4 className="font-bold text-sm md:text-base">{gusto.nombre}</h4>
                                    <span className="text-xs opacity-75">{gusto.categoria}</span>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 bg-white text-primary-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                            ✓
                                        </div>
                                    )}
                                    {!gusto.hayStock && (
                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                            <span className="text-red-600 font-bold text-sm transform -rotate-12 border-2 border-red-600 px-2 rounded">AGOTADO</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 flex justify-between">
                        <button
                            onClick={resetOrder}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition"
                        >
                            Atrás
                        </button>
                        <button
                            disabled={selectedGustos.length === 0}
                            onClick={() => setStep(3)}
                            className={`
                                font-semibold py-2 px-6 rounded-lg transition
                                ${selectedGustos.length > 0
                                    ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-primary-500/30'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                            `}
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && selectedProduct && (
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">Resumen del Pedido</h3>

                    <div className="flex justify-between border-b pb-4 mb-4">
                        <span className="text-lg font-medium">{selectedProduct.nombre}</span>
                        <span className="text-lg font-bold text-green-600">${selectedProduct.precio}</span>
                    </div>

                    <div className="mb-6">
                        <h4 className="font-semibold text-gray-600 mb-2">Sabores seleccionados:</h4>
                        {selectedGustos.length > 0 ? (
                            <ul className="space-y-1">
                                {selectedGustos.map(g => (
                                    <li key={g.id} className="text-gray-800 flex items-center">
                                        <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                                        {g.nombre}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 italic">Sin sabores seleccionados (Producto por unidad)</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition transform hover:scale-101"
                            onClick={() => {
                                const item = {
                                    product: selectedProduct,
                                    gustos: selectedGustos,
                                    price: selectedProduct.precio
                                };
                                addToCart(item);
                                alert("¡Agregado al carrito!");
                                resetOrder();
                            }}
                        >
                            Agregar al Carrito
                        </button>
                        <button
                            onClick={resetOrder}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 px-4 rounded-lg transition"
                        >
                            Volver a empezar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
