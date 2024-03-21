import React from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, children }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="relative flex flex-col pointer-events-auto bg-[#002d4e] text-white border border-[rgba(0,0,0,.2)] rounded-lg outline-none mx-w-[720px]">
                {children}
            </div>
        </div>,
        document.body
    );
};

export default Modal;