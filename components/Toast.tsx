import React from 'react';

export interface ToastProps {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
  onDismiss: (id: number) => void;
}

const toastStyles = {
    info: {
        bg: 'bg-blue-500',
        icon: 'ℹ️'
    },
    success: {
        bg: 'bg-green-500',
        icon: '✅'
    },
    error: {
        bg: 'bg-red-500',
        icon: '❌'
    }
};

const Toast: React.FC<ToastProps> = ({ id, message, type, onDismiss }) => {
    return (
        <div className={`flex items-center ${toastStyles[type].bg} text-white text-sm font-bold px-4 py-3 rounded-md shadow-lg my-2 animate-fade-in-right`}>
            <span className="mr-3 text-xl">{toastStyles[type].icon}</span>
            <p className="flex-grow">{message}</p>
            <button onClick={() => onDismiss(id)} className="ml-4 -mr-1 p-1 text-xl font-semibold leading-none opacity-70 hover:opacity-100">&times;</button>
        </div>
    );
};

export default Toast;