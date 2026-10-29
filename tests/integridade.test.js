const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.resolve(__dirname, '..');
const ler = (caminho) => fs.readFileSync(path.join(raiz, caminho), 'utf8');
const existe = (caminho) => fs.existsSync(path.join(raiz, caminho));
const html = ler('index.html');
const js = ler('js/jogo.js');

test('a página principal usa português brasileiro e possui metadados básicos', () => {
  assert.match(html, /<html lang="pt-BR">/i);
  assert.match(html, /<meta name="viewport"/i);
  assert.match(html, /<title>[^<]+<\/title>/i);
});

test('a entrada antiga redireciona por script externo e preserva um caminho de recuperação do save', () => {
  const legado = ler('NexusGame.html');
  assert.match(legado, /js\/redirecionar-legado\.js/);
  assert.doesNotMatch(legado, /<script\b(?![^>]*\bsrc=)[^>]*>/i);
  assert.match(ler('js/redirecionar-legado.js'), /nexus_estado_completo_v3/);
  assert.match(js, /function importarSalvamentoLegadoDaUrl/);
});

test('o HTML carrega folhas de estilo e JavaScript externos existentes', () => {
  const estilos = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/gi)];
  const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"/gi)];
  assert.ok(estilos.length >= 2, 'as folhas CSS externas devem ser carregadas');
  assert.equal(scripts.length, 1, 'a lógica principal deve estar em um único arquivo externo');
  for (const [, href] of estilos) {
    if (/^https?:\/\//i.test(href)) continue;
    assert.ok(existe(href), `folha de estilo não encontrada: ${href}`);
  }
  for (const [, src] of scripts) assert.ok(existe(src), `script não encontrado: ${src}`);
});

test('o HTML não usa eventos JavaScript inline nem blocos script inline', () => {
  assert.doesNotMatch(html, /\s+on(?:click|load|error|change|input|keydown|keyup)\s*=/i);
  assert.doesNotMatch(html, /<script\b(?![^>]*\bsrc=)[^>]*>/i);
  assert.doesNotMatch(html, /\sstyle\s*=/i, 'o HTML não deve depender de estilos inline');
});

test('os IDs estáticos do HTML são únicos', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id);
  const duplicados = ids.filter((id, i) => ids.indexOf(id) !== i);
  assert.deepEqual([...new Set(duplicados)], [], `IDs duplicados: ${[...new Set(duplicados)].join(', ')}`);
});

test('as imagens essenciais do jogo estão presentes', () => {
  const arquivos = [
    'assets/imagens/fundo-novo.png',
    'assets/imagens/Crocodilo.png',
    'assets/imagens/favicon.svg',
    'assets/imagens/mapa-preview.svg',
    'assets/imagens/imagem1.png',
    'assets/imagens/imagem2.png',
    'assets/imagens/imagem3.png',
    'assets/imagens/jogador.png',
    'assets/personagens/folhas/explorador-azul.png',
    'assets/personagens/folhas/explorador-verde.png',
  ];
  for (const arquivo of arquivos) assert.ok(existe(arquivo), `recurso não encontrado: ${arquivo}`);
  for (let i = 0; i < 14; i++) {
    const arquivo = `assets/personagens/npcs/npc-${String(i).padStart(3, '0')}.png`;
    assert.ok(existe(arquivo), `sprite de NPC não encontrado: ${arquivo}`);
  }
});

test('todas as URLs locais usadas nas folhas CSS apontam para recursos existentes', () => {
  const folhas = ['css/01-base.css', 'css/04-identidade-visual.css'];
  for (const arquivo of folhas) {
    const css = ler(arquivo);
    const urls = [...css.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/gi)].map(([, url]) => url);
    for (const url of urls) {
      if (url.startsWith('#') || /^(?:data:|https?:|\/\/)/i.test(url)) continue;
      const destino = path.resolve(raiz, path.dirname(arquivo), decodeURIComponent(url));
      assert.ok(fs.existsSync(destino), `URL quebrada em ${arquivo}: ${url}`);
    }
  }
});

test('a chave de salvamento existente foi preservada', () => {
  assert.match(js, /const CHAVE_SAVE = 'nexus_estado_completo_v3'/);
  assert.match(js, /localStorage\.setItem\(CHAVE_SAVE/);
  assert.match(js, /localStorage\.getItem\(CHAVE_SAVE/);
});

test('a conversa do guia usa o modal compartilhado, sem cartão estático duplicado', () => {
  assert.match(html, /id="inicio-abrir-conversa"/);
  assert.doesNotMatch(html, /class="guia-crocodilo"|id="guia-comecar"/);
  assert.match(js, /function abrirCartaoGuia/);
});

test('o cartão de diálogo usa a largura do balão, não uma coluna interna estreita', () => {
  const css = ler('css/04-identidade-visual.css');
  assert.match(css, /#modal \.conversa-cartao,[\s\S]{0,240}display: block !important/);
  assert.match(css, /grid-template-columns: none !important/);
  assert.match(css, /#modal #modal-titulo[\s\S]{0,300}margin: 0 0 13px !important/);
});

test('a folha final do tema é externa e não é injetada no carregamento do jogo', () => {
  assert.match(html, /href="css\/04-identidade-visual\.css"/);
  assert.doesNotMatch(js, /nexus-polish-complete|function aplicarEsteticaPixelNexus/);
  assert.doesNotMatch(js, /style\.cssText/, 'use classes CSS para estilos de componentes gerados dinamicamente');
});
