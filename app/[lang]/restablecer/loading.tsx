export default function Loading() {
  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-[#111] text-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Restablecer contraseña</h1>
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-800 rounded"></div>
        <div className="h-10 bg-gray-800 rounded"></div>
        <div className="h-10 bg-green-800 rounded"></div>
      </div>
    </div>
  )
}
