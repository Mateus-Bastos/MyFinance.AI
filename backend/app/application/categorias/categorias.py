from app.domain.categoria import Categoria
from app.ports.categoria_repository import CategoriaRepository


class CriarCategoria:
    def __init__(self, repo: CategoriaRepository):
        self.repo = repo

    def execute(self, nome: str, cor: str, icone: str = None, descricao: str = None) -> dict:
        categoria = Categoria(nome=nome, cor=cor, icone=icone, descricao=descricao)
        id_criado = self.repo.criar(categoria)
        if id_criado:
            return {"success": True, "id": id_criado}
        return {"success": False, "error": "Categoria já existe"}


class EditarCategoria:
    def __init__(self, repo: CategoriaRepository):
        self.repo = repo

    def execute(self, id: str, nome: str, cor: str, icone: str = None, descricao: str = None) -> dict:
        categoria = Categoria(id=id, nome=nome, cor=cor, icone=icone, descricao=descricao)
        sucesso = self.repo.atualizar(categoria)
        return {"success": sucesso}


class ExcluirCategoria:
    def __init__(self, repo: CategoriaRepository):
        self.repo = repo

    def execute(self, id: str) -> dict:
        sucesso = self.repo.excluir(id)
        return {"success": sucesso}


class ListarCategorias:
    def __init__(self, repo: CategoriaRepository):
        self.repo = repo

    def execute(self) -> list:
        return self.repo.listar()

    def buscar_por_id(self, id: str):
        return self.repo.buscar_por_id(id)
