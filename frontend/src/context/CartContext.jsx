import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultProducts, defaultGustos } from '../data/defaultCatalog';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    // Inicializar state desde localStorage si existe
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('icecore_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Error parsing cart from localStorage", error);
            return [];
        }
    });

    // Guardar en localStorage cada vez que el carrito cambie
    useEffect(() => {
        localStorage.setItem('icecore_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item) => {
        // item structure: { id, product, gustos, price, quantity }
        // Generamos un ID único para el item en el carrito (timestamp + random)
        const newItem = {
            ...item,
            cartId: Date.now() + Math.random().toString(36).substr(2, 9)
        };
        setCart([...cart, newItem]);
    };

    const removeFromCart = (cartId) => {
        setCart(cart.filter(item => item.cartId !== cartId));
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    const cartCount = cart.length;

    // --- CATALOGO CACHEADO ---
    // Inicializamos con el catálogo estático para "Zero Latency"
    const [products, setProducts] = useState(defaultProducts);
    const [gustos, setGustos] = useState(defaultGustos);
    const [catalogLoading, setCatalogLoading] = useState(false); // Ya no cargamos, mostramos lo estático de una

    const fetchCatalog = async (force = false) => {
        // No ponemos setLoading(true) para no bloquear la UI con spinners.
        // La actualización ocurre en "segundo plano" (background revalidation).
        try {
            const now = Date.now();
            const CACHE_DURATION = 60 * 60 * 1000; // 1 Hora

            // 1. Intentar cargar desde localStorage (Mejor que estático si existe)
            if (!force) {
                const cachedProducts = localStorage.getItem('icecore_products');
                const cachedGustos = localStorage.getItem('icecore_gustos');
                const lastFetch = localStorage.getItem('icecore_catalog_time');

                if (cachedProducts && cachedGustos && lastFetch && (now - parseInt(lastFetch) < CACHE_DURATION)) {
                    console.log("Usando catálogo en caché (Local Storage) ⚡");
                    setProducts(JSON.parse(cachedProducts));
                    setGustos(JSON.parse(cachedGustos));
                    return;
                }
            }

            // 2. Si no hay caché válido, buscamos en la API (Second plane update)
            console.log("Actualizando catálogo desde API (Background) 🌐");
            const [tiposRes, gustosRes] = await Promise.all([
                import('../lib/api').then(module => module.default.get('/tipos-producto')),
                import('../lib/api').then(module => module.default.get('/gustos/activos'))
            ]);

            // Solo actualizamos si hay datos reales
            if (tiposRes.data && tiposRes.data.length > 0) setProducts(tiposRes.data);
            if (gustosRes.data && gustosRes.data.length > 0) setGustos(gustosRes.data);

            // 3. Guardar en localStorage
            localStorage.setItem('icecore_products', JSON.stringify(tiposRes.data));
            localStorage.setItem('icecore_gustos', JSON.stringify(gustosRes.data));
            localStorage.setItem('icecore_catalog_time', now.toString());

        } catch (error) {
            console.warn("No se pudo actualizar el catálogo con el backend. Usando versión estática/caché.", error);
            // No hacemos nada, el usuario sigue viendo los datos estáticos/viejos que son mejores que nada.
        }
    };

    // Auto-fetch al montar el provider (una sola vez por sesion de app)
    useEffect(() => {
        fetchCatalog();
    }, []);


    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            cartTotal,
            cartCount,
            products,
            gustos,
            catalogLoading,
            fetchCatalog // Exponer para recargar manual si se desea
        }}>
            {children}
        </CartContext.Provider>
    );
};
