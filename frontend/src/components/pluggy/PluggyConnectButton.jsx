import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { PluggyConnect } from 'react-pluggy-connect'
import { Link2, Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../../utils/constants'

export default function PluggyConnectButton({ onSuccess }) {
  const [connectToken, setConnectToken] = useState(null)
  const [widgetAberto, setWidgetAberto] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [sincronizando, setSincronizando] = useState(false)
  const [mensagem, setMensagem] = useState(null)

  const abrirWidget = async () => {
    setCarregando(true)
    setMensagem(null)
    try {
      const resp = await axios.post(`${API_BASE_URL}/pluggy/connect-token`)
      setConnectToken(resp.data.accessToken)
      setWidgetAberto(true)
    } catch (error) {
      console.error('Erro ao obter connect token:', error)
      setMensagem({
        tipo: 'erro',
        texto: 'Erro ao conectar com Pluggy. Verifique as credenciais no backend.',
      })
    } finally {
      setCarregando(false)
    }
  }

  const handleSuccess = useCallback(async (data) => {
    setWidgetAberto(false)
    setConnectToken(null)

    const itemId = data?.item?.id
    if (!itemId) {
      console.error('Pluggy onSuccess sem item.id:', data)
      setMensagem({ tipo: 'erro', texto: 'Erro: resposta do banco não contém dados válidos.' })
      return
    }

    setSincronizando(true)
    setMensagem({ tipo: 'info', texto: 'Sincronizando transações (pode levar alguns segundos)...' })

    try {
      const resp = await axios.post(`${API_BASE_URL}/pluggy/sync`, {
        item_id: itemId,
      }, { timeout: 120000 })
      setMensagem({
        tipo: 'sucesso',
        texto: `${resp.data.importadas} transações importadas! (${resp.data.duplicadas} duplicadas ignoradas)`,
      })
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Erro ao sincronizar:', error)
      const detalhe = error.response?.data?.detail || error.message || 'Erro desconhecido'
      setMensagem({
        tipo: 'erro',
        texto: `Erro ao sincronizar: ${detalhe}`,
      })
    } finally {
      setSincronizando(false)
    }
  }, [onSuccess])

  const handleError = useCallback((error) => {
    console.error('Pluggy Connect error:', error)
    setWidgetAberto(false)
    setConnectToken(null)
    setMensagem({
      tipo: 'erro',
      texto: 'Erro na conexão bancária. Tente novamente.',
    })
  }, [])

  const handleClose = useCallback(() => {
    setWidgetAberto(false)
    setConnectToken(null)
  }, [])

  return (
    <div>
      <button
        onClick={abrirWidget}
        disabled={carregando || sincronizando}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {carregando ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : sincronizando ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
        {carregando
          ? 'Conectando...'
          : sincronizando
            ? 'Sincronizando...'
            : 'Conectar Banco'}
      </button>

      {mensagem && (
        <div className={`mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm ${
          mensagem.tipo === 'sucesso'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : mensagem.tipo === 'erro'
              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
        }`}>
          {mensagem.tipo === 'sucesso' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : mensagem.tipo === 'erro' ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <RefreshCw className="w-4 h-4 flex-shrink-0 animate-spin" />
          )}
          {mensagem.texto}
        </div>
      )}

      {widgetAberto && connectToken && createPortal(
        <PluggyConnect
          connectToken={connectToken}
          includeSandbox={true}
          onSuccess={handleSuccess}
          onError={handleError}
          onClose={handleClose}
        />,
        document.body
      )}
    </div>
  )
}
