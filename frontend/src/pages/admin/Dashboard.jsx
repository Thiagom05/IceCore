import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { LogOut, Plus, Search, CheckCircle, XCircle, Edit2, IceCream, Package, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
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
            'PENDIENTE': 'bg-yellow-100 text-yellow-800',
            'EN_PREPARACION': 'bg-blue-100 text-blue-800',
            'LISTO': 'bg-purple-100 text-purple-800',
            'ENTREGADO': 'bg-green-100 text-green-800',
            'CANCELADO': 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status ? status.replace('_', ' ') : 'UNKNOWN'}
            </span>
        );
    };

    // --- RENDER ---
    const filteredGustos = gustos.filter(g =>
        g.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* Modales */}
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

            {/* Navbar */}
            <nav className="bg-white shadow-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary-600 text-white p-2 rounded-lg font-bold">PV</div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Panel de Control</h1>
                                <p className="text-xs text-gray-500">Hola, {user?.username || 'Admin'}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                                <LogOut size={18} /> Salir
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 sm:gap-4 mb-6 px-4 sm:px-0">
                    <button onClick={() => setActiveTab('gustos')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${activeTab === 'gustos' ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                        <IceCream size={20} /> Sabores
                    </button>
                    <button onClick={() => setActiveTab('productos')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${activeTab === 'productos' ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                        <Package size={20} /> Productos
                    </button>
                    <button onClick={() => setActiveTab('pedidos')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${activeTab === 'pedidos' ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                        <ShoppingBag size={20} /> Pedidos
                        {activeTab !== 'pedidos' && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">Live</span>}
                    </button>
                </div>

                {/* CONTENIDO TAB GUSTOS */}
                {activeTab === 'gustos' && (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 px-4 sm:px-0">
                            <h2 className="text-2xl font-bold text-gray-800">Inventario de Sabores</h2>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <div className="relative flex-grow sm:flex-grow-0">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="text" placeholder="Buscar sabor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 w-full" />
                                </div>
                                <button onClick={handleCreateGusto} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition">
                                    <Plus size={20} /> Nuevo
                                </button>
                            </div>
                        </div>

                        <div className="bg-white shadow rounded-xl overflow-hidden mx-4 sm:mx-0">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Visible</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredGustos.map((gusto) => (
                                            <tr key={gusto.id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">{gusto.nombre}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{gusto.descripcion}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-800">{gusto.categoria}</span></td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button onClick={() => toggleStock(gusto.id)}
                                                        className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center justify-center gap-1 mx-auto w-28 ${gusto.hayStock ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                                                        {gusto.hayStock ? 'En Stock' : 'AGOTADO'}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center cursor-pointer" onClick={() => toggleActive(gusto.id)}>
                                                    {gusto.activo ? <CheckCircle className="inline text-green-500" size={20} /> : <XCircle className="inline text-gray-300" size={20} />}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleEditGusto(gusto)} className="text-primary-600 hover:text-primary-900 flex items-center gap-1 ml-auto"><Edit2 size={16} /> Editar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* CONTENIDO TAB PRODUCTOS */}
                {activeTab === 'productos' && (
                    <>
                        <div className="flex justify-between items-center mb-6 px-4 sm:px-0">
                            <h2 className="text-2xl font-bold text-gray-800">Precios y Formatos</h2>
                        </div>
                        <div className="bg-white shadow rounded-xl overflow-hidden mx-4 sm:mx-0">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max. Gustos</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {productos.map((prod) => (
                                        <tr key={prod.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{prod.nombre}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prod.esPorPeso ? 'Pote (Por Peso)' : 'Unidad'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prod.maxGustos > 0 ? prod.maxGustos : '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">${prod.precio.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleEditProduct(prod)} className="text-primary-600 hover:text-primary-900 flex items-center gap-1 ml-auto"><Edit2 size={16} /> Modificar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* CONTENIDO TAB PEDIDOS */}
                {activeTab === 'pedidos' && (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 px-4 sm:px-0">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Gestión de Pedidos</h2>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => setViewMode('today')}
                                        className={`px-3 py-1 text-sm rounded-full transition ${viewMode === 'today' ? 'bg-primary-100 text-primary-800 font-bold' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        Pedidos de Hoy
                                    </button>
                                    <button
                                        onClick={() => setViewMode('history')}
                                        className={`px-3 py-1 text-sm rounded-full transition ${viewMode === 'history' ? 'bg-primary-100 text-primary-800 font-bold' : 'bg-gray-100 text-gray-600'}`}
                                    >
                                        Historial Completo
                                    </button>
                                </div>
                            </div>
                            <button onClick={fetchPedidos} className="text-sm text-primary-600 hover:text-primary-800 underline">Actualizar Lista</button>
                        </div>

                        <div className="space-y-8 mx-4 sm:mx-0">
                            {getFilteredPedidos().length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl shadow text-gray-500">
                                    {viewMode === 'today' ? 'No hay pedidos hoy. ' : 'No hay historial de pedidos.'}
                                </div>
                            ) : (
                                Object.entries(groupPedidosByDate(getFilteredPedidos())).map(([fecha, pedidosDelDia]) => (
                                    <div key={fecha} className="border-b last:border-0 pb-6 mb-6 last:mb-0 last:pb-0 border-gray-200">
                                        <div className="flex items-center gap-4 mb-4">
                                            <h3 className="text-lg font-bold text-gray-700 capitalize border-b-2 border-primary-200 pb-1">
                                                {fecha}
                                            </h3>
                                            <span className="bg-primary-100 text-primary-800 text-xs font-bold px-2 py-1 rounded-full">
                                                {pedidosDelDia.length} Pedidos
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            {pedidosDelDia.map((pedido) => (
                                                <div key={pedido.id} className="bg-white shadow rounded-xl p-6 border-l-4 border-primary-500 hover:shadow-lg transition">
                                                    <div className="flex flex-col md:flex-row justify-between gap-4">
                                                        {/* Info Cliente */}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-lg font-bold text-gray-900">#{pedido.id}</span>
                                                                <span className="text-gray-500 text-sm">
                                                                    {new Date(pedido.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                <StatusBadge status={pedido.estado} />
                                                            </div>
                                                            <h3 className="font-bold text-gray-800">{pedido.nombreCliente} {pedido.apellidoCliente}</h3>
                                                            <p className="text-sm text-gray-600">{pedido.direccion}</p>
                                                            <p className="text-sm text-gray-500">{pedido.telefono}</p>
                                                        </div>

                                                        {/* Items */}
                                                        <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 pt-4 md:pt-0">
                                                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Detalle del Pedido</h4>
                                                            <ul className="space-y-2">
                                                                {pedido.items.map((item, idx) => (
                                                                    <li key={idx} className="text-sm text-gray-700">
                                                                        <span className="font-bold text-primary-700">{item.cantidad}x {item.tipoProducto.nombre}</span>
                                                                        <div className="text-xs text-gray-500 ml-4">
                                                                            {item.gustos.map(g => g.nombre).join(', ')}
                                                                        </div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        {/* Total y Acciones */}
                                                        <div className="flex flex-col justify-between items-end min-w-[150px] border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 pt-4 md:pt-0">
                                                            <div className="text-right mb-4">
                                                                <p className="text-xs text-gray-500 uppercase">Total</p>
                                                                <p className="text-2xl font-black text-gray-900">${pedido.precioTotal.toLocaleString()}</p>
                                                                <p className="text-xs font-bold text-gray-500 mt-1">{pedido.metodoPago}</p>
                                                            </div>

                                                            <div className="w-full">
                                                                <label className="text-xs text-gray-400 block mb-1">Cambiar Estado:</label>
                                                                <select
                                                                    value={pedido.estado}
                                                                    onChange={(e) => handleStatusChange(pedido.id, e.target.value)}
                                                                    className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                                                >
                                                                    <option value="PENDIENTE">Pendiente</option>
                                                                    <option value="EN_PREPARACION">En Preparación</option>
                                                                    <option value="LISTO">Listo</option>
                                                                    <option value="ENTREGADO">Entregado</option>
                                                                    <option value="CANCELADO">Cancelado</option>
                                                                </select>
                                                            </div>
                                                            <div className="w-full mt-4 border-t pt-2"> {/* Agregamos un separador y margen */}
                                                                <label className="text-xs text-gray-400 block mb-1">Asignar Repartidor:</label>
                                                                <select
                                                                    value={pedido.repartidor || ""} // Si es null, muestra la opción por defecto
                                                                    onChange={(e) => handleRepartidorChange(pedido.id, e.target.value)}
                                                                    className={`w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 ${pedido.repartidor ? 'bg-green-50 text-green-800 font-bold' : 'bg-gray-50'}`}
                                                                >
                                                                    <option value="">-- Sin asignar --</option>
                                                                    {REPARTIDORES.map((repa) => (
                                                                        <option key={repa} value={repa}>
                                                                            {repa}
                                                                        </option>
                                                                    ))}
                                                                </select>
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
                    </>
                )}

            </div>
        </div>
    );
}
