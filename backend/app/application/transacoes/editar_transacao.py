from app.domain.transacao import Transacao
from app.ports.transacao_repository import TransacaoRepository


class EditarTransacao:
    def __init__(self, repo: TransacaoRepository):
        self.repo = repo

    def execute(self, id: str, data: str, descricao: str, valor: float, categoria: str, ignorar_no_resumo: bool = False) -> dict:
        from datetime import date
        transacao = Transacao(
            id=id,
            data=date.fromisoformat(data),
            descricao=descricao,
            valor=valor,
            categoria=categoria,
            ignorar_no_resumo=ignorar_no_resumo,
        )
        sucesso = self.repo.atualizar(transacao)
        return {"success": sucesso}
