import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../lib/api';

import { useUI } from '../../context/UIContext';

export default function ProductFormModal({ isOpen, onClose, productToEdit, onSave }) {
    const { showError } = useUI();
    const [formData, setFormData] = useState({
        nombre: '',
        precio: '',
        maxGustos: 0,
        esPorPeso: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                nombre: productToEdit.nombre,
                precio: productToEdit.precio,
                maxGustos: productToEdit.maxGustos,
                esPorPeso: productToEdit.esPorPeso
            });
        } else {
            setFormData({
                nombre: '',
                precio: '',
                maxGustos: 0,
                esPorPeso: false
            });
        }
    }, [productToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (productToEdit) {
                await api.put(`/tipos-producto/${productToEdit.id}`, formData);
            } else {
                await api.post('/tipos-producto', formData);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error("Error guardando producto:", error);
            showError("Error al guardar producto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in border border-gray-100">
                <div className="bg-[#2C1B18] px-8 py-6 flex justify-between items-center">
                    <h3 className="text-white font-black text-xl tracking-tight">{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="group">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 group-focus-within:text-[#2C1B18] transition-colors">Nombre del Producto</label>
                        <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 text-[#2C1B18] font-bold placeholder-gray-400 focus:outline-none focus:border-[#2C1B18] focus:bg-white transition-all rounded-t-lg"
                        />
                    </div>

                    <div className="group">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 group-focus-within:text-[#2C1B18] transition-colors">Precio ($)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.precio}
                            onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                            className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 text-[#2C1B18] font-black text-xl placeholder-gray-400 focus:outline-none focus:border-[#2C1B18] focus:bg-white transition-all rounded-t-lg"
                        />
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-1 group">
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 group-focus-within:text-[#2C1B18] transition-colors">Max. Sabores</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.maxGustos}
                                onChange={(e) => setFormData({ ...formData, maxGustos: e.target.value })}
                                className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 text-[#2C1B18] font-bold placeholder-gray-400 focus:outline-none focus:border-[#2C1B18] focus:bg-white transition-all rounded-t-lg"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Tipo Venta</label>
                            <div className="relative">
                                <select
                                    value={formData.esPorPeso}
                                    onChange={(e) => setFormData({ ...formData, esPorPeso: e.target.value === 'true' })}
                                    className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 text-[#2C1B18] font-bold focus:outline-none focus:border-[#2C1B18] focus:bg-white transition-all rounded-t-lg appearance-none cursor-pointer"
                                >
                                    <option value="false">Por Unidad</option>
                                    <option value="true">Por Pote</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-[#2C1B18] hover:bg-gray-50 rounded-xl transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-[#2C1B18] text-white rounded-xl hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#2C1B18]/20 text-xs font-bold uppercase tracking-widest"
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
