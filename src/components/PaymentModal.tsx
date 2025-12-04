// src/components/PaymentModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, DollarSign, CreditCard, Banknote } from "lucide-react";

interface PaymentModalProps {
    total: number;
    onClose: () => void;
    onConfirm: (payments: any[]) => void;
}

export default function PaymentModal({ total, onClose, onConfirm }: PaymentModalProps) {
    const [amountReceived, setAmountReceived] = useState("");
    const [payments, setPayments] = useState<{ method: string; amount: number }[]>([]);

    // Calculamos cuánto falta por pagar
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, total - totalPaid);
    const change = Math.max(0, totalPaid - total);

    // Auto-rellenar el input con lo que falta
    useEffect(() => {
        if (remaining > 0) setAmountReceived(remaining.toString());
    }, [remaining]);

    const addPayment = (method: string) => {
        const val = parseFloat(amountReceived);
        if (!val || val <= 0) return;

        setPayments([...payments, { method, amount: val }]);
        setAmountReceived(""); // Limpiar input
    };

    const handleFinalize = () => {
        if (remaining > 0) return alert("Falta cubrir el total");
        onConfirm(payments); // Enviamos la lista de pagos al POS
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-gray-900 text-white p-6 flex justify-between items-start">
                    <div>
                        <p className="text-gray-400 text-sm">Total a Pagar</p>
                        <h2 className="text-4xl font-bold">${total.toFixed(2)}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Resumen de Pagos */}
                    <div className="space-y-2">
                        {payments.map((p, i) => (
                            <div key={i} className="flex justify-between text-sm border-b pb-1">
                                <span className="capitalize text-gray-600">{p.method}</span>
                                <span className="font-medium">${p.amount.toFixed(2)}</span>
                            </div>
                        ))}

                        <div className="flex justify-between items-center text-lg pt-2">
                            <span className={remaining > 0 ? "text-orange-600 font-bold" : "text-gray-400"}>
                                {remaining > 0 ? "Falta:" : "Cubierto"}
                            </span>
                            <span className={remaining > 0 ? "text-orange-600 font-bold" : "text-green-600 font-bold"}>
                                ${remaining > 0 ? remaining.toFixed(2) : "OK"}
                            </span>
                        </div>

                        {/* EL GRAN CAMBIO */}
                        {change > 0 && (
                            <div className="bg-green-100 p-3 rounded-lg flex justify-between items-center animate-pulse">
                                <span className="text-green-800 font-bold text-lg">CAMBIO:</span>
                                <span className="text-green-800 font-extrabold text-2xl">${change.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Input de Dinero Recibido */}
                    {remaining > 0 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monto Recibido</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="number"
                                        className="w-full pl-10 pr-4 py-3 text-xl font-bold border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                        value={amountReceived}
                                        onChange={(e) => setAmountReceived(e.target.value)}
                                        onFocus={(e) => e.target.select()} // Seleccionar todo al hacer click
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => addPayment("Efectivo")}
                                    className="bg-green-100 text-green-700 py-3 rounded-lg font-bold hover:bg-green-200 flex items-center justify-center gap-2"
                                >
                                    <Banknote /> Efectivo
                                </button>
                                <button
                                    onClick={() => addPayment("Tarjeta")}
                                    className="bg-blue-100 text-blue-700 py-3 rounded-lg font-bold hover:bg-blue-200 flex items-center justify-center gap-2"
                                >
                                    <CreditCard /> Tarjeta
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Botón Final */}
                    <button
                        onClick={handleFinalize}
                        disabled={remaining > 0}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Confirmar y Cerrar Mesa
                    </button>

                </div>
            </div>
        </div>
    );
}