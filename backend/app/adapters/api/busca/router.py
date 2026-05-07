from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.dependencies import buscar_similares

router = APIRouter(prefix="/busca", tags=["Busca Semântica"])


class BuscaInput(BaseModel):
    query: str
    limite: int = 10
    threshold: float = 0.3


@router.post("")
def busca_semantica(body: BuscaInput):
    try:
        resultados = buscar_similares.execute(
            query=body.query,
            limite=body.limite,
            threshold=body.threshold,
        )
        return {"query": body.query, "total": len(resultados), "resultados": resultados}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na busca: {str(e)}")


@router.get("/status")
def status_indexacao():
    try:
        return buscar_similares.status_indexacao()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar status: {str(e)}")
