import os
from typing import Optional, List
from dotenv import load_dotenv
from google import genai
from sqlalchemy import text
from pydantic import BaseModel, Field
from datetime import date

from app.domain.fatura import Fatura
from app.domain.transacao import Transacao
from app.ports.ai_service import AIService
from app.adapters.database.connection import engine

load_dotenv()


_PADROES_PAGAMENTO_FATURA = (
    "PAGTO FATURA", "PAGAMENTO FATURA", "PAG FATURA", "PGT FATURA",
    "PGTO FATURA", "FATURA CARTAO", "FATURA VISA", "FATURA MASTERCARD",
    "FATURA NUBANK", "FATURA ITAU", "FATURA BRADESCO", "FATURA SANTANDER",
    "FATURA C6", "FATURA INTER", "BILL PAYMENT", "CREDIT CARD PAYMENT",
    "PGT CARTAO", "PGTO CARTAO", "PAGTO CARTAO", "PAGAMENTO CARTAO",
    "PAGAMENTO RECEBIDO",
    "PAGAMENTO EM ",
)


def _detectar_pagamento_fatura(descricao: str) -> bool:
    upper = descricao.upper()
    return any(padrao in upper for padrao in _PADROES_PAGAMENTO_FATURA)


class _TransacaoSchema(BaseModel):
    data: date
    descricao: str
    valor: float
    categoria: str = Field(description="Categoria da transação")
    parcela_atual: Optional[int] = None
    parcelas_total: Optional[int] = None
    ignorar_no_resumo: bool = Field(
        default=False,
        description=(
            "TRUE quando a transação for um pagamento de fatura de cartão de crédito "
            "(ex: 'PAGTO FATURA', 'PAGAMENTO FATURA', 'PAG FATURA', 'BILL PAYMENT', "
            "'Pagamento em 06 JAN'). "
            "Esses lançamentos não devem entrar nos cálculos de despesas pois os gastos "
            "já foram contabilizados individualmente no mês em que as compras foram feitas."
        ),
    )


class _FaturaSchema(BaseModel):
    transacoes: List[_TransacaoSchema]


class GeminiService(AIService):

    CHAT_MODEL = "gemini-2.5-flash"
    EMBEDDING_MODEL = "text-embedding-004"

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY não encontrada no .env")
        self.client = genai.Client(api_key=api_key)

    def processar_fatura(self, texto: str, regras_categorias: str, contexto_aprendido: str) -> Optional[Fatura]:
        secao_contexto = ""
        if contexto_aprendido:
            secao_contexto = f"""
    CONTEXTO APRENDIDO (classificações anteriores - use como referência):
{contexto_aprendido}
    """

        prompt = f"""
    Analise o texto cru deste extrato bancário ou fatura de cartão de crédito.
    Extraia todas as transações, identificando parcelas se houver (ex: 01/10).
    Converta gastos/saídas para valores negativos e entradas para valores positivos.

    CAMPO OBRIGATÓRIO — ignorar_no_resumo (boolean):
    Este campo DEVE ser preenchido para CADA transação. Siga a regra abaixo sem exceção:

    ignorar_no_resumo = true  → quando a descrição indicar pagamento de fatura de cartão
        Exemplos: "PAGTO FATURA", "PAGAMENTO FATURA", "PAG FATURA", "PGT FATURA",
                  "FATURA CARTAO", "FATURA VISA", "FATURA MASTERCARD", "FATURA NUBANK",
                  "BILL PAYMENT", "CREDIT CARD PAYMENT", "PGT CARTAO", "PGTO CARTAO"
                  e qualquer variação que indique quitação de fatura de cartão de crédito.
                  IMPORTANTE: faturas Nubank usam o padrão "Pagamento em DD MMM"
                  (ex: "Pagamento em 06 JAN", "Pagamento em 10 FEV") — marque como true.

    ignorar_no_resumo = false → para TODAS as demais transações (compras, transferências,
        receitas, saques, tarifas, etc.)

    Esses pagamentos de fatura NÃO devem entrar nos totais de despesas pois os gastos
    individuais já foram contabilizados quando a fatura foi importada.

    REGRAS DE CATEGORIZAÇÃO (use EXATAMENTE estes nomes de categoria):
{regras_categorias}
    {secao_contexto}
    TEXTO DO EXTRATO:
    {texto}
    """

        try:
            response = self.client.models.generate_content(
                model=self.CHAT_MODEL,
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_json_schema": _FaturaSchema.model_json_schema(),
                },
            )
            texto_limpo = response.text.replace("```json", "").replace("```", "").strip()
            fatura_schema = _FaturaSchema.model_validate_json(texto_limpo)

            transacoes = [
                Transacao(
                    data=t.data,
                    descricao=t.descricao,
                    valor=t.valor,
                    categoria=t.categoria,
                    parcela_atual=t.parcela_atual,
                    parcelas_total=t.parcelas_total,
                    ignorar_no_resumo=t.ignorar_no_resumo or _detectar_pagamento_fatura(t.descricao),
                )
                for t in fatura_schema.transacoes
            ]
            return Fatura(transacoes=transacoes)
        except Exception as e:
            print(f"❌ Erro ao processar fatura: {e}")
            return None

    def gerar_embedding(self, texto: str) -> Optional[list[float]]:
        try:
            response = self.client.models.embed_content(
                model=self.EMBEDDING_MODEL,
                contents=texto,
            )
            return response.embeddings[0].values
        except Exception as e:
            print(f"❌ Erro ao gerar embedding: {e}")
            return None

    def buscar_similares(self, texto: str, limite: int = 10, threshold: float = 0.3) -> list[dict]:
        embedding = self.gerar_embedding(texto)
        if not embedding:
            return []

        embedding_str = "[" + ",".join(map(str, embedding)) + "]"

        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT * FROM buscar_transacoes_similares(
                    CAST(:embedding AS vector),
                    :limite,
                    :threshold
                )
            """), {"embedding": embedding_str, "limite": limite, "threshold": threshold})

            transacoes = []
            for row in result.mappings():
                t = dict(row)
                t["id"] = str(t["id"])
                t["data"] = str(t["data"])
                t["valor"] = float(t["valor"])
                t["similaridade"] = float(t["similaridade"])
                transacoes.append(t)

            return transacoes
