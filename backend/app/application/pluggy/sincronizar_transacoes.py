import logging
from datetime import date
from app.domain.transacao import Transacao
from app.ports.pluggy_service import PluggyService
from app.ports.transacao_repository import TransacaoRepository

logger = logging.getLogger(__name__)


class SincronizarTransacoesPluggy:
    def __init__(self, pluggy: PluggyService, repo: TransacaoRepository):
        self.pluggy = pluggy
        self.repo = repo

    def execute(self, item_id: str) -> dict:
        logger.info(f"Iniciando sincronização para item {item_id}")

        logger.info("Aguardando item ficar pronto...")
        self.pluggy.aguardar_item_pronto(item_id)

        contas = self.pluggy.buscar_contas(item_id)
        if not contas:
            logger.warning(f"Nenhuma conta encontrada para item {item_id}")
            return {
                "success": True,
                "importadas": 0,
                "duplicadas": 0,
                "contas_processadas": 0,
                "mensagem": "Nenhuma conta encontrada nesta conexão.",
            }

        total_importadas = 0
        total_duplicadas = 0

        for conta in contas:
            account_id = conta["id"]
            logger.info(f"Processando conta {account_id} ({conta.get('name', 'N/A')})")
            page = 1

            while True:
                resultado = self.pluggy.buscar_transacoes(account_id, page=page)
                transacoes_raw = resultado["results"]

                for t in transacoes_raw:
                    transacao = self._mapear_transacao(t)
                    if transacao:
                        id_criado = self.repo.salvar(transacao)
                        if id_criado:
                            total_importadas += 1
                        else:
                            total_duplicadas += 1

                if page >= resultado["totalPages"]:
                    break
                page += 1

        logger.info(f"Sincronização concluída: {total_importadas} importadas, {total_duplicadas} duplicadas")

        return {
            "success": True,
            "importadas": total_importadas,
            "duplicadas": total_duplicadas,
            "contas_processadas": len(contas),
        }

    def _mapear_transacao(self, raw: dict) -> Transacao | None:
        try:
            data_str = raw.get("date", "")[:10]
            data_transacao = date.fromisoformat(data_str)

            descricao = raw.get("description", "").strip()
            if not descricao:
                descricao = raw.get("descriptionRaw", "Transação sem descrição").strip()

            valor = float(raw.get("amount", 0))
            if valor == 0:
                return None

            categoria_pluggy = raw.get("category", "")
            categoria = self._mapear_categoria(categoria_pluggy)

            return Transacao(
                data=data_transacao,
                descricao=descricao,
                valor=valor,
                categoria=categoria,
            )
        except (ValueError, KeyError) as e:
            logger.warning(f"Erro ao mapear transação: {e} | raw: {raw}")
            return None

    def _mapear_categoria(self, categoria_pluggy: str) -> str:
        if not categoria_pluggy:
            return "Outros"

        mapeamento = {
            "Food & Groceries": "Alimentação",
            "Restaurants": "Alimentação",
            "Food": "Alimentação",
            "Groceries": "Alimentação",
            "Transportation": "Transporte",
            "Travel": "Transporte",
            "Ride Sharing": "Transporte",
            "Entertainment": "Lazer",
            "Recreation": "Lazer",
            "Health": "Saúde",
            "Healthcare": "Saúde",
            "Pharmacy": "Saúde",
            "Education": "Educação",
            "Shopping": "Compras",
            "Clothing": "Compras",
            "Electronics": "Compras",
            "Services": "Serviços",
            "Subscription": "Serviços",
            "Utilities": "Serviços",
            "Insurance": "Serviços",
            "Investments": "Investimento",
            "Savings": "Investimento",
            "Transfer": "Transferência",
            "Transfers": "Transferência",
            "Wire Transfer": "Transferência",
            "Salary": "Receitas",
            "Income": "Receitas",
        }

        for key, valor in mapeamento.items():
            if key.lower() in categoria_pluggy.lower():
                return valor

        return "Outros"
