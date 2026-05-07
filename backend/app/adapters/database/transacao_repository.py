from typing import Optional
from datetime import date
from sqlalchemy import text
from app.domain.transacao import Transacao
from app.ports.transacao_repository import TransacaoRepository
from app.adapters.database.connection import engine


class SQLAlchemyTransacaoRepository(TransacaoRepository):

    def salvar(self, transacao: Transacao) -> Optional[str]:
        with engine.connect() as conn:
            query = text("""
                INSERT INTO transacoes (hash_id, data, descricao, valor, categoria, ignorar_no_resumo)
                VALUES (:hash, :data, :desc, :val, :cat, :ignorar)
                ON CONFLICT (hash_id) DO NOTHING
                RETURNING id
            """)
            result = conn.execute(query, {
                "hash": transacao.gerar_hash(),
                "data": transacao.data,
                "desc": transacao.descricao,
                "val": transacao.valor,
                "cat": transacao.categoria,
                "ignorar": transacao.ignorar_no_resumo,
            })
            conn.commit()
            row = result.fetchone()
            return str(row[0]) if row else None

    def buscar_por_id(self, id: str) -> Optional[Transacao]:
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT * FROM transacoes WHERE id = CAST(:id AS uuid)"),
                {"id": id}
            ).mappings().first()
            return self._row_to_entity(dict(result)) if result else None

    def listar(self, filtro_ano=None, filtro_mes=None, filtro_categoria=None) -> list[Transacao]:
        with engine.connect() as conn:
            query = "SELECT * FROM transacoes WHERE 1=1"
            params = {}
            if filtro_ano:
                query += " AND TO_CHAR(data, 'YYYY') = :ano"
                params["ano"] = filtro_ano
            if filtro_mes:
                query += " AND TO_CHAR(data, 'MM') = :mes"
                params["mes"] = filtro_mes
            if filtro_categoria:
                query += " AND categoria = :cat"
                params["cat"] = filtro_categoria
            query += " ORDER BY data DESC"
            result = conn.execute(text(query), params)
            return [self._row_to_entity(dict(row)) for row in result.mappings()]

    def atualizar(self, transacao: Transacao) -> bool:
        with engine.connect() as conn:
            novo_hash = transacao.gerar_hash()
            result = conn.execute(text("""
                UPDATE transacoes
                SET data = :data, descricao = :desc, valor = :val, categoria = :cat,
                    hash_id = :hash, ignorar_no_resumo = :ignorar
                WHERE id = CAST(:id AS uuid)
            """), {
                "id": transacao.id,
                "hash": novo_hash,
                "data": transacao.data,
                "desc": transacao.descricao,
                "val": transacao.valor,
                "cat": transacao.categoria,
                "ignorar": transacao.ignorar_no_resumo,
            })
            conn.commit()
            return result.rowcount > 0

    def excluir(self, id: str) -> bool:
        with engine.connect() as conn:
            result = conn.execute(
                text("DELETE FROM transacoes WHERE id = CAST(:id AS uuid)"),
                {"id": id}
            )
            conn.commit()
            return result.rowcount > 0

    def listar_meses(self) -> list[str]:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT DISTINCT TO_CHAR(data, 'YYYY-MM') as mes
                FROM transacoes ORDER BY mes DESC
            """))
            return [row.mes for row in result]

    def gastos_por_mes(self, ano: str) -> list[dict]:
        mapa_meses = {
            "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr",
            "05": "Mai", "06": "Jun", "07": "Jul", "08": "Ago",
            "09": "Set", "10": "Out", "11": "Nov", "12": "Dez"
        }
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT TO_CHAR(data, 'MM') as mes_num, SUM(ABS(valor)) as total
                FROM transacoes
                WHERE TO_CHAR(data, 'YYYY') = :ano
                  AND valor < 0
                  AND categoria != 'Investimento'
                  AND ignorar_no_resumo = FALSE
                GROUP BY mes_num ORDER BY mes_num ASC
            """), {"ano": ano})
            return [
                {"mes": mapa_meses.get(row.mes_num, row.mes_num), "total": float(row.total)}
                for row in result.mappings()
            ]

    def resumo_financeiro(self, ano: str, mes: Optional[str] = None) -> dict:
        with engine.connect() as conn:
            query = """
                SELECT
                    COALESCE(SUM(CASE WHEN valor > 0 AND categoria != 'Investimento' AND ignorar_no_resumo = FALSE THEN valor ELSE 0 END), 0) as receitas,
                    COALESCE(SUM(CASE WHEN valor < 0 AND categoria != 'Investimento' AND ignorar_no_resumo = FALSE THEN ABS(valor) ELSE 0 END), 0) as despesas,
                    COALESCE(SUM(CASE WHEN valor < 0 AND categoria = 'Investimento' AND ignorar_no_resumo = FALSE THEN ABS(valor) ELSE 0 END), 0) as investimentos
                FROM transacoes WHERE TO_CHAR(data, 'YYYY') = :ano
            """
            params = {"ano": ano}
            if mes:
                query += " AND TO_CHAR(data, 'MM') = :mes"
                params["mes"] = mes
            result = conn.execute(text(query), params).mappings().first()
            receitas = float(result["receitas"]) if result else 0
            despesas = float(result["despesas"]) if result else 0
            investimentos = float(result["investimentos"]) if result else 0
            return {
                "receitas": receitas,
                "despesas": despesas,
                "investimentos": investimentos,
                "saldo": receitas - despesas,
            }

    def obter_dicionario_aprendizado(self) -> dict[str, str]:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT DISTINCT ON (descricao) descricao, categoria
                FROM transacoes ORDER BY descricao, data DESC
            """))
            return {row.descricao: row.categoria for row in result}

    def salvar_embedding(self, transacao_id: str, embedding: list[float]) -> bool:
        with engine.connect() as conn:
            embedding_str = "[" + ",".join(map(str, embedding)) + "]"
            result = conn.execute(text("""
                UPDATE transacoes
                SET embedding = CAST(:embedding AS vector)
                WHERE id = CAST(:id AS uuid)
            """), {"id": transacao_id, "embedding": embedding_str})
            conn.commit()
            return result.rowcount > 0

    def listar_sem_embedding(self) -> list[Transacao]:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT id, data, descricao, valor, categoria
                FROM transacoes WHERE embedding IS NULL ORDER BY data DESC
            """))
            return [self._row_to_entity(dict(row)) for row in result.mappings()]

    def contar_indexadas(self) -> dict:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT COUNT(*) as total, COUNT(embedding) as indexadas,
                       COUNT(*) - COUNT(embedding) as pendentes
                FROM transacoes
            """)).mappings().first()
            return {
                "total": result["total"],
                "indexadas": result["indexadas"],
                "pendentes": result["pendentes"],
            }

    def alternar_ignorar_no_resumo(self, id: str) -> Optional[bool]:
        with engine.connect() as conn:
            result = conn.execute(text("""
                UPDATE transacoes
                SET ignorar_no_resumo = NOT ignorar_no_resumo
                WHERE id = CAST(:id AS uuid)
                RETURNING ignorar_no_resumo
            """), {"id": id})
            conn.commit()
            row = result.fetchone()
            return bool(row[0]) if row else None

    def _row_to_entity(self, row: dict) -> Transacao:
        return Transacao(
            id=str(row["id"]),
            data=row["data"] if isinstance(row["data"], date) else date.fromisoformat(str(row["data"])),
            descricao=row["descricao"],
            valor=float(row["valor"]),
            categoria=row["categoria"],
            ignorar_no_resumo=bool(row.get("ignorar_no_resumo", False)),
        )
