import { useState, useEffect } from 'react';

// Horarios por defecto (si la API no responde)
const DEFAULT_HOURS = {
    aperturaT1: 660,       // 11:00 en minutos
    cierreT1: 900,         // 15:00
    aperturaT2: 1200,      // 20:00
    cierreT2: 1440,        // 00:00 (medianoche)
    intervaloMinutos: 30,  // Slots cada 30 min
};

// Convierte minutos desde medianoche a "HH:MM"
const minutesToTime = (mins) => {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// Genera todos los slots de un turno dado inicio y fin
const generateSlots = (start, end, interval) => {
    const slots = [];
    for (let m = start; m < end; m += interval) {
        slots.push(m);
    }
    return slots;
};

// Formatea un slot como texto legible para el usuario
const formatSlot = (dateLabel, minutes) => {
    return `${dateLabel} a las ${minutesToTime(minutes)}`;
};

export function useBusinessHours() {
    const [hours, setHours] = useState(DEFAULT_HOURS);
    const [isOpen, setIsOpen] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [nextSlotLabel, setNextSlotLabel] = useState('');

    useEffect(() => {
        // Cargar horarios desde el backend
        import('../lib/api').then(module => {
            module.default.get('/business-hours')
                .then(res => setHours(res.data))
                .catch(() => { /* usa defaults */ });
        });
    }, []);

    useEffect(() => {
        computeSlots();
        // Recalcular cada minuto para mantener la info actualizada
        const interval = setInterval(computeSlots, 60_000);
        return () => clearInterval(interval);
    }, [hours]);

    const computeSlots = () => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const { aperturaT1, cierreT1, aperturaT2, cierreT2, intervaloMinutos } = hours;

        // Determinar si está abierto ahora
        const openNow =
            (currentMinutes >= aperturaT1 && currentMinutes < cierreT1) ||
            (currentMinutes >= aperturaT2 && currentMinutes < cierreT2);
        setIsOpen(openNow);

        // Construir lista de slots disponibles (hoy y mañana)
        const slots = [];

        // ── Turno 1 hoy ──
        const t1Today = generateSlots(aperturaT1, cierreT1, intervaloMinutos);
        t1Today.forEach(m => {
            if (m > currentMinutes) {
                slots.push({ label: formatSlot('Hoy', m), value: formatSlot('Hoy', m) });
            }
        });

        // ── Turno 2 hoy ──
        const t2Today = generateSlots(aperturaT2, cierreT2, intervaloMinutos);
        t2Today.forEach(m => {
            // Para medianche (1440) comparamos con normalización
            const mNormalized = m % 1440;
            if (mNormalized > currentMinutes || m === 1440) {
                slots.push({ label: formatSlot('Hoy', m % 1440), value: formatSlot('Hoy', m % 1440) });
            }
        });

        // ── Turno 1 mañana ──
        const t1Tomorrow = generateSlots(aperturaT1, cierreT1, intervaloMinutos);
        t1Tomorrow.forEach(m => {
            slots.push({ label: formatSlot('Mañana', m), value: formatSlot('Mañana', m) });
        });

        // ── Turno 2 mañana ──
        const t2Tomorrow = generateSlots(aperturaT2, cierreT2, intervaloMinutos);
        t2Tomorrow.forEach(m => {
            slots.push({ label: formatSlot('Mañana', m % 1440), value: formatSlot('Mañana', m % 1440) });
        });

        setAvailableSlots(slots);

        // Próximo slot disponible (para pre-seleccionar cuando está cerrado)
        if (slots.length > 0) {
            setNextSlotLabel(slots[0].label);
        }
    };

    // Info del próximo turno (para el banner de cerrado)
    const getNextOpeningInfo = () => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const { aperturaT1, aperturaT2 } = hours;

        if (currentMinutes < aperturaT1) return `Hoy a las ${minutesToTime(aperturaT1)}`;
        if (currentMinutes < aperturaT2) return `Hoy a las ${minutesToTime(aperturaT2)}`;
        return `Mañana a las ${minutesToTime(aperturaT1)}`;
    };

    return { isOpen, availableSlots, nextSlotLabel, hours, getNextOpeningInfo, minutesToTime };
}
