// src/app/dashboard/inventory/page.tsx
"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp } from "firebase/firestore";
import { Plus, Tag, DollarSign, Package, Loader2 } from "lucide-react";

export default function InventoryPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Estado para el formulario de nuevo producto
    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        category: "General",
        stock: "0",
        destination: "kitchen" // Nuevo campo por defecto
    });

    // 1. ESCUCHAR PRODUCTOS EN TIEMPO REAL
    // Esto hace que si agregas un producto, aparezca solo sin recargar la página
    useEffect(() => {
        // Esperamos a que Firebase confirme quién es el usuario
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (user) {
                // Buscamos en la colección: restaurants -> {id_usuario} -> products
                const q = query(
                    collection(db, "restaurants", user.uid, "products"),
                    orderBy("createdAt", "desc")
                );

                // onSnapshot escucha cambios en vivo
                const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                    const productsData = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setProducts(productsData);
                    setLoading(false);
                });

                return () => unsubscribeSnapshot();
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    // 2. GUARDAR NUEVO PRODUCTO
    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth.currentUser) return;
        setIsSubmitting(true);

        try {
            // Guardamos en Firestore
            await addDoc(collection(db, "restaurants", auth.currentUser.uid, "products"), {
                // ... resto de campos
                destination: newProduct.destination, // Guardamos el destino
                createdAt: serverTimestamp(),
            });

            // Limpiamos el formulario
            setNewProduct({ name: "", price: "", category: "General", stock: "0", destination: "kitchen" });
            alert("Producto agregado correctamente");
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Hubo un error al guardar el producto");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-8">Cargando inventario...</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Package className="text-orange-600" />
                Inventario y Menú
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* --- FORMULARIO DE ALTA (Izquierda) --- */}
                <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
                    <h2 className="font-semibold text-lg mb-4">Nuevo Producto</h2>
                    <form onSubmit={handleAddProduct} className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plato</label>
                            <input
                                type="text"
                                required
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="Ej. Hamburguesa Doble"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        className="w-full border rounded-lg pl-9 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="0.00"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                    value={newProduct.stock}
                                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    list="categories"
                                    className="w-full border rounded-lg pl-9 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                                    placeholder="Ej. Bebidas, Parrilla..."
                                    value={newProduct.category}
                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                />
                                {/* Sugerencias simples */}
                                <datalist id="categories">
                                    <option value="Bebidas" />
                                    <option value="Entradas" />
                                    <option value="Platos Fuertes" />
                                    <option value="Postres" />
                                </datalist>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Destino de Impresión</label>
                            <select
                                className="w-full border rounded-lg px-3 py-2 outline-none"
                                value={newProduct.destination}
                                onChange={(e) => setNewProduct({ ...newProduct, destination: e.target.value })}
                            >
                                <option value="kitchen">Cocina (Comida)</option>
                                <option value="bar">Barra (Bebidas)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                            Guardar Producto
                        </button>
                    </form>
                </div>

                {/* --- LISTA DE PRODUCTOS (Derecha) --- */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-700">Catálogo Actual</h3>
                            <span className="text-sm text-gray-500">{products.length} productos</span>
                        </div>

                        {products.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No tienes productos aún. ¡Agrega el primero!
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                                        <tr>
                                            <th className="p-4">Nombre</th>
                                            <th className="p-4">Categoría</th>
                                            <th className="p-4">Precio</th>
                                            <th className="p-4">Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="p-4 font-medium text-gray-900">{product.name}</td>
                                                <td className="p-4">
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-bold text-gray-700">
                                                    ${(Number(product.price) || 0).toFixed(2)}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${product.stock < 5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                                                        }`}>
                                                        {product.stock} un.
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}