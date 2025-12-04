// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Inicializamos Stripe con la clave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-11-17.clover", // Updated to match the installed Stripe library version
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { priceId, userId, email } = body;

        // Crear una sesión de Checkout de Stripe
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            // Importante: Guardamos el ID del usuario en metadata para saber quién pagó luego
            metadata: {
                userId: userId,
            },
            customer_email: email, // Para que Stripe le mande el recibo
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscription?payment=cancelled`,
        });

        // Devolvemos la URL de pago al frontend
        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error("Error Stripe:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}