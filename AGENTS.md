# Instruções para agentes de IA e manutenção

Antes de editar, leia `README.md`, `docs/ARQUITETURA.md` e os comentários da área que será modificada.

## Regras de segurança do projeto

1. **Preserve o jogo funcional.** Teste o fluxo afetado em navegador, além de validar a sintaxe. Não declare que a interface foi verificada visualmente sem realmente abri-la.
2. **Não altere a chave de salvamento** `nexus_estado_completo_v3` nem remova campos de `estado` sem criar e testar migração. O progresso fica no `localStorage`.
3. **Não apague arquivos de recursos antes de pesquisar suas referências** em `index.html`, `css/` e `js/jogo.js`. O mapa utiliza camadas de imagem e sprites carregados por código.
4. **Não adicione dependências de runtime** para tarefas que podem ser feitas com HTML, CSS e JavaScript nativos. Ferramentas de desenvolvimento precisam ser justificadas e documentadas.
5. **Mantenha os textos da interface e os comentários em português brasileiro.** Use nomes de arquivo claros, UTF-8, LF e indentação de dois espaços. Não renomeie símbolos globais sem atualizar todas as referências.
6. **Respeite a identidade visual:** creme, verde-floresta e verde-sálvia; detalhes pixelados discretos; diálogos legíveis; sem adicionar fundo luminoso ou roxo à interface principal.
7. **Evite manipuladores inline no HTML.** Vincule eventos no JavaScript. Prefira classes CSS a estilos inline repetidos.
8. **Não inclua segredos, credenciais, saves pessoais ou arquivos de backup no repositório.** Backups e materiais de referência estão fora da pasta publicada.
9. **Não faça deploy ou push sem solicitação explícita.** Para mudanças visuais, confira desktop e celular e preserve uma cópia antes de refatorações amplas.

## Fluxo recomendado

- Inspecione o estado atual e pesquise todas as referências do código ou do recurso.
- Faça alterações pequenas e reversíveis.
- Execute `npm run check`.
- Teste navegação inicial, conversa do guia, questionário, painel e entrada no mapa.
- Revise `git diff` e `git status` antes de entregar.
