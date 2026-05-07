# MyFinance.AI

> **Status: Em desenvolvimento**
> Este projeto está em construção ativa. Algumas funcionalidades podem estar incompletas ou sujeitas a mudanças.

Aplicação de gestão financeira pessoal que usa Inteligência Artificial para extrair e categorizar automaticamente transações a partir de faturas de cartão de crédito e extratos bancários em PDF.

---

## Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração e Instalação](#configuração-e-instalação)
- [Rodando o Projeto](#rodando-o-projeto)
- [Endpoints da API](#endpoints-da-api)
- [Variáveis de Ambiente](#variáveis-de-ambiente)

---

## Visão Geral

O MyFinance.AI permite que o usuário faça upload de uma fatura em PDF. A aplicação extrai o texto do documento, envia para o Google Gemini, que identifica todas as transações, classifica cada uma em uma categoria financeira e salva no banco de dados. O frontend exibe dashboards, gráficos e permite gerenciar transações e categorias manualmente.

---

## Funcionalidades

- **Upload de fatura PDF** — extração automática de transações via IA
- **Categorização inteligente** — o Gemini classifica cada transação com base nas categorias cadastradas no banco
- **Memória seletiva** — a IA aprende com classificações anteriores e aplica ao processar novas faturas
- **Dashboard financeiro** — visão geral de receitas, despesas, investimentos e saldo
- **Gráficos mensais** — evolução dos gastos ao longo do ano
- **CRUD de transações** — criar, editar e excluir transações manualmente
- **CRUD de categorias** — personalizar categorias com nome, cor e ícone
- **Busca semântica (RAG)** — encontrar transações por contexto usando embeddings vetoriais do Gemini
- **Filtros** — por ano, mês e categoria

---

## Tecnologias

### Backend
| Tecnologia | Uso |
|---|---|
| Python 3.9+ | Linguagem principal |
| FastAPI | Framework web / API REST |
| SQLAlchemy | ORM e execução de queries SQL |
| PostgreSQL (Supabase) | Banco de dados com suporte a vetores (pgvector) |
| Google Gemini API | Processamento de linguagem natural e embeddings |
| pdfplumber | Extração de texto de arquivos PDF |
| Pydantic | Validação de dados e schemas |
| python-dotenv | Gerenciamento de variáveis de ambiente |

### Frontend
| Tecnologia | Uso |
|---|---|
| React 19 | Interface de usuário |
| Vite | Bundler e servidor de desenvolvimento |
| Tailwind CSS | Estilização utilitária |
| Recharts | Gráficos financeiros |
| Lucide React | Ícones |
| Axios | Chamadas HTTP à API |

---

## Arquitetura

O backend segue os princípios da **Clean Architecture**, com a **Regra de Dependência**: o código sempre aponta para dentro — camadas internas nunca conhecem as externas.

```
┌─────────────────────────────────────────┐
│  Adapters (FastAPI, SQLAlchemy, Gemini) │  ← Frameworks e infraestrutura
│  ┌───────────────────────────────────┐  │
│  │  Application (Casos de Uso)       │  │  ← Orquestra o domínio
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Ports (Interfaces)         │  │  │  ← Contratos abstratos
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │  Domain (Entidades)   │  │  │  │  ← Regras de negócio puras
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Camadas

#### `domain/` — Entidades
Contém as classes de negócio puras, sem nenhuma dependência de framework ou biblioteca externa.

- `Transacao` — representa uma transação financeira; contém a lógica de geração de hash único, e métodos como `is_despesa()`, `is_receita()`, `is_investimento()`
- `Categoria` — representa uma categoria financeira com nome, cor e ícone
- `Fatura` — agrupamento de transações extraídas de um PDF

#### `ports/` — Interfaces (Contratos)
Define o que cada dependência externa precisa fazer, sem dizer como. São classes abstratas (`ABC`) que garantem que qualquer implementação siga o mesmo contrato.

- `TransacaoRepository` — operações de persistência de transações
- `CategoriaRepository` — operações de persistência de categorias
- `AIService` — processamento de fatura, geração de embeddings e busca semântica
- `PDFReader` — extração de texto de arquivos PDF

#### `application/` — Casos de Uso
Orquestra as entidades e as ports para executar uma ação de negócio completa. Cada caso de uso recebe as dependências por injeção e não sabe qual implementação concreta está sendo usada.

- `transacoes/` — `CriarTransacao`, `EditarTransacao`, `ExcluirTransacao`, `ListarTransacoes`
- `categorias/` — `CriarCategoria`, `EditarCategoria`, `ExcluirCategoria`, `ListarCategorias`
- `faturas/` — `ProcessarFatura` (pipeline completo: PDF → texto → IA → banco)
- `busca/` — `BuscarSimilares` (RAG com embeddings vetoriais)

#### `adapters/` — Implementações Concretas
Implementa as interfaces definidas nas ports usando frameworks e bibliotecas reais.

- `adapters/api/` — routers FastAPI; recebe requisições HTTP e delega para os casos de uso
- `adapters/database/` — repositórios SQLAlchemy que implementam `TransacaoRepository` e `CategoriaRepository`
- `adapters/ai/` — `GeminiService` que implementa `AIService` usando a API do Google Gemini
- `adapters/pdf/` — `PdfPlumberReader` que implementa `PDFReader` usando pdfplumber

#### `dependencies.py` — Injeção de Dependências
Arquivo central que instancia todos os adapters concretos e os injeta nos casos de uso. É o único lugar onde as implementações concretas são conhecidas.

#### `main.py` — Entrypoint
Cria a aplicação FastAPI, registra os routers e configura middlewares (CORS).

### Fluxo do Upload de Fatura

```
POST /upload (PDF)
      │
      ▼
adapters/api/faturas/router.py
      │  salva arquivo temporário, chama caso de uso
      ▼
application/faturas/processar_fatura.py
      │
      ├──▶ PDFReader.extrair_texto()
      │         └── adapters/pdf/PdfPlumberReader
      │
      ├──▶ AIService.processar_fatura(texto, regras, contexto)
      │         └── adapters/ai/GeminiService → Google Gemini API
      │
      └──▶ TransacaoRepository.salvar(transacao) [para cada transação]
                └── adapters/database/SQLAlchemyTransacaoRepository → PostgreSQL
```

---

## Estrutura do Projeto

```
MyFinance.AI/
├── backend/
│   ├── app/
│   │   ├── domain/
│   │   │   ├── transacao.py
│   │   │   ├── categoria.py
│   │   │   └── fatura.py
│   │   ├── ports/
│   │   │   ├── transacao_repository.py
│   │   │   ├── categoria_repository.py
│   │   │   ├── ai_service.py
│   │   │   └── pdf_reader.py
│   │   ├── application/
│   │   │   ├── transacoes/
│   │   │   │   ├── criar_transacao.py
│   │   │   │   ├── editar_transacao.py
│   │   │   │   ├── excluir_transacao.py
│   │   │   │   └── listar_transacoes.py
│   │   │   ├── categorias/
│   │   │   │   └── categorias.py
│   │   │   ├── faturas/
│   │   │   │   └── processar_fatura.py
│   │   │   └── busca/
│   │   │       └── buscar_similares.py
│   │   ├── adapters/
│   │   │   ├── api/
│   │   │   │   ├── transacoes/router.py
│   │   │   │   ├── categorias/router.py
│   │   │   │   ├── faturas/router.py
│   │   │   │   └── busca/router.py
│   │   │   ├── database/
│   │   │   │   ├── connection.py
│   │   │   │   ├── transacao_repository.py
│   │   │   │   └── categoria_repository.py
│   │   │   ├── ai/
│   │   │   │   └── gemini_service.py
│   │   │   └── pdf/
│   │   │       └── pdf_reader.py
│   │   ├── dependencies.py
│   │   └── main.py
│   ├── .env
│   ├── requirements.txt
│   └── .venv/
└── frontend/
    └── src/
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Transacoes.jsx
        │   ├── Investimentos.jsx
        │   ├── Configuracoes.jsx
        │   └── Ajuda.jsx
        ├── components/
        │   ├── layout/
        │   │   ├── Header.jsx
        │   │   └── Sidebar.jsx
        │   └── ui/
        │       ├── BuscaSemantica.jsx
        │       └── Logo.jsx
        ├── context/
        │   └── AppContext.jsx
        └── utils/
            ├── constants.js
            └── formatters.js
```

---

## Configuração e Instalação

### Pré-requisitos

- Python 3.9+
- Node.js 18+
- Conta no [Supabase](https://supabase.com) com extensão `pgvector` habilitada
- Chave de API do [Google Gemini](https://aistudio.google.com)

### 1. Clonar o repositório

```bash
git clone <url-do-repositório>
cd MyFinance.AI
```

### 2. Configurar o Backend

```bash
cd backend

# Criar e ativar ambiente virtual
python3 -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate   # Windows

# Instalar dependências
pip install -r requirements.txt
```

### 3. Configurar variáveis de ambiente

Crie o arquivo `backend/.env`:

```env
GEMINI_API_KEY=sua_chave_aqui
DATABASE_URL=postgresql://usuario:senha@host:porta/banco
```

### 4. Configurar o Frontend

```bash
cd frontend
npm install
```

---

## Rodando o Projeto

### Backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

A API estará disponível em `http://localhost:8000`.  
Documentação interativa (Swagger): `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

---

## Endpoints da API

### Transações

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/transacoes` | Lista transações (filtros: `ano`, `mes`, `categoria`) |
| `GET` | `/transacoes/{id}` | Busca transação por ID |
| `POST` | `/transacoes` | Cria uma transação manualmente |
| `PUT` | `/transacoes/{id}` | Edita uma transação |
| `DELETE` | `/transacoes/{id}` | Exclui uma transação |
| `GET` | `/transacoes/meses` | Lista meses disponíveis |
| `GET` | `/transacoes/por_mes?ano=2025` | Gastos agrupados por mês |
| `GET` | `/transacoes/resumo?ano=2025` | Resumo financeiro (receitas, despesas, saldo) |

### Categorias

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/categorias` | Lista todas as categorias |
| `GET` | `/categorias/{id}` | Busca categoria por ID |
| `POST` | `/categorias` | Cria uma categoria |
| `PUT` | `/categorias/{id}` | Edita uma categoria |
| `DELETE` | `/categorias/{id}` | Exclui uma categoria |

### Faturas

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/upload` | Faz upload de PDF e processa com IA |

### Busca Semântica

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/busca` | Busca transações por similaridade semântica |
| `GET` | `/busca/status` | Status de indexação dos embeddings |

---

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|---|---|---|
| `GEMINI_API_KEY` | Chave de API do Google Gemini | Sim |
| `DATABASE_URL` | URL de conexão com o PostgreSQL | Sim |
