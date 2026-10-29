# Execução e publicação

## Desenvolvimento local

1. Instale Python 3 para servir arquivos estáticos. Node.js 20+ é necessário apenas para os testes automatizados.
2. Na pasta do projeto, execute `npm run dev` ou `python3 -m http.server 4173`.
3. Acesse `http://localhost:4173`.
4. Execute `npm run check` antes de publicar.

Não execute `npm install` para usar o jogo: não há dependências de runtime nem build.

## Vercel

Configure o Vercel como um projeto estático com estas opções:

- **Root Directory:** use a raiz padrão (`.`) quando o repositório Git for este projeto. Se ele estiver dentro de um monorepositório, selecione a subpasta que contém `index.html`, `css/`, `js/` e `assets/`.
- **Framework Preset:** `Other`.
- **Build Command:** vazio / nenhum.
- **Output Directory:** `.` (raiz do projeto).
- **Install Command:** vazio / nenhum.

A página inicial é `index.html`. O arquivo `NexusGame.html` existe apenas como atalho para instalações e links locais antigos.

## Revisão pré-deploy

- Rode `npm run check`.
- Confirme que `assets/imagens/fundo-novo.png`, `assets/imagens/Crocodilo.png`, as camadas `assets/imagens/imagem1.png` e `assets/imagens/imagem2.png`, e os sprites em `assets/personagens/` carregam.
- Teste conversa inicial, seleção de personagem, cinco perguntas do questionário, painel de perfil e entrada no mapa.
- Verifique desktop e celular.
- Confirme `git status` e que não há backups, arquivos de referência pesados, `.env`, saves pessoais ou protótipos dentro da pasta publicada.

## Salvamentos

`localStorage` é isolado por origem. Um save feito em `file://` ou `localhost` não aparece automaticamente no novo domínio do Vercel. Se precisar preservar esse progresso, exporte-o e planeje uma importação controlada antes da primeira publicação; não substitua nem apague a chave de save para tentar transferi-lo.
