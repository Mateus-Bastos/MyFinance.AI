import { Upload, Loader2, Tag, Search } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { NOMES_MESES } from '../../utils/constants'
import Logo from '../ui/Logo'
import BuscaSemantica from '../ui/BuscaSemantica'
import PluggyConnectButton from '../pluggy/PluggyConnectButton'

export default function Header() {
  const {
    menuAtivo,
    anoSelecionado,
    setAnoSelecionado,
    mesSelecionado,
    setMesSelecionado,
    categoriaSelecionada,
    setCategoriaSelecionada,
    anosDisponiveis,
    mesesDoAnoSelecionado,
    uploading,
    handleUpload,
    nomesCategorias,
    pluggyConfigurado,
    recarregarTudo,
  } = useApp()

  const [buscaAberta, setBuscaAberta] = useState(false)

  const getTitulo = () => {
    switch (menuAtivo) {
      case 'dashboard': return 'Dashboard'
      case 'transacoes': return 'Transações'
      case 'investimentos': return 'Investimentos'
      case 'config': return 'Configurações'
      case 'ajuda': return 'Ajuda'
      default: return 'Dashboard'
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-[#0f0f23]/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Título + Logo mobile */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mobile */}
            <div className="lg:hidden">
              <Logo size={36} />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-semibold text-white">
                {getTitulo()}
              </h2>
              <p className="text-xs lg:text-sm text-slate-500 mt-0.5">
                {mesSelecionado ? NOMES_MESES[mesSelecionado] : 'Todo o ano'} de {anoSelecionado}
              </p>
            </div>
          </div>
          
          {/* Upload Button mobile */}
          <label className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all font-medium text-sm
            ${uploading 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
            }`}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Filtros */}
          <div className="flex items-center bg-white/5 rounded-xl border border-white/10 overflow-hidden flex-wrap">
            <select 
              value={anoSelecionado} 
              onChange={(e) => { setAnoSelecionado(e.target.value); setMesSelecionado("") }} 
              className="px-3 lg:px-4 py-2.5 bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer text-sm border-r border-white/10 flex-1 sm:flex-none"
            >
              {anosDisponiveis.map(ano => <option key={ano} value={ano} className="bg-[#1a1a2e]">{ano}</option>)}
            </select>
            <select 
              value={mesSelecionado} 
              onChange={(e) => setMesSelecionado(e.target.value)} 
              className="px-3 lg:px-4 py-2.5 bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer text-sm border-r border-white/10 flex-1 sm:flex-none"
            >
              <option value="" className="bg-[#1a1a2e]">Todo Ano</option>
              {mesesDoAnoSelecionado.map(mes => (
                <option key={mes} value={mes} className="bg-[#1a1a2e]">{NOMES_MESES[mes]}</option>
              ))}
            </select>
            <div className="flex items-center flex-1 sm:flex-none">
              <Tag className="w-4 h-4 text-slate-500 ml-3" />
              <select 
                value={categoriaSelecionada} 
                onChange={(e) => setCategoriaSelecionada(e.target.value)} 
                className="px-2 lg:px-3 py-2.5 bg-transparent text-slate-300 font-medium focus:outline-none cursor-pointer text-sm pr-3 flex-1"
              >
                <option value="" className="bg-[#1a1a2e]">Todas</option>
                {nomesCategorias.map(cat => (
                  <option key={cat} value={cat} className="bg-[#1a1a2e]">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Botão Busca IA */}
          <button
            onClick={() => setBuscaAberta(true)}
            className="hidden lg:flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-violet-500/20 border border-white/10 hover:border-violet-500/30 text-slate-300 hover:text-violet-300 rounded-xl transition-all font-medium text-sm"
          >
            <Search className="w-4 h-4" />
            <span>Busca IA</span>
            <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[10px] bg-white/5 rounded text-slate-500">
              ⌘K
            </kbd>
          </button>

          {/* Pluggy Connect Button desktop */}
          {pluggyConfigurado && (
            <div className="hidden lg:block">
              <PluggyConnectButton onSuccess={recarregarTudo} />
            </div>
          )}

          {/* Upload Button desktop */}
          <label className={`hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer transition-all font-medium text-sm
            ${uploading 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-lg hover:shadow-violet-500/25 hover:scale-105'
            }`}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? 'Processando...' : 'Importar PDF'}</span>
            <input type="file" className="hidden" accept=".pdf" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Modal de Busca Semântica */}
      <BuscaSemantica isOpen={buscaAberta} onClose={() => setBuscaAberta(false)} />
    </header>
  )
}

