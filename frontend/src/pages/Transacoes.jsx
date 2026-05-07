import { Receipt, Search, TrendingDown, TrendingUp } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { formatarMoeda, formatarData } from '../utils/formatters'

export default function Transacoes() {
  const { transacoes, loading, resumo } = useApp()
  const [busca, setBusca] = useState('')

  // Filtra transações pela busca (exclui investimentos - tem página própria)
  const transacoesFiltradas = useMemo(() => {
    let resultado = transacoes.filter(t => t.categoria !== 'Investimento' && !t.ignorar_no_resumo)
    
    // Aplica filtro de busca
    if (busca.trim()) {
      const termoBusca = busca.toLowerCase()
      resultado = resultado.filter(t => 
        t.descricao.toLowerCase().includes(termoBusca) ||
        t.categoria.toLowerCase().includes(termoBusca)
      )
    }
    
    return resultado
  }, [transacoes, busca])

  // Totais das transações filtradas (exclui investimentos de receitas e despesas)
  const totais = useMemo(() => {
    const receitas = transacoesFiltradas.filter(t => t.valor > 0 && t.categoria !== 'Investimento').reduce((acc, t) => acc + t.valor, 0)
    const despesas = transacoesFiltradas.filter(t => t.valor < 0 && t.categoria !== 'Investimento').reduce((acc, t) => acc + Math.abs(t.valor), 0)
    return { receitas, despesas, saldo: receitas - despesas }
  }, [transacoesFiltradas])

  return (
    <div className="p-4 lg:p-8">
      {/* Header da página */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white">Todas as Transações</h1>
            <p className="text-sm text-slate-500 mt-1">
              {transacoesFiltradas.length} de {transacoes.length} transações
            </p>
          </div>

          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar transação..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Mini cards de resumo */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-500 uppercase">Receitas</span>
            </div>
            <p className="text-lg font-bold text-emerald-400">{formatarMoeda(totais.receitas)}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <span className="text-xs text-slate-500 uppercase">Despesas</span>
            </div>
            <p className="text-lg font-bold text-rose-400">{formatarMoeda(totais.despesas)}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-4 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-slate-500 uppercase">Saldo</span>
            </div>
            <p className={`text-lg font-bold ${totais.saldo >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatarMoeda(totais.saldo)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-xl lg:rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/[0.02]">
              <tr>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                <th className="px-4 lg:px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    Carregando transações...
                  </td>
                </tr>
              ) : transacoesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    {busca ? 'Nenhuma transação encontrada para a busca.' : 'Nenhuma transação no período.'}
                  </td>
                </tr>
              ) : (
                transacoesFiltradas.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 lg:px-6 py-4 text-sm text-slate-400 whitespace-nowrap">
                      {formatarData(t.data)}
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">{t.descricao}</p>
                        <span className="md:hidden inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-slate-400">
                          {t.categoria}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 text-slate-400 border border-white/10">
                        {t.categoria}
                      </span>
                    </td>
                    <td className={`px-4 lg:px-6 py-4 text-right text-sm font-bold whitespace-nowrap
                      ${t.valor < 0 ? 'text-rose-400' : 'text-emerald-400'}`}
                    >
                      {formatarMoeda(t.valor)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer com total */}
        {transacoesFiltradas.length > 0 && (
          <div className="px-4 lg:px-6 py-4 border-t border-white/5 bg-white/[0.02] flex justify-between items-center">
            <span className="text-sm text-slate-500">
              Total de {transacoesFiltradas.length} transações
            </span>
            <span className={`text-sm font-bold ${totais.saldo >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              Saldo: {formatarMoeda(totais.saldo)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

