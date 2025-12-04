// src/app/signup/page.tsx
"use client";
import Image from "next/image";
import { useState } from "react";
import { auth, db } from "@/lib/firebase"; // Importamos nuestra conexión
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ChefHat, Mail, Lock, Store, Loader2 } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();

    // Estados para guardar lo que escribe el usuario
    const [formData, setFormData] = useState({
        restaurantName: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Manejar el envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Crear usuario en Authentication
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;

            // 2. Crear el documento del Restaurante en Firestore
            // Usamos el UID del usuario como ID del documento para vincularlo fácil
            await setDoc(doc(db, "restaurants", user.uid), {
                name: formData.restaurantName,
                ownerId: user.uid,
                email: formData.email,
                plan: "free_trial", // Empezamos con prueba gratis
                createdAt: serverTimestamp(),
                isActive: true,
            });

            // 3. Crear documento de configuración inicial del usuario (Dueño)
            // Guardamos info extra del usuario dentro de la colección del restaurante
            await setDoc(doc(db, `restaurants/${user.uid}/staff`, user.uid), {
                name: "Dueño",
                email: formData.email,
                role: "owner", // Rol de super administrador
                createdAt: serverTimestamp(),
            });

            alert("¡Cuenta creada con éxito!");
            router.push("/dashboard"); // Redirigir al panel principal (lo crearemos luego)

        } catch (err: any) {
            console.error(err);
            // Mensajes de error amigables
            if (err.code === "auth/email-already-in-use") {
                setError("Este correo ya está registrado.");
            } else if (err.code === "auth/weak-password") {
                setError("La contraseña debe tener al menos 6 caracteres.");
            } else {
                setError("Ocurrió un error al registrarse. Intenta de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">

                {/* Encabezado con Logo */}
                <div className="text-center">
                    <div className="mx-auto flex justify-center"> {/* Quitamos el fondo naranja redondo */}
                        <Image
                            src="/logo-icon.svg" /* Aquí queda mejor solo el ícono */
                            alt="Go Kitchen"
                            width={80}
                            height={80}
                        />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Crea tu cuenta en Go Kitchen
                    </h2>
                    {/* ... */}
                </div>
                {/* Formulario */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">

                        {/* Input Nombre del Restaurante */}
                        <div className="relative mb-4">
                            <label htmlFor="restaurant-name" className="sr-only">Nombre del Restaurante</label>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Store className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="restaurant-name"
                                name="restaurantName"
                                type="text"
                                required
                                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                placeholder="Nombre de tu Restaurante"
                                value={formData.restaurantName}
                                onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                            />
                        </div>

                        {/* Input Email */}
                        <div className="relative mb-4">
                            <label htmlFor="email-address" className="sr-only">Correo Electrónico</label>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                placeholder="correo@ejemplo.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        {/* Input Password */}
                        <div className="relative">
                            <label htmlFor="password" className="sr-only">Contraseña</label>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                placeholder="Contraseña segura"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Mensaje de Error */}
                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    {/* Botón de Registro */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                "Crear Cuenta y Restaurante"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}