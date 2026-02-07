import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, Truck, Sparkles, DropletOff } from 'lucide-react';

// Imágenes
import img1 from '../assets/1.png';
import img2 from '../assets/2.png';
import img3 from '../assets/3.png';
import img4 from '../assets/4.png';
import img5 from '../assets/5.png';

export default function Home() {
    return (
        <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-black selection:text-white">

            {/* Hero Section Minimalista */}
            <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 pt-20 overflow-hidden">

                {/* Background Image Sutil */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={img3}
                        alt="Background Texture"
                        className="w-full h-full object-cover opacity-30 scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white/80"></div>
                </div>

                <div className="max-w-5xl z-10 flex flex-col items-center relative">
                    <span className="text-sm font-medium tracking-[0.3em] uppercase text-text-secondary animate-fade-in-up mb-4">
                        Est. 2026 — Pura Vida
                    </span>
                    {/* Ajuste Mobile: text-6xl en vez de 7xl para evitar desbordes en pantallas muy angostas */}
                    <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-[0.9] animate-fade-in mb-8">
                        PURA<br />VIDA
                    </h1>

                    <p className="text-lg md:text-xl text-text-secondary max-w-xl mx-auto font-light animate-fade-in-up delay-200 mb-12 px-4">
                        Cremas heladas artesanales. <br className="hidden md:block" />
                        Donde la textura encuentra el sabor puro.
                    </p>

                    <div className="animate-fade-in-up delay-300">
                        <Link
                            to="/pedido"
                            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full text-lg font-medium transition-transform active:scale-95 overflow-hidden shadow-xl"
                        >
                            <span className="relative z-10 group-hover:pr-2 transition-all">Pedir Ahora</span>
                            <ArrowRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Marquee / Separator */}
            <div className="w-full bg-black text-white py-4 overflow-hidden border-y border-white/10">
                <div className="flex whitespace-nowrap gap-16 animate-marquee text-xs md:text-sm font-bold uppercase tracking-widest">
                    <span>— 100% Artesanal</span>
                    <span>— Sabores Auténticos</span>
                    <span>— Envíos a todo Quequén y Necochea</span>
                    <span>— Ingredientes Premium</span>
                    <span>— 100% Artesanal</span>
                    <span>— Sabores Auténticos</span>
                    <span>— Envíos a todo Quequén y Necochea</span>
                    <span>— Ingredientes Premium</span>
                    <span>— 100% Artesanal</span>
                    <span>— Sabores Auténticos</span>
                    <span>— Envíos a todo Quequén y Necochea</span>
                    <span>— Ingredientes Premium</span>
                    <span>— 100% Artesanal</span>
                    <span>— Sabores Auténticos</span>
                    <span>— Envíos a todo Quequén y Necochea</span>
                    <span>— Ingredientes Premium</span>
                </div>
            </div>

            {/* Sección Editorial 1: Imagen Izquierda - Texto Derecha */}
            <section className="py-16 md:py-32 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                    <div className="relative group order-2 md:order-1">
                        <div className="absolute inset-0 bg-gray-100 rounded-3xl transition-all duration-500 group-hover:rotate-0 group-hover:opacity-0"></div>
                        <img
                            src={img2}
                            alt="Proceso Artesanal"
                            className="relative rounded-3xl shadow-lg w-full object-cover aspect-[4/5] md:aspect-square transform transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-black/20"
                        />
                    </div>
                    <div className="space-y-6 order-1 md:order-2">
                        <div className="flex items-center gap-4 text-gray-400">
                            <span className="h-px w-10 bg-gray-300"></span>
                            <span className="uppercase tracking-widest text-xs font-bold">Nuestra Esencia</span>
                        </div>
                        <h3 className="text-4xl md:text-6xl font-bold tracking-tight leading-none">
                            Calidad <br /> Absoluta.
                        </h3>
                        <p className="text-text-secondary text-lg leading-relaxed max-w-md">
                            No usamos colorantes, ni saborizantes artificiales, ni conservantes. Solo ingredientes reales.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl w-full md:w-auto">
                                <Sparkles className="w-6 h-6 mb-2" />
                                <span className="text-xs font-bold uppercase">100% Natural</span>
                            </div>
                            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl w-full md:w-auto">
                                <DropletOff className="w-6 h-6 mb-2" />
                                <span className="text-xs font-bold uppercase">Sin Aditivos</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección Editorial 2: Texto Izquierda - Imagen Derecha */}
            <section className="py-16 md:py-32 px-6 max-w-7xl mx-auto bg-gray-50 rounded-[2rem] md:rounded-[3rem] my-8 md:my-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                    <div className="space-y-6 md:pl-12">
                        <div className="flex items-center gap-4 text-gray-400">
                            <span className="h-px w-10 bg-gray-300"></span>
                            <span className="uppercase tracking-widest text-xs font-bold">Logística</span>
                        </div>
                        <h3 className="text-4xl md:text-6xl font-bold tracking-tight leading-none">
                            Del Freezer <br /> a tu Puerta.
                        </h3>
                        <p className="text-text-secondary text-lg leading-relaxed max-w-md">
                            Nuestro sistema de delivery propio garantiza que el helado llegue con la temperatura y textura perfecta.
                            Sin cristales de hielo, solo cremosidad.
                        </p>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-white rounded-3xl transform -rotate-2 scale-95 opacity-50"></div>
                        <img
                            src={img3}
                            alt="Delivery de Helado"
                            className="rounded-3xl w-full md:w-4/5 mx-auto drop-shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-black/20"
                        />
                    </div>
                </div>
            </section>

            {/* Galería Visual */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Favoritos de la Casa</h2>
                    <p className="text-gray-500">Una selección de lo que más piden nuestros clientes.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    <div className="group relative overflow-hidden rounded-3xl aspect-[4/5] transition-all duration-500 hover:shadow-2xl hover:shadow-black/20">
                        <img src={img4} alt="Sabor Favorito 1" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white font-bold text-xl">Mascarpone con <br /> Frutos Rojos</p>
                        </div>
                    </div>
                    <div className="hidden lg:flex flex-col justify-center items-center bg-black text-white rounded-3xl p-8 text-center space-y-6 aspect-[4/5]">
                        <h3 className="text-8xl font-black text-zinc-600 hover:text-white hover:scale-105 transition-all duration-600 cursor-default">20+</h3>
                        <p className="text-lg font-bold">Sabores Unicos</p>
                        <Link to="/catalogo" className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition">
                            Ver Catálogo
                        </Link>
                    </div>
                    <div className="group relative overflow-hidden rounded-3xl aspect-[4/5] transition-all duration-500 hover:shadow-2xl hover:shadow-black/20">
                        <img src={img5} alt="Sabor Favorito 2" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white font-bold text-xl">Chocolate Pura Vida</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
