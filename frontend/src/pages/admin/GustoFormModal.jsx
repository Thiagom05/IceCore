import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../lib/api';

export default function GustoFormModal({ isOpen, onClose, gustoToEdit, onSave }) {
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
            alert("Error al guardar. Verifica que el nombre no esté duplicado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                <div className="bg-primary-600 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg">
                        {gustoToEdit ? 'Editar Sabor' : 'Nuevo Sabor'}
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
                            placeholder="Ej: Chocolate Suizo"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                        <select
                            value={formData.categoria}
                            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
                        >
                            <option value="Cremas">Cremas</option>
                            <option value="Dulces">Dulces</option>
                            <option value="Chocolates">Chocolates</option>
                            <option value="Frutales">Frutales</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                        <textarea
                            rows="3"
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
                            placeholder="Breve descripción de los ingredientes..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium shadow-sm flex items-center gap-2
                                ${loading ? 'opacity-70 cursor-wait' : ''}
                            `}
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
