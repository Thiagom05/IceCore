import React, { createContext, useContext, useState } from 'react';
import ErrorModal from '../components/ErrorModal';

const UIContext = createContext();

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI debe ser usado dentro de un UIProvider');
    }
    return context;
};

export const UIProvider = ({ children }) => {
    const [errorModal, setErrorModal] = useState({
        isOpen: false,
        title: 'Atención',
        message: ''
    });

    const showError = (message, title = 'Atención') => {
        setErrorModal({ isOpen: true, title, message });
    };

    const closeError = () => {
        setErrorModal(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <UIContext.Provider value={{ showError, closeError }}>
            {children}
            {/* Renderizamos el Modal aquí para que sea global */}
            <ErrorModal
                isOpen={errorModal.isOpen}
                onClose={closeError}
                title={errorModal.title}
                message={errorModal.message}
            />
        </UIContext.Provider>
    );
};
