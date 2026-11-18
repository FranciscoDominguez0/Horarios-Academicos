export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-800">Página no encontrada</h2>
        <p className="text-xs text-slate-500">La ruta solicitada no existe.</p>
      </div>
    </div>
  );
}
