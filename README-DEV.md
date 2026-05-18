# Debut.io — Guia do Desenvolvedor (iniciante)

Este guia explica **como começar a programar** cada módulo do sistema, mesmo se você nunca trabalhou neste projeto antes.

## 1) Antes de tudo: o que você precisa saber

### Tecnologias
- **Expo + React Native**: UI mobile.
- **TypeScript**: linguagem do projeto.
- **Arquitetura em camadas**: separa UI, domínio, dados e integrações.
- **MVP na apresentação**: View → Presenter → Model.

### Onde está o código
- **UI (telas)**: `src/presentation`
- **Regra de negócio**: `src/domain`
- **Dados/banco**: `src/persistence`
- **API (contratos)**: `src/application`
- **Integrações externas**: `src/integrations`

> Se você está inseguro, comece lendo o `README.md` principal.

---

## 2) Como escolher por onde começar

Escolha **um caso de uso** e siga o fluxo. Exemplo: **UC16 – Realizar login**.

Para qualquer módulo, o fluxo é sempre o mesmo:

1. **Definir a entidade** no domínio (se não existir).
2. **Criar o serviço** de regra de negócio no domínio.
3. **Criar o repositório** (se precisar persistir dados).
4. **Criar a View e o Presenter** no módulo correspondente.
5. **Conectar o fluxo completo** (Presenter → Service → Repository).

---

# ✅ EXEMPLO GUIADO: MÓDULO DE LOGIN

## Passo 1 — Criar o modelo do domínio
Arquivo: `src/domain/models/index.ts`

Adicione o tipo do usuário:

```ts
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}
```

## Passo 2 — Criar serviço de autenticação
Arquivo: `src/domain/services/index.ts`

Crie a interface:

```ts
export interface AuthService {
  login(email: string, password: string): Promise<User>;
}
```

## Passo 3 — Criar repositório de usuários
Arquivo: `src/persistence/repositories/index.ts`

```ts
export interface UserRepository {
  getByEmail(email: string): Promise<User | null>;
}
```

## Passo 4 — Criar a View (tela de login)
Local: `src/presentation/mvp/views/`

- Crie o componente `LoginView.tsx`
- Campos: e-mail e senha
- Botão: “Entrar”

## Passo 5 — Criar o Presenter
Local: `src/presentation/mvp/presenters/`

- Recebe o evento de login da View
- Chama o serviço de autenticação
- Retorna erro ou sucesso para a View

## Passo 6 — Conectar tudo
- A View chama o Presenter
- O Presenter chama o AuthService
- O AuthService usa o UserRepository

---

# ✅ MAPEAMENTO DE MÓDULOS E ONDE COMEÇAR

## Eventos (UC01–UC04)
- Comece em: `src/domain/models` → `Event`
- Services: `src/domain/services` (ex.: validar orçamento)
- UI: `src/presentation/modules/eventos`

## Fornecedores (UC05)
- Model: `Supplier`
- Repo: `SupplierRepository`
- UI: `src/presentation/modules/fornecedores`

## Financeiro (UC06–UC07)
- Model: `Payment`
- Service: validação de orçamento
- UI: `src/presentation/modules/financeiro`

## Tarefas (UC08–UC10)
- Model: `Task`
- Service: atualização de status
- UI: `src/presentation/modules/tarefas`

## Agenda (UC11–UC12)
- Model: `Appointment`
- Service: alertas/agenda
- UI: `src/presentation/modules/agenda`

## Dashboard (UC14–UC15)
- Usa modelos de outras camadas
- UI: `src/presentation/modules/dashboard`

---

# ✅ DICAS PARA QUEM ESTÁ COMEÇANDO

- **Nunca coloque regra de negócio dentro da View**.
- **Sempre crie a entidade no domínio primeiro**.
- **Se a regra é do negócio, ela vive em `domain/services`**.
- **Se for banco/dados, use `persistence/repositories`**.
- **Se for tela, use `presentation/mvp/views`**.

---

# ✅ GUIA DO BANCO DE DADOS (SQLite com Expo)

Esta seção mostra **do zero** como configurar o banco e começar a programar.

## Passo 1 — Instalar a biblioteca

```bash
npx expo install expo-sqlite expo-file-system expo-asset
```

## Passo 2 — Instalar extensão no VS Code

Recomendação para visualizar o banco:

- **SQLite Viewer** (extensão do VS Code)

> Com ela você consegue abrir o `.db` direto no editor.

## Passo 3 — Criar o arquivo do banco

Coloque o arquivo em `assets/` com o nome:

```
assets/debut.db
```

## Passo 4 — Usar o arquivo de conexão

O projeto já usa `src/persistence/db.ts` para copiar o `.db` do `assets/` para o storage do app na primeira execução.

Para abrir o banco:

```ts
import { getDatabase } from '../persistence';

async function initDb() {
  const db = await getDatabase();
  const rows = db.getAllSync('SELECT name FROM sqlite_master WHERE type = "table"');
  console.log(rows);
}
```

## Passo 5 — Colocar o SQL de criação

Use o arquivo:

```
src/persistence/schema.sql
```

> Coloque nele os `CREATE TABLE` do projeto.

## Passo 6 — Começar a programar com dados

Agora você já pode:

- Criar repositórios em `src/persistence/repositories`
- Chamar o banco via `getDatabase()`
- Evoluir as telas normalmente

---

## Como rodar o projeto

```bash
npm install
npm run start
```

---

## Próximo passo (se você está iniciando agora)

Se você ainda não sabe por onde começar:
1. Leia os casos de uso (UCs).
2. Escolha o UC mais simples (ex.: UC03 consultar evento).
3. Implemente só a View e o Presenter primeiro.
4. Depois conecte com domínio e persistência.
