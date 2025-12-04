// src/app/dashboard/page.tsx
export default function DashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Resumen del Restaurante</h1>

            {/* Tarjetas de Estadísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: "Ventas Hoy", val: "$0.00", color: "bg-blue-500" },
                    { label: "Órdenes Activas", val: "0", color: "bg-orange-500" },
                    { label: "Mesas Ocupadas", val: "0/10", color: "bg-green-500" },
                    { label: "Inventario Bajo", val: "0 Items", color: "bg-red-500" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className={`h-2 w-8 ${stat.color} rounded-full mb-4`}></div>
                        <p className="text-gray-500 text-sm">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stat.val}</h3>
                    </div>
                ))}
            </div>

            {/* Sección de Acciones Rápidas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Comenzar</h2>
                <p className="text-gray-600 mb-4">
                    Bienvenido a Go Kitchen. Para empezar a vender, necesitas configurar tu menú.
                </p>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                    Crear mi primer producto
                </button>
            </div>
        </div>
    );
}