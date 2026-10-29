# Arquitetura do NexusGame

## Visão geral

O NexusGame é um jogo estático sem framework. A lógica permanece em um script JavaScript clássico porque as telas e as interações compartilham funções globais entre si. Os arquivos foram separados por responsabilidade de entrega, sem converter a lógica em módulos ES e sem introduzir um passo de build.

## Componentes

### `index.html`

Contém as telas, os controles e o elemento `canvas` do mapa. Os arquivos externos de CSS e JavaScript são carregados por caminhos relativos; mantenha a raiz de publicação na pasta do projeto.

### `css/01-base.css`

Regras originais de estrutura: telas, painéis, mapa, HUD e modal. Algumas regras-base são refinadas pela folha de identidade visual; não inverter a ordem sem revisar o resultado no navegador.

### `css/04-identidade-visual.css`

Paleta, composição responsiva, painel inicial, prévia ilustrada do mapa e tratamento final de botões, diálogos e HUD. Essa folha carrega depois da folha-base de propósito para consolidar os ajustes finais da interface.

### `js/jogo.js`

Controla estado, níveis, questionário, perfil profissional, NPCs, movimento, colisões, desenho do canvas, interações, recompensas e progresso. Continua como um arquivo principal; uma futura divisão em módulos deve ocorrer em etapas e ser validada junto às referências globais.

### `assets/`

- `assets/imagens/`: fundos, personagem original, crocodilo e camadas visuais do mapa.
- `assets/personagens/npcs/`: sprites usados pelos personagens não jogáveis.
- `assets/personagens/folhas/`: spritesheets usados nas opções de personagem.

## Estado e persistência

O objeto `estado` é salvo na chave `nexus_estado_completo_v3` do `localStorage`. `CHAVE_SAVE` e a estrutura dos campos são um contrato com as partidas já existentes. Alterações nessa estrutura precisam de uma migração explícita e testes de leitura de saves antigos.

## Limitações conhecidas

- A lógica está concentrada em `js/jogo.js`; a separação atual é por tipo de arquivo, não por domínio de negócio.
- A identidade visual é aplicada por várias folhas em ordem de cascata. A folha final explica essa intenção; no futuro, regras duplicadas podem ser consolidadas com testes visuais por tela.
- Não existe backend nem sincronização de progresso entre navegadores.
