from abc import ABC, abstractmethod
from typing import Optional
from app.domain.fatura import Fatura


class AIService(ABC):

    @abstractmethod
    def processar_fatura(self, texto: str, regras_categorias: str, contexto_aprendido: str) -> Optional[Fatura]:
        """Envia o texto extraído do PDF para a IA e retorna uma Fatura com as transações."""
        ...

    @abstractmethod
    def gerar_embedding(self, texto: str) -> Optional[list[float]]:
        """Gera um embedding vetorial para o texto fornecido."""
        ...

    @abstractmethod
    def buscar_similares(self, texto: str, limite: int, threshold: float) -> list[dict]:
        """Busca transações semanticamente similares ao texto."""
        ...
