import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../lib/api';

import { useUI } from '../../context/UIContext';

export default function GustoFormModal({ isOpen, onClose, gustoToEdit, onSave }) {
    const { showError } = useUI();
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: 'Cremas'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (gustoToEdit) {
            setFormData({
                nombre: gustoToEdit.nombre,
                descripcion: gustoToEdit.descripcion || '',
                categoria: gustoToEdit.categoria
            });
        } else {
            setFormData({
                nombre: '',
                descripcion: '',
                categoria: 'Cremas'
            });
        }
    }, [gustoToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (gustoToEdit) {
                // Editar
                await api.put(`/gustos/${gustoToEdit.id}`, formData);
            } else {
                // Crear
                await api.post('/gustos', formData);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error("Error guardando gusto:", error);
            // Mostramos el mensaje real del backend si está disponible
            const serverMsg = error?.response?.data?.message || error?.response?.data || null;
            const displayMsg = (typeof serverMsg === 'string' && serverMsg.length > 0)
                ? serverMsg
                : "Error al guardar. Verificá que el nombre no esté duplicado y que el backend esté disponible.";
            showError(displayMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in border border-gray-100">
                <div className="bg-[#2C1B18] px-8 py-6 flex justify-between items-center">
                    <h3 className="text-white font-black text-xl tracking-tight">
                        {gustoToEdit ? 'Editar Sabor' : 'Nuevo Sabor'}
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="group">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 group-focus-within:text-[#2C1B18] transition-colors">Nombre del Sabor</label>
                        <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 text-[#2C1B18] font-bold placeholder-gray-400 focus:outline-none focus:border-[#2C1B18] focus:bg-white transition-all rounded-t-lg"
                            placeholder="Ej: Chocolate Suizo"
                        />
                    </div>

                    <div className="group">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 group-focus-within:text-[#2C1B18] transition-colors">Categoría</label>
                        <div className="relative">
                            <select
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 text-[#2C1B18] font-bold focus:outline-none focus:border-[#2C1B18] focus:bg-white transition-all rounded-t-lg appearance-none cursor-pointer"
                            >
                                <option value="Cremas">Cremas</option>
                                <option value="Dulces">Dulces</option>
                                <option value="Chocolates">Chocolates</option>
                                <option value="Frutales">Frutales</option>
                            </select>
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2 group-focus-within:text-[#2C1B18] transition-colors">Descripción (Opcional)</label>
                        <textarea
                            rows="3"
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#2C1B18] focus:bg-white transition-all rounded-t-lg resize-none"
                            placeholder="Breve descripción de los ingredientes..."
                        />
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-100 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-[#2C1B18] hover:bg-gray-50 rounded-xl transition cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-8 py-3 bg-[#2C1B18] text-white rounded-xl hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#2C1B18]/20 text-xs font-bold uppercase tracking-widest flex items-center gap-2
                                ${loading ? 'opacity-70 cursor-wait' : ''}
                            cursor-pointer`}
                        >
                            {loading ? 'Guardando...' : 'Guardar Sabor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
