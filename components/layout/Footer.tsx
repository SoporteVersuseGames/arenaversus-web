import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#111111] border-t border-white/7 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-av-gradient flex items-center justify-center font-black text-white text-sm">AV</div>
              <span className="font-bold text-white">Arena Versus</span>
            </div>
            <p className="text-gray-400 text-sm">La plataforma oficial de torneos esports para LATAM.</p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Plataforma</h4>
            <ul className="space-y-2">
              {([['Torneos', '/torneos'], ['Clasificación', '/clasificacion'], ['Registrarse', '/register']] as const).map(([l, h]) => (
                <li key={h}><Link href={h} className="text-gray-400 hover:text-white text-sm transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Comunidad</h4>
            <ul className="space-y-2">
              {['Discord', 'Instagram', 'TikTok', 'Twitter/X'].map(l => (
                <li key={l}><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Empresa</h4>
            <ul className="space-y-2">
              {([['Nosotros', '/#nosotros'], ['Contacto', '/#nosotros']] as const).map(([l, h]) => (
                <li key={l}><Link href={h} className="text-gray-400 hover:text-white text-sm transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/7 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 text-sm">
          <span>© 2026 Arena Versus. Todos los derechos reservados.</span>
          <span>🔒 Sin tarjeta de crédito · Siempre gratis · LATAM Esports</span>
        </div>
      </div>
    </footer>
  )
}
