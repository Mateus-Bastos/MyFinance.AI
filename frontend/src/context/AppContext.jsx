import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'

const AppContext = createContext()

export function AppProvider({ children }) {
  // Estados de dados
  const [transacoes, setTransacoes] = useState([])
  const [dadosBarras, setDadosBarras] = useState([])
  const [resumo, setResumo] = useState({ receitas: 0, despesas: 0, investimentos: 0, saldo: 0 })
  const [listaPeriodos, setListaPeriodos] = useState([])
  const [categorias, setCategorias] = useState([])

  // Estados de filtros
  const [anoSelecionado, setAnoSelecionado] = useState("")
  const [mesSelecionado, setMesSelecionado] = useState("")
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("")

  // Estados de UI
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [msgUpload, setMsgUpload] = useState(null)
  const [menuAtivo, setMenuAtivo] = useState('dashboard')
  const [sidebarAberto, setSidebarAberto] = useState(true)
  const [pluggyConfigurado, setPluggyConfigurado] = useState(false)

  // Funções de carregamento
  const carregarPeriodos = async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/transacoes/meses`)
      const periodos = resp.data
      setListaPeriodos(periodos)
      if (!anoSelecionado && periodos.length > 0) {
        const [anoRecente, mesRecente] = periodos[0].split('-')
        setAnoSelecionado(anoRecente)
        setMesSelecionado(mesRecente)
      }
    } catch (error) {
      console.error('Erro ao carregar períodos:', error)
    }
  }

  const carregarTransacoes = async () => {
    if (!anoSelecionado) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('ano', anoSelecionado)
      if (mesSelecionado) params.append('mes', mesSelecionado)
      if (categoriaSelecionada) params.append('categoria', categoriaSelecionada)

      const resp = await axios.get(`${API_BASE_URL}/transacoes?${params.toString()}`)
      setTransacoes(resp.data.data)
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarGraficoBarras = async () => {
    if (!anoSelecionado) return
    try {
      const resp = await axios.get(`${API_BASE_URL}/transacoes/por_mes?ano=${anoSelecionado}`)
      setDadosBarras(resp.data)
    } catch (error) {
      console.error('Erro ao carregar gráfico:', error)
    }
  }

  const carregarResumo = async () => {
    if (!anoSelecionado) return
    try {
      const params = new URLSearchParams()
      params.append('ano', anoSelecionado)
      if (mesSelecionado) params.append('mes', mesSelecionado)

      const resp = await axios.get(`${API_BASE_URL}/transacoes/resumo?${params.toString()}`)
      setResumo(resp.data)
    } catch (error) {
      console.error('Erro ao carregar resumo:', error)
    }
  }

  const carregarCategorias = async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/categorias`)
      setCategorias(resp.data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const handleUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    setUploading(true)
    setMsgUpload(null)
    const formData = new FormData()
    formData.append('file', file)

    try {
      await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMsgUpload({ tipo: 'sucesso', texto: 'Fatura processada com sucesso!' })
      carregarPeriodos()
      carregarTransacoes()
      carregarGraficoBarras()
      carregarResumo()
    } catch (error) {
      console.error('Erro no upload:', error)
      setMsgUpload({ tipo: 'erro', texto: 'Erro ao processar fatura.' })
    } finally {
      setUploading(false)
    }
  }

  const recarregarTudo = () => {
    carregarPeriodos()
    carregarTransacoes()
    carregarGraficoBarras()
    carregarResumo()
    carregarCategorias()
  }

  const verificarPluggy = async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/pluggy/status`)
      setPluggyConfigurado(resp.data.configured)
    } catch {
      setPluggyConfigurado(false)
    }
  }

  // Effects
  useEffect(() => { 
    carregarPeriodos() 
    carregarCategorias()
    verificarPluggy()
  }, [])
  useEffect(() => { carregarTransacoes() }, [anoSelecionado, mesSelecionado, categoriaSelecionada])
  useEffect(() => { carregarResumo() }, [anoSelecionado, mesSelecionado])
  useEffect(() => { carregarGraficoBarras() }, [anoSelecionado])

  // Memos
  const anosDisponiveis = useMemo(() => {
    const anos = new Set(listaPeriodos.map(p => p.split('-')[0]))
    return Array.from(anos).sort().reverse()
  }, [listaPeriodos])

  const mesesDoAnoSelecionado = useMemo(() => {
    if (!anoSelecionado) return []
    return listaPeriodos
      .filter(p => p.startsWith(anoSelecionado))
      .map(p => p.split('-')[1])
      .sort().reverse()
  }, [listaPeriodos, anoSelecionado])

  const dadosPizza = useMemo(() => {
    return transacoes
      .filter(t => t.valor < 0 && !t.ignorar_no_resumo)
      .reduce((acc, curr) => {
        const cat = curr.categoria
        const valorPositivo = Math.abs(curr.valor)
        const existente = acc.find(item => item.name === cat)
        if (existente) existente.value += valorPositivo
        else acc.push({ name: cat, value: valorPositivo })
        return acc
      }, [])
      .sort((a, b) => b.value - a.value)
  }, [transacoes])

  const totalCategoriaFiltrada = useMemo(() => {
    if (!categoriaSelecionada) return 0
    return transacoes
      .filter(t => t.valor < 0 && !t.ignorar_no_resumo)
      .reduce((acc, t) => acc + Math.abs(t.valor), 0)
  }, [transacoes, categoriaSelecionada])

  // Transações filtradas por tipo
  const transacoesInvestimento = useMemo(() => {
    return transacoes.filter(t => t.categoria === 'Investimento')
  }, [transacoes])

  // Mapa de cores por categoria (para gráficos)
  const coresCategorias = useMemo(() => {
    const mapa = {}
    categorias.forEach(cat => {
      mapa[cat.nome] = cat.cor
    })
    return mapa
  }, [categorias])

  // Lista de nomes de categorias (para dropdowns)
  const nomesCategorias = useMemo(() => {
    return categorias.map(cat => cat.nome)
  }, [categorias])

  const value = {
    // Dados
    transacoes,
    dadosBarras,
    resumo,
    listaPeriodos,
    dadosPizza,
    totalCategoriaFiltrada,
    transacoesInvestimento,
    categorias,
    coresCategorias,
    nomesCategorias,
    
    // Filtros
    anoSelecionado,
    setAnoSelecionado,
    mesSelecionado,
    setMesSelecionado,
    categoriaSelecionada,
    setCategoriaSelecionada,
    anosDisponiveis,
    mesesDoAnoSelecionado,
    
    // UI
    loading,
    uploading,
    msgUpload,
    setMsgUpload,
    menuAtivo,
    setMenuAtivo,
    sidebarAberto,
    setSidebarAberto,
    pluggyConfigurado,
    
    // Ações
    handleUpload,
    recarregarTudo,
    carregarCategorias,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider')
  }
  return context
}

