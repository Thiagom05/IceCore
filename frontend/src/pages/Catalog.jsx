import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Sparkles, Snowflake } from 'lucide-react';

export default function Catalog() {
    const [gustos, setGustos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

    // Agrupar gustos por categoría y ordenar
    const groupedGustos = gustos.reduce((acc, gusto) => {
        const cat = gusto.categoria || 'Varios';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(gusto);
        return acc;
    }, {});

    // Ordenar alfabéticamente (A-Z) dentro de cada categoría
    Object.keys(groupedGustos).forEach(cat => {
        groupedGustos[cat].sort((a, b) => a.nombre.localeCompare(b.nombre));
    });

    // Orden deseado de categorías
    const categoryOrder = ['Cremas', 'Chocolates', 'Dulces de Leche', 'Frutales'];

    // Obtener las categorías que existen en los datos, ordenadas según preferencia o al final si no están en la lista
    const sortedCategories = Object.keys(groupedGustos).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-bg-primary text-text-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2C1B18]"></div>
                <p className="mt-4 text-sm font-medium tracking-widest uppercase animate-pulse">Cargando Sabores...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary pt-24 pb-16 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Minimalista */}
                <div className="text-center mb-12 md:mb-20 animate-fade-in-up">
                    <span className="text-xs font-bold tracking-[0.3em] uppercase text-text-secondary">
                        Catálogo 2026
                    </span>
                    <h1 className="text-4xl md:text-7xl text-text-[#2C1B18] tracking-tighter mt-4 mb-6">
                        NUESTROS<br />SABORES
                    </h1>
                </div>

                {/* Lista por Categorías */}
                <div className="space-y-24">
                    {sortedCategories.map((category) => (
                        <section key={category} className="animate-fade-in-up">
                            <div className="flex items-center gap-4 mb-12">
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-text-[#2C1B18]">{category}</h2>
                                <div className="h-px bg-gray-200 flex-grow"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                                {groupedGustos[category].map((gusto) => (
                                    <div key={gusto.id} className="group flex flex-col">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <h3 className="text-xl md:text-2xl font-bold tracking-tight group-hover:underline decoration-2 underline-offset-4 decoration-[#2C1B18]/30 transition-all">
                                                {gusto.nombre}
                                            </h3>
                                            {!gusto.hayStock && (
                                                <span className="text-[10px] font-bold text-red-500 border border-red-500 px-2 py-0.5 rounded ml-4 uppercase tracking-wider">
                                                    Agotado
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-text-secondary text-sm md:text-base leading-relaxed font-light">
                                            {gusto.descripcion}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Empty State */}
                {gustos.length === 0 && (
                    <div className="text-center py-20 text-text-secondary">
                        <p>No hay sabores disponibles en este momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
