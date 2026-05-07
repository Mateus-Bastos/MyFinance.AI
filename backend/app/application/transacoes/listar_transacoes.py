from typing import Optional
from app.ports.transacao_repository import TransacaoRepository


class ListarTransacoes:
    def __init__(self, repo: TransacaoRepository):
        self.repo = repo

    def execute(
        self,
        filtro_ano: Optional[str] = None,
        filtro_mes: Optional[str] = None,
        filtro_categoria: Optional[str] = None,
    ) -> list:
        return self.repo.listar(filtro_ano, filtro_mes, filtro_categoria)

    def buscar_por_id(self, id: str):
        return self.repo.buscar_por_id(id)

    def listar_meses(self) -> list[str]:
        return self.repo.listar_meses()

    def gastos_por_mes(self, ano: str) -> list[dict]:
        return self.repo.gastos_por_mes(ano)

    def resumo_financeiro(self, ano: str, mes: Optional[str] = None) -> dict:
        return self.repo.resumo_financeiro(ano, mes)
