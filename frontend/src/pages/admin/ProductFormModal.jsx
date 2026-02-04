import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../lib/api';

export default function ProductFormModal({ isOpen, onClose, productToEdit, onSave }) {
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
        }
    }, [productToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/tipos-producto/${productToEdit.id}`, formData);
            onSave();
            onClose();
        } catch (error) {
            console.error("Error guardando producto:", error);
            alert("Error al guardar producto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
                <div className="bg-primary-600 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg">Editar Producto</h3>
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
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.precio}
                            onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max. Sabores</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.maxGustos}
                                onChange={(e) => setFormData({ ...formData, maxGustos: e.target.value })}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2 border"
                            />
                        </div>
                        <div className="flex-1">
                            {/* Es Por Peso: Read only for now unless logic changes */}
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Venta</label>
                            <div className="p-2 bg-gray-100 rounded text-sm text-gray-600">
                                {formData.esPorPeso ? 'Por Pote' : 'Por Unidad'}
                            </div>
                        </div>
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
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium shadow-sm"
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
