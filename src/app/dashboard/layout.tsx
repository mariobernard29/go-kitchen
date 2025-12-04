// src/app/dashboard/layout.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // Hooks de navegación
import { auth } from "@/lib/firebase"; // Tu autenticación
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
    Menu
} from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname(); // Para saber en qué página estamos
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // 1. Verificación de Seguridad
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push("/login"); // Ahora mandamos al login
            } else {
                setUser(currentUser);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Función para cerrar sesión
    const handleSignOut = async () => {
        await signOut(auth);
        router.push("/signup");
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-orange-500">Cargando Go Kitchen...</div>;

    // Lista de enlaces del menú
    const menuItems = [
        { name: "Resumen", icon: LayoutDashboard, href: "/dashboard" },
        { name: "Punto de Venta", icon: Store, href: "/dashboard/pos" },
        { name: "Cocina (KDS)", icon: UtensilsCrossed, href: "/dashboard/kitchen" },
        { name: "Inventario", icon: Package, href: "/dashboard/inventory" },
        { name: "Personal", icon: Users, href: "/dashboard/staff" },
        { name: "Configuración", icon: Settings, href: "/dashboard/settings" },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* --- SIDEBAR (Barra Lateral) --- */}
            <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">

                {/* Logo */}
                {/* Logo */}
                <div className="p-6 border-b flex items-center gap-2">
                    {/* Reemplazamos el div naranja por tu imagen */}
                    <Image
                        src="/logo-full.svg"
                        alt="Go Kitchen Logo"
                        width={140}
                        height={40}
                        priority // Esto hace que cargue instantáneo sin parpadear
                    />
                </div>

                {/* Menú de Navegación */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? "bg-orange-50 text-orange-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                <item.icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Pie del Sidebar (Usuario y Salir) */}
                <div className="p-4 border-t bg-gray-50">
                    <div className="text-xs text-gray-500 mb-2 truncate">{user?.email}</div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 w-full"
                    >
                        <LogOut size={16} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* --- ÁREA PRINCIPAL --- */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm p-4 md:hidden flex items-center justify-between">
                    {/* Header solo para móviles */}
                    <span className="font-bold text-gray-800">Go Kitchen</span>
                    <Menu className="text-gray-600" />
                </header>

                <div className="p-8">
                    {children} {/* Aquí se renderizarán las páginas internas */}
                </div>
            </main>
        </div>
    );
}