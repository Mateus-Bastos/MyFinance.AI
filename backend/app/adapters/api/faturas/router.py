import os
import shutil
from fastapi import APIRouter, File, HTTPException, UploadFile
from app.dependencies import processar_fatura

router = APIRouter(prefix="/upload", tags=["Faturas"])


@router.post("")
async def upload_fatura(file: UploadFile = File(...)):
    print(f"📥 Recebendo arquivo: {file.filename}")

    nome_arquivo = f"temp_{file.filename}"
    with open(nome_arquivo, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        novos, repetidos = processar_fatura.execute(nome_arquivo)
        os.remove(nome_arquivo)
        return {
            "success": "Fatura processada com sucesso",
            "detalhes": {
                "novos": novos,
                "repetidos": repetidos,
                "total_processadas": novos + repetidos,
            },
        }
    except Exception as e:
        if os.path.exists(nome_arquivo):
            os.remove(nome_arquivo)
        print(f"❌ Erro: {e}")
        raise HTTPException(status_code=500, detail=str(e))
