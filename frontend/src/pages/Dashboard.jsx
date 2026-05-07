import { TrendingDown, TrendingUp, PiggyBank, BarChart3, PieChart as PieIcon, Tag, Receipt, Landmark } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { useApp } from '../context/AppContext'
import { formatarMoeda } from '../utils/formatters'
import { COLORS } from '../utils/constants'

export default function Dashboard() {
  const {
    resumo,
    dadosBarras,
    dadosPizza,
    transacoes,
    loading,
    anoSelecionado,
    categoriaSelecionada,
    totalCategoriaFiltrada,
    coresCategorias,
  } = useApp()

  // Função para obter cor da categoria (dinâmica ou fallback)
  const getCorCategoria = (nomeCategoria, index) => {
    return coresCategorias[nomeCategoria] || COLORS[index % COLORS.length]
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Cards de Resumo */}
      <div className={`grid grid-cols-2 gap-3 lg:gap-4 mb-6 lg:mb-8 ${categoriaSelecionada ? 'lg:grid-cols-6' : 'lg:grid-cols-5'}`}>
        
        {/* Saldo */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-white/5 relative overflow-hidden group hover:border-violet-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 lg:w-32 h-24 lg:h-32 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <p className="text-[10px] lg:text-xs text-slate-500 font-medium uppercase tracking-wider mb-2 lg:mb-3">Saldo</p>
          <p className={`text-lg lg:text-2xl font-bold ${resumo.saldo >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {loading ? "..." : formatarMoeda(resumo.saldo)}
          </p>
          <div className={`mt-2 lg:mt-3 inline-flex items-center gap-1 lg:gap-1.5 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md lg:rounded-lg text-[10px] lg:text-xs font-medium
            ${resumo.saldo >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {resumo.saldo >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span className="hidden sm:inline">{resumo.saldo >= 0 ? 'Positivo' : 'Negativo'}</span>
          </div>
        </div>

        {/* Receitas */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 lg:w-32 h-24 lg:h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <p className="text-[10px] lg:text-xs text-slate-500 font-medium uppercase tracking-wider mb-2 lg:mb-3">Receitas</p>
          <p className="text-lg lg:text-2xl font-bold text-emerald-400">{formatarMoeda(resumo.receitas)}</p>
          <div className="mt-2 lg:mt-3 inline-flex items-center gap-1 lg:gap-1.5 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md lg:rounded-lg text-[10px] lg:text-xs font-medium bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span className="hidden sm:inline">Entradas</span>
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-white/5 relative overflow-hidden group hover:border-rose-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 lg:w-32 h-24 lg:h-32 bg-gradient-to-br from-rose-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <p className="text-[10px] lg:text-xs text-slate-500 font-medium uppercase tracking-wider mb-2 lg:mb-3">Despesas</p>
          <p className="text-lg lg:text-2xl font-bold text-rose-400">{formatarMoeda(resumo.despesas)}</p>
          <div className="mt-2 lg:mt-3 inline-flex items-center gap-1 lg:gap-1.5 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md lg:rounded-lg text-[10px] lg:text-xs font-medium bg-rose-500/10 text-rose-400">
            <TrendingDown className="w-3 h-3" />
            <span className="hidden sm:inline">Saídas</span>
          </div>
        </div>

        {/* Investimentos */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-white/5 relative overflow-hidden group hover:border-violet-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 lg:w-32 h-24 lg:h-32 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <p className="text-[10px] lg:text-xs text-slate-500 font-medium uppercase tracking-wider mb-2 lg:mb-3">Investimentos</p>
          <p className="text-lg lg:text-2xl font-bold text-violet-400">{formatarMoeda(resumo.investimentos)}</p>
          <div className="mt-2 lg:mt-3 inline-flex items-center gap-1 lg:gap-1.5 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md lg:rounded-lg text-[10px] lg:text-xs font-medium bg-violet-500/10 text-violet-400">
            <PiggyBank className="w-3 h-3" />
            <span className="hidden sm:inline">Aplicações</span>
          </div>
        </div>

        {/* Patrimônio */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 lg:w-32 h-24 lg:h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <p className="text-[10px] lg:text-xs text-slate-500 font-medium uppercase tracking-wider mb-2 lg:mb-3">Patrimônio</p>
          <p className="text-lg lg:text-2xl font-bold text-amber-400">
            {loading ? "..." : formatarMoeda(resumo.saldo + resumo.investimentos)}
          </p>
          <div className="mt-2 lg:mt-3 inline-flex items-center gap-1 lg:gap-1.5 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md lg:rounded-lg text-[10px] lg:text-xs font-medium bg-amber-500/10 text-amber-400">
            <Landmark className="w-3 h-3" />
            <span className="hidden sm:inline">Saldo + Investido</span>
          </div>
        </div>

        {/* Card Dinâmico - Categoria Filtrada */}
        {categoriaSelecionada && (
          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-fuchsia-500/30 relative overflow-hidden group hover:border-fuchsia-400/50 transition-all ring-1 ring-fuchsia-500/20">
            <div className="absolute top-0 right-0 w-24 lg:w-32 h-24 lg:h-32 bg-gradient-to-br from-fuchsia-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2 lg:mb-3">
                <Tag className="w-3 h-3 text-fuchsia-400" />
                <p className="text-[10px] lg:text-xs text-fuchsia-400 font-medium uppercase tracking-wider truncate">{categoriaSelecionada}</p>
              </div>
              <p className="text-lg lg:text-2xl font-bold text-fuchsia-400">{formatarMoeda(totalCategoriaFiltrada)}</p>
              <div className="mt-2 lg:mt-3 inline-flex items-center gap-1 lg:gap-1.5 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md lg:rounded-lg text-[10px] lg:text-xs font-medium bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                <Receipt className="w-3 h-3" />
                {transacoes.length} <span className="hidden sm:inline">transações</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        
        {/* Gráfico de Barras */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-white/5">
          <h3 className="text-xs lg:text-sm font-semibold text-white mb-4 lg:mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-400" /> 
            Evolução Mensal — {anoSelecionado}
          </h3>
          <div className="h-48 lg:h-64 w-full">
            {dadosBarras.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosBarras}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff08" />
                  <XAxis dataKey="mes" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
<Tooltip 
                                    formatter={(value) => formatarMoeda(value)} 
                                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#94a3b8' }}
                                  />
                                  <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                Sem dados para exibir
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Pizza */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-4 lg:p-6 rounded-xl lg:rounded-2xl border border-white/5">
          <h3 className="text-xs lg:text-sm font-semibold text-white mb-4 lg:mb-6 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-fuchsia-400" /> 
            Por Categoria
          </h3>
          <div className="h-40 lg:h-48 w-full">
            {dadosPizza.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={dadosPizza} 
                    innerRadius={50} 
                    outerRadius={70} 
                    paddingAngle={3} 
                    dataKey="value"
                    stroke="none"
                  >
                    {dadosPizza.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCorCategoria(entry.name, index)} />
                    ))}
                  </Pie>
<Tooltip 
                                    formatter={(value) => formatarMoeda(value)} 
                                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#94a3b8' }}
                                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                Sem dados
              </div>
            )}
          </div>
          {/* Legenda */}
          <div className="mt-4 space-y-2">
            {dadosPizza.slice(0, 4).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getCorCategoria(item.name, index) }}></div>
                  <span className="text-slate-400">{item.name}</span>
                </div>
                <span className="text-slate-300 font-medium">{formatarMoeda(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

