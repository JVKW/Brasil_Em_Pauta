# Documentação do Projeto: Brasil em Pauta

## 1. Visão Geral do Projeto

"Brasil em Pauta" é um jogo de tabuleiro digital multiplayer projetado como uma ferramenta educacional sobre Educação em Direitos Humanos (EDH). Nele, os jogadores assumem papéis de ministros e tomam decisões que impactam uma nação virtual, equilibrando indicadores enquanto enfrentam dilemas éticos.

O projeto é construído como uma aplicação web moderna, utilizando uma arquitetura cliente-servidor com um backend em tempo real para suportar a jogabilidade multiplayer.

### Stack de Tecnologia

- **Frontend:** Next.js (React) com TypeScript
- **UI:** ShadCN, Tailwind CSS, Lucide React (ícones)
- **Backend & Banco de Dados:** API REST customizada com banco de dados PostgreSQL.
- **Funcionalidades de IA:** Genkit (para futuras expansões)

---

## 2. Arquitetura do Backend e Fluxo de Dados (API REST)

O backend é construído sobre uma API REST que se comunica com um banco de dados PostgreSQL. O frontend interage com esta API para todas as ações do jogo. Esta seção detalha como cada ação do usuário interage com o backend.

### 2.1. Modelo de Dados Relacional (PostgreSQL)

Diferente de um modelo NoSQL, usamos um banco de dados relacional que separa as informações em tabelas distintas, conectadas por chaves estrangeiras.

- **`game_sessions`:** Contém o estado geral de uma partida (código da sala, status, turno).
- **`players`:** Cada linha é um jogador e está ligada a uma `game_session` através de uma chave estrangeira (`game_session_id`).
- **`nation_states`:** Armazena os indicadores da nação, também ligada 1-para-1 com uma `game_session`.
- **`decision_cards`:** Tabela estática com a definição de todas as cartas possíveis no jogo.
- **`session_decision_cards`:** Tabela de junção que representa o "deck" de uma partida específica, indicando quais cartas foram sorteadas e se já foram resolvidas.

**Vantagens deste modelo:**
- **Integridade dos Dados:** O banco de dados garante que um jogador não pode existir sem uma partida, por exemplo.
- **Consultas Complexas:** Facilita a agregação de dados e a geração de relatórios no futuro.
- **Estrutura Clara:** A separação de responsabilidades entre as tabelas é bem definida.

### 2.2. Detalhamento do Fluxo de Ações do Usuário

#### Ação 1: Abrir o Jogo (Primeira Visita)
1.  **Ação do Usuário:** Abre a URL do jogo.
2.  **Processamento no Frontend:** O arquivo `src/app/page.tsx` executa uma função `getOrCreateUserUid`. Se não houver um `userUid` salvo no `localStorage` do navegador, um novo ID único é gerado e salvo. Este `uid` é a identidade do jogador para todas as ações futuras na API.
3.  **Interface:** O lobby é exibido, mostrando opções para criar ou entrar em um jogo.

#### Ação 2: Criar uma Nova Partida
1.  **Ação do Usuário:** Digita um nome e clica em "Criar Partida".
2.  **Processamento no Frontend/Backend (`CreateGameForm.tsx`):**
    - O frontend envia uma requisição `POST` para o endpoint `/game/create` com o `userUid` e `playerName`.
    - **No Backend:**
        - A API executa a função `createGame`.
        - Ela gera um `gameCode` único.
        - Cria uma nova linha na tabela `game_sessions`.
        - Cria uma linha correspondente em `nation_states` com os indicadores iniciais.
        - Adiciona o criador como o primeiro jogador na tabela `players`, atribuindo o papel de "Presidente".
        - Tudo isso ocorre em uma transação para garantir a atomicidade.
        - Retorna o `gameCode` para o frontend.
3.  **Interface:** O jogador é redirecionado para a tela do jogo (`/game/:gameCode`), onde o componente `GameClient` começa a sondar (poll) a API para obter o estado do jogo.

#### Ação 3: Entrar em uma Partida Existente
1.  **Ação do Usuário:** Digita um nome, um código de partida e clica em "Entrar na Partida".
2.  **Processamento no Frontend/Backend (`JoinGameForm.tsx`):**
    - O frontend envia uma requisição `POST` para `/game/join` com `gameCode`, `userUid` e `playerName`.
    - **No Backend:**
        - A API executa a função `joinGame`.
        - **Verificações de Lógica de Negócio:**
            - A partida existe?
            - O `status` é `waiting`?
            - O número de jogadores é menor que 4?
            - Este `userUid` já está na partida?
        - **Se tudo estiver OK:**
            - Atribui um `character_role` ao novo jogador.
            - Insere uma nova linha na tabela `players`, associada à `game_session_id` correta.
            - Retorna sucesso.
3.  **Interface:** O jogador é redirecionado para a tela do jogo. O `GameClient`, através de sua sondagem periódica (`GET /game/:gameCode`), detecta o novo jogador na lista e atualiza a interface para todos.

#### Ação 4: Iniciar a Partida
1.  **Ação do Usuário:** O criador da partida, vendo que há jogadores suficientes, clica no botão "Iniciar Partida".
2.  **Processamento no Frontend/Backend (`GameClient.tsx`):**
    - O frontend envia uma requisição `POST` para `/game/start` com o `gameCode`.
    - **No Backend:**
        - A API muda o `status` da `game_session` para `in_progress`.
        - **Sorteia a primeira carta de decisão** para a partida e a vincula na tabela `session_decision_cards`.
3.  **Sincronização:**
    - Na próxima sondagem (`GET /game/:gameCode`), todos os clientes receberão o novo `status: 'in_progress'` e os dados da `currentCard`.
    - O frontend renderiza a carta de decisão e habilita os controles para o jogador da vez.

#### Ação 5: Tomar uma Decisão no Jogo
1.  **Ação do Usuário:** O jogador da vez clica em uma opção de decisão (Ética ou Corrupta).
2.  **Processamento no Frontend/Backend (`GameClient.tsx`):**
    - O frontend envia uma `POST` para `/game/decision` com `gameCode`, `userUid` e a escolha (`ethical` ou `corrupt`).
    - **No Backend:**
        - A API valida se é o turno do jogador que fez a requisição.
        - Calcula os novos valores para os indicadores, aplicando as regras de negócio (como limites de 0 a 10).
        - Atualiza as tabelas `nation_states` e `players` (para o capital).
        - Marca a carta atual como resolvida (`is_resolved = TRUE`).
        - Atualiza o `current_player_index` e, se necessário, o `current_turn` na tabela `game_sessions`.
        - Sorteia uma nova carta para o próximo turno.
        - Todas essas operações de escrita ocorrem em uma transação.
3.  **Sincronização:**
    - Na próxima sondagem, os clientes de todos os jogadores recebem o estado atualizado do jogo (novos indicadores, novo jogador da vez, nova carta), e a interface é re-renderizada para refletir as mudanças.

---

### 3. Estrutura e Regras das Cartas de Decisão

A mecânica central do jogo gira em torno das cartas de decisão. É crucial que o backend seja a autoridade final sobre seus efeitos.

#### 3.1. SQL e Estrutura da Tabela `decision_cards`
A estrutura que você definiu é ideal. Ela armazena o dilema e os dois possíveis resultados em formato `JSONB`, o que oferece grande flexibilidade.

```sql
CREATE TABLE decision_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    dilemma TEXT NOT NULL,
    ethical_choice_effect JSONB NOT NULL,
    corrupt_choice_effect JSONB NOT NULL
);
```

**Chaves de Efeito Válidas (Dentro do JSON):**
*   `economy`, `education`, `wellbeing`, `popular_support`, `hunger`, `military_religion`: Afetam os indicadores da nação.
*   `board_position`: Move o peão no tabuleiro.
*   `capital`: Afeta o capital **do jogador que tomou a decisão**.

#### 3.2. Responsabilidades do Backend (Regras de Negócio)
O frontend pode mostrar os efeitos previstos, mas **o backend deve calcular e aplicar os resultados** para garantir a integridade do jogo.

1.  **Cálculo dos Efeitos:** Ao receber um `POST /game/decision`, o backend lê o `JSONB` da escolha e aplica cada efeito.
2.  **Limites (Clamping):** Todos os indicadores da nação (`economy`, `education`, etc.) **devem ser travados (clamped) entre 0 e 10** no backend. Se `Economia` é 9 e o efeito é `+2`, o valor salvo no banco de dados deve ser `10`.
3.  **Lógica do Turno:** Após aplicar os efeitos, o backend **deve**:
    *   Marcar a carta atual como resolvida.
    *   Atualizar o `current_player_index` e, se necessário, o `current_turn`.
    *   **Sortear uma nova carta** para o próximo jogador, garantindo que o jogo nunca fique sem uma carta ativa enquanto estiver `in_progress`.

---

### 4. Outras Responsabilidades Críticas do Backend

1.  **Atribuição de Papéis (`character_role`):** Ao receber um `POST /game/join`, o backend deve atribuir um `character_role` único a cada novo jogador. Ele deve verificar os papéis já em uso na partida e selecionar um dos disponíveis.
2.  **Checagem de Condições de Vitória/Derrota:** Após cada decisão, o backend deve verificar se o jogo terminou.
    *   **Derrota:** Se um indicador chegar a 0 ou a fome chegar a 10, o backend muda o `status` para `finished`.
    *   **Vitória:** Se a `board_position` atingir o final com as condições cumpridas, ou um jogador atingir um objetivo secreto, o backend finaliza a partida.
3.  **Segurança e Validação:** O backend é a última linha de defesa. Ele deve sempre validar:
    *   Este `userUid` pertence a esta partida?
    *   É o turno deste jogador?
    *   Esta partida já não terminou?
