export default function Loading() {
  return (
    <div className="pt-32 pb-8 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6 text-gold-500">Restablecer Contraseña</h1>
          <div className="bg-bunker-900/80 backdrop-blur-sm rounded-lg shadow-xl p-6 border border-gold-500/20 animate-pulse">
            <div className="h-6 bg-bunker-800 w-3/4 mx-auto mb-4 rounded"></div>
            <div className="space-y-4">
              <div className="h-10 bg-bunker-800 rounded"></div>
              <div className="h-10 bg-bunker-800 rounded"></div>
              <div className="h-12 bg-gold-500/30 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
