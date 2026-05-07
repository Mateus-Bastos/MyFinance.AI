from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.adapters.api.transacoes.router import router as transacoes_router
from app.adapters.api.categorias.router import router as categorias_router
from app.adapters.api.faturas.router import router as faturas_router
from app.adapters.api.busca.router import router as busca_router
from app.adapters.api.pluggy.router import router as pluggy_router
from app.dependencies import categoria_repo

app = FastAPI(
    title="MyFinance.AI API",
    description="API para servir dados financeiros extraídos de PDFs via IA.",
    version="2.0",
)

try:
    categoria_repo.popular_padrao()
except Exception as e:
    print(f"⚠️ Aviso ao popular categorias: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transacoes_router)
app.include_router(categorias_router)
app.include_router(faturas_router)
app.include_router(busca_router)
app.include_router(pluggy_router)


@app.get("/")
def root():
    return {"message": "API do MyFinance.AI está funcionando!", "status": "online"}
