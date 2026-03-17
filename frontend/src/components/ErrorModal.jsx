import React from 'react';
import { X, AlertCircle } from 'lucide-react';

const ErrorModal = ({ isOpen, onClose, title = "Error", message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-scale-up"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="bg-[#2C1B18] px-6 py-4 flex items-center justify-between">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-700 text-lg leading-relaxed text-center font-medium">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex justify-center">
                    <button
                        onClick={onClose}
                        className="bg-[#2C1B18] text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-transform hover:scale-105 shadow-lg shadow-[#2C1B18]/20"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorModal;
