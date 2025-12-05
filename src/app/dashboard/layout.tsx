// src/app/dashboard/layout.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Link from "next/link";
import {
    LayoutDashboard,
    Store,
    UtensilsCrossed,
    Package,
    Users,
    Settings,
    LogOut,
    Menu,
    X,      // Icono para cerrar menú
    Beer    // Icono para el bar
} from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // ESTADO NUEVO: Controlar si el menú móvil está abierto o cerrado
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push("/login");
            } else {
                setUser(currentUser);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleSignOut = async () => {
        await signOut(auth);
        router.push("/login");
    };

    // Función para cerrar el menú al hacer clic en un enlace (UX móvil)
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    if (loading) return <div className="h-screen flex items-center justify-center text-orange-500">Cargando...</div>;

    const menuItems = [
        { name: "Resumen", icon: LayoutDashboard, href: "/dashboard" },
        { name: "Punto de Venta", icon: Store, href: "/dashboard/pos" },
        { name: "Cocina (KDS)", icon: UtensilsCrossed, href: "/dashboard/kitchen" },
        { name: "Barra (Monitor)", icon: Beer, href: "/dashboard/bar" }, // ¡AGREGADO!
        { name: "Inventario", icon: Package, href: "/dashboard/inventory" },
        { name: "Personal", icon: Users, href: "/dashboard/staff" },
        { name: "Configuración", icon: Settings, href: "/dashboard/settings" },
    ];

    return (
        <div className="flex h-screen bg-gray-100">

            {/* --- SIDEBAR DESKTOP (Oculto en móvil) --- */}
            <aside className="w-64 bg-white shadow-md hidden md:flex flex-col z-10">
                <div className="p-6 border-b flex items-center gap-2">
                    <Image src="/logo-full.svg" alt="Go Kitchen" width={140} height={40} priority />
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-orange-50 text-orange-600 font-medium" : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <item.icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t bg-gray-50">
                    <div className="text-xs text-gray-500 mb-2 truncate">{user?.email}</div>
                    <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 w-full">
                        <LogOut size={16} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* --- MENÚ MÓVIL (Overlay) --- */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-gray-800/50 md:hidden" onClick={closeMobileMenu}>
                    <div className="bg-white w-64 h-full shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b flex justify-between items-center">
                            <span className="font-bold text-lg text-orange-600">Menú</span>
                            <button onClick={closeMobileMenu} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={closeMobileMenu} // Cierra el menú al navegar
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? "bg-orange-100 text-orange-700" : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                    >
                                        <item.icon size={20} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                            <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-3 w-full text-red-600 mt-4 border-t pt-4">
                                <LogOut size={20} />
                                <span>Salir</span>
                            </button>
                        </nav>
                    </div>
                </div>
            )}

            {/* --- ÁREA PRINCIPAL --- */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header Móvil */}
                <header className="bg-white shadow-sm p-4 md:hidden flex items-center justify-between shrink-0 z-20">
                    <span className="font-bold text-gray-800 text-lg">Go Kitchen</span>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu size={28} />
                    </button>
                </header>

                {/* Contenido Scrollable */}
                <div className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}