from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.dependencies import criar_transacao, editar_transacao, excluir_transacao, listar_transacoes, transacao_repo

router = APIRouter(prefix="/transacoes", tags=["Transações"])


class TransacaoInput(BaseModel):
    data: str
    descricao: str
    valor: float
    categoria: str
    ignorar_no_resumo: bool = False


@router.get("")
def get_transacoes(ano: str = None, mes: str = None, categoria: str = None):
    dados = listar_transacoes.execute(filtro_ano=ano, filtro_mes=mes, filtro_categoria=categoria)
    return {"total": len(dados), "data": [_serialize(t) for t in dados]}


@router.get("/meses")
def get_meses():
    return listar_transacoes.listar_meses()


@router.get("/por_mes")
def get_por_mes(ano: str):
    return listar_transacoes.gastos_por_mes(ano)


@router.get("/resumo")
def get_resumo(ano: str, mes: str = None):
    return listar_transacoes.resumo_financeiro(ano, mes)


@router.get("/{id}")
def get_transacao(id: str):
    transacao = listar_transacoes.buscar_por_id(id)
    if not transacao:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return _serialize(transacao)


@router.post("")
def post_transacao(body: TransacaoInput):
    resultado = criar_transacao.execute(
        data=body.data,
        descricao=body.descricao,
        valor=body.valor,
        categoria=body.categoria,
        ignorar_no_resumo=body.ignorar_no_resumo,
    )
    if not resultado.get("success"):
        raise HTTPException(status_code=400, detail=resultado.get("error"))
    return {"message": "Transação criada com sucesso", "id": resultado.get("id")}


@router.put("/{id}")
def put_transacao(id: str, body: TransacaoInput):
    resultado = editar_transacao.execute(
        id=id,
        data=body.data,
        descricao=body.descricao,
        valor=body.valor,
        categoria=body.categoria,
        ignorar_no_resumo=body.ignorar_no_resumo,
    )
    if not resultado.get("success"):
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return {"message": "Transação atualizada com sucesso"}


@router.patch("/{id}/ignorar")
def patch_ignorar(id: str):
    """Alterna o flag ignorar_no_resumo da transação (toggle)."""
    novo_valor = transacao_repo.alternar_ignorar_no_resumo(id)
    if novo_valor is None:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return {
        "message": "Flag atualizado com sucesso",
        "ignorar_no_resumo": novo_valor,
    }


@router.delete("/{id}")
def delete_transacao(id: str):
    resultado = excluir_transacao.execute(id)
    if not resultado.get("success"):
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    return {"message": "Transação excluída com sucesso"}


def _serialize(t) -> dict:
    if isinstance(t, dict):
        return t
    return {
        "id": t.id,
        "data": str(t.data),
        "descricao": t.descricao,
        "valor": t.valor,
        "categoria": t.categoria,
        "parcela_atual": t.parcela_atual,
        "parcelas_total": t.parcelas_total,
        "ignorar_no_resumo": t.ignorar_no_resumo,
    }
