import Link from "next/link";
import { ChefHat, ArrowRight, CheckCircle2, Zap, BarChart3, Smartphone } from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* --- NAVBAR --- */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {/* Reemplaza el ChefHat por esto */}
              <Image
                src="/logo-full.svg"
                alt="Go Kitchen"
                width={150}
                height={45}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-orange-600 font-medium hidden md:block">
              Iniciar Sesión
            </Link>
            <Link
              href="/signup"
              className="bg-gray-900 text-white px-5 py-2 rounded-full font-medium hover:bg-orange-600 transition-colors"
            >
              Prueba Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION (La Promesa) --- */}
      <header className="relative overflow-hidden pt-16 pb-24 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Tu restaurante, <span className="text-orange-600">bajo control.</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
            Sistema Punto de Venta (POS), Monitor de Cocina (KDS) y Gestión de Inventarios en una sola plataforma.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="flex items-center justify-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-orange-700 shadow-lg hover:shadow-xl transition-all"
            >
              Comenzar Ahora <ArrowRight />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-200 transition-all"
            >
              Ver Demo
            </Link>
          </div>
        </div>
      </header>

      {/* --- CARACTERÍSTICAS --- */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="text-orange-500" />}
              title="Punto de Venta Rápido"
              desc="Toma órdenes en segundos. Interfaz táctil intuitiva diseñada para meseros y cajeros."
            />
            <FeatureCard
              icon={<Smartphone className="text-blue-500" />}
              title="Monitor de Cocina KDS"
              desc="Olvídate del papel. Las comandas llegan directo a la pantalla del chef en tiempo real."
            />
            <FeatureCard
              icon={<BarChart3 className="text-green-500" />}
              title="Reportes y Ganancias"
              desc="Conoce tus productos más vendidos, controla el stock y visualiza tus ingresos diarios."
            />
          </div>
        </div>
      </section>

      {/* --- PRECIOS --- */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Un precio simple y transparente</h2>

          <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase">
              Más Popular
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Suscripción Pro</h3>
            <div className="my-6">
              <span className="text-5xl font-extrabold text-gray-900">$99</span>
              <span className="text-gray-500 text-xl"> / mes</span>
            </div>
            <ul className="text-left space-y-4 mb-8 max-w-xs mx-auto">
              <li className="flex gap-3 text-gray-700"><CheckCircle2 className="text-green-500" /> Mesas ilimitadas</li>
              <li className="flex gap-3 text-gray-700"><CheckCircle2 className="text-green-500" /> Usuarios ilimitados</li>
              <li className="flex gap-3 text-gray-700"><CheckCircle2 className="text-green-500" /> Soporte técnico 24/7</li>
              <li className="flex gap-3 text-gray-700"><CheckCircle2 className="text-green-500" /> Actualizaciones incluidas</li>
            </ul>
            <Link
              href="/signup"
              className="block w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors"
            >
              Empezar Prueba Gratis
            </Link>
            <p className="mt-4 text-sm text-gray-400">Cancela cuando quieras. Sin plazos forzosos.</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <ChefHat className="text-orange-500" />
            <span className="text-xl font-bold">Go Kitchen</span>
          </div>
          <p className="text-gray-400">© 2025 Go Kitchen Inc. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

// Componente auxiliar para las tarjetas
function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
      <div className="bg-gray-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}