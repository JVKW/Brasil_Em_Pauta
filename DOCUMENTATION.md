# Documentação do Projeto: Brasil em Pauta

## 1. Visão Geral do Projeto

"Brasil em Pauta" é um jogo de tabuleiro digital multiplayer projetado como uma ferramenta educacional sobre Educação em Direitos Humanos (EDH). Nele, os jogadores assumem papéis de ministros e tomam decisões que impactam uma nação virtual, equilibrando indicadores enquanto enfrentam dilemas éticos.

O projeto é construído como uma aplicação web moderna, utilizando uma arquitetura cliente-servidor com um backend em tempo real para suportar a jogabilidade multiplayer.

### Stack de Tecnologia

- **Frontend:** Next.js (React) com TypeScript
- **UI:** ShadCN, Tailwind CSS, Lucide React (ícones)
- **Backend & Banco de Dados:** Firebase (Firestore para banco de dados, Firebase Authentication para usuários)
- **Funcionalidades de IA:** Genkit (para futuras expansões)

---

## 2. Arquitetura do Backend e Fluxo de Dados (Firebase)

O backend é "serverless", totalmente gerenciado pelo Firebase. Esta seção detalha como cada ação do usuário interage com o backend.

### 2.1. Modelo de Dados: A Partida como um Documento Único

A principal decisão de arquitetura é tratar **cada partida como um único documento** no Firestore. Isso é diferente de um banco de dados relacional tradicional com tabelas separadas para `partidas` e `jogadores`.

- **Coleção Principal:** `game_sessions`
- **Documento:** Cada documento nesta coleção é uma partida completa, identificado por um `gameCode` de 6 dígitos (ex: `AB7DE1`).

**Vantagens deste modelo:**
- **Atômico:** Todas as informações de uma partida (jogadores, indicadores, logs) estão em um só lugar. Uma única operação de escrita (`updateDoc`) pode alterar múltiplos aspectos do jogo de forma segura.
- **Eficiente:** O cliente só precisa "escutar" (`useDoc`) um único documento para receber todas as atualizações em tempo real.
- **Simples de Gerenciar:** Ao reiniciar ou terminar uma partida, basta atualizar ou deletar um único documento.

#### Estrutura do Documento `game_session`:
```json
// /game_sessions/{gameCode}
{
  "gameCode": "AB7DE1",
  "creatorId": "uid_do_criador",
  "status": "waiting" | "in_progress" | "completed",
  "createdAt": "timestamp",
  "boardPosition": 1,
  "indicators": { ... },
  "players": {
    "uid_jogador_1": { "name": "Nome 1", "role": "ministerOfEducation", ... },
    "uid_jogador_2": { "name": "Nome 2", "role": "influencer", ... }
  },
  "currentPlayerIndex": 0,
  "turn": 1,
  "currentCardId": "card2",
  "logs": [ ... ]
}
```
- **`players` é um Mapa (Objeto), não uma Tabela Separada:** A chave de cada jogador é seu `uid` (ID de usuário do Firebase). Não há "chave estrangeira". O jogador *existe dentro* do documento da partida.

---

### 2.2. Detalhamento do Fluxo de Ações do Usuário

#### Ação 1: Abrir o Jogo (Primeira Visita)
1.  **Ação do Usuário:** Abre a URL do jogo pela primeira vez.
2.  **Processamento no Backend (Firebase Authentication):**
    - O aplicativo cliente chama a função `signInAnonymously` do Firebase Auth.
    - O Firebase cria uma conta de usuário anônima e temporária, retornando um **ID de Usuário (`uid`)** único. Este `uid` é a identidade do jogador para todas as ações futuras.
3.  **Interface:** O lobby é exibido, mostrando o `uid` do jogador.

#### Ação 2: Criar uma Nova Partida
1.  **Ação do Usuário:** Digita um nome (ex: "Maria") e clica em "Criar Partida".
2.  **Processamento no Frontend/Backend:**
    - O código do cliente (em `CreateGameForm.tsx`) gera um `gameCode` único de 6 caracteres (ex: `XJ3K9M`).
    - Um objeto `GameSession` completo é montado em memória, contendo:
        - `gameCode`, `creatorId` (o `uid` do jogador "Maria"), `status: 'waiting'`.
        - O estado inicial dos indicadores (`initialGameState`).
        - Um mapa `players` contendo apenas o criador: `{[maria_uid]: { name: "Maria", role: ..., capital: 5, ...}}`.
    - Uma única chamada `setDoc` é feita ao Firestore para criar um novo documento em `/game_sessions/XJ3K9M` com todos os dados acima.
3.  **Interface:** O jogador é redirecionado para a tela do jogo (`GameClient`), que agora observa as mudanças no documento `XJ3K9M`.

#### Ação 3: Entrar em uma Partida Existente
1.  **Ação do Usuário:** Digita um nome (ex: "João") e um código de partida (ex: `XJ3K9M`) e clica em "Entrar na Partida".
2.  **Processamento no Frontend/Backend (`JoinGameForm.tsx`):**
    - O código cliente chama `getDoc` para ler o documento `/game_sessions/XJ3K9M` do Firestore.
    - **Verificações de Lógica de Negócio (no cliente):**
        - O documento existe?
        - O `status` do jogo é `waiting`?
        - O número de jogadores (`Object.keys(players).length`) é menor que 4?
        - O `uid` de "João" já não está na lista de jogadores?
    - **Se todas as verificações passarem:**
        - Um novo objeto de jogador para "João" é criado em memória.
        - Um novo mapa `updatedPlayers` é criado, combinando os jogadores existentes com o novo jogador "João".
        - Uma chamada `updateDoc` é feita para o documento `XJ3K9M`, substituindo todo o campo `players` pelo `updatedPlayers`.
3.  **Interface:** "João" é redirecionado para a tela do jogo, que começa a observar o documento `XJ3K9M`. Os outros jogadores já na partida veem "João" aparecer no painel de jogadores instantaneamente, pois o `useDoc` deles detecta a atualização no campo `players`.

#### Ação 4: Tomar uma Decisão no Jogo
1.  **Ação do Usuário:** É a vez do jogador "Maria". Ela clica em uma opção de decisão.
2.  **Processamento no Frontend/Backend (`GameClient.tsx`):**
    - A função `handleDecision` é chamada.
    - O código do cliente calcula os **novos valores** para os indicadores, capital do jogador, posição no tabuleiro, etc., com base nos efeitos da decisão e no cargo da "Maria".
    - Ele também determina o `nextPlayerIndex` e, se necessário, avança o `turn`.
    - Um novo `currentCardId` é sorteado.
    - Uma única e atômica chamada `updateDoc` é feita para o documento da partida, atualizando **todos** os campos que mudaram de uma só vez: `indicators`, `players` (o capital da Maria), `boardPosition`, `currentPlayerIndex`, `turn`, `currentCardId`, e adicionando uma entrada ao `log`.
3.  **Sincronização em Tempo Real:**
    - A atualização no Firestore é propagada para todos os clientes que estão "escutando" aquele documento.
    - O hook `useDoc` em todos os navegadores (de todos os jogadores) recebe os novos dados.
    - O React re-renderiza os componentes (`ResourceDashboard`, `PlayerDashboard`, etc.) com os novos valores.
    - O resultado é que todos os jogadores veem os indicadores mudarem, a coroa passar para o próximo jogador, e a carta de decisão mudar, tudo em tempo real e de forma sincronizada.

#### Ação 5: Reiniciar a Partida
1.  **Ação do Usuário:** Qualquer jogador clica no botão "Reiniciar".
2.  **Processamento no Frontend/Backend (`GameClient.tsx`):**
    - A função `handleRestart` é chamada.
    - Um novo objeto de estado de jogo é montado, similar ao `initialGameState`, mas preservando o `gameCode`, `creatorId`, e o criador original no mapa de `players` (com capital resetado). Todos os outros jogadores são removidos. O status volta para `'waiting'`.
    - Uma chamada `updateDoc` sobrescreve os campos do documento da partida com este novo estado inicial.
3.  **Interface:** A tela de todos os jogadores é resetada para o estado de "lobby de espera" dentro da mesma partida, pois o `useDoc` detectou a mudança de status e a remoção dos jogadores. Novos jogadores podem agora entrar usando o mesmo código.

### 2.3. Regras de Segurança (`firestore.rules`)

As regras de segurança são a camada final que protege o banco de dados contra manipulação.

- **Leitura (`get`, `list`):** Qualquer usuário autenticado pode ler os dados de qualquer partida. Isso é necessário para que o `JoinGameForm` possa verificar o status de uma partida antes de tentar entrar.
- **Criação (`create`):** Qualquer usuário autenticado pode criar uma nova partida.
- **Atualização (`update`):** Um usuário só pode atualizar um documento de partida se:
    1.  Ele já for um jogador naquela partida (seu `uid` está no mapa `players`). Isso permite que jogadores ativos façam seus movimentos.
    2.  OU a partida estiver no estado `'waiting'`. Isso permite que novos jogadores se adicionem ao mapa `players`.
- **Exclusão (`delete`):** Apenas o criador original da partida (`creatorId`) pode deletar o documento.

Este sistema garante que apenas jogadores válidos possam interagir com uma partida em andamento, enquanto mantém o lobby aberto para novos participantes.
