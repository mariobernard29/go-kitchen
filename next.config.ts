import type { NextConfig } from "next";
import Stripe from "stripe";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
// Inicializamos Stripe con la clave secreta
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover", // Usa la versión que te sugiera VS Code o la más reciente
});
