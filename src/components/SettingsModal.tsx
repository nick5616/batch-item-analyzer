import React from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "./Modal";

interface SettingsModalProps {
    isOpen: boolean;
    apiKey: string;
    onApiKeyChange: (key: string) => void;
    onClose: () => void;
    onDeleteKey: () => void;
    clickOffToClose?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    apiKey,
    onApiKeyChange,
    onClose,
    onDeleteKey,
    clickOffToClose = false,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            clickOffToClose={clickOffToClose}
        >
            <h2 className="font-space text-xl mb-4">Configuration</h2>
            <label className="block text-sm text-slate-400 mb-2">
                OpenAI API Key
            </label>
            <input
                type="password"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 mb-6 font-mono text-sm"
            />
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-space font-medium transition-colors"
                >
                    Save & Continue
                </button>
                {apiKey && (
                    <button
                        onClick={onDeleteKey}
                        className="px-4 py-3 bg-red-900/20 border border-red-900/50 hover:bg-red-900/40 text-red-400 rounded-lg transition-colors"
                        title="Delete Key"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                )}
            </div>
        </Modal>
    );
};

