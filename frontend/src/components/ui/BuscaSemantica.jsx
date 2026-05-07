import { useState } from 'react'
import { Search, X, Sparkles, Loader2 } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../../utils/constants'
import { formatarMoeda, formatarData } from '../../utils/formatters'

export default function BuscaSemantica({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(false)
  const [buscou, setBuscou] = useState(false)

  const handleBusca = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setBuscou(true)

    try {
      const resp = await axios.post(`${API_BASE_URL}/busca`, {
        query: query.trim(),
        limite: 10,
        threshold: 0.5  // Threshold maior para resultados mais precisos
      })
      setResultados(resp.data.resultados)
    } catch (error) {
      console.error('Erro na busca:', error)
      setResultados([])
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setQuery('')
    setResultados([])
    setBuscou(false)
    onClose()
  }

  // Sugestões de busca
  const sugestoes = [
    'uber transporte',
    'restaurante alimentação',
    'mercado compras',
    'transferência pix'
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#1a1a2e] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <form onSubmit={handleBusca} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca inteligente... ex: uber, restaurante, mercado"
                autoFocus
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Buscar
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-3 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </form>

          {/* Sugestões */}
          {!buscou && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-slate-500">Sugestões:</span>
              {sugestoes.map((sug) => (
                <button
                  key={sug}
                  onClick={() => setQuery(sug)}
                  className="px-3 py-1 text-xs bg-white/5 hover:bg-violet-500/20 text-slate-400 hover:text-violet-300 rounded-lg transition-all border border-white/5 hover:border-violet-500/30"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-3" />
              <p className="text-slate-400">Buscando com IA...</p>
            </div>
          ) : buscou && resultados.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Nenhuma transação encontrada.</p>
              <p className="text-sm text-slate-500 mt-1">Tente outros termos de busca.</p>
            </div>
          ) : resultados.length > 0 ? (
            <div className="divide-y divide-white/5">
              {resultados.map((r) => (
                <div
                  key={r.id}
                  className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium truncate">{r.descricao}</p>
                      <span className="flex-shrink-0 px-2 py-0.5 text-[10px] font-medium bg-violet-500/20 text-violet-300 rounded-full">
                        {(r.similaridade * 100).toFixed(0)}% match
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">{formatarData(r.data)}</span>
                      <span className="text-xs px-2 py-0.5 bg-white/5 text-slate-400 rounded">
                        {r.categoria}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ml-4 ${r.valor < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formatarMoeda(r.valor)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Sparkles className="w-10 h-10 text-violet-400/50 mx-auto mb-3" />
              <p className="text-slate-400">Busca Semântica com IA</p>
              <p className="text-sm text-slate-500 mt-1">
                Encontre transações por contexto, não apenas texto exato.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {resultados.length > 0 && (
          <div className="p-3 border-t border-white/5 bg-white/[0.02]">
            <p className="text-xs text-slate-500 text-center">
              {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

