import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Save, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function BillingConfig() {
    const [settings, setSettings] = useState({
        targetPercentage: 0,
        businessName: '',
        cuit: '',
        address: '',
        startActivityDate: '',
        grossIncomeNumber: '',
        salesPoint: 1
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/billing/settings');
            setSettings(res.data);
        } catch (error) {
            console.error("Error fetching billing settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/billing/settings', settings);
            alert("Configuración guardada correctamente");
        } catch (error) {
            console.error("Error saving settings", error);
            alert("Error al guardar configuración");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Cargando configuración...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-black text-[#2C1B18] mb-8">Configuración de Facturación</h1>

            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-[#2C1B18]/5 border border-gray-100 mb-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="bg-yellow-50 p-3 rounded-full text-yellow-600">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#2C1B18]">Estrategia Fiscal</h2>
                        <p className="text-text-secondary text-sm">Define el porcentaje de ventas que deseas "blanquear" (simulación interna).</p>
                    </div>
                </div>

                <div className="mb-8">
                    <label className="flex justify-between font-bold text-[#2C1B18] mb-4">
                        <span>Porcentaje Objetivo</span>
                        <span className="text-2xl">{settings.targetPercentage}%</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        name="targetPercentage"
                        value={settings.targetPercentage}
                        onChange={handleChange}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2C1B18]"
                    />
                    <div className="flex justify-between text-xs text-text-secondary mt-2 font-medium uppercase tracking-wider">
                        <span>0% (Todo Negro)</span>
                        <span>100% (Todo Blanco)</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="bg-white rounded-3xl p-8 shadow-xl shadow-[#2C1B18]/5 border border-gray-100">
                <div className="flex items-start gap-4 mb-8">
                    <div className="bg-green-50 p-3 rounded-full text-green-600">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#2C1B18]">Datos del Emisor</h2>
                        <p className="text-text-secondary text-sm">Información que aparecerá en los tickets simulados.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="group">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Razón Social</label>
                        <input name="businessName" value={settings.businessName || ''} onChange={handleChange} className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 focus:outline-none focus:border-[#2C1B18] rounded-t-lg transition-colors" />
                    </div>
                    <div className="group">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">CUIT</label>
                        <input name="cuit" value={settings.cuit || ''} onChange={handleChange} className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 focus:outline-none focus:border-[#2C1B18] rounded-t-lg transition-colors" />
                    </div>
                    <div className="group md:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Dirección Comercial</label>
                        <input name="address" value={settings.address || ''} onChange={handleChange} className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 focus:outline-none focus:border-[#2C1B18] rounded-t-lg transition-colors" />
                    </div>
                    <div className="group">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">IIBB</label>
                        <input name="grossIncomeNumber" value={settings.grossIncomeNumber || ''} onChange={handleChange} className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 focus:outline-none focus:border-[#2C1B18] rounded-t-lg transition-colors" />
                    </div>
                    <div className="group">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">Punto de Venta</label>
                        <input type="number" name="salesPoint" value={settings.salesPoint || 1} onChange={handleChange} className="w-full bg-gray-50 border-b-2 border-gray-100 px-4 py-3 focus:outline-none focus:border-[#2C1B18] rounded-t-lg transition-colors" />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#2C1B18] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-[#2C1B18]/20"
                    >
                        {saving ? 'Guardando...' : <><Save size={18} /> Guardar Configuración</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
