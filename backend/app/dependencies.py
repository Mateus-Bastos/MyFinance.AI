"""
Injeção de dependências: instancia os adapters concretos
e injeta nos casos de uso.
"""
import os
from dotenv import load_dotenv
load_dotenv()

from app.adapters.database.transacao_repository import SQLAlchemyTransacaoRepository
from app.adapters.database.categoria_repository import SQLAlchemyCategoriaRepository
from app.adapters.ai.gemini_service import GeminiService
from app.adapters.pdf.pdf_reader import PdfPlumberReader

from app.application.transacoes.criar_transacao import CriarTransacao
from app.application.transacoes.editar_transacao import EditarTransacao
from app.application.transacoes.excluir_transacao import ExcluirTransacao
from app.application.transacoes.listar_transacoes import ListarTransacoes
from app.application.categorias.categorias import CriarCategoria, EditarCategoria, ExcluirCategoria, ListarCategorias
from app.application.faturas.processar_fatura import ProcessarFatura
from app.application.busca.buscar_similares import BuscarSimilares

# Adapters
transacao_repo = SQLAlchemyTransacaoRepository()
categoria_repo = SQLAlchemyCategoriaRepository()
ai_service = GeminiService()
pdf_reader = PdfPlumberReader()

# Casos de uso — Transações
criar_transacao = CriarTransacao(transacao_repo)
editar_transacao = EditarTransacao(transacao_repo)
excluir_transacao = ExcluirTransacao(transacao_repo)
listar_transacoes = ListarTransacoes(transacao_repo)

# Casos de uso — Categorias
criar_categoria = CriarCategoria(categoria_repo)
editar_categoria = EditarCategoria(categoria_repo)
excluir_categoria = ExcluirCategoria(categoria_repo)
listar_categorias = ListarCategorias(categoria_repo)

# Casos de uso — Faturas
processar_fatura = ProcessarFatura(pdf_reader, ai_service, transacao_repo, categoria_repo)

# Casos de uso — Busca semântica
buscar_similares = BuscarSimilares(ai_service, transacao_repo)

# Pluggy (Open Finance) — só inicializa se as credenciais existirem
pluggy_service = None
sincronizar_transacoes_pluggy = None

if os.getenv("PLUGGY_CLIENT_ID") and os.getenv("PLUGGY_CLIENT_SECRET"):
    from app.adapters.pluggy.pluggy_service import PluggyServiceImpl
    from app.application.pluggy.sincronizar_transacoes import SincronizarTransacoesPluggy

    pluggy_service = PluggyServiceImpl()
    sincronizar_transacoes_pluggy = SincronizarTransacoesPluggy(pluggy_service, transacao_repo)
