# Debut.io

Projeto em Expo + React Native, organizado para refletir uma arquitetura em camadas e o padrão MVP na camada de apresentação.
Este README é um guia didático para quem vai começar a programar no projeto.

## Visão rápida

- **Expo** continua como base (não mudamos a estrutura exigida pelo framework).
- **`src/`** concentra o código da aplicação.
- **MVP** é usado apenas na camada de apresentação.
- **Camadas** separam responsabilidades para manter o projeto simples de evoluir.

## Estrutura do projeto

```
./
├── App.tsx
├── index.ts
├── src/
│   ├── presentation/
│   │   ├── AppRoot.tsx
│   │   ├── mvp/
│   │   │   ├── models/
│   │   │   ├── presenters/
│   │   │   └── views/
│   │   └── modules/
│   │       ├── agenda/
│   │       ├── dashboard/
│   │       ├── eventos/
│   │       ├── financeiro/
│   │       ├── fornecedores/
│   │       └── tarefas/
│   ├── application/
│   │   └── api/
│   │       ├── controllers/
│   │       ├── middlewares/
│   │       └── routes/
│   ├── domain/
│   │   ├── models/
│   │   └── services/
│   ├── persistence/
│   │   └── repositories/
│   └── integrations/
│       └── google-calendar/
└── assets/
```

## O que cada parte faz (explicação didática)

### 1) Entradas do Expo

- **`index.ts`**: ponto de bootstrap do Expo. Registra o componente raiz.
- **`App.tsx`**: ponto de entrada da UI. Apenas monta o `AppRoot`.

> Se você está começando, pense em `App.tsx` como a “porta de entrada” da interface.

### 2) Camada de Apresentação (UI) — `src/presentation`

Aqui fica tudo que aparece na tela. Esta camada usa **MVP**.

- **`AppRoot.tsx`**: compõe a aplicação e cria o Presenter principal.
- **`mvp/`**:
	- **`views/`**: componentes visuais (React Native). Mostram dados e disparam ações.
	- **`presenters/`**: recebem eventos da View, chamam serviços e devolvem dados.
	- **`models/`**: estruturas de dados usadas pela UI (formatos simples para a View).
- **`modules/`**: organização por módulos funcionais:
	- **`eventos/`**, **`financeiro/`**, **`fornecedores/`**, **`tarefas/`**, **`agenda/`**, **`dashboard/`**.

> MVP aqui significa: **View → Presenter → Model**. A View não fala direto com regra de negócio.

### 3) Camada de Aplicação (API REST) — `src/application`

Responsável por orquestrar o fluxo entre UI e domínio, como se fosse um “porteiro” da aplicação.

- **`routes/`**: define endpoints (URLs) e operações.
- **`controllers/`**: recebe requisições, valida dados, chama serviços e retorna resposta.
- **`middlewares/`**: autenticação, autorização, validações comuns, logs e erros.

> Aqui não ficam regras complexas. Apenas coordenação.

### 4) Camada de Domínio — `src/domain`

É o “coração” do sistema. As regras de negócio vivem aqui.

- **`models/`**: entidades do negócio (Usuário, Evento, Pagamento, Tarefa...).
- **`services/`**: regras e validações (ex.: controle de orçamento, status de tarefas, etc).

> Se algo é uma regra do negócio, deve estar nesta camada.

### 5) Persistência — `src/persistence`

Responsável por **acessar o banco** e salvar/ler dados.

- **`repositories/`**: operações CRUD, consultas e encapsulamento de banco.

> A regra de negócio **não** conhece o banco diretamente, usa repositórios.

### 6) Integrações externas — `src/integrations`

Comunica com serviços de terceiros.

- **`google-calendar/`**: integração com Google Calendar para sincronizar agenda.

## Como seguir o fluxo (exemplo mental)

1. Usuário toca na tela (View).
2. View chama o Presenter.
3. Presenter chama a API (Camada de Aplicação).
4. Camada de Aplicação chama Services (Domínio).
5. Services usam Repositories (Persistência).
6. Dados voltam para o Presenter e a View atualiza.

## Dicas para quem está começando

- Quer criar uma tela? Vá para `src/presentation/mvp/views/`.
- Quer organizar um módulo novo? Crie uma pasta dentro de `src/presentation/modules/`.
- Quer uma regra de negócio? Crie/edite em `src/domain/services/`.
- Precisa de dados do banco? Use/implemente um repositório em `src/persistence/repositories/`.
- Integração externa? Coloque em `src/integrations/`.

## Como rodar

```bash
npm install
npm run start
```
