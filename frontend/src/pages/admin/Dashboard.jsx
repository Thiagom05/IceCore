import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { LogOut, Plus, Search, CheckCircle, XCircle, Edit2, IceCream, Package, ShoppingBag, Truck, Calendar, Clock, DollarSign, User, MapPin } from 'lucide-react';
import GustoFormModal from './GustoFormModal';
import ProductFormModal from './ProductFormModal';

export default function Dashboard() {
    const { logout, user } = useAuth();

    // Data State
    const [gustos, setGustos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [pedidos, setPedidos] = useState([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('gustos'); // 'gustos' | 'productos' | 'pedidos'
    const [viewMode, setViewMode] = useState('today'); // 'today' | 'history'

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGusto, setCurrentGusto] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    const REPARTIDORES = ["Luis", "Claudio", "Matias"];

    useEffect(() => {
        fetchData();
        // Polling para pedidos nuevos cada 30 seg
        const interval = setInterval(() => {
            if (activeTab === 'pedidos') fetchPedidos();
        }, 10000);
        return () => clearInterval(interval);
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([fetchGustos(), fetchProductos(), fetchPedidos()]);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGustos = async () => {
        const res = await api.get('/gustos');
        setGustos(res.data.sort((a, b) => {
            if (a.hayStock === b.hayStock) return a.nombre.localeCompare(b.nombre);
            return a.hayStock ? 1 : -1;
        }));
    };

    const fetchProductos = async () => {
        const res = await api.get('/tipos-producto');
        setProductos(res.data.sort((a, b) => a.precio - b.precio));
    };


    // Helper para agrupar pedidos por fecha
    const groupPedidosByDate = (pedidosList) => {
        const grouped = pedidosList.reduce((acc, pedido) => {
            const date = new Date(pedido.fecha).toLocaleDateString('es-AR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(pedido);
            return acc;
        }, {});
        return grouped;
    };

    // Filtrar pedidos según el modo de vista
    const getFilteredPedidos = () => {
        const today = new Date().toLocaleDateString('es-AR');

        if (viewMode === 'today') {
            return pedidos.filter(p => new Date(p.fecha).toLocaleDateString('es-AR') === today);
        } else {
            // En historial mostramos TODOS (o podríamos excluir los de hoy, pero mostrar todos es mejor para "ver todo")
            return pedidos;
        }
    };

    const fetchPedidos = async () => {
        try {
            const res = await api.get('/pedidos');
            // Ordenar por ID descendente (más recientes primero) que es equivalente a fecha
            setPedidos(res.data.sort((a, b) => b.id - a.id));
        } catch (error) {
            console.error("Error fetching pedidos:", error);
        }
    };

    // --- LOGICA GUSTOS ---
    const handleCreateGusto = () => { setCurrentGusto(null); setIsModalOpen(true); };
    const handleEditGusto = (gusto) => { setCurrentGusto(gusto); setIsModalOpen(true); };

    const toggleStock = async (id) => {
        try {
            setGustos(gustos.map(g => g.id === id ? { ...g, hayStock: !g.hayStock } : g));
            await api.put(`/gustos/${id}/stock`);
        } catch (error) {
            console.error("Error cambiando stock:", error);
            fetchGustos();
        }
    };

    const toggleActive = async (id) => {
        try {
            setGustos(gustos.map(g => g.id === id ? { ...g, activo: !g.activo } : g));
            await api.put(`/gustos/${id}/toggle`);
        } catch (error) {
            console.error("Error cambiando visibilidad:", error);
            fetchGustos();
        }
    };

    // --- LOGICA PRODUCTOS ---
    const handleCreateProduct = () => { setCurrentProduct(null); setIsProductModalOpen(true); };
    const handleEditProduct = (prod) => { setCurrentProduct(prod); setIsProductModalOpen(true); };

    // --- LOGICA PEDIDOS ---
    const handleStatusChange = async (pedidoId, newStatus) => {
        try {
            // Optimistic update
            setPedidos(pedidos.map(p => p.id === pedidoId ? { ...p, estado: newStatus } : p));
            await api.patch(`/pedidos/${pedidoId}/estado`, null, { params: { estado: newStatus } });
        } catch (error) {
            console.error("Error actualizando estado:", error);
            fetchPedidos();
        }
    };

    const handleRepartidorChange = async (pedidoId, nuevoRepartidor) => {
        try {
            // Actualización optimista (para que se vea instantáneo en pantalla)
            setPedidos(pedidos.map(p => p.id === pedidoId ? { ...p, repartidor: nuevoRepartidor } : p));

            // Llamada al backend
            await api.patch(`/pedidos/${pedidoId}/repartidor`, null, {
                params: { nombre: nuevoRepartidor }
            });
        } catch (error) {
            console.error("Error asignando repartidor:", error);
            fetchPedidos(); // Si falla, recargamos para ver el dato real
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            'PENDIENTE': 'bg-yellow-50 text-yellow-700 border-yellow-200',
            'EN_PREPARACION': 'bg-blue-50 text-blue-700 border-blue-200',
            'LISTO': 'bg-purple-50 text-purple-700 border-purple-200',
            'ENTREGADO': 'bg-green-50 text-green-700 border-green-200',
            'CANCELADO': 'bg-red-50 text-red-700 border-red-200',
        };
        const labels = {
            'PENDIENTE': 'Pendiente',
            'EN_PREPARACION': 'Preparando',
            'LISTO': 'Listo',
            'ENTREGADO': 'Entregado',
            'CANCELADO': 'Cancelado',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const filteredGustos = gustos.filter(g =>
        g.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const TabButton = ({ id, icon: Icon, label, liveCount }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`
                flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300
                ${activeTab === id
                    ? 'bg-[#2C1B18] text-white shadow-lg shadow-[#2C1B18]/20 translate-y-[-1px]'
                    : 'bg-white text-text-secondary hover:bg-gray-50 hover:text-[#2C1B18]'}
            `}
        >
            <Icon size={18} /> {label}
            {liveCount && <span className="ml-1 flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>}
        </button>
    );

    return (
        <div className="min-h-screen bg-bg-primary font-sans text-text-primary">
            <GustoFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                gustoToEdit={currentGusto}
                onSave={fetchGustos}
            />
            <ProductFormModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                productToEdit={currentProduct}
                onSave={fetchProductos}
            />

            {/* Navbar Minimalista */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#2C1B18] text-white rounded-full flex items-center justify-center font-bold shadow-md shadow-[#2C1B18]/10">PV</div>
                            <div>
                                <h1 className="text-lg font-black text-[#2C1B18] tracking-tight">Admin Panel</h1>
                                <p className="text-[10px] text-text-secondary font-medium uppercase tracking-widest">Pura Vida</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                            <LogOut size={16} /> Salir
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-10 px-6">

                {/* Tabs Navigation */}
                <div className="flex flex-wrap gap-4 mb-10 justify-center">
                    <TabButton id="gustos" icon={IceCream} label="Sabores" />
                    <TabButton id="productos" icon={Package} label="Productos" />
                    <TabButton id="pedidos" icon={ShoppingBag} label="Pedidos" liveCount={activeTab !== 'pedidos'} />
                </div>

                {/* CONTENIDO TAB GUSTOS */}
                {activeTab === 'gustos' && (
                    <div className="animate-fade-in-up">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <h2 className="text-3xl font-bold text-[#2C1B18]">Inventario</h2>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <div className="relative flex-grow sm:flex-grow-0 group">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#2C1B18] transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-3 border-none bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-[#2C1B18]/10 w-full text-sm font-medium"
                                    />
                                </div>
                                <button onClick={handleCreateGusto} className="bg-[#2C1B18] hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#2C1B18]/20 flex items-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer">
                                    <Plus size={18} /> Nuevo Sabor
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl shadow-[#2C1B18]/5 overflow-hidden border border-gray-100">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-8 py-5 text-left text-[10px] font-bold text-text-secondary uppercase tracking-widest">Sabor</th>
                                            <th className="px-8 py-5 text-left text-[10px] font-bold text-text-secondary uppercase tracking-widest">Categoría</th>
                                            <th className="px-8 py-5 text-center text-[10px] font-bold text-text-secondary uppercase tracking-widest">Estado Stock</th>
                                            <th className="px-8 py-5 text-center text-[10px] font-bold text-text-secondary uppercase tracking-widest">Visibilidad</th>
                                            <th className="px-8 py-5 text-right text-[10px] font-bold text-text-secondary uppercase tracking-widest">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredGustos.map((gusto) => (
                                            <tr key={gusto.id} className="hover:bg-gray-50/50 transition duration-150">
                                                <td className="px-8 py-6">
                                                    <div className="text-sm font-bold text-[#2C1B18]">{gusto.nombre}</div>
                                                    <div className="text-xs text-text-secondary mt-1">{gusto.descripcion}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full bg-orange-50 text-orange-800 border border-orange-100">
                                                        {gusto.categoria}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <button
                                                        onClick={() => toggleStock(gusto.id)}
                                                        className={`px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider transition-all border ${gusto.hayStock ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'} cursor-pointer`}
                                                    >
                                                        {gusto.hayStock ? 'En Stock' : 'Agotado'}
                                                    </button>
                                                </td>
                                                <td className="px-8 py-6 text-center cursor-pointer" onClick={() => toggleActive(gusto.id)}>
                                                    <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center transition-colors ${gusto.activo ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                        {gusto.activo ? <CheckCircle size={18} /> : <XCircle size={18} />}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button onClick={() => handleEditGusto(gusto)} className="text-text-secondary hover:text-[#2C1B18] transition p-2 rounded-full hover:bg-gray-100 inline-flex cursor-pointer">
                                                        <Edit2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENIDO TAB PRODUCTOS */}
                {activeTab === 'productos' && (
                    <div className="animate-fade-in-up">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <h2 className="text-3xl font-bold text-[#2C1B18]">Precios y Formatos</h2>
                            <button onClick={handleCreateProduct} className="bg-[#2C1B18] hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#2C1B18]/20 flex items-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer">
                                <Plus size={18} /> Nuevo Producto
                            </button>
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl shadow-[#2C1B18]/5 overflow-hidden border border-gray-100">
                            <table className="min-w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-[10px] font-bold text-text-secondary uppercase tracking-widest">Producto</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-bold text-text-secondary uppercase tracking-widest">Tipo</th>
                                        <th className="px-8 py-5 text-left text-[10px] font-bold text-text-secondary uppercase tracking-widest">Límite Gustos</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-bold text-text-secondary uppercase tracking-widest">Precio</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-bold text-text-secondary uppercase tracking-widest">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {productos.map((prod) => (
                                        <tr key={prod.id} className="hover:bg-gray-50/50 transition">
                                            <td className="px-8 py-6 text-sm font-bold text-[#2C1B18]">{prod.nombre}</td>
                                            <td className="px-8 py-6 text-sm text-text-secondary">{prod.esPorPeso ? 'Por Peso' : 'Unidad'}</td>
                                            <td className="px-8 py-6 text-sm text-text-secondary pl-12">{prod.maxGustos > 0 ? prod.maxGustos : 'N/A'}</td>
                                            <td className="px-8 py-6 text-right text-sm font-black text-[#2C1B18]">${prod.precio.toLocaleString()}</td>
                                            <td className="px-8 py-6 text-right">
                                                <button onClick={() => handleEditProduct(prod)} className="text-text-secondary hover:text-[#2C1B18] transition p-2 rounded-full hover:bg-gray-100 inline-flex group cursor-pointer">
                                                    <Edit2 size={16} className="group-hover:scale-110 transition-transform" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CONTENIDO TAB PEDIDOS */}
                {activeTab === 'pedidos' && (
                    <div className="animate-fade-in-up">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                                <button
                                    onClick={() => setViewMode('today')}
                                    className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${viewMode === 'today' ? 'bg-[#2C1B18] text-white shadow-md' : 'text-text-secondary hover:bg-gray-50'}`}
                                >
                                    Hoy
                                </button>
                                <button
                                    onClick={() => setViewMode('history')}
                                    className={`px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${viewMode === 'history' ? 'bg-[#2C1B18] text-white shadow-md' : 'text-text-secondary hover:bg-gray-50'}`}
                                >
                                    Historial
                                </button>
                            </div>
                            <button onClick={fetchPedidos} className="text-xs font-bold uppercase tracking-wider text-[#2C1B18] hover:underline flex items-center gap-2">
                                <Clock size={14} /> Actualizar
                            </button>
                        </div>

                        <div className="space-y-12">
                            {getFilteredPedidos().length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                    <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-text-secondary font-medium">No hay pedidos para mostrar.</p>
                                </div>
                            ) : (
                                Object.entries(groupPedidosByDate(getFilteredPedidos())).map(([fecha, pedidosDelDia]) => (
                                    <div key={fecha}>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-px bg-gray-200 flex-grow"></div>
                                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary bg-white px-4 py-1 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
                                                <Calendar size={12} /> {fecha}
                                            </span>
                                            <div className="h-px bg-gray-200 flex-grow"></div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {pedidosDelDia.map((pedido) => (
                                                <div key={pedido.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xl shadow-[#2C1B18]/5 group hover:border-[#2C1B18]/20 transition-all duration-300">
                                                    <div className="flex justify-between items-start mb-6 border-b border-gray-50 pb-4">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xl font-black text-[#2C1B18]">#{pedido.id}</span>
                                                                <StatusBadge status={pedido.estado} />
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
                                                                <Clock size={12} />
                                                                {new Date(pedido.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="flex items-center justify-end gap-1 text-[#2C1B18] font-black text-xl">
                                                                <span className="text-xs text-text-secondary font-medium mr-1">Total</span>
                                                                ${pedido.precioTotal.toLocaleString()}
                                                            </div>
                                                            <div className="text-[10px] font-bold uppercase tracking-wider text-text-secondary bg-gray-50 px-2 py-0.5 rounded inline-block mt-1">
                                                                {pedido.metodoPago}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 mb-6">
                                                        <div className="flex items-start gap-3">
                                                            <User size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-sm">{pedido.nombreCliente} {pedido.apellidoCliente}</p>
                                                                <p className="text-xs text-gray-500">{pedido.telefono}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <MapPin size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                                                            <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-400">{pedido.direccion}</p>
                                                        </div>
                                                    </div>

                                                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                                        <ul className="space-y-3">
                                                            {pedido.items.map((item, idx) => (
                                                                <li key={idx} className="text-sm">
                                                                    <div className="flex justify-between items-baseline mb-1">
                                                                        <span className="font-bold text-[#2C1B18]">{item.cantidad}x {item.tipoProducto.nombre}</span>
                                                                    </div>
                                                                    {item.gustos.length > 0 && (
                                                                        <p className="text-xs text-text-secondary leading-relaxed pl-4 border-l-2 border-gray-200">
                                                                            {item.gustos.map(g => g.nombre).join(', ')}
                                                                        </p>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1 block">Estado</label>
                                                            <select
                                                                value={pedido.estado}
                                                                onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
                                                                className="w-full text-xs font-medium border-gray-200 rounded-lg focus:ring-[#2C1B18] focus:border-[#2C1B18] bg-white py-2"
                                                            >
                                                                <option value="PENDIENTE">PENDIENTE</option>
                                                                <option value="EN_PREPARACION">EN PREPARACIÓN</option>
                                                                <option value="LISTO">LISTO</option>
                                                                <option value="ENTREGADO">ENTREGADO</option>
                                                                <option value="CANCELADO">CANCELADO</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1 block">Repartidor</label>
                                                            <div className="relative">
                                                                <select
                                                                    value={pedido.repartidor || ""}
                                                                    onChange={(e) => handleRepartidorChange(pedido.id, e.target.value)}
                                                                    className={`w-full text-xs font-medium border-gray-200 rounded-lg focus:ring-[#2C1B18] focus:border-[#2C1B18] py-2 pl-8 appearance-none
                                                                        ${pedido.repartidor ? 'bg-green-50 text-green-800 border-green-200' : 'bg-white text-gray-500'}
                                                                    `}
                                                                >
                                                                    <option value="">Sin Asignar</option>
                                                                    {REPARTIDORES.map((repa) => (
                                                                        <option key={repa} value={repa}>{repa}</option>
                                                                    ))}
                                                                </select>
                                                                <Truck className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 ${pedido.repartidor ? 'text-green-600' : 'text-gray-400'}`} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
