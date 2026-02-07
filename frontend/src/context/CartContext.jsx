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

    const cartTotal = cart.reduce((total, item) => total + item.price, 0);
    const cartCount = cart.length;

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
