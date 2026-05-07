import hashlib
from dataclasses import dataclass, field
from datetime import date
from typing import Optional


@dataclass
class Transacao:
    data: date
    descricao: str
    valor: float
    categoria: str
    parcela_atual: Optional[int] = None
    parcelas_total: Optional[int] = None
    id: Optional[str] = None
    ignorar_no_resumo: bool = False
    embedding: Optional[list] = field(default=None, repr=False)

    def gerar_hash(self) -> str:
        raw = f"{self.data}{self.valor}{self.descricao}"
        return hashlib.md5(raw.encode("utf-8")).hexdigest()

    def is_despesa(self) -> bool:
        return self.valor < 0

    def is_receita(self) -> bool:
        return self.valor > 0

    def is_investimento(self) -> bool:
        return self.categoria == "Investimento"

    def is_pagamento_fatura(self) -> bool:
        return self.ignorar_no_resumo
