// src/app/dashboard/pos/page.tsx
"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, doc, writeBatch, serverTimestamp, orderBy, query, where } from "firebase/firestore";
import { useCartStore } from "@/store/cartStore";
import { Search, ShoppingCart, Minus, Plus, ChefHat, ArrowLeft, Receipt, DollarSign } from "lucide-react";
import TableSelector from "@/components/TableSelector";
import PaymentModal from "@/components/PaymentModal";

export default function POSPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [view, setView] = useState<"tables" | "pos">("tables");
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // ESTADO NUEVO: Historial de pedidos de la mesa actual (Lo que ya se mandó a cocina)
    const [activeOrders, setActiveOrders] = useState<any[]>([]);

    const { cart, addItem, removeItem, clearCart, total: cartTotal, currentTable, setTable } = useCartStore();

    // 1. Cargar Productos
    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (user) {
                const q = query(collection(db, "restaurants", user.uid, "products"), orderBy("name"));
                onSnapshot(q, (snapshot) => {
                    setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                });
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // 2. ESCUCHAR LA MESA ACTUAL (Para ver tickets anteriores: cocina, barra, listos)
    useEffect(() => {
        if (!auth.currentUser || !currentTable) return;

        // Buscamos todo lo que NO esté pagado ("completed")
        // OJO: Status puede ser 'pending', 'cooking', 'ready'
        const q = query(
            collection(db, "restaurants", auth.currentUser.uid, "orders"),
            where("tableId", "==", currentTable),
            where("status", "in", ["pending", "cooking", "ready"])
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setActiveOrders(orders);
        });

        return () => unsubscribe();
    }, [currentTable]);

    // CALCULAR TOTAL REAL (Lo del carrito + Lo que ya se pidió antes)
    const orderedTotal = activeOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const grandTotal = cartTotal() + orderedTotal;

    // --- SELECCIONAR MESA ---
    const handleSelectTable = (tableId: string) => {
        setTable(tableId);
        clearCart(); // El carrito es solo para LO NUEVO
        setView("pos");
    };

    // --- ENVIAR A COCINA/BARRA (SEPARAR COMANDAS) ---
    const handleSendOrder = async () => {
        if (!auth.currentUser || !currentTable || cart.length === 0) return;

        try {
            // Separamos items por destino
            const kitchenItems = cart.filter((i: any) => i.destination === 'kitchen' || !i.destination);
            const barItems = cart.filter((i: any) => i.destination === 'bar');

            const batchPromises = [];

            // 1. Crear Ticket de Cocina (Si hay comida)
            if (kitchenItems.length > 0) {
                batchPromises.push(addDoc(collection(db, "restaurants", auth.currentUser.uid, "orders"), {
                    tableId: currentTable,
                    items: kitchenItems,
                    total: kitchenItems.reduce((s, i) => s + (i.price * i.quantity), 0),
                    status: "pending",
                    destination: "kitchen", // Para que salga en monitor cocina
                    createdAt: serverTimestamp(),
                }));
            }

            // 2. Crear Ticket de Barra (Si hay bebida)
            if (barItems.length > 0) {
                batchPromises.push(addDoc(collection(db, "restaurants", auth.currentUser.uid, "orders"), {
                    tableId: currentTable,
                    items: barItems,
                    total: barItems.reduce((s, i) => s + (i.price * i.quantity), 0),
                    status: "pending",
                    destination: "bar", // Para que salga en monitor barra
                    createdAt: serverTimestamp(),
                }));
            }

            await Promise.all(batchPromises);

            alert("Comandas enviadas correctamente");
            clearCart(); // Limpiamos solo lo nuevo, lo viejo sigue en activeOrders
        } catch (error) {
            console.error(error);
            alert("Error al enviar");
        }
    };

    // --- COBRAR TODO ---
    const handlePay = async (payments: any[]) => {
        if (!auth.currentUser || !currentTable) return;

        try {
            const batch = writeBatch(db);

            // Marcamos TODOS los tickets de esta mesa como 'completed' (pagados)
            activeOrders.forEach((order) => {
                const ref = doc(db, "restaurants", auth.currentUser!.uid, "orders", order.id);
                batch.update(ref, {
                    status: "completed",
                    paidAt: serverTimestamp(),
                    paymentDetails: payments // Guardamos cómo se pagó en cada ticket (simplificado)
                });
            });

            // Si había algo en el carrito sin mandar, no lo cobramos (o forzamos envío, aquí lo ignoramos por seguridad)
            if (cart.length > 0) {
                alert("Atención: Había items en el carrito sin enviar a cocina. No se cobraron.");
            }

            await batch.commit();

            alert("Mesa cobrada y cerrada.");
            setShowPaymentModal(false);
            setTable(null);
            setView("tables");
        } catch (error) {
            console.error(error);
            alert("Error al cobrar");
        }
    };

    // RENDERIZADO
    if (view === "tables") {
        return (
            <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Mapa de Mesas</h1>
                <TableSelector onSelectTable={handleSelectTable} />
            </div>
        );
    }

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex h-[calc(100vh-theme(spacing.24))] gap-6">

            {/* COLUMNA IZQUIERDA: CATÁLOGO */}
            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Header con volver y buscar */}
                <div className="p-4 border-b flex gap-4 items-center bg-gray-50">
                    <button onClick={() => setView("tables")} className="p-2 hover:bg-gray-200 rounded-lg"><ArrowLeft /></button>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filteredProducts.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => addItem(product)}
                                className="bg-white p-4 rounded-xl shadow-sm border hover:border-orange-500 transition-all text-left flex flex-col justify-between h-28"
                            >
                                <span className="font-bold text-gray-700 leading-tight">{product.name}</span>
                                <div className="flex justify-between items-end mt-2">
                                    <span className="font-bold text-orange-600">${product.price}</span>
                                    <span className="text-[10px] bg-gray-100 px-2 rounded uppercase text-gray-500">
                                        {product.destination === 'bar' ? 'Barra' : 'Cocina'}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* COLUMNA DERECHA: CUENTA */}
            <div className="w-96 bg-white rounded-xl shadow-sm border flex flex-col">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="font-bold text-lg">{currentTable}</h2>
                    <div className="text-right">
                        <div className="text-xs text-gray-500">Total Acumulado</div>
                        <div className="font-bold text-xl">${grandTotal.toFixed(2)}</div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">

                    {/* 1. SECCIÓN: LO NUEVO (EN CARRITO) */}
                    {cart.length > 0 && (
                        <div>
                            <div className="text-xs font-bold text-orange-600 uppercase mb-2 flex items-center gap-1">
                                <ShoppingCart size={12} /> Por Enviar
                            </div>
                            <div className="space-y-2 mb-4">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center bg-orange-50 p-2 rounded border border-orange-100">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{item.name}</div>
                                            <div className="text-xs text-gray-500">${item.price}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => removeItem(item.id)} className="p-1 bg-white rounded"><Minus size={12} /></button>
                                            <span className="font-bold text-sm">{item.quantity}</span>
                                            <button onClick={() => addItem(item)} className="p-1 bg-white rounded"><Plus size={12} /></button>
                                        </div>
                                        <div className="text-right w-14 font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleSendOrder}
                                className="w-full py-2 bg-orange-600 text-white rounded-lg font-bold text-sm mb-4 hover:bg-orange-700"
                            >
                                Enviar Comanda
                            </button>
                            <hr className="border-dashed" />
                        </div>
                    )}

                    {/* 2. SECCIÓN: HISTORIAL (YA ENVIADO) */}
                    {activeOrders.length > 0 ? (
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase mb-2 mt-2 flex items-center gap-1">
                                <Receipt size={12} /> Comandas Anteriores
                            </div>
                            {activeOrders.map((order) => (
                                <div key={order.id} className="mb-3 border-b pb-2 last:border-0">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Ticket #{order.id.slice(-4)}</span>
                                        <span className={`uppercase font-bold ${order.status === 'ready' ? 'text-green-600' : 'text-blue-500'
                                            }`}>
                                            {order.status === 'ready' ? 'Listo' : 'En proceso'}
                                        </span>
                                    </div>
                                    {order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-sm text-gray-600 pl-2 border-l-2 border-gray-200">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        cart.length === 0 && <div className="text-center text-gray-400 mt-10">Mesa vacía</div>
                    )}
                </div>

                {/* FOOTER: TOTAL Y PAGAR */}
                <div className="p-4 bg-gray-900 text-white mt-auto">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400">Total a Pagar</span>
                        <span className="text-2xl font-bold">${grandTotal.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={() => setShowPaymentModal(true)}
                        disabled={grandTotal === 0}
                        className="w-full py-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <DollarSign size={20} /> Cerrar Cuenta
                    </button>
                </div>
            </div>

            {showPaymentModal && (
                <PaymentModal
                    total={grandTotal}
                    onClose={() => setShowPaymentModal(false)}
                    onConfirm={handlePay}
                />
            )}

        </div>
    );
}