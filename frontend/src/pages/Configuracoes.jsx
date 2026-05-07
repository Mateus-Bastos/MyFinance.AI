import { useState } from 'react'
import { Settings, Edit3, Trash2, Plus, X, Save, Search, Tag, Palette, PiggyBank, Link2 } from 'lucide-react'
import axios from 'axios'
import { useApp } from '../context/AppContext'
import { formatarMoeda, formatarData } from '../utils/formatters'
import { API_BASE_URL } from '../utils/constants'
import PluggyConnectButton from '../components/pluggy/PluggyConnectButton'

export default function Configuracoes() {
  const { transacoes, loading, recarregarTudo, categorias, nomesCategorias, carregarCategorias, pluggyConfigurado } = useApp()
  
  // Tab ativa
  const [tabAtiva, setTabAtiva] = useState('transacoes')
  
  // Estados de transações
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [excluindo, setExcluindo] = useState(null)
  
  // Form state transações
  const [formData, setFormData] = useState({
    data: '',
    descricao: '',
    valor: '',
    categoria: 'Outros'
  })

  // Estados de categorias
  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false)
  const [modoEdicaoCategoria, setModoEdicaoCategoria] = useState(false)
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null)
  const [salvandoCategoria, setSalvandoCategoria] = useState(false)
  const [excluindoCategoria, setExcluindoCategoria] = useState(null)
  
  // Form state categorias
  const [formCategoria, setFormCategoria] = useState({
    nome: '',
    cor: '#818cf8',
    icone: '',
    descricao: ''
  })

  // Cores pré-definidas para seleção
  const coresPredefinidas = [
    '#f472b6', '#fb7185', '#f87171', '#fb923c', '#fbbf24', 
    '#facc15', '#a3e635', '#4ade80', '#2dd4bf', '#22d3ee',
    '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#e879f9',
    '#94a3b8', '#64748b'
  ]

  // ==================== TRANSAÇÕES ====================
  
  // Filtra transações do dia a dia (exclui investimentos)
  const transacoesFiltradas = transacoes.filter(t => {
    // Exclui investimentos - tem tab própria
    if (t.categoria === 'Investimento') return false
    if (!busca.trim()) return true
    const termo = busca.toLowerCase()
    return t.descricao.toLowerCase().includes(termo) || t.categoria.toLowerCase().includes(termo)
  })

  // Filtra apenas investimentos
  const investimentosFiltrados = transacoes.filter(t => {
    if (t.categoria !== 'Investimento') return false
    if (!busca.trim()) return true
    const termo = busca.toLowerCase()
    return t.descricao.toLowerCase().includes(termo)
  })

  // Abre modal para criar nova transação
  const abrirModalCriar = () => {
    setFormData({
      data: new Date().toISOString().split('T')[0],
      descricao: '',
      valor: '',
      categoria: tabAtiva === 'investimentos' ? 'Investimento' : 'Outros'
    })
    setModoEdicao(false)
    setTransacaoSelecionada(null)
    setModalAberto(true)
  }

  // Abre modal para editar transação
  const abrirModalEditar = (transacao) => {
    setFormData({
      data: transacao.data,
      descricao: transacao.descricao,
      valor: Math.abs(transacao.valor).toString(),
      categoria: transacao.categoria
    })
    setModoEdicao(true)
    setTransacaoSelecionada(transacao)
    setModalAberto(true)
  }

  // Fecha o modal
  const fecharModal = () => {
    setModalAberto(false)
    setTransacaoSelecionada(null)
    setFormData({ data: '', descricao: '', valor: '', categoria: 'Outros' })
  }

  // Salvar transação (criar ou editar)
  const salvarTransacao = async () => {
    if (!formData.data || !formData.descricao || !formData.valor) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setSalvando(true)
    
    // Valor é negativo para despesas (padrão)
    const valorNumerico = -Math.abs(parseFloat(formData.valor))
    
    const payload = {
      data: formData.data,
      descricao: formData.descricao,
      valor: valorNumerico,
      categoria: formData.categoria
    }

    try {
      if (modoEdicao && transacaoSelecionada) {
        await axios.put(`${API_BASE_URL}/transacoes/${transacaoSelecionada.id}`, payload)
      } else {
        await axios.post(`${API_BASE_URL}/transacoes`, payload)
      }
      
      fecharModal()
      recarregarTudo()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar transação')
    } finally {
      setSalvando(false)
    }
  }

  // Excluir transação
  const excluirTransacao = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return
    
    setExcluindo(id)
    
    try {
      await axios.delete(`${API_BASE_URL}/transacoes/${id}`)
      recarregarTudo()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir transação')
    } finally {
      setExcluindo(null)
    }
  }

  // ==================== CATEGORIAS ====================

  // Abre modal para criar nova categoria
  const abrirModalCriarCategoria = () => {
    setFormCategoria({
      nome: '',
      cor: '#818cf8',
      icone: '',
      descricao: ''
    })
    setModoEdicaoCategoria(false)
    setCategoriaSelecionada(null)
    setModalCategoriaAberto(true)
  }

  // Abre modal para editar categoria
  const abrirModalEditarCategoria = (categoria) => {
    setFormCategoria({
      nome: categoria.nome,
      cor: categoria.cor || '#818cf8',
      icone: categoria.icone || '',
      descricao: categoria.descricao || ''
    })
    setModoEdicaoCategoria(true)
    setCategoriaSelecionada(categoria)
    setModalCategoriaAberto(true)
  }

  // Fecha modal de categoria
  const fecharModalCategoria = () => {
    setModalCategoriaAberto(false)
    setCategoriaSelecionada(null)
    setFormCategoria({ nome: '', cor: '#818cf8', icone: '', descricao: '' })
  }

  // Salvar categoria
  const salvarCategoria = async () => {
    if (!formCategoria.nome.trim()) {
      alert('O nome da categoria é obrigatório')
      return
    }

    setSalvandoCategoria(true)
    
    const payload = {
      nome: formCategoria.nome.trim(),
      cor: formCategoria.cor,
      icone: formCategoria.icone || null,
      descricao: formCategoria.descricao || null
    }

    try {
      if (modoEdicaoCategoria && categoriaSelecionada) {
        await axios.put(`${API_BASE_URL}/categorias/${categoriaSelecionada.id}`, payload)
      } else {
        await axios.post(`${API_BASE_URL}/categorias`, payload)
      }
      
      fecharModalCategoria()
      carregarCategorias()
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      const msg = error.response?.data?.detail || 'Erro ao salvar categoria'
      alert(msg)
    } finally {
      setSalvandoCategoria(false)
    }
  }

  // Excluir categoria
  const excluirCategoria = async (id, nome) => {
    if (nome === 'Outros') {
      alert('A categoria "Outros" não pode ser excluída.')
      return
    }
    
    if (!confirm(`Tem certeza que deseja excluir a categoria "${nome}"?\nTransações com essa categoria serão movidas para "Outros".`)) return
    
    setExcluindoCategoria(id)
    
    try {
      await axios.delete(`${API_BASE_URL}/categorias/${id}`)
      carregarCategorias()
      recarregarTudo() // Recarrega transações que podem ter mudado
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      alert('Erro ao excluir categoria')
    } finally {
      setExcluindoCategoria(null)
    }
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-3">
              <Settings className="w-6 h-6 text-violet-400" />
              Configurações
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Gerencie transações e categorias
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setTabAtiva('transacoes')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tabAtiva === 'transacoes'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Transações
          </button>
          <button
            onClick={() => setTabAtiva('investimentos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tabAtiva === 'investimentos'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            Investimentos
          </button>
          <button
            onClick={() => setTabAtiva('categorias')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tabAtiva === 'categorias'
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            Categorias
          </button>
          {pluggyConfigurado && (
            <button
              onClick={() => setTabAtiva('conexoes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tabAtiva === 'conexoes'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Link2 className="w-4 h-4" />
              Conexões
            </button>
          )}
        </div>
      </div>

      {/* ==================== TAB TRANSAÇÕES ==================== */}
      {tabAtiva === 'transacoes' && (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Barra de busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar transação..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>

            <button
              onClick={abrirModalCriar}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nova Transação
            </button>
          </div>

          {/* Lista de Transações */}
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/[0.02]">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                    <th className="px-4 lg:px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        Carregando...
                      </td>
                    </tr>
                  ) : transacoesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        Nenhuma transação encontrada.
                      </td>
                    </tr>
                  ) : (
                    transacoesFiltradas.map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 lg:px-6 py-4 text-sm text-slate-400 whitespace-nowrap">
                          {formatarData(t.data)}
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <p className="text-sm font-medium text-white">{t.descricao}</p>
                          <span className="md:hidden inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-slate-400">
                            {t.categoria}
                          </span>
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
                        <td className="px-4 lg:px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => abrirModalEditar(t)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-violet-500/20 text-slate-400 hover:text-violet-400 transition-all"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => excluirTransacao(t.id)}
                              disabled={excluindo === t.id}
                              className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all disabled:opacity-50"
                              title="Excluir"
                            >
                              <Trash2 className={`w-4 h-4 ${excluindo === t.id ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {transacoesFiltradas.length > 0 && (
              <div className="px-4 lg:px-6 py-4 border-t border-white/5 bg-white/[0.02]">
                <span className="text-sm text-slate-500">
                  {transacoesFiltradas.length} transações
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* ==================== TAB INVESTIMENTOS ==================== */}
      {tabAtiva === 'investimentos' && (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Barra de busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar investimento..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
            </div>

            <button
              onClick={abrirModalCriar}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Novo Investimento
            </button>
          </div>

          {/* Lista de Investimentos */}
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-2xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/[0.02]">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                    <th className="px-4 lg:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Tipo</th>
                    <th className="px-4 lg:px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                    <th className="px-4 lg:px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        Carregando...
                      </td>
                    </tr>
                  ) : investimentosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        <PiggyBank className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        Nenhum investimento encontrado.
                      </td>
                    </tr>
                  ) : (
                    investimentosFiltrados.map((t) => (
                      <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 lg:px-6 py-4 text-sm text-slate-400 whitespace-nowrap">
                          {formatarData(t.data)}
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <p className="text-sm font-medium text-white">{t.descricao}</p>
                        </td>
                        <td className="px-4 lg:px-6 py-4 hidden md:table-cell">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                            t.valor < 0 
                              ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {t.valor < 0 ? 'Aplicação' : 'Resgate'}
                          </span>
                        </td>
                        <td className={`px-4 lg:px-6 py-4 text-right text-sm font-bold whitespace-nowrap
                          ${t.valor < 0 ? 'text-violet-400' : 'text-emerald-400'}`}
                        >
                          {formatarMoeda(t.valor)}
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => abrirModalEditar(t)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-violet-500/20 text-slate-400 hover:text-violet-400 transition-all"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => excluirTransacao(t.id)}
                              disabled={excluindo === t.id}
                              className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all disabled:opacity-50"
                              title="Excluir"
                            >
                              <Trash2 className={`w-4 h-4 ${excluindo === t.id ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {investimentosFiltrados.length > 0 && (
              <div className="px-4 lg:px-6 py-4 border-t border-white/5 bg-white/[0.02]">
                <span className="text-sm text-slate-500">
                  {investimentosFiltrados.length} investimentos
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* ==================== TAB CATEGORIAS ==================== */}
      {tabAtiva === 'categorias' && (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <p className="text-sm text-slate-400">
              {categorias.length} categorias cadastradas
            </p>

            <button
              onClick={abrirModalCriarCategoria}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nova Categoria
            </button>
          </div>

          {/* Grid de Categorias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categorias.map((cat) => (
              <div
                key={cat.id}
                className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: cat.cor + '20' }}
                    >
                      <Tag className="w-5 h-5" style={{ color: cat.cor }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{cat.nome}</h3>
                      <p className="text-xs text-slate-500">{cat.icone || 'Sem ícone'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-5 h-5 rounded-full border-2 border-white/20"
                      style={{ backgroundColor: cat.cor }}
                    />
                    <span className="text-xs text-slate-400 font-mono">{cat.cor}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => abrirModalEditarCategoria(cat)}
                      className="p-2 rounded-lg hover:bg-violet-500/20 text-slate-400 hover:text-violet-400 transition-all"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => excluirCategoria(cat.id, cat.nome)}
                      disabled={excluindoCategoria === cat.id || cat.nome === 'Outros'}
                      className="p-2 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      title={cat.nome === 'Outros' ? 'Categoria padrão' : 'Excluir'}
                    >
                      <Trash2 className={`w-4 h-4 ${excluindoCategoria === cat.id ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {categorias.length === 0 && (
            <div className="text-center py-12">
              <Tag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500">Nenhuma categoria cadastrada.</p>
              <p className="text-sm text-slate-600 mt-1">Clique em "Nova Categoria" para adicionar.</p>
            </div>
          )}
        </>
      )}

      {/* ==================== TAB CONEXÕES (PLUGGY) ==================== */}
      {tabAtiva === 'conexoes' && pluggyConfigurado && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-2xl border border-white/5 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Link2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">Open Finance</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Conecte suas contas bancárias para importar transações automaticamente via Open Finance (Pluggy).
                  Seus dados são transmitidos de forma segura e criptografada.
                </p>
                <PluggyConnectButton onSuccess={recarregarTudo} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-2xl border border-white/5 p-6">
            <h4 className="text-sm font-semibold text-white mb-4">Como funciona</h4>
            <div className="space-y-3">
              {[
                { step: '1', text: 'Clique em "Conectar Banco" e selecione sua instituição financeira' },
                { step: '2', text: 'Autorize a conexão com suas credenciais bancárias' },
                { step: '3', text: 'As transações serão importadas e categorizadas automaticamente' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {step}
                  </span>
                  <p className="text-sm text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL TRANSAÇÃO ==================== */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={fecharModal}
          ></div>
          
          {/* Modal */}
          <div className="relative bg-[#1a1a2e] rounded-2xl border border-white/10 w-full max-w-md p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {modoEdicao ? 'Editar Transação' : 'Nova Transação'}
              </h3>
              <button
                onClick={fecharModal}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Data */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Data *</label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Descrição *</label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Supermercado Extra"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>

              {/* Valor */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Valor * (despesa)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    placeholder="0,00"
                    className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Categoria</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                >
                  {nomesCategorias.map(cat => (
                    <option key={cat} value={cat} className="bg-[#1a1a2e]">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={fecharModal}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={salvarTransacao}
                disabled={salvando}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL CATEGORIA ==================== */}
      {modalCategoriaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={fecharModalCategoria}
          ></div>
          
          {/* Modal */}
          <div className="relative bg-[#1a1a2e] rounded-2xl border border-white/10 w-full max-w-md p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                {modoEdicaoCategoria ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                onClick={fecharModalCategoria}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Nome *</label>
                <input
                  type="text"
                  value={formCategoria.nome}
                  onChange={(e) => setFormCategoria({ ...formCategoria, nome: e.target.value })}
                  placeholder="Ex: Alimentação"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>

              {/* Cor */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5" />
                    Cor
                  </div>
                </label>
                
                {/* Cores pré-definidas */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {coresPredefinidas.map((cor) => (
                    <button
                      key={cor}
                      onClick={() => setFormCategoria({ ...formCategoria, cor })}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        formCategoria.cor === cor 
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e] scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: cor }}
                    />
                  ))}
                </div>
                
                {/* Input de cor customizada */}
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formCategoria.cor}
                    onChange={(e) => setFormCategoria({ ...formCategoria, cor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={formCategoria.cor}
                    onChange={(e) => setFormCategoria({ ...formCategoria, cor: e.target.value })}
                    placeholder="#818cf8"
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Ícone (opcional) */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Ícone (opcional)
                </label>
                <input
                  type="text"
                  value={formCategoria.icone}
                  onChange={(e) => setFormCategoria({ ...formCategoria, icone: e.target.value })}
                  placeholder="Ex: Utensils, Car, ShoppingBag..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
                <p className="text-[10px] text-slate-600 mt-1">
                  Nomes de ícones do Lucide React
                </p>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Descrição (para a IA)
                </label>
                <textarea
                  value={formCategoria.descricao}
                  onChange={(e) => setFormCategoria({ ...formCategoria, descricao: e.target.value })}
                  placeholder="Ex: Restaurantes, lanchonetes, supermercados, delivery de comida..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                />
                <p className="text-[10px] text-slate-600 mt-1">
                  Essa descrição ajuda a IA a classificar as transações corretamente
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={fecharModalCategoria}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={salvarCategoria}
                disabled={salvandoCategoria}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {salvandoCategoria ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
