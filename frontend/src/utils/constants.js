import { LayoutDashboard, Receipt, PiggyBank, HelpCircle, Settings } from 'lucide-react'

export const NOMES_MESES = {
  "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
  "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
  "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro"
}

export const CATEGORIAS = [
  "Alimentação", "Transporte", "Lazer", "Saúde", "Educação", 
  "Compras", "Serviços", "Investimento", "Transferência", "Outros"
]

export const COLORS = [
  '#818cf8', '#f472b6', '#a78bfa', '#2dd4bf', 
  '#fbbf24', '#fb7185', '#60a5fa', '#4ade80'
]

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transacoes', label: 'Transações', icon: Receipt },
  { id: 'investimentos', label: 'Investimentos', icon: PiggyBank },
]

export const MENU_BOTTOM = [
  { id: 'ajuda', label: 'Ajuda', icon: HelpCircle },
  { id: 'config', label: 'Configurações', icon: Settings },
]

export const API_BASE_URL = 'http://127.0.0.1:8000'

