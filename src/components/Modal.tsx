import React, { useEffect, useRef } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    clickOffToClose?: boolean;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    clickOffToClose = false,
    children,
}) => {
    const modalContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (
            clickOffToClose &&
            modalContentRef.current &&
            !modalContentRef.current.contains(e.target as Node)
        ) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={handleOverlayClick}
        >
            <div
                ref={modalContentRef}
                className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200"
            >
                {children}
            </div>
        </div>
    );
};

