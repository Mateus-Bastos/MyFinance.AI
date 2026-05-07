from abc import ABC, abstractmethod
from typing import Optional


class PluggyService(ABC):

    @abstractmethod
    def criar_connect_token(self, item_id: Optional[str] = None) -> str:
        """Cria um Connect Token para o widget do frontend."""
        ...

    @abstractmethod
    def buscar_contas(self, item_id: str) -> list[dict]:
        """Lista as contas de um Item conectado."""
        ...

    @abstractmethod
    def buscar_transacoes(self, account_id: str, page: int = 1, page_size: int = 500) -> dict:
        """Busca transações de uma conta. Retorna dict com results e totalPages."""
        ...

    @abstractmethod
    def buscar_item(self, item_id: str) -> dict:
        """Busca detalhes de um Item conectado."""
        ...

    @abstractmethod
    def aguardar_item_pronto(self, item_id: str, max_tentativas: int = 20, intervalo: int = 3) -> dict:
        """Aguarda até o item estar com status UPDATED (pronto para consultas)."""
        ...

    @abstractmethod
    def deletar_item(self, item_id: str) -> bool:
        """Remove um Item conectado."""
        ...
