from app.domain.transacao import Transacao
from app.ports.transacao_repository import TransacaoRepository


class CriarTransacao:
    def __init__(self, repo: TransacaoRepository):
        self.repo = repo

    def execute(self, data: str, descricao: str, valor: float, categoria: str, ignorar_no_resumo: bool = False) -> dict:
        from datetime import date
        transacao = Transacao(
            data=date.fromisoformat(data),
            descricao=descricao,
            valor=valor,
            categoria=categoria,
            ignorar_no_resumo=ignorar_no_resumo,
        )
        id_criado = self.repo.salvar(transacao)
        if id_criado:
            return {"success": True, "id": id_criado}
        return {"success": False, "error": "Transação já existe"}
