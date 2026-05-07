from abc import ABC, abstractmethod
from typing import Optional
from app.domain.categoria import Categoria


class CategoriaRepository(ABC):

    @abstractmethod
    def listar(self) -> list[Categoria]:
        ...

    @abstractmethod
    def buscar_por_id(self, id: str) -> Optional[Categoria]:
        ...

    @abstractmethod
    def criar(self, categoria: Categoria) -> Optional[str]:
        """Retorna o ID criado ou None se já existir."""
        ...

    @abstractmethod
    def atualizar(self, categoria: Categoria) -> bool:
        ...

    @abstractmethod
    def excluir(self, id: str) -> bool:
        ...

    @abstractmethod
    def popular_padrao(self) -> bool:
        """Popula categorias padrão se a tabela estiver vazia."""
        ...
