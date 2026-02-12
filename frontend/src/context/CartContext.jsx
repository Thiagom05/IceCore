import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const [products, setProducts] = useState([]);
    const [gustos, setGustos] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(false);

    const fetchCatalog = async (force = false) => {
        setCatalogLoading(true);
        try {
            const now = Date.now();
            const CACHE_DURATION = 60 * 60 * 1000; // 1 Hora

            // 1. Intentar cargar desde localStorage
            if (!force) {
                const cachedProducts = localStorage.getItem('icecore_products');
                const cachedGustos = localStorage.getItem('icecore_gustos');
                const lastFetch = localStorage.getItem('icecore_catalog_time');

                if (cachedProducts && cachedGustos && lastFetch && (now - parseInt(lastFetch) < CACHE_DURATION)) {
                    console.log("Usando catálogo en caché ⚡");
                    setProducts(JSON.parse(cachedProducts));
                    setGustos(JSON.parse(cachedGustos));
                    setCatalogLoading(false);
                    return;
                }
            }

            // 2. Si no hay caché o expiró, buscar en API
            console.log("Fetching catálogo fresco from API 🌐");
            const [tiposRes, gustosRes] = await Promise.all([
                import('../lib/api').then(module => module.default.get('/tipos-producto')),
                import('../lib/api').then(module => module.default.get('/gustos/activos'))
            ]);

            setProducts(tiposRes.data);
            setGustos(gustosRes.data);

            // 3. Guardar en localStorage
            localStorage.setItem('icecore_products', JSON.stringify(tiposRes.data));
            localStorage.setItem('icecore_gustos', JSON.stringify(gustosRes.data));
            localStorage.setItem('icecore_catalog_time', now.toString());

        } catch (error) {
            console.error("Error fetching catalog:", error);
            // Fallback a caché vencido si falla la red?
        } finally {
            setCatalogLoading(false);
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
