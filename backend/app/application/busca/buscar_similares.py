from app.ports.ai_service import AIService
from app.ports.transacao_repository import TransacaoRepository


class BuscarSimilares:
    def __init__(self, ai_service: AIService, transacao_repo: TransacaoRepository):
        self.ai_service = ai_service
        self.transacao_repo = transacao_repo

    def execute(self, query: str, limite: int = 10, threshold: float = 0.3) -> list[dict]:
        return self.ai_service.buscar_similares(query, limite, threshold)

    def status_indexacao(self) -> dict:
        return self.transacao_repo.contar_indexadas()

    def indexar_transacao(self, transacao: dict) -> bool:
        texto = f"{transacao['descricao']}. Categoria: {transacao['categoria']}"
        embedding = self.ai_service.gerar_embedding(texto)
        if embedding:
            return self.transacao_repo.salvar_embedding(str(transacao["id"]), embedding)
        return False
