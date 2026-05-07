from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.dependencies import criar_categoria, editar_categoria, excluir_categoria, listar_categorias

router = APIRouter(prefix="/categorias", tags=["Categorias"])


class CategoriaInput(BaseModel):
    nome: str
    cor: str
    icone: Optional[str] = None
    descricao: Optional[str] = None


@router.get("")
def get_categorias():
    cats = listar_categorias.execute()
    return [_serialize(c) for c in cats]


@router.get("/{id}")
def get_categoria(id: str):
    cat = listar_categorias.buscar_por_id(id)
    if not cat:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return _serialize(cat)


@router.post("")
def post_categoria(body: CategoriaInput):
    resultado = criar_categoria.execute(
        nome=body.nome, cor=body.cor, icone=body.icone, descricao=body.descricao
    )
    if not resultado.get("success"):
        raise HTTPException(status_code=400, detail=resultado.get("error"))
    return {"message": "Categoria criada com sucesso", "id": resultado.get("id")}


@router.put("/{id}")
def put_categoria(id: str, body: CategoriaInput):
    resultado = editar_categoria.execute(
        id=id, nome=body.nome, cor=body.cor, icone=body.icone, descricao=body.descricao
    )
    if not resultado.get("success"):
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return {"message": "Categoria atualizada com sucesso"}


@router.delete("/{id}")
def delete_categoria(id: str):
    resultado = excluir_categoria.execute(id)
    if not resultado.get("success"):
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    return {"message": "Categoria excluída com sucesso"}


def _serialize(c) -> dict:
    if isinstance(c, dict):
        return c
    return {
        "id": c.id,
        "nome": c.nome,
        "cor": c.cor,
        "icone": c.icone,
        "descricao": c.descricao,
    }
