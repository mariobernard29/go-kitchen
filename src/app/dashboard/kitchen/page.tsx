// src/app/dashboard/kitchen/page.tsx
"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Clock, CheckCircle2, Flame, ChefHat } from "lucide-react";

export default function KitchenPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. ESCUCHAR ÓRDENES ACTIVAS
    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (user) {
                // Queremos órdenes que NO estén completadas (pending o cooking)
                // Nota: En Firestore a veces requerimos índices para consultas compuestas. 
                // Si te da error en consola, te dará un link para crearlo con un clic.

                // CAMBIO: Agregamos "open" a la lista para que aparezcan apenas el mesero las mande
                const q = query(
                    collection(db, "restaurants", user.uid, "orders"),
                    where("status", "in", ["open", "cooking"]),
                    orderBy("createdAt", "asc")
                );

                const unsubscribe = onSnapshot(q, (snapshot) => {
                    const ordersData = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setOrders(ordersData);
                    setLoading(false);
                });

                return () => unsubscribe();
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // 2. CAMBIAR ESTADO (Flujo de Cocina)
    const updateStatus = async (orderId: string, newStatus: string) => {
        if (!auth.currentUser) return;

        // Si el estado es 'completed', la orden desaparecerá de esta pantalla automáticamente
        // gracias al filtro del query de arriba.
        const orderRef = doc(db, "restaurants", auth.currentUser.uid, "orders", orderId);

        await updateDoc(orderRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
        });
    };

    // Función para calcular tiempo transcurrido (visual)
    const getTimeElapsed = (timestamp: any) => {
        if (!timestamp) return "0m";
        const diff = new Date().getTime() - timestamp.toDate().getTime();
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m`;
    };

    if (loading) return <div className="p-8">Cargando comanda...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <ChefHat className="text-orange-600" />
                Monitor de Cocina (KDS)
            </h1>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border text-gray-400">
                    <CheckCircle2 size={48} className="mb-4 opacity-20" />
                    <p className="text-lg">Todo tranquilo por ahora. ¡Buen trabajo!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className={`rounded-xl border shadow-sm flex flex-col overflow-hidden ${order.status === 'cooking' ? 'ring-2 ring-orange-400' : ''
                                }`}
                        >
                            {/* Header de la Comanda */}
                            <div className={`p-3 flex justify-between items-center text-white ${order.status === 'cooking' ? 'bg-orange-500' : 'bg-blue-600'
                                }`}>
                                <div>
                                    <span className="font-bold text-lg">#{order.id.slice(-4)}</span>
                                    <span className="text-xs opacity-90 block">Mesa: {order.tableId}</span>
                                </div>
                                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-xs">
                                    <Clock size={12} />
                                    {getTimeElapsed(order.createdAt)}
                                </div>
                            </div>

                            {/* Lista de Platos */}
                            <div className="p-4 bg-white flex-1 space-y-3">
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-3 items-start border-b pb-2 last:border-0 last:pb-0">
                                        <span className="font-bold bg-gray-100 text-gray-700 w-6 h-6 flex items-center justify-center rounded text-sm">
                                            {item.quantity}
                                        </span>
                                        <div className="text-gray-800 font-medium leading-tight">
                                            {item.name}
                                            {/* Aquí podrías agregar notas como "Sin cebolla" */}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Acciones */}
                            <div className="p-3 bg-gray-50 border-t grid grid-cols-1 gap-2">
                                {order.status === 'pending' && (
                                    <button
                                        onClick={() => updateStatus(order.id, 'cooking')}
                                        className="w-full py-2 bg-orange-100 text-orange-700 font-semibold rounded hover:bg-orange-200 flex items-center justify-center gap-2"
                                    >
                                        <Flame size={18} />
                                        Empezar a Cocinar
                                    </button>
                                )}

                                <button
                                    onClick={() => updateStatus(order.id, 'completed')}
                                    className="w-full py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={18} />
                                    {order.status === 'cooking' ? 'Terminar Orden' : 'Entregar Directo'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}