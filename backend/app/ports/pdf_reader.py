from abc import ABC, abstractmethod
from typing import Optional


class PDFReader(ABC):

    @abstractmethod
    def extrair_texto(self, caminho: str) -> Optional[str]:
        """Lê um arquivo PDF e retorna o texto extraído."""
        ...
