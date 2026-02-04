import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Home() {
    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Hero Section */}
            <div className="bg-primary-800 text-white py-20 px-4 text-center rounded-b-[3rem] shadow-xl">
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                    Pura Vida Helados
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-secondary-300 max-w-2xl mx-auto opacity-90">
                    Cremas heladas artesanales
                </p>
                <Link to="/pedido" className="inline-flex items-center bg-white text-secondary-500 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-300 transition hover:scale-101">
                    Pedir Ahora <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </div>

            {/* Features o Promociones */}
            <div className="max-w-7xl mx-auto py-16 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Artesanal 100%</h3>
                    <p className="text-gray-600">Elaborados diariamente con frutas frescas y materias primas seleccionadas.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Delivery Rápido</h3>
                    <p className="text-gray-600">Llegamos a tu puerta sin que se derrita una sola gota.</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Variedad Única</h3>
                    <p className="text-gray-600">Más de 20 sabores para elegir, desde los clásicos hasta los más exóticos.</p>
                </div>
            </div>
        </div>
    );
}
