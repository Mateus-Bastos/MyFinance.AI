from typing import Optional
import pdfplumber
from app.ports.pdf_reader import PDFReader


class PdfPlumberReader(PDFReader):

    def extrair_texto(self, caminho: str) -> Optional[str]:
        print(f"Extraindo texto do arquivo: {caminho}")
        texto_completo = ""
        try:
            with pdfplumber.open(caminho) as pdf:
                total = len(pdf.pages)
                print(f"Total de páginas: {total}")
                for i, pagina in enumerate(pdf.pages):
                    print(f"Processando página {i + 1} de {total}")
                    texto = pagina.extract_text()
                    if texto:
                        texto_completo += texto + "\n"
        except Exception as e:
            print(f"Erro ao extrair texto de {caminho}: {e}")
            return None
        return texto_completo or None
