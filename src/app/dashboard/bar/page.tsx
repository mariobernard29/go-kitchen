// src/app/dashboard/bar/page.tsx
"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Beer, CheckCircle2 } from "lucide-react";

export default function BarPage() {
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (user) {
                // Buscamos órdenes activas que sean DE TIPO BARRA
                const q = query(
                    collection(db, "restaurants", user.uid, "orders"),
                    where("status", "in", ["pending", "cooking", "ready"]), // Traemos todo lo activo
                    where("destination", "==", "bar"), // FILTRO CLAVE
                    orderBy("createdAt", "asc")
                );

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
                });
                return () => unsubscribe();
            }
        });
        return () => unsubscribeAuth();
    }, []);

    const updateStatus = async (orderId: string, newStatus: string) => {
        if (!auth.currentUser) return;
        const orderRef = doc(db, "restaurants", auth.currentUser.uid, "orders", orderId);
        await updateDoc(orderRef, { status: newStatus });
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Beer className="text-blue-600" />
                Monitor de Barra
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
                        <div className={`p-3 text-white flex justify-between ${order.status === 'ready' ? 'bg-green-600' : 'bg-blue-600'
                            }`}>
                            <span className="font-bold">{order.tableId}</span>
                            <span className="text-xs opacity-75">#{order.id.slice(-4)}</span>
                        </div>

                        <div className="p-4 space-y-2">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between border-b last:border-0 pb-1">
                                    <span>{item.name}</span>
                                    <span className="font-bold bg-gray-100 px-2 rounded">{item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-2 bg-gray-50 border-t">
                            {order.status !== 'ready' ? (
                                <button
                                    onClick={() => updateStatus(order.id, 'ready')}
                                    className="w-full bg-blue-100 text-blue-700 py-2 rounded font-bold hover:bg-blue-200"
                                >
                                    Marcar Listo
                                </button>
                            ) : (
                                <div className="text-center text-green-600 font-bold py-2 flex items-center justify-center gap-2">
                                    <CheckCircle2 size={16} /> En espera de mesero
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}