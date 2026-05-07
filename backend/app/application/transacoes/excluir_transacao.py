from app.ports.transacao_repository import TransacaoRepository


class ExcluirTransacao:
    def __init__(self, repo: TransacaoRepository):
        self.repo = repo

    def execute(self, id: str) -> dict:
        sucesso = self.repo.excluir(id)
        return {"success": sucesso}
