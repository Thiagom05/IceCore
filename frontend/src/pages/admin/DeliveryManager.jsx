import React, { useState, useEffect } from 'react';
import { User, Phone, Trash2, Plus, DollarSign, RefreshCw, Truck, XCircle, CheckCircle } from 'lucide-react';
import api from '../../lib/api';

import { useUI } from '../../context/UIContext';

export default function DeliveryManager() {
    const { showError } = useUI();
    const [repartidores, setRepartidores] = useState([]);
    const [caja, setCaja] = useState({ repartidores: [] });
    const [loading, setLoading] = useState(true);
    const [newRepartidor, setNewRepartidor] = useState({ nombre: '', telefono: '' });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, cajaRes] = await Promise.all([
                api.get('/repartidores'),
                api.get('/repartidores/caja')
            ]);
            setRepartidores(usersRes.data);
            setCaja(cajaRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newRepartidor.nombre) return;
        try {
            await api.post('/repartidores', newRepartidor);
            setNewRepartidor({ nombre: '', telefono: '' });
            setShowForm(false);
            fetchData();
        } catch (error) {
            console.error("Error creating repartidor:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este repartidor?")) return;
        try {
            await api.delete(`/repartidores/${id}`);
            fetchData();
        } catch (error) {
            console.error("Error deleting repartidor:", error);
        }
    };

    // --- LOGICA VUELTAS (ROUNDS) ---
    const [activeRounds, setActiveRounds] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [selectedRepartidorForRound, setSelectedRepartidorForRound] = useState('');
    const [showRoundModal, setShowRoundModal] = useState(false);

    useEffect(() => {
        fetchData();
        fetchRoundsData();
    }, []);

    const fetchRoundsData = async () => {
        try {
            const [roundsRes, ordersRes] = await Promise.all([
                api.get('/repartidores/rounds/active'),
                api.get('/pedidos') // TODO: Filter by pending/ready in backend for efficiency
            ]);
            setActiveRounds(roundsRes.data);
            // Filtrar pedidos que esten LISTO o PENDIENTE y SIN repartidor asignado (o con repartidor pero sin ronda)
            // Simplificacion: Pedidos con estado PENDIENTE/LISTO
            const eligible = ordersRes.data.filter(p =>
                (p.estado === 'PENDIENTE' || p.estado === 'LISTO') && !p.deliveryRound
            );
            setPendingOrders(eligible);
        } catch (error) {
            console.error("Error rounds data:", error);
        }
    };

    const handleCreateRound = async () => {
        if (!selectedRepartidorForRound || selectedOrders.length === 0) return;

        try {
            await api.post('/repartidores/rounds', {
                repartidorId: selectedRepartidorForRound,
                pedidoIds: selectedOrders
            });
            setShowRoundModal(false);
            setSelectedOrders([]);
            setSelectedRepartidorForRound('');
            fetchData();
            fetchRoundsData();
        } catch (error) {
            console.error("Error creating round:", error);
            showError("Error al crear la hoja de ruta");
        }
    };

    const handleToggleOrder = (id) => {
        if (selectedOrders.includes(id)) {
            setSelectedOrders(selectedOrders.filter(pid => pid !== id));
        } else {
            setSelectedOrders([...selectedOrders, id]);
        }
    };

    const handleFinishRound = async (roundId) => {
        if (!window.confirm("¿Finalizar esta vuelta?")) return;
        try {
            await api.put(`/repartidores/rounds/${roundId}/finish`);
            fetchRoundsData();
            fetchData(); // Actualizar caja
        } catch (error) {
            console.error("Error finishing round:", error);
        }
    };

    // Helper para encontrar la deuda de un repartidor específico
    const getDeuda = (id) => {
        const data = caja.repartidores?.find(r => r.id === id);
        return data ? data.totalDeuda : 0;
    };

    const getPedidosPendientes = (id) => {
        const data = caja.repartidores?.find(r => r.id === id);
        return data ? data.cantidadPedidos : 0;
    };

    return (
        <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-[#2C1B18] flex items-center gap-2">
                    <User className="w-6 h-6" />
                    Gestión de Repartidores
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-[#2C1B18] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-black transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="mb-6 bg-gray-50 p-4 rounded-2xl animate-fade-in-down">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Nombre"
                            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#2C1B18]"
                            value={newRepartidor.nombre}
                            onChange={e => setNewRepartidor({ ...newRepartidor, nombre: e.target.value })}
                            autoFocus
                        />
                        <input
                            type="text"
                            placeholder="Teléfono"
                            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-[#2C1B18]"
                            value={newRepartidor.telefono}
                            onChange={e => setNewRepartidor({ ...newRepartidor, telefono: e.target.value })}
                        />
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700">
                            Guardar
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-4 text-gray-400">Cargando...</div>
                ) : repartidores.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                        No hay repartidores registrados
                    </div>
                ) : (
                    repartidores.map(rep => (
                        <div key={rep.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#2C1B18]/10 text-[#2C1B18] flex items-center justify-center font-bold">
                                    {rep.nombre.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#2C1B18]">{rep.nombre}</h3>
                                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                                        <Phone className="w-3 h-3" />
                                        {rep.telefono || "Sin teléfono"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* CAJA DEL REPARTIDOR */}
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Caja a Rendir</div>
                                    <div className={`font-black text-lg flex items-center justify-end gap-1 ${getDeuda(rep.id) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                        <DollarSign className="w-4 h-4" />
                                        {getDeuda(rep.id).toLocaleString('es-AR')}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-medium">
                                        {getPedidosPendientes(rep.id)} pedidos en efectivo
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(rep.id)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                    title="Eliminar Repartidor"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                <button onClick={fetchData} className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-[#2C1B18]">
                    <RefreshCw className="w-3 h-3" /> Actualizar Caja
                </button>
            </div>

            {/* SECCION HOJAS DE RUTA */}
            <div className="mt-8 border-t border-gray-100 pt-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-[#2C1B18] flex items-center gap-2">
                        <Truck className="w-6 h-6" />
                        Salidas Activas (Vueltas)
                    </h2>
                    <button
                        onClick={() => setShowRoundModal(true)}
                        className="bg-[#2C1B18] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-lg shadow-[#2C1B18]/20"
                    >
                        Armar Salida
                    </button>
                </div>

                {activeRounds.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                        No hay repartidores en calle actualmente.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeRounds.map(round => (
                            <div key={round.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Repartidor</span>
                                        <h3 className="text-lg font-black text-[#2C1B18]">{round.repartidor.nombre}</h3>
                                        <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full mt-1 inline-block">EN CALLE</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">Caja a Rendir</span>
                                        <div className="text-xl font-black text-[#2C1B18]">${round.cashToRender.toLocaleString()}</div>
                                        <div className="text-xs text-gray-400">Total valor: ${round.totalAmount.toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pedidos en esta vuelta:</div>
                                    {/* Lista de pedidos simplificada, idealmente vendria del backend populada */}
                                    {/* Por ahora solo mostramos cantidad y hora */}
                                    <div className="text-sm text-gray-600">
                                        Salida: {new Date(round.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleFinishRound(round.id)}
                                    className="w-full py-2 bg-green-100 text-green-700 font-bold rounded-xl hover:bg-green-200 transition-colors text-sm"
                                >
                                    Finalizar Vuelta (Rendir Caja)
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL ARMAR SALIDA */}
            {
                showRoundModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-xl font-black text-[#2C1B18]">Armar Nueva Salida</h3>
                                <button onClick={() => setShowRoundModal(false)} className="text-gray-400 hover:text-black">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                {/* Seleccionar Repartidor */}
                                <div className="mb-6">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">1. Seleccionar Repartidor</label>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {repartidores.map(rep => (
                                            <button
                                                key={rep.id}
                                                onClick={() => setSelectedRepartidorForRound(rep.id)}
                                                className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${selectedRepartidorForRound === rep.id
                                                    ? 'border-[#2C1B18] bg-[#2C1B18] text-white shadow-lg'
                                                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                    }`}
                                            >
                                                <User size={16} />
                                                <span className="font-bold">{rep.nombre}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Seleccionar Pedidos */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">2. Seleccionar Pedidos ({selectedOrders.length})</label>
                                    {pendingOrders.length === 0 ? (
                                        <div className="text-gray-400 text-sm italic">No hay pedidos pendientes para asignar.</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {pendingOrders.map(pedido => (
                                                <div
                                                    key={pedido.id}
                                                    onClick={() => handleToggleOrder(pedido.id)}
                                                    className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${selectedOrders.includes(pedido.id)
                                                        ? 'border-[#2C1B18] bg-[#2C1B18]/5'
                                                        : 'border-gray-100 hover:border-gray-200'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedOrders.includes(pedido.id) ? 'bg-[#2C1B18] border-[#2C1B18]' : 'border-gray-300'}`}>
                                                            {selectedOrders.includes(pedido.id) && <CheckCircle size={12} className="text-white" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[#2C1B18]">Internal #{pedido.id} - {pedido.nombreCliente}</div>
                                                            <div className="text-xs text-gray-500">{pedido.direccion}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold">${pedido.precioTotal.toLocaleString()}</div>
                                                        <div className="text-[10px] uppercase text-gray-400">{pedido.metodoPago}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button onClick={() => setShowRoundModal(false)} className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-100">Cancelar</button>
                                <button
                                    onClick={handleCreateRound}
                                    disabled={!selectedRepartidorForRound || selectedOrders.length === 0}
                                    className="px-8 py-3 rounded-xl bg-[#2C1B18] text-white font-bold shadow-lg shadow-[#2C1B18]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition-all"
                                >
                                    Confirmar Salida
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
