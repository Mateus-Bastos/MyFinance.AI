from typing import Optional
from sqlalchemy import text
from app.domain.categoria import Categoria
from app.ports.categoria_repository import CategoriaRepository
from app.adapters.database.connection import engine

CATEGORIAS_PADRAO = [
    {"nome": "Alimentação", "cor": "#f472b6", "icone": "Utensils", "descricao": "Restaurantes, lanchonetes, supermercados, delivery de comida, iFood, Rappi"},
    {"nome": "Transporte", "cor": "#60a5fa", "icone": "Car", "descricao": "Uber, 99, combustível, estacionamento, pedágio, transporte público, táxi"},
    {"nome": "Lazer", "cor": "#a78bfa", "icone": "Gamepad2", "descricao": "Cinema, streaming, jogos, viagens, eventos, entretenimento, Netflix, Spotify"},
    {"nome": "Saúde", "cor": "#4ade80", "icone": "Heart", "descricao": "Farmácias, consultas médicas, planos de saúde, exames, hospitais, clínicas"},
    {"nome": "Educação", "cor": "#fbbf24", "icone": "GraduationCap", "descricao": "Cursos, livros, mensalidades escolares, faculdade, cursos online"},
    {"nome": "Compras", "cor": "#fb7185", "icone": "ShoppingBag", "descricao": "Lojas, e-commerce, vestuário, eletrônicos, Amazon, Mercado Livre, Shopee"},
    {"nome": "Serviços", "cor": "#2dd4bf", "icone": "Wrench", "descricao": "Contas de luz, água, internet, telefone, assinaturas, seguros"},
    {"nome": "Investimento", "cor": "#818cf8", "icone": "TrendingUp", "descricao": "Aplicações financeiras, CDB, RDB, LCI, LCA, Tesouro Direto, fundos, ações, criptomoedas, previdência, poupança"},
    {"nome": "Transferência", "cor": "#94a3b8", "icone": "ArrowLeftRight", "descricao": "PIX, TED, DOC enviados ou recebidos entre contas"},
    {"nome": "Outros", "cor": "#64748b", "icone": "MoreHorizontal", "descricao": "Quando não se encaixar em nenhuma categoria acima"},
]


class SQLAlchemyCategoriaRepository(CategoriaRepository):

    def listar(self) -> list[Categoria]:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM categorias ORDER BY nome ASC"))
            return [self._row_to_entity(dict(row)) for row in result.mappings()]

    def buscar_por_id(self, id: str) -> Optional[Categoria]:
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT * FROM categorias WHERE id = CAST(:id AS uuid)"),
                {"id": id}
            ).mappings().first()
            return self._row_to_entity(dict(result)) if result else None

    def criar(self, categoria: Categoria) -> Optional[str]:
        with engine.connect() as conn:
            result = conn.execute(text("""
                INSERT INTO categorias (nome, cor, icone, descricao)
                VALUES (:nome, :cor, :icone, :descricao)
                ON CONFLICT (nome) DO NOTHING
                RETURNING id
            """), {
                "nome": categoria.nome,
                "cor": categoria.cor,
                "icone": categoria.icone,
                "descricao": categoria.descricao,
            })
            conn.commit()
            row = result.fetchone()
            return str(row[0]) if row else None

    def atualizar(self, categoria: Categoria) -> bool:
        with engine.connect() as conn:
            result = conn.execute(text("""
                UPDATE categorias
                SET nome = :nome, cor = :cor, icone = :icone, descricao = :descricao
                WHERE id = CAST(:id AS uuid)
            """), {
                "id": categoria.id,
                "nome": categoria.nome,
                "cor": categoria.cor,
                "icone": categoria.icone,
                "descricao": categoria.descricao,
            })
            conn.commit()
            return result.rowcount > 0

    def excluir(self, id: str) -> bool:
        with engine.connect() as conn:
            row = conn.execute(
                text("SELECT nome FROM categorias WHERE id = CAST(:id AS uuid)"),
                {"id": id}
            ).mappings().first()
            if row:
                conn.execute(
                    text("UPDATE transacoes SET categoria = 'Outros' WHERE categoria = :nome"),
                    {"nome": row["nome"]}
                )
            result = conn.execute(
                text("DELETE FROM categorias WHERE id = CAST(:id AS uuid)"),
                {"id": id}
            )
            conn.commit()
            return result.rowcount > 0

    def popular_padrao(self) -> bool:
        with engine.connect() as conn:
            count = conn.execute(text("SELECT COUNT(*) FROM categorias")).scalar()
            if count == 0:
                for cat in CATEGORIAS_PADRAO:
                    conn.execute(text("""
                        INSERT INTO categorias (nome, cor, icone, descricao)
                        VALUES (:nome, :cor, :icone, :descricao)
                        ON CONFLICT (nome) DO NOTHING
                    """), cat)
                conn.commit()
                return True
            return False

    def _row_to_entity(self, row: dict) -> Categoria:
        return Categoria(
            id=str(row["id"]),
            nome=row["nome"],
            cor=row["cor"],
            icone=row.get("icone"),
            descricao=row.get("descricao"),
        )
