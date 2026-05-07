import { CheckCircle, X } from 'lucide-react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Dashboard from './pages/Dashboard'
import Transacoes from './pages/Transacoes'
import Investimentos from './pages/Investimentos'
import Configuracoes from './pages/Configuracoes'
import Ajuda from './pages/Ajuda'

function AppContent() {
  const { menuAtivo, sidebarAberto, msgUpload, setMsgUpload } = useApp()

  // Renderiza a página ativa
  const renderPage = () => {
    switch (menuAtivo) {
      case 'dashboard':
        return <Dashboard />
      case 'transacoes':
        return <Transacoes />
      case 'investimentos':
        return <Investimentos />
      case 'config':
        return <Configuracoes />
      case 'ajuda':
        return <Ajuda />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f23] text-white flex font-['Space_Grotesk',sans-serif]">
      <Sidebar />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarAberto ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <Header />

        {/* Mensagem de Upload */}
      {msgUpload && (
          <div className={`mx-4 lg:mx-8 mt-6 p-4 rounded-xl flex items-center justify-between
            ${msgUpload.tipo === 'sucesso' 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{msgUpload.texto}</span>
            </div>
            <button onClick={() => setMsgUpload(null)} className="hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Conteúdo da Página */}
        {renderPage()}
      </main>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
