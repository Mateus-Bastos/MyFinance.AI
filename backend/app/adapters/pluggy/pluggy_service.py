import os
import time
import logging
import requests
from typing import Optional
from dotenv import load_dotenv
from app.ports.pluggy_service import PluggyService as PluggyServicePort

load_dotenv()

API_BASE = "https://api.pluggy.ai"
REQUEST_TIMEOUT = 30

logger = logging.getLogger(__name__)


class PluggyServiceImpl(PluggyServicePort):

    def __init__(self):
        self.client_id = os.getenv("PLUGGY_CLIENT_ID")
        self.client_secret = os.getenv("PLUGGY_CLIENT_SECRET")
        if not self.client_id or not self.client_secret:
            raise RuntimeError("PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET são obrigatórios no .env")
        self._api_key: Optional[str] = None
        self._api_key_expires_at: float = 0

    def _get_api_key(self) -> str:
        if self._api_key and time.time() < self._api_key_expires_at:
            return self._api_key

        logger.info("Renovando API Key do Pluggy...")
        resp = requests.post(f"{API_BASE}/auth", json={
            "clientId": self.client_id,
            "clientSecret": self.client_secret,
        }, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        self._api_key = data["apiKey"]
        self._api_key_expires_at = time.time() + (2 * 60 * 60) - (5 * 60)
        return self._api_key

    def _headers(self) -> dict:
        return {
            "X-API-KEY": self._get_api_key(),
            "Content-Type": "application/json",
        }

    def criar_connect_token(self, item_id: Optional[str] = None) -> str:
        payload = {}
        if item_id:
            payload["itemId"] = item_id

        resp = requests.post(
            f"{API_BASE}/connect_token",
            json=payload,
            headers=self._headers(),
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json()["accessToken"]

    def buscar_contas(self, item_id: str) -> list[dict]:
        logger.info(f"Buscando contas do item {item_id}")
        resp = requests.get(
            f"{API_BASE}/accounts",
            params={"itemId": item_id},
            headers=self._headers(),
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        contas = resp.json().get("results", [])
        logger.info(f"Encontradas {len(contas)} contas")
        return contas

    def buscar_transacoes(self, account_id: str, page: int = 1, page_size: int = 500) -> dict:
        logger.info(f"Buscando transações da conta {account_id} (página {page})")
        resp = requests.get(
            f"{API_BASE}/transactions",
            params={
                "accountId": account_id,
                "pageSize": page_size,
                "page": page,
            },
            headers=self._headers(),
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()
        logger.info(f"Recebidas {len(data.get('results', []))} transações (página {page}/{data.get('totalPages', 1)})")
        return {
            "results": data.get("results", []),
            "totalPages": data.get("totalPages", 1),
            "page": data.get("page", page),
        }

    def buscar_item(self, item_id: str) -> dict:
        resp = requests.get(
            f"{API_BASE}/items/{item_id}",
            headers=self._headers(),
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json()

    def aguardar_item_pronto(self, item_id: str, max_tentativas: int = 20, intervalo: int = 3) -> dict:
        """Aguarda até o item estar com status UPDATED (pronto para consultas)."""
        for tentativa in range(max_tentativas):
            item = self.buscar_item(item_id)
            status = item.get("status")
            logger.info(f"Item {item_id} status: {status} (tentativa {tentativa + 1}/{max_tentativas})")

            if status == "UPDATED":
                return item
            if status in ("LOGIN_ERROR", "OUTDATED", "WAITING_USER_ACTION"):
                raise RuntimeError(f"Item com status de erro: {status}")

            time.sleep(intervalo)

        raise RuntimeError(f"Timeout: item {item_id} não ficou pronto após {max_tentativas * intervalo}s")

    def deletar_item(self, item_id: str) -> bool:
        resp = requests.delete(
            f"{API_BASE}/items/{item_id}",
            headers=self._headers(),
            timeout=REQUEST_TIMEOUT,
        )
        return resp.status_code in (200, 204)
