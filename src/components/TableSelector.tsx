// src/components/TableSelector.tsx
"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { Plus, Users, Trash2, X } from "lucide-react";

interface TableSelectorProps {
    onSelectTable: (tableId: string, existingOrder: any | null) => void;
}

export default function TableSelector({ onSelectTable }: TableSelectorProps) {
    const [tables, setTables] = useState<any[]>([]);
    const [occupiedTables, setOccupiedTables] = useState<Record<string, any>>({});

    // Estado para el modal de crear mesa
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTableName, setNewTableName] = useState("");
    const [newTableCapacity, setNewTableCapacity] = useState("");

    useEffect(() => {
        if (!auth.currentUser) return;

        // 1. ESCUCHAR LA LISTA DE MESAS CREADAS (Ordenadas por nombre)
        const qTables = query(collection(db, "restaurants", auth.currentUser.uid, "tables"), orderBy("name"));
        const unsubTables = onSnapshot(qTables, (snapshot) => {
            setTables(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // ... dentro del useEffect ...

        // 2. ESCUCHAR LAS ÓRDENES ACTIVAS (Para saber cuál está ocupada)
        // CAMBIO: Ahora escuchamos "open", "cooking" y "ready" para que la mesa siga roja mientras cocinan
        const qOrders = query(
            collection(db, "restaurants", auth.currentUser.uid, "orders"),
            where("status", "in", ["open", "cooking", "ready"])
        );

        // ... el resto sigue igual ...
        const unsubOrders = onSnapshot(qOrders, (snapshot) => {
            const occupied: Record<string, any> = {};
            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                if (data.tableId) {
                    occupied[data.tableId] = { id: doc.id, ...data };
                }
            });
            setOccupiedTables(occupied);
        });

        return () => {
            unsubTables();
            unsubOrders();
        };
    }, []);

    // FUNCIÓN: Crear Nueva Mesa
    const handleCreateTable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser || !newTableName) return;

        try {
            await addDoc(collection(db, "restaurants", auth.currentUser.uid, "tables"), {
                name: newTableName,
                capacity: newTableCapacity || "4", // Por defecto 4 sillas
                createdAt: serverTimestamp()
            });
            setNewTableName("");
            setNewTableCapacity("");
            setShowCreateModal(false);
        } catch (error) {
            console.error("Error al crear mesa:", error);
            alert("Error al crear la mesa");
        }
    };

    // FUNCIÓN: Borrar Mesa (Opcional, por si te equivocas)
    const handleDeleteTable = async (e: React.MouseEvent, tableId: string) => {
        e.stopPropagation(); // Evita que se seleccione la mesa al borrar
        if (!auth.currentUser) return;
        if (confirm("¿Estás seguro de borrar esta mesa?")) {
            await deleteDoc(doc(db, "restaurants", auth.currentUser.uid, "tables", tableId));
        }
    };

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">

                {/* --- BOTÓN DE NUEVA MESA --- */}
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="h-32 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all group"
                >
                    <div className="bg-gray-100 group-hover:bg-orange-100 p-3 rounded-full mb-2 transition-colors">
                        <Plus size={24} />
                    </div>
                    <span className="font-medium">Nueva Mesa</span>
                </button>

                {/* --- LISTA DE MESAS --- */}
                {tables.map((table) => {
                    // Usamos el ID de la mesa para verificar si está ocupada
                    // OJO: En POSPage guardábamos usando el ID. Asegúrate que coincida.
                    const order = occupiedTables[table.name]; // Buscamos por nombre para mantener compatibilidad simple
                    const isOccupied = !!order;

                    return (
                        <button
                            key={table.id}
                            onClick={() => onSelectTable(table.name, order || null)}
                            className={`relative h-32 rounded-xl border-2 flex flex-col items-center justify-center transition-all shadow-sm group ${isOccupied
                                ? "bg-red-50 border-red-500 text-red-700 hover:bg-red-100"
                                : "bg-white border-gray-200 text-gray-700 hover:border-green-500 hover:bg-green-50"
                                }`}
                        >
                            {/* Botón de borrar (Solo aparece al pasar el mouse si está libre) */}
                            {!isOccupied && (
                                <div
                                    onClick={(e) => handleDeleteTable(e, table.id)}
                                    className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </div>
                            )}

                            <span className="font-bold text-xl mb-1">{table.name}</span>

                            <div className="flex items-center gap-1 text-xs opacity-70 mb-2">
                                <Users size={12} />
                                <span>{table.capacity} personas</span>
                            </div>

                            {isOccupied ? (
                                <div className="bg-red-100 px-3 py-1 rounded-full text-xs font-bold text-red-800">
                                    ${order.total.toFixed(2)}
                                </div>
                            ) : (
                                <span className="text-[10px] uppercase tracking-wider text-green-600 font-bold">
                                    LIBRE
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* --- MODAL PARA CREAR MESA --- */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Agregar Nueva Mesa</h3>
                            <button onClick={() => setShowCreateModal(false)}><X className="text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleCreateTable} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la mesa</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Ej: Terraza 1, Barra..."
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={newTableName}
                                    onChange={e => setNewTableName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad (Personas)</label>
                                <input
                                    type="number"
                                    placeholder="4"
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={newTableCapacity}
                                    onChange={e => setNewTableCapacity(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700"
                            >
                                Crear Mesa
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}