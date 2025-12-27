import React from "react";
import { Modal } from "./Modal";

interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    clickOffToClose?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title = "Confirm Action",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    clickOffToClose = false,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onCancel}
            clickOffToClose={clickOffToClose}
        >
            <h2 className="font-space text-xl mb-4">{title}</h2>
            <p className="text-slate-300 mb-6">{message}</p>
            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-space font-medium transition-colors border border-slate-700"
                >
                    {cancelText}
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-space font-medium transition-colors"
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
};

