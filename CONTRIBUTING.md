# Como contribuir

## Estilo de código

- Textos de interface, comentários e documentação em português brasileiro.
- Indentação de dois espaços e final de linha LF (configurado em `.editorconfig`).
- Eventos registrados no JavaScript, evitando `onclick` e outros eventos inline no HTML.
- CSS organizado em folhas por responsabilidade, mantendo a ordem de carregamento declarada em `index.html`.
- Use nomes explicativos para arquivos, classes e funções novas.
- Comente a intenção de decisões não óbvias; não repita em comentários o que o nome já explica.

## Antes de abrir uma alteração

1. Rode `npm run check`.
2. Abra o jogo por servidor HTTP local.
3. Teste os fluxos afetados em desktop e celular.
4. Confirme que imagens, fundos e folhas de estilo carregam.
5. Confira se não foram incluídos dados locais, backups, protótipos ou dependências sem necessidade.

Não existe etapa de build: o site é HTML/CSS/JavaScript estático.
