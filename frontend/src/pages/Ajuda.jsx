import { 
  HelpCircle, Upload, Brain, Database, BarChart3, 
  FileText, Sparkles, PiggyBank, ArrowRight, CheckCircle2,
  Wallet, Settings
} from 'lucide-react'

export default function Ajuda() {
  const etapas = [
    {
      numero: 1,
      titulo: 'Importar Extrato',
      descricao: 'Faça upload do PDF do seu extrato bancário ou fatura de cartão de crédito.',
      icon: Upload,
      cor: 'violet'
    },
    {
      numero: 2,
      titulo: 'Processamento com IA',
      descricao: 'Nossa inteligência artificial (Google Gemini) analisa o documento e extrai todas as transações automaticamente.',
      icon: Brain,
      cor: 'fuchsia'
    },
    {
      numero: 3,
      titulo: 'Categorização Inteligente',
      descricao: 'Cada transação é categorizada automaticamente: Alimentação, Transporte, Investimento, etc.',
      icon: Sparkles,
      cor: 'amber'
    },
    {
      numero: 4,
      titulo: 'Armazenamento Seguro',
      descricao: 'Os dados são salvos no banco de dados PostgreSQL. Transações duplicadas são ignoradas automaticamente.',
      icon: Database,
      cor: 'emerald'
    },
    {
      numero: 5,
      titulo: 'Visualização e Análise',
      descricao: 'Visualize seus gastos em gráficos, filtre por período e categoria, e acompanhe sua evolução financeira.',
      icon: BarChart3,
      cor: 'sky'
    }
  ]

  const recursos = [
    {
      titulo: 'Dashboard',
      descricao: 'Visão geral com saldo, receitas, despesas e investimentos. Gráficos de evolução mensal e distribuição por categoria.',
      icon: Wallet
    },
    {
      titulo: 'Transações',
      descricao: 'Lista completa de todas as transações com busca. Filtre por ano, mês ou categoria.',
      icon: FileText
    },
    {
      titulo: 'Investimentos',
      descricao: 'Acompanhe suas aplicações financeiras separadamente. Investimentos não são contabilizados como despesas.',
      icon: PiggyBank
    },
    {
      titulo: 'Configurações',
      descricao: 'Edite, crie ou exclua transações manualmente. Corrija categorizações ou adicione transações que não estavam no extrato.',
      icon: Settings
    }
  ]

  const categorias = [
    { nome: 'Alimentação', exemplos: 'Restaurantes, supermercados, delivery' },
    { nome: 'Transporte', exemplos: 'Uber, combustível, estacionamento' },
    { nome: 'Lazer', exemplos: 'Cinema, streaming, viagens' },
    { nome: 'Saúde', exemplos: 'Farmácias, consultas, planos' },
    { nome: 'Educação', exemplos: 'Cursos, livros, mensalidades' },
    { nome: 'Compras', exemplos: 'Lojas, e-commerce, vestuário' },
    { nome: 'Serviços', exemplos: 'Luz, água, internet, telefone' },
    { nome: 'Investimento', exemplos: 'CDB, ações, Tesouro Direto' },
    { nome: 'Transferência', exemplos: 'PIX, TED, DOC' },
    { nome: 'Outros', exemplos: 'Demais transações' },
  ]

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Como funciona o MyFinance<span className="text-violet-400">.AI</span>
            </h1>
            <p className="text-slate-500 mt-1">Entenda o processo completo de análise financeira</p>
          </div>
        </div>
      </div>

      {/* Introdução */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-6 lg:p-8 rounded-2xl border border-white/5 mb-8">
        <p className="text-slate-300 leading-relaxed">
          O <span className="text-violet-400 font-semibold">MyFinance.AI</span> é um sistema de gestão financeira pessoal 
          que utiliza <span className="text-fuchsia-400 font-semibold">Inteligência Artificial</span> para automatizar 
          a extração e categorização de transações a partir de extratos bancários em PDF. 
          Basta fazer upload do seu extrato e deixar a IA fazer o trabalho pesado!
        </p>
      </div>

      {/* Etapas do Processo */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          O Processo em 5 Etapas
        </h2>
        
        <div className="space-y-4">
          {etapas.map((etapa, index) => (
            <div key={etapa.numero} className="relative">
              <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-5 rounded-2xl border border-white/5 flex items-start gap-5 hover:border-violet-500/30 transition-all">
                {/* Número */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                  ${etapa.cor === 'violet' ? 'bg-violet-500/20' : ''}
                  ${etapa.cor === 'fuchsia' ? 'bg-fuchsia-500/20' : ''}
                  ${etapa.cor === 'amber' ? 'bg-amber-500/20' : ''}
                  ${etapa.cor === 'emerald' ? 'bg-emerald-500/20' : ''}
                  ${etapa.cor === 'sky' ? 'bg-sky-500/20' : ''}
                `}>
                  <etapa.icon className={`w-6 h-6
                    ${etapa.cor === 'violet' ? 'text-violet-400' : ''}
                    ${etapa.cor === 'fuchsia' ? 'text-fuchsia-400' : ''}
                    ${etapa.cor === 'amber' ? 'text-amber-400' : ''}
                    ${etapa.cor === 'emerald' ? 'text-emerald-400' : ''}
                    ${etapa.cor === 'sky' ? 'text-sky-400' : ''}
                  `} />
                </div>
                
                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-500">ETAPA {etapa.numero}</span>
                  </div>
                  <h3 className="text-white font-semibold mb-1">{etapa.titulo}</h3>
                  <p className="text-sm text-slate-400">{etapa.descricao}</p>
                </div>

                {/* Seta */}
                {index < etapas.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-slate-600 flex-shrink-0 hidden lg:block" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recursos */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Recursos Disponíveis
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recursos.map((recurso) => (
            <div 
              key={recurso.titulo}
              className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] p-5 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                  <recurso.icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-white font-semibold">{recurso.titulo}</h3>
              </div>
              <p className="text-sm text-slate-400">{recurso.descricao}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categorias */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-fuchsia-400" />
          Categorias de Transação
        </h2>
        
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-2xl border border-white/5 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
            <div className="divide-y divide-white/5">
              {categorias.slice(0, 5).map((cat) => (
                <div key={cat.nome} className="p-4 flex justify-between items-center">
                  <span className="text-white font-medium text-sm">{cat.nome}</span>
                  <span className="text-xs text-slate-500">{cat.exemplos}</span>
                </div>
              ))}
            </div>
            <div className="divide-y divide-white/5">
              {categorias.slice(5).map((cat) => (
                <div key={cat.nome} className="p-4 flex justify-between items-center">
                  <span className="text-white font-medium text-sm">{cat.nome}</span>
                  <span className="text-xs text-slate-500">{cat.exemplos}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Nota sobre Investimentos */}
      <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 p-6 rounded-2xl border border-violet-500/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <PiggyBank className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Sobre Investimentos</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Transações categorizadas como <span className="text-violet-400">Investimento</span> (CDB, ações, Tesouro Direto, etc.) 
              são separadas das despesas normais. Isso porque o dinheiro investido ainda é seu patrimônio, 
              apenas em outra forma. Assim, seu <span className="text-emerald-400">saldo real</span> reflete 
              melhor sua situação financeira.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center">
        <p className="text-sm text-slate-600">
          Desenvolvido com 💜 usando React, FastAPI, PostgreSQL e Google Gemini AI
        </p>
      </div>
    </div>
  )
}

