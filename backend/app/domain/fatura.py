from dataclasses import dataclass, field
from typing import List
from app.domain.transacao import Transacao


@dataclass
class Fatura:
    transacoes: List[Transacao] = field(default_factory=list)

    def total_transacoes(self) -> int:
        return len(self.transacoes)
