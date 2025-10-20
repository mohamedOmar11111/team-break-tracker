import React from 'react';
import Toast, { ToastProps } from './Toast';

interface ToastContainerProps {
    toasts: Omit<ToastProps, 'onDismiss'>[];
    onDismiss: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    return (
        <div className="fixed top-5 right-5 z-50 w-80">
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
};

export default ToastContainer;