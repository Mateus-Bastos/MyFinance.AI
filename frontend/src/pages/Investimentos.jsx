import { PiggyBank, TrendingUp, Calendar, Wallet, ArrowDownCircle } from 'lucide-react'
import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { formatarMoeda, formatarData } from '../utils/formatters'

const PADROES_RENDIMENTO = [
  'TRANSFERÊNCIA DE SALDO',
  'TRANSFERENCIA DE SALDO',
  'RENDIMENTO',
  'DIVIDENDO',
  'PROVENTO',
  'JUROS SOBRE CAPITAL',
  'JCP',
]

function isRendimento(descricao) {
  const upper = descricao.toUpperCase()
  return PADROES_RENDIMENTO.some(p => upper.includes(p))
}

export default function Investimentos() {
  const { transacoes, resumo, loading, anoSelecionado, mesSelecionado } = useApp()

  const investimentos = useMemo(() => {
    return transacoes.filter(t => t.categoria === 'Investimento')
  }, [transacoes])

  const investimentosPorMes = useMemo(() => {
    const grupos = {}
    investimentos.forEach(inv => {
      const mes = inv.data.substring(0, 7)
      if (!grupos[mes]) grupos[mes] = []
      grupos[mes].push(inv)
    })
    return Object.entries(grupos)
      .sort((a, b) => b[0].localeCompare(a[0]))
  }, [investimentos])

  const totalInvestido = useMemo(() => {
    return investimentos
      .filter(t => t.valor < 0)
      .reduce((acc, t) => acc + Math.abs(t.valor), 0)
  }, [investimentos])

  const totalRendimentos = useMemo(() => {
    return investimentos
      .filter(t => t.valor > 0 && isRendimento(t.descricao))
      .reduce((acc, t) => acc + t.valor, 0)
  }, [investimentos])

  const totalResgatado = useMemo(() => {
    return investimentos
      .filter(t => t.valor > 0 && !isRendimento(t.descricao))
      .reduce((acc, t) => acc + t.valor, 0)
  }, [investimentos])

  const formatarMesAno = (mesAno) => {
    const [ano, mes] = mesAno.split('-')
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${meses[parseInt(mes) - 1]} ${ano}`
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl lg:text-2xl font-bold text-white">Meus Investimentos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Acompanhe suas aplicações e resgates
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Investido</p>
              <p className="text-xs text-slate-600">no período</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-violet-400">{formatarMoeda(totalInvestido)}</p>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Rendimentos</p>
              <p className="text-xs text-slate-600">proventos recebidos</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{formatarMoeda(totalRendimentos)}</p>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <ArrowDownCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Resgatado</p>
              <p className="text-xs text-slate-600">no período</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-400">{formatarMoeda(totalResgatado)}</p>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-fuchsia-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-fuchsia-500/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-fuchsia-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Saldo Líquido</p>
              <p className="text-xs text-slate-600">investido - resgatado</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-fuchsia-400">{formatarMoeda(totalInvestido - totalResgatado)}</p>
        </div>
      </div>

      {/* Lista de Investimentos por Mês */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-violet-400" />
            Histórico de Investimentos
          </h3>
          <span className="text-xs font-medium bg-violet-500/10 text-violet-400 px-3 py-1.5 rounded-lg border border-violet-500/20">
            {investimentos.length} transações
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            Carregando investimentos...
          </div>
        ) : investimentos.length === 0 ? (
          <div className="p-12 text-center">
            <PiggyBank className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">Nenhum investimento encontrado no período.</p>
            <p className="text-slate-600 text-sm mt-1">Importe um extrato que contenha aplicações financeiras.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {investimentosPorMes.map(([mesAno, items]) => (
              <div key={mesAno} className="p-4 lg:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-slate-400">{formatarMesAno(mesAno)}</h4>
                  <span className="text-xs text-slate-500">
                    {items.length} {items.length === 1 ? 'transação' : 'transações'}
                  </span>
                </div>
                <div className="space-y-3">
                  {items.map((inv) => {
                    const rendimento = inv.valor > 0 && isRendimento(inv.descricao)
                    const resgate = inv.valor > 0 && !isRendimento(inv.descricao)
                    let bgClass, IconComp, iconClass, valorClass
                    if (rendimento) {
                      bgClass = 'bg-emerald-500/20'
                      IconComp = TrendingUp
                      iconClass = 'text-emerald-400'
                      valorClass = 'text-emerald-400'
                    } else if (resgate) {
                      bgClass = 'bg-amber-500/20'
                      IconComp = ArrowDownCircle
                      iconClass = 'text-amber-400'
                      valorClass = 'text-amber-400'
                    } else {
                      bgClass = 'bg-violet-500/20'
                      IconComp = PiggyBank
                      iconClass = 'text-violet-400'
                      valorClass = 'text-violet-400'
                    }
                    return (
                      <div 
                        key={inv.id}
                        className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl hover:bg-white/[0.04] transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass}`}>
                            <IconComp className={`w-5 h-5 ${iconClass}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{inv.descricao}</p>
                            <p className="text-xs text-slate-500">{formatarData(inv.data)}</p>
                          </div>
                        </div>
                        <p className={`text-sm font-bold ${valorClass}`}>
                          {inv.valor < 0 ? '-' : '+'}{formatarMoeda(Math.abs(inv.valor))}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

