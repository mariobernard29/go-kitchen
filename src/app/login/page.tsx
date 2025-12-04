// src/app/login/page.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, LogIn } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
            router.push("/dashboard"); // Si entra bien, lo mandamos al panel
        } catch (err: any) {
            console.error(err);
            if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
                setError("Correo o contraseña incorrectos.");
            } else if (err.code === "auth/too-many-requests") {
                setError("Demasiados intentos fallidos. Intenta más tarde.");
            } else {
                setError("Error al iniciar sesión.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">

                {/* Encabezado */}
                <div className="text-center">
                    <div className="mx-auto flex justify-center mb-4">
                        <Image
                            src="/logo-icon.svg"
                            alt="Go Kitchen"
                            width={60}
                            height={60}
                        />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Bienvenido de nuevo</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Inicia sesión para gestionar tu restaurante
                    </p>
                </div>

                {/* Formulario */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                required
                                className="w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="Correo electrónico"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full pl-10 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="Contraseña"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Ingresar"}
                    </button>
                </form>

                {/* Pie de página */}
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        ¿No tienes cuenta?{" "}
                        <Link href="/signup" className="font-medium text-orange-600 hover:text-orange-500">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}