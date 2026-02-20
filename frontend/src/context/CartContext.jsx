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
                    const parsedProducts = JSON.parse(cachedProducts);
                    const parsedGustos = JSON.parse(cachedGustos);

                    if (parsedProducts.length > 0 && parsedGustos.length > 0) {
                        console.log("Usando catálogo en caché (Local Storage) ⚡");
                        setProducts(parsedProducts);
                        setGustos(parsedGustos);
                        return;
                    }
                }
            }

            // 2. Si no hay caché válido, buscamos en la API (Second plane update)
            console.log("Actualizando catálogo desde API (Background) 🌐");
            const [tiposRes, gustosRes] = await Promise.all([
                import('../lib/api').then(module => module.default.get('/tipos-producto')),
                import('../lib/api').then(module => module.default.get('/gustos/activos'))
            ]);

            // --- LÓGICA DE FUSIÓN INTELIGENTE (SMART MERGE) ---
            // Función para fusionar: Agrega items del default si NO existen en la respuesta de la API (por nombre)
            const smartMerge = (defaultItems, apiItems) => {
                if (!apiItems || apiItems.length === 0) return defaultItems;

                // Normalizamos nombres para comparar (minusculas, trim)
                const apiNames = new Set(apiItems.map(item => item.nombre.toLowerCase().trim()));

                // Filtramos los defaults que NO esten en la API
                const missingDefaults = defaultItems.filter(defItem =>
                    !apiNames.has(defItem.nombre.toLowerCase().trim())
                );

                // Retornamos API primero (prioridad) + Defaults faltantes
                return [...apiItems, ...missingDefaults];
            };

            const mergedProducts = smartMerge(defaultProducts, tiposRes.data);
            const mergedGustos = smartMerge(defaultGustos, gustosRes.data);

            setProducts(mergedProducts);
            setGustos(mergedGustos);

            // 3. Guardar en localStorage lo fusionado (para que la proxima sea rapido con todo)
            localStorage.setItem('icecore_products', JSON.stringify(mergedProducts));
            localStorage.setItem('icecore_gustos', JSON.stringify(mergedGustos));
            localStorage.setItem('icecore_catalog_time', now.toString());

        } catch (error) {
            console.warn("No se pudo actualizar el catálogo con el backend. Usando versión estática/caché.", error);
            // No hacemos nada, el usuario sigue viendo los datos estáticos/viejos que son mejores que nada.
        }
    };

    // Auto-fetch al montar el provider
    useEffect(() => {
        fetchCatalog();
    }, []);

    // Auto-Corrección de IDs del Carrito (Sync Cart with Fresh Catalog)
    // Si el usuario tenía items con IDs viejos (del defaultCatalog) y ahora tenemos IDs nuevos (de la DB),
    // intentamos matchear por NOMBRE y actualizar los IDs en el carrito automáticamente.
    useEffect(() => {
        if (products.length === 0 && gustos.length === 0) return;
        if (cart.length === 0) return;

        let cartUpdated = false;
        const newCart = cart.map(item => {
            let itemChanged = false;

            // 1. Sync Product (Update ID and Price)
            let newProduct = item.product;
            // Try match by ID first
            let matchedProduct = products.find(p => p.id === item.product.id);
            // If not found, try match by Name
            if (!matchedProduct) {
                matchedProduct = products.find(p => p.nombre.toLowerCase().trim() === item.product.nombre.toLowerCase().trim());
                if (matchedProduct) itemChanged = true; // Found by name, ID changed
            } else {
                // Found by ID, check if price changed
                if (matchedProduct.precio !== item.product.precio) itemChanged = true;
            }

            if (matchedProduct) newProduct = matchedProduct;

            // 2. Sync Gustos (Update IDs)
            let newGustos = item.gustos;
            if (item.gustos && item.gustos.length > 0) {
                const refreshedGustos = item.gustos.map(g => {
                    // Try ID Match
                    const existingGusto = gustos.find(dbG => dbG.id === g.id);
                    if (existingGusto) return existingGusto;

                    // Try Name Match
                    const matchedGusto = gustos.find(dbG => dbG.nombre.toLowerCase().trim() === g.nombre.toLowerCase().trim());
                    if (matchedGusto) {
                        itemChanged = true;
                        return matchedGusto;
                    }
                    return g;
                });

                // Compare arrays to see if actually changed
                const gustosChanged = refreshedGustos.some((g, i) => g.id !== item.gustos[i].id);
                if (gustosChanged) {
                    newGustos = refreshedGustos;
                    itemChanged = true;
                }
            }

            if (itemChanged) {
                cartUpdated = true;
                // Return updated item with new product (and price) and new gustos
                return { ...item, product: newProduct, gustos: newGustos, price: newProduct.precio };
            }
            return item;
        });

        if (cartUpdated) {
            console.log("Carrito sincronizado con nuevos IDs de la Base de Datos 🔄");
            setCart(newCart);
        }

    }, [products, gustos]); // Correr cada vez que se actualiza el catálogo (merged)


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
            catalogLoading
        }}>
            {children}
        </CartContext.Provider>
    );
};
