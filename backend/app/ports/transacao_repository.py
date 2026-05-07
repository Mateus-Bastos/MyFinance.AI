from abc import ABC, abstractmethod
from typing import Optional
from app.domain.transacao import Transacao


class TransacaoRepository(ABC):

    @abstractmethod
    def salvar(self, transacao: Transacao) -> Optional[str]:
        """Salva uma transação. Retorna o ID gerado ou None se duplicada."""
        ...

    @abstractmethod
    def buscar_por_id(self, id: str) -> Optional[Transacao]:
        ...

    @abstractmethod
    def listar(
        self,
        filtro_ano: Optional[str] = None,
        filtro_mes: Optional[str] = None,
        filtro_categoria: Optional[str] = None,
    ) -> list[Transacao]:
        ...

    @abstractmethod
    def atualizar(self, transacao: Transacao) -> bool:
        ...

    @abstractmethod
    def excluir(self, id: str) -> bool:
        ...

    @abstractmethod
    def listar_meses(self) -> list[str]:
        ...

    @abstractmethod
    def gastos_por_mes(self, ano: str) -> list[dict]:
        ...

    @abstractmethod
    def resumo_financeiro(self, ano: str, mes: Optional[str] = None) -> dict:
        ...

    @abstractmethod
    def obter_dicionario_aprendizado(self) -> dict[str, str]:
        ...

    @abstractmethod
    def salvar_embedding(self, transacao_id: str, embedding: list[float]) -> bool:
        ...

    @abstractmethod
    def listar_sem_embedding(self) -> list[Transacao]:
        ...

    @abstractmethod
    def contar_indexadas(self) -> dict:
        ...

    @abstractmethod
    def alternar_ignorar_no_resumo(self, id: str) -> Optional[bool]:
        """Inverte o flag ignorar_no_resumo. Retorna o novo valor ou None se não encontrado."""
        ...
