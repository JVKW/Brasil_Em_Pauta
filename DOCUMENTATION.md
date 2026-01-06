# Documentação do Projeto: Brasil em Pauta

## 1. Visão Geral do Projeto

"Brasil em Pauta" é um jogo de tabuleiro digital multiplayer projetado como uma ferramenta educacional sobre Educação em Direitos Humanos (EDH). Nele, os jogadores assumem papéis de ministros e tomam decisões que impactam uma nação virtual, equilibrando indicadores como economia, educação e bem-estar, enquanto enfrentam dilemas éticos.

O projeto é construído como uma aplicação web moderna, utilizando uma arquitetura cliente-servidor com um backend em tempo real para suportar a jogabilidade multiplayer.

### Stack de Tecnologia

- **Frontend:** Next.js (React) com TypeScript
- **UI:** ShadCN, Tailwind CSS, Lucide React (ícones)
- **Backend & Banco de Dados:** Firebase (Firestore para banco de dados em tempo real, Firebase Authentication para gerenciamento de usuários)
- **Funcionalidades de IA:** Genkit (para futuras expansões, como análise de vitória)

---

## 2. Estrutura de Arquivos

A organização do projeto segue as convenções do Next.js, separando lógica, componentes de UI, dados e configuração do backend.

```
/
├── src/
│   ├── app/                # Roteamento e Páginas (App Router)
│   │   ├── page.tsx        # Ponto de entrada principal da aplicação
│   │   ├── layout.tsx      # Layout global (inclui fontes e metadados)
│   │   └── globals.css     # Estilos globais e variáveis de tema (Tailwind)
│   │
│   ├── components/         # Componentes React reutilizáveis
│   │   ├── game/           # Componentes da tela principal do jogo (gameplay)
│   │   ├── lobby/          # Componentes para criar/entrar em uma partida
│   │   └── ui/             # Componentes base da UI (ShadCN)
│   │
│   ├── firebase/           # Configuração e hooks do Firebase
│   │   ├── config.ts       # Chaves de configuração do projeto Firebase
│   │   ├── index.ts        # Ponto de inicialização e exportação dos serviços
│   │   ├── provider.tsx    # Provedor de contexto para Firebase e autenticação
│   │   └── firestore/      # Hooks para interagir com o Firestore (useDoc, useCollection)
│   │
│   ├── lib/                # Lógica central, tipos e dados estáticos
│   │   ├── game-data.ts    # Dados iniciais do jogo (jogadores, cartas, chefes)
│   │   ├── types.ts        # Definições de tipos TypeScript para o jogo
│   │   └── utils.ts        # Funções utilitárias (ex: `cn` para Tailwind)
│   │
│   └── ai/                 # Lógica de Inteligência Artificial com Genkit
│       ├── genkit.ts       # Configuração do cliente Genkit
│       └── flows/          # Fluxos de IA (ex: `analyze-win-conditions.ts`)
│
├── docs/
│   └── backend.json        # Definição do schema do banco de dados (Firestore)
│
├── firestore.rules         # Regras de segurança do banco de dados Firestore
│
└── DOCUMENTATION.md        # Este arquivo
```

### Explicação dos Diretórios Principais:

- **`/src/app`**: Contém as rotas da aplicação. `page.tsx` é a página principal que decide se renderiza o Lobby ou o Jogo. `layout.tsx` define a estrutura HTML base.
- **`/src/components`**: O coração da interface.
  - `/game`: Contém os "widgets" do tabuleiro, como `GameBoard.tsx`, `DecisionCard.tsx` e `ResourceDashboard.tsx`.
  - `/lobby`: `CreateGameForm.tsx` e `JoinGameForm.tsx` gerenciam a entrada dos jogadores nas partidas.
- **`/src/firebase`**: Gerencia toda a comunicação com o backend. O `provider.tsx` é crucial, pois disponibiliza o estado de autenticação do usuário e as instâncias do Firestore para toda a aplicação. Os hooks `useDoc` e `useCollection` abstraem a complexidade de ouvir dados em tempo real.
- **`/src/lib`**: Contém a "alma" do jogo. `types.ts` define a estrutura de dados (o que é um `Player`, um `GameState`, etc.), e `game-data.ts` fornece os valores padrão para iniciar uma partida.
- **`/docs/backend.json`**: Documenta a estrutura de dados do Firestore, servindo como um "contrato" para o backend.

---

## 3. Roteamento e Fluxo da Aplicação

O jogo possui um fluxo de tela único, gerenciado condicionalmente.

1.  **Ponto de Entrada (`/`):** O arquivo `src/app/page.tsx` é a única rota.
2.  **Autenticação Anônima:** Ao carregar a página, o `GameLobby.tsx` utiliza o `useEffect` para iniciar um login anônimo com o Firebase Auth. Isso garante que cada visitante tenha um `uid` (ID de usuário) único, mesmo sem criar uma conta.
3.  **Estado da Partida:** `page.tsx` usa um estado `gameId`.
    - Se `gameId` for `null`, o componente `GameLobby` é renderizado.
    - No lobby, o jogador pode **criar** uma partida (que gera um novo documento no Firestore e define o `gameId`) ou **entrar** em uma (que valida o código e define o `gameId`).
    - Uma vez que `gameId` é definido, o `page.tsx` renderiza o componente `GameClient`.
4.  **Tela do Jogo:** `GameClient.tsx` recebe o `gameId` e usa esse ID para buscar e sincronizar todos os dados da partida específica do Firestore.

---

## 4. Arquitetura do Backend (Firebase)

O backend é "serverless", totalmente gerenciado pelo Firebase, o que o torna ideal para aplicações em tempo real como esta.

### 4.1. Autenticação (Firebase Authentication)

-   **Método:** Login Anônimo.
-   **Funcionamento:** Cada usuário que abre o jogo recebe uma conta temporária e anônima. Isso é suficiente para identificá-lo unicamente dentro de uma sessão de jogo, permitindo que o sistema saiba quem está realizando qual ação. O ID do usuário (`user.uid`) é a chave para associá-lo a um jogador em uma partida.

### 4.2. Banco de Dados (Firestore)

O Firestore é um banco de dados NoSQL baseado em documentos, organizado em coleções. A estrutura principal do nosso jogo gira em torno de uma única coleção principal: `game_sessions`.

-   **Coleção Principal:** `game_sessions`
    -   Cada **documento** nesta coleção representa uma partida única.
    -   O **ID de cada documento** é o código de 6 dígitos que os jogadores usam para entrar no jogo (ex: `AB7DE1`).

#### Estrutura de um Documento `game_session`:

```json
{
  // game_sessions/{gameCode}
  "gameCode": "AB7DE1",
  "creatorId": "uid_do_criador",
  "status": "waiting" | "in_progress" | "completed",
  "createdAt": "timestamp",
  "boardPosition": 1,
  "indicators": {
    "economy": 7,
    "education": 4,
    "wellBeing": 5,
    "popularSupport": 5,
    "hunger": 2,
    "militaryReligion": 4
  },
  "players": {
    "uid_jogador_1": {
      "name": "Nome 1",
      "role": "ministerOfEducation",
      "capital": 5,
      "avatar": "1",
      "isOpportunist": false
    },
    "uid_jogador_2": {
      "name": "Nome 2",
      "role": "influencer",
      "capital": 5,
      "avatar": "2",
      "isOpportunist": true
    }
  },
  "currentPlayerIndex": 0,
  "turn": 1,
  "currentCardId": "card2",
  "log": [
    { "id": 1, "turn": 1, "playerName": "Nome 1", ... }
  ]
}
```

**Explicação dos Campos:**

-   `gameCode`, `creatorId`, `status`: Metadados da partida.
-   `boardPosition`, `indicators`: Representam o **estado compartilhado da nação**, que é o mesmo para todos os jogadores. Quando um jogador faz uma escolha que afeta a economia, ele atualiza o campo `indicators.economy` neste documento.
-   `players`: Um **mapa** onde cada chave é o `uid` do jogador (fornecido pelo Firebase Auth). O valor é um objeto com os dados **individuais** daquele jogador (capital, cargo, etc.).
-   `currentPlayerIndex`, `turn`, `currentCardId`: Gerenciam o fluxo de turnos e a carta de decisão ativa.
-   `log`: Um array que armazena o histórico de ações da partida.

### 4.3. Regras de Segurança (`firestore.rules`)

Este é um arquivo crucial que protege o banco de dados contra acesso não autorizado. As regras implementam a seguinte lógica:

-   Um usuário só pode ler ou escrever em um documento de `game_session` se seu `uid` estiver presente na lista de `players` daquela sessão.
-   Isso impede que um jogador de uma partida espione ou modifique os dados de outra.
-   A criação de um jogo é permitida para qualquer usuário autenticado.

---

## 5. Lógica Multiplayer e Sincronização em Tempo Real

A mágica do multiplayer acontece através dos **hooks de tempo real** do Firebase.

1.  **Leitura de Dados:**
    -   O componente `GameClient` usa o hook `useDoc<GameState>` (de `/firebase/firestore/use-doc.tsx`) para "escutar" o documento da partida atual no Firestore (`game_sessions/{gameId}`).
    -   Qualquer alteração nesse documento no banco de dados (feita por qualquer jogador) é **automaticamente** enviada para o cliente, e o hook atualiza o estado do componente, fazendo a UI re-renderizar com os novos dados.

2.  **Escrita de Dados:**
    -   Quando um jogador toma uma decisão (`handleDecision` em `GameClient.tsx`), em vez de usar `setState`, a função calcula os novos valores para os indicadores, capital, etc.
    -   Em seguida, ela chama a função `updateDoc` do Firestore para atualizar o documento da partida na nuvem.
    -   Essa atualização dispara o listener em todos os clientes conectados, que recebem os novos dados e atualizam suas telas, mantendo todos sincronizados.

Este ciclo de `updateDoc` -> `listener do useDoc` -> `re-renderização` é o que cria a experiência multiplayer em tempo real.
