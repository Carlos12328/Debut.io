# Debut.io

> Sistema de gestão de festas de 15 anos — planejamento, finanças, fornecedores, tarefas e agenda em uma plataforma.

**Desenvolvido por:** André Estevam, Anna Beatriz Medeiros, Carlos Carvalho e Erick Zampier  
**Curso:** Análise e Desenvolvimento de Sistemas — Universidade Católica de Brasília  
**Disciplina:** Soluções Computacionais

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Banco de dados](#banco-de-dados--decisão-arquitetural)
- [Arquitetura: MVP + ViewModel](#arquitetura-mvp--viewmodel)
- [Fluxo das camadas](#fluxo-das-camadas)
- [Estrutura do frontend](#estrutura-do-frontend)
- [Status dos módulos](#status-dos-módulos)
- [Como rodar localmente](#como-rodar-localmente)

---

## Sobre o projeto

O Debut.io centraliza todas as informações de um evento de 15 anos: cadastro do evento, controle financeiro, gestão de fornecedores, organização de tarefas e agenda de compromissos — numa única plataforma acessível por familiares e cerimonialistas.

---

## Banco de dados — Decisão Arquitetural

| Item | Decisão |
|---|---|
| **Banco primário** | **Supabase** (PostgreSQL gerenciado em nuvem) |
| **Versão da decisão** | v1.1 — 08/06/2026 |
| **Substituição** | SQLite (era o banco inicial do documento de arquitetura v1.0) |
| **SQLite hoje** | Fallback local de contingência apenas. Sem uso ativo em produção. |

**Por que Supabase:**
- Autenticação JWT gerenciada (Auth built-in)
- API REST e SDK gerados automaticamente das tabelas
- Real-time subscriptions para atualizações ao vivo
- PostgreSQL robusto, com suporte a relacionamentos complexos
- Escalabilidade para versões futuras sem migração de banco

> **Regra:** todos os Repositórios do projeto apontam para Supabase.  
> Não existe módulo apontando para SQLite em produção.

---

## Arquitetura: MVP + ViewModel

O sistema adota **MVP (Model–View–Presenter)** com a adição explícita da camada **ViewModel**, validada pelo professor da disciplina.

### O que cada camada faz

| Camada | Localização | Responsabilidade | O que pode chamar |
|---|---|---|---|
| **View** (Screen) | `src/screens/` | Renderizar ViewModel. Capturar eventos do usuário. **Zero lógica.** | Apenas Presenter |
| **Presenter** | `src/presenters/` | Chamar API. Transformar entidade bruta em ViewModel. Tratar erros. | API REST |
| **ViewModel** | `src/viewmodels/` | Interface TypeScript — contrato de dados entre Presenter e View. | — |
| **Controller** (Express) | `backend/controllers/` | Receber requisição HTTP. Validar entrada. Chamar Service. | Service |
| **Service** | `backend/services/` | Regras de negócio. Validações de domínio. | Repository |
| **Repository** | `backend/repositories/` | CRUD no banco de dados Supabase. | Supabase |

### Regra de ouro — nenhuma camada pula outra

```
✅ CORRETO                       ❌ ERRADO
────────────────────────────     ────────────────────────────
View → Presenter                 View → Service (bypass)
Presenter → API REST             View → Repository (bypass)
Controller → Service             Controller → Supabase direto
Service → Repository             Presenter → Repository direto
Repository → Supabase
```

---

## Fluxo das camadas

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│                                                             │
│   ┌──────────┐     ┌───────────┐     ┌─────────────────┐   │
│   │  Screen  │────▶│ Presenter │────▶│   ViewModel     │   │
│   │  (View)  │◀────│           │◀────│  (interface TS) │   │
│   └──────────┘     └─────┬─────┘     └─────────────────┘   │
│                          │ HTTP (fetch / axios)             │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                      BACKEND                                │
│                          │                                  │
│               ┌──────────▼──────────┐                       │
│               │  Routes + Middleware │                       │
│               └──────────┬──────────┘                       │
│                          │                                  │
│               ┌──────────▼──────────┐                       │
│               │     Controller      │ ← valida input HTTP   │
│               └──────────┬──────────┘                       │
│                          │                                  │
│               ┌──────────▼──────────┐                       │
│               │      Service        │ ← regras de negócio   │
│               └──────────┬──────────┘                       │
│                          │                                  │
│               ┌──────────▼──────────┐                       │
│               │     Repository      │ ← CRUD Supabase       │
│               └──────────┬──────────┘                       │
│                          │                                  │
│               ┌──────────▼──────────┐                       │
│               │  Supabase (Postgres) │                      │
│               └─────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Estrutura do frontend

```
src/
├── viewmodels/         ← Interfaces TypeScript (contrato View↔Presenter)
│   ├── LoginViewModel.ts
│   ├── CadastroViewModel.ts
│   ├── EventoViewModel.ts
│   ├── FornecedorViewModel.ts
│   ├── FinanceiroViewModel.ts
│   ├── TarefaViewModel.ts
│   ├── AgendaViewModel.ts
│   ├── DashboardViewModel.ts
│   └── index.ts        ← barrel export (sempre importe daqui)
│
├── presenters/         ← Lógica de apresentação, transformação de dados
├── screens/            ← Componentes React (View) — apenas render + eventos
├── services/           ← Chamadas HTTP à API REST
└── ...
```

### Como importar ViewModels

```typescript
// ✅ Sempre pelo barrel export
import { TarefaViewModel, DashboardViewModel } from '../viewmodels';

// ❌ Nunca direto no arquivo — acopla ao path interno
import { TarefaViewModel } from '../viewmodels/TarefaViewModel';
```

### ViewModels disponíveis

| ViewModel | Módulo | Casos de Uso (UC) |
|---|---|---|
| `LoginViewModel` | Autenticação | UC16 |
| `CadastroViewModel` | Cadastro de usuário | — |
| `EventoViewModel` | Gestão de eventos | UC01, UC02, UC03, UC04 |
| `FornecedorViewModel` | Fornecedores | UC05 |
| `FinanceiroViewModel` | Financeiro + Pagamentos | UC06, UC07, UC14 |
| `TarefaListaViewModel` / `TarefaViewModel` | Tarefas | UC08, UC09, UC10 |
| `AgendaViewModel` | Compromissos | UC11, UC12 |
| `DashboardViewModel` | Painel geral | UC14, UC15 |

---

## Status dos módulos

| Módulo | Presentation | Controller | Service | Repository | ViewModel | Routes | Status |
|---|---|---|---|---|---|---|---|
| **Login** | ⚠️ refatorar | ⚠️ ajustar | ✅ | ✅ Supabase | 🔄 pendente | 🔄 pendente | Em refatoração |
| **Cadastro** | ⚠️ refatorar | ⚠️ ajustar | ✅ | ✅ | 🔄 pendente | 🔄 pendente | Em refatoração |
| **Eventos** | ⚠️ refatorar | ⚠️ ajustar | ✅ | ✅ | 🔄 pendente | ⚠️ parcial | Em refatoração |
| **Fornecedores** | ⚠️ refatorar | ⚠️ ajustar | ✅ | ✅ | 🔄 pendente | ⚠️ parcial | Em refatoração |
| **Financeiro** | 🔴 remover bypass | ⚠️ ajustar | ✅ | ✅ | 🔄 pendente | 🔄 pendente | Crítico |
| **Tarefas** | ✅ refatorado | ✅ em uso | ✅ | ✅ Supabase | 🔄 pendente | 🔄 pendente | Quase pronto |
| **Agenda** | ✅ refatorado | ✅ em uso | ✅ | ✅ Supabase | 🔄 pendente | 🔄 pendente | Quase pronto |
| **Dashboard** | ⚠️ acoplado | 🔴 criar | ⚠️ ajustar | ⚠️ ajustar | 🔄 pendente | 🔄 pendente | Reconstruir |
| **Main** | ✅ navegação | — | — | — | — | — | Container OK |

**Legenda:** ✅ ok · ⚠️ existe fora do padrão · 🔴 crítico · 🔄 pendente

---

## Como rodar localmente

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev
```

> Variáveis de ambiente necessárias: ver `.env.example`

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React.js + TypeScript |
| Backend | Node.js + Express.js |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth (JWT) |
| Padrão arquitetural | MVP + ViewModel (Layered Architecture) |