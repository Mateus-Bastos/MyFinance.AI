import logging
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/pluggy", tags=["Pluggy"])
logger = logging.getLogger(__name__)


def _get_pluggy_service():
    from app.dependencies import pluggy_service
    if not pluggy_service:
        raise HTTPException(
            status_code=503,
            detail="Pluggy não configurado. Adicione PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET no .env"
        )
    return pluggy_service


def _get_sync_use_case():
    from app.dependencies import sincronizar_transacoes_pluggy
    if not sincronizar_transacoes_pluggy:
        raise HTTPException(
            status_code=503,
            detail="Pluggy não configurado. Adicione PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET no .env"
        )
    return sincronizar_transacoes_pluggy


class ConnectTokenRequest(BaseModel):
    item_id: Optional[str] = None


class SyncRequest(BaseModel):
    item_id: str


@router.get("/status")
def get_status():
    from app.dependencies import pluggy_service
    return {"configured": pluggy_service is not None}


@router.post("/connect-token")
def post_connect_token(body: ConnectTokenRequest = ConnectTokenRequest()):
    service = _get_pluggy_service()
    try:
        token = service.criar_connect_token(item_id=body.item_id)
        return {"accessToken": token}
    except Exception as e:
        logger.exception("Erro ao gerar connect token")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar connect token: {str(e)}")


@router.post("/sync")
def post_sync(body: SyncRequest):
    logger.info(f"Recebida requisição de sync para item_id={body.item_id}")
    use_case = _get_sync_use_case()
    try:
        resultado = use_case.execute(body.item_id)
        logger.info(f"Sync concluído: {resultado}")
        return resultado
    except Exception as e:
        logger.exception(f"Erro ao sincronizar item {body.item_id}")
        raise HTTPException(status_code=500, detail=f"Erro ao sincronizar: {str(e)}")


@router.get("/items/{item_id}")
def get_item(item_id: str):
    service = _get_pluggy_service()
    try:
        item = service.buscar_item(item_id)
        return item
    except Exception as e:
        logger.exception(f"Erro ao buscar item {item_id}")
        raise HTTPException(status_code=404, detail=f"Item não encontrado: {str(e)}")


@router.delete("/items/{item_id}")
def delete_item(item_id: str):
    service = _get_pluggy_service()
    sucesso = service.deletar_item(item_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    return {"message": "Conexão removida com sucesso"}
