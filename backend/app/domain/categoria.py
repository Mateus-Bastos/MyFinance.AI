from dataclasses import dataclass
from typing import Optional


@dataclass
class Categoria:
    nome: str
    cor: str
    icone: Optional[str] = None
    descricao: Optional[str] = None
    id: Optional[str] = None
