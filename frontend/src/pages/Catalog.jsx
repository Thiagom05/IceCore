import React, { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Catalog() {
    const [gustos, setGustos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Cargar gustos activos desde el backend
        api.get('/gustos/activos')
            .then(response => {
                setGustos(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error al cargar gustos:", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="text-center p-10">Cargando delicias... 🍧</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Nuestros Sabores</h2>

            {/* Grid de Gustos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {gustos.map((gusto) => (
                    <div key={gusto.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex flex-col">
                        {/* Si tuviéramos fotos, irían aquí. Por ahora, un placeholder de color */}
                        <div className={`h-32 w-full flex items-center justify-center text-4xl
              ${gusto.categoria === 'Cremas' ? 'bg-amber-100' :
                                gusto.categoria === 'Frutales' ? 'bg-red-100' :
                                    gusto.categoria === 'Dulces de Leche' ? 'bg-orange-100' : 'bg-gray-200'
                            }`}>
                            🍦
                        </div>

                        <div className="p-4 flex-grow">
                            <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-1 rounded-full mb-2 inline-block">
                                {gusto.categoria}
                            </span>
                            <div className="px-4 pb-4">
                                {!gusto.hayStock && (
                                    <span className="text-xs text-red-500 font-bold border border-red-500 px-2 py-1 rounded">AGOTADO</span>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{gusto.nombre}</h3>
                            <p className="text-gray-600 text-sm line-clamp-2">{gusto.descripcion}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
