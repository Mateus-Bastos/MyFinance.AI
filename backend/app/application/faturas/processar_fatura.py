from typing import Tuple
from app.ports.transacao_repository import TransacaoRepository
from app.ports.categoria_repository import CategoriaRepository
from app.ports.ai_service import AIService
from app.ports.pdf_reader import PDFReader


class ProcessarFatura:
    def __init__(
        self,
        pdf_reader: PDFReader,
        ai_service: AIService,
        transacao_repo: TransacaoRepository,
        categoria_repo: CategoriaRepository,
    ):
        self.pdf_reader = pdf_reader
        self.ai_service = ai_service
        self.transacao_repo = transacao_repo
        self.categoria_repo = categoria_repo

    def execute(self, caminho_pdf: str) -> Tuple[int, int]:
        """
        Orquestra o pipeline completo: PDF → texto → IA → banco.
        Retorna (novos, repetidos).
        """
        texto = self.pdf_reader.extrair_texto(caminho_pdf)
        if not texto:
            raise ValueError("Não foi possível extrair texto do PDF.")

        regras_categorias = self._montar_regras_categorias()
        contexto_aprendido = self._filtrar_contexto_aprendido(texto)

        fatura = self.ai_service.processar_fatura(texto, regras_categorias, contexto_aprendido)
        if not fatura:
            raise ValueError("A IA não conseguiu processar a fatura.")

        novos = 0
        repetidos = 0
        for transacao in fatura.transacoes:
            id_criado = self.transacao_repo.salvar(transacao)
            if id_criado:
                novos += 1
            else:
                repetidos += 1

        return novos, repetidos

    def _montar_regras_categorias(self) -> str:
        try:
            categorias = self.categoria_repo.listar()
            if not categorias:
                return '    - "Outros": Quando não se encaixar em nenhuma categoria específica'
            regras = []
            for cat in categorias:
                descricao = cat.descricao or f"Transações relacionadas a {cat.nome.lower()}"
                regras.append(f'    - "{cat.nome}": {descricao}')
            return "\n".join(regras)
        except Exception:
            return '    - "Outros": Quando não se encaixar em nenhuma categoria específica'

    def _filtrar_contexto_aprendido(self, texto_cru: str) -> str:
        try:
            dicionario = self.transacao_repo.obter_dicionario_aprendizado()
            if not dicionario:
                return ""
            texto_upper = texto_cru.upper()
            contexto = [
                f"    - {est}: {cat}"
                for est, cat in dicionario.items()
                if est.upper() in texto_upper
            ]
            return "\n".join(contexto)
        except Exception:
            return ""
