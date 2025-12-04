// src/app/dashboard/subscription/page.tsx
"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { Check, CreditCard, Loader2 } from "lucide-react";

export default function SubscriptionPage() {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (priceIdKey: string) => {
        if (!auth.currentUser) return;
        setLoading(true);

        try {
            // 1. Llamamos a nuestra propia API
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    priceId: priceIdKey, // Enviamos el ID del precio (mensual o anual)
                    userId: auth.currentUser.uid,
                    email: auth.currentUser.email,
                }),
            });

            const data = await response.json();

            // 2. Redirigimos al usuario a Stripe
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Error al iniciar pago");
                setLoading(false);
            }

        } catch (error) {
            console.error(error);
            alert("Error de conexión");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Elige tu Plan</h1>
            <p className="text-gray-600 mb-12">Desbloquea todo el potencial de Go Kitchen</p>

            <div className="grid md:grid-cols-2 gap-8 items-center">

                {/* PLAN MENSUAL */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-orange-100 hover:border-orange-500 transition-all">
                    <h3 className="text-xl font-semibold text-gray-900">Mensual</h3>
                    <div className="my-4">
                        <span className="text-4xl font-bold text-gray-900">$99</span>
                        <span className="text-gray-500">/mes</span>
                    </div>
                    <ul className="text-left space-y-3 mb-8 text-gray-600">
                        <li className="flex gap-2"><Check className="text-green-500" size={20} /> Punto de Venta Ilimitado</li>
                        <li className="flex gap-2"><Check className="text-green-500" size={20} /> Gestión de Inventarios</li>
                        <li className="flex gap-2"><Check className="text-green-500" size={20} /> Soporte Técnico</li>
                    </ul>
                    <button
                        onClick={() => handleSubscribe("price_1SZo4TRu0REP21glGUP59fj3")}
                        disabled={loading}
                        className="w-full py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
                        Suscribirse Ahora
                    </button>
                </div>

                {/* PLAN ANUAL (Solo visual por ahora si no configuraste la variable) */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-orange-100 hover:border-orange-500 transition-all">
                    <h3 className="text-xl font-semibold text-gray-900">Anual</h3>
                    <div className="my-4">
                        <span className="text-4xl font-bold text-gray-900">$999</span>
                        <span className="text-gray-500">/año</span>
                    </div>
                    <ul className="text-left space-y-3 mb-8 text-gray-600">
                        <li className="flex gap-2"><Check className="text-green-500" size={20} /> Punto de Venta Ilimitado</li>
                        <li className="flex gap-2"><Check className="text-green-500" size={20} /> Gestión de Inventarios</li>
                        <li className="flex gap-2"><Check className="text-green-500" size={20} /> Soporte Técnico</li>
                    </ul>
                    <button
                        onClick={() => handleSubscribe("price_1SZoB9Ru0REP21gly3NK5SyL")}
                        disabled={loading}
                        className="w-full py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <CreditCard size={20} />}
                        Suscribirse Ahora
                    </button>
                </div>

            </div>
        </div>
    );
}