/* ============================================================================
 * NEXUSGAME — lógica principal
 *
 * Responsabilidades deste arquivo:
 * - controlar telas, questionário, progresso e níveis;
 * - desenhar o mapa e os personagens no canvas;
 * - coordenar diálogos e interações com teclado e mouse;
 * - salvar o progresso local no navegador.
 *
 * A marcação fica em index.html e os estilos ficam em css/.
 * Para preservar partidas já salvas, não altere CHAVE_SAVE sem uma migração.
 * ========================================================================== */
/* ==========================================================================
   ESTADO DO JOGO E VARIÁVEIS
   ========================================================================== */
// Chave persistida no navegador. Não renomear sem migrar os dados das partidas existentes.
const CHAVE_SAVE = 'nexus_estado_completo_v3';
let estado = {
  nivelAtual: 0,
  xp: 0,
  atributos: { conhecimento: 0, colaboracao: 0, inovacao: 0, comunicacao: 0 },
  habilidadePrincipal: '',
  quizConcluido: false,
  progresso: [] // um item por nível: { descobertos: [ids], tesouro: booleano }
};

const perguntasQuiz = [
  { p: "Como você resolve um problema complexo?", r: [
    { t: "Estudo todas as variáveis antes de agir", a: "conhecimento" },
    { t: "Peço ajuda à equipe para termos várias ideias", a: "colaboracao" },
    { t: "Tento uma abordagem que ninguém pensou ainda", a: "inovacao" },
    { t: "Converso com as pessoas para entender a raiz do problema", a: "comunicacao" }
  ]},
  { p: "Qual o seu papel em um projeto em grupo?", r: [
    { t: "O especialista que busca as informações", a: "conhecimento" },
    { t: "O integrador que garante que todos trabalhem juntos", a: "colaboracao" },
    { t: "O criativo que propõe novos formatos", a: "inovacao" },
    { t: "O porta-voz que apresenta o projeto", a: "comunicacao" }
  ]},
  { p: "Ao enfrentar um obstáculo inesperado, você:", r: [
    { t: "Pesquiso tutoriais e manuais para superá-lo", a: "conhecimento" },
    { t: "Divido a tarefa para ficar mais leve para todos", a: "colaboracao" },
    { t: "Crio uma ferramenta nova para resolver", a: "inovacao" },
    { t: "Explico a situação para alinhar expectativas", a: "comunicacao" }
  ]},
  { p: "O que te motiva mais no trabalho?", r: [
    { t: "Aprender coisas novas constantemente", a: "conhecimento" },
    { t: "O sentimento de pertencimento a uma equipe forte", a: "colaboracao" },
    { t: "A liberdade para experimentar e errar", a: "inovacao" },
    { t: "O reconhecimento e feedback claro", a: "comunicacao" }
  ]},
  { p: "Um obstáculo crítico bloqueia o caminho da nave. O que você faz?", r: [
    { t: "Analiso os pontos fracos da falha técnica", a: "conhecimento" },
    { t: "Faço um alinhamento coordenado com meus aliados", a: "colaboracao" },
    { t: "Uso os recursos do ambiente de forma inusitada", a: "inovacao" },
    { t: "Negocio e busco consenso para avançar", a: "comunicacao" }
  ]}
];
let quizAtual = 0;

/* ==========================================================================
   FUNÇÕES GERAIS E SALVAMENTO
   ========================================================================== */
// Persiste os dados da partida na chave compatível com os salvamentos existentes.
function salvarEstado() {
  estado.skinJogador = skinJogadorSelecionada;
  localStorage.setItem(CHAVE_SAVE, JSON.stringify(estado));
}
// Restaura uma partida salva sem descartar campos padrão adicionados em versões novas.
// Se o JSON estiver corrompido, mantém o registro original e inicia com os valores padrão.
function carregarEstado() {
  const salvo = localStorage.getItem(CHAVE_SAVE);

  if (salvo) {
    try {
      const dadosSalvos = JSON.parse(salvo);
      if (dadosSalvos && typeof dadosSalvos === 'object' && !Array.isArray(dadosSalvos)) {
        estado = {
          ...estado,
          ...dadosSalvos,
          atributos: { ...estado.atributos, ...(dadosSalvos.atributos || {}) },
          progresso: Array.isArray(dadosSalvos.progresso) ? dadosSalvos.progresso : estado.progresso,
        };

        if (estado.skinJogador) {
          skinJogadorSelecionada = estado.skinJogador;
          const skinSalva = skinsJogador.find(skin => skin.id === skinJogadorSelecionada);
          if (skinSalva && skinSalva.tipo === 'sheet') imgSkinJogador.src = skinSalva.src;
        }
      } else {
        console.warn('[NexusGame] O salvamento local não contém um objeto de partida válido.');
      }
    } catch (erro) {
      console.warn('[NexusGame] Não foi possível ler o salvamento local; os dados armazenados foram preservados.', erro);
    }
  }

  if (!Array.isArray(estado.progresso)) estado.progresso = [];
  while (estado.progresso.length < niveis.length) {
    estado.progresso.push({ descobertos: [], tesouro: false });
  }
}
const perfisProfissionaisQuiz=[
 {id:1,nome:'Assistente de Operações',descricao:'Organiza rotinas e acompanha tarefas',ferramenta:'Painel de operações'},
 {id:2,nome:'Assistente de RH',descricao:'Apoia pessoas e processos internos',ferramenta:'Painel de pessoas'},
 {id:3,nome:'Analista de Dados Júnior',descricao:'Transforma informações em evidências',ferramenta:'Scanner de dados'},
 {id:4,nome:'Desenvolvedor Júnior',descricao:'Cria e mantém soluções digitais',ferramenta:'Bancada de código'},
 {id:5,nome:'Técnico de Suporte',descricao:'Investiga falhas e ajuda a equipe',ferramenta:'Console de suporte'},
 {id:6,nome:'Coordenador de Equipe',descricao:'Alinha prioridades e responsabilidades',ferramenta:'Quadro de equipe'},
 {id:7,nome:'Especialista em Comunicação',descricao:'Torna mensagens claras e objetivas',ferramenta:'Central de comunicação'},
 {id:8,nome:'Analista de Qualidade',descricao:'Verifica critérios e identifica erros',ferramenta:'Laboratório de testes'},
 {id:9,nome:'Pesquisador de Inovação',descricao:'Explora ideias e testa hipóteses',ferramenta:'Laboratório de protótipos'},
 {id:10,nome:'Designer de Experiência',descricao:'Melhora a jornada de quem usa o sistema',ferramenta:'Estúdio UX'},
 {id:11,nome:'Analista de Segurança',descricao:'Avalia riscos e protege recursos',ferramenta:'Centro de segurança'},
 {id:12,nome:'Administrador de Sistemas',descricao:'Mantém serviços e acessos organizados',ferramenta:'Console de sistemas'},
 {id:13,nome:'Engenheiro de Automação',descricao:'Reduz tarefas repetitivas com automação',ferramenta:'Mesa de automação'},
 {id:14,nome:'Analista de Produto',descricao:'Conecta necessidades e soluções',ferramenta:'Mapa de produto'},
 {id:15,nome:'Facilitador Ágil',descricao:'Ajuda o time a remover bloqueios',ferramenta:'Quadro ágil'},
 {id:16,nome:'Gestor de Projetos',descricao:'Coordena entregas, escopo e prazos',ferramenta:'Painel de projetos'},
 {id:17,nome:'Especialista em Treinamento',descricao:'Transforma conhecimento em aprendizagem',ferramenta:'Sala de treinamento'},
 {id:18,nome:'Analista Financeiro',descricao:'Acompanha recursos e prioridades',ferramenta:'Painel financeiro'},
 {id:19,nome:'Analista de Processos',descricao:'Mapeia fluxos e propõe melhorias',ferramenta:'Mapa de processos'},
 {id:20,nome:'Consultor Interno',descricao:'Ajuda áreas a resolver desafios',ferramenta:'Central de consultoria'},
 {id:21,nome:'Analista de Infraestrutura',descricao:'Mantém a base técnica disponível',ferramenta:'Console de infraestrutura'},
 {id:22,nome:'Engenheiro de Software',descricao:'Projeta soluções sustentáveis',ferramenta:'Estação de engenharia'},
 {id:23,nome:'Analista de Inteligência',descricao:'Cruza sinais para apoiar decisões',ferramenta:'Mesa de inteligência'},
 {id:24,nome:'Especialista em Acessibilidade',descricao:'Torna ferramentas úteis para todos',ferramenta:'Laboratório inclusivo'},
 {id:25,nome:'Analista de Sustentabilidade',descricao:'Equilibra recursos e impacto',ferramenta:'Painel sustentável'},
 {id:26,nome:'Gestor de Conhecimento',descricao:'Organiza e compartilha aprendizados',ferramenta:'Biblioteca técnica'},
 {id:27,nome:'Líder de Atendimento',descricao:'Eleva a qualidade do suporte',ferramenta:'Central de atendimento'},
 {id:28,nome:'Analista de Experimentos',descricao:'Mede resultados e testa alternativas',ferramenta:'Laboratório de métricas'},
 {id:29,nome:'Arquiteto de Soluções',descricao:'Conecta sistemas e necessidades',ferramenta:'Mapa de arquitetura'},
 {id:30,nome:'Especialista em Banco de Dados',descricao:'Mantém dados consistentes e acessíveis',ferramenta:'Console de dados'},
 {id:31,nome:'Analista de Cibersegurança',descricao:'Detecta ameaças e reduz vulnerabilidades',ferramenta:'Sala de defesa'},
 {id:32,nome:'Engenheiro de IA',descricao:'Desenvolve soluções inteligentes',ferramenta:'Laboratório de IA'},
 {id:33,nome:'Líder de Produto',descricao:'Define prioridades de evolução',ferramenta:'Roadmap de produto'},
 {id:34,nome:'Coordenador de Operações',descricao:'Integra rotinas entre setores',ferramenta:'Centro de operações'},
 {id:35,nome:'Gerente de Pessoas',descricao:'Desenvolve equipes e cultura',ferramenta:'Painel de pessoas'},
 {id:36,nome:'Diretor Técnico',descricao:'Orienta decisões técnicas de longo prazo',ferramenta:'Centro técnico'},
 {id:37,nome:'Estrategista de Inovação',descricao:'Conduz experimentos e novas iniciativas',ferramenta:'Hub de inovação'},
 {id:38,nome:'Arquiteto da Estação',descricao:'Planeja o funcionamento integrado da estação',ferramenta:'Mapa Nexus'},
 {id:39,nome:'Gestor de Transformação Digital',descricao:'Lidera mudanças e adoção tecnológica',ferramenta:'Centro digital'},
 {id:40,nome:'Comandante da Estação Nexus',descricao:'Coordena pessoas, tecnologia e missão',ferramenta:'Centro de comando'}
];
const cargosNexus=[
 {min:0,nome:'Jovem Aprendiz',descricao:'Integração e aprendizagem',ferramenta:'Terminal de treinamento'},
 {min:100,nome:'Auxiliar Administrativo',descricao:'Execução e organização',ferramenta:'Painel de tarefas'},
 {min:300,nome:'Analista de RH',descricao:'Análise e resolução de problemas',ferramenta:'Scanner de dados'},
 {min:650,nome:'Gestor da Estação',descricao:'Coordenação e decisões estratégicas',ferramenta:'Centro de comando'}
];
function cargoAtualNexus(){return [...cargosNexus].reverse().find(c=>estado.xp>=c.min)||cargosNexus[0];}
function escolherPerfilProfissional(){
 const chaves=Object.keys(estado.atributos||{conhecimento:0,colaboracao:0,inovacao:0,comunicacao:0});
 const respostas=respostasQuizPerfil.length?respostasQuizPerfil:chaves;
 // A sequência ordenada das respostas define o perfil; pontuações iguais não reduzem todos ao mesmo resultado.
 let codigo=0;
 for(const resposta of respostas)codigo=(codigo*4+Math.max(0,chaves.indexOf(resposta)))%2147483647;
 const indice=codigo%perfisProfissionaisQuiz.length;
 const perfil=perfisProfissionaisQuiz[indice];
 estado.perfilProfissional=perfil.id;estado.perfilProfissionalNome=perfil.nome;return perfil;
}
function inicializarProgressoCarreira(){
  if(document.getElementById('nexus-cargo'))return;
  const el=document.createElement('aside');el.id='nexus-cargo';el.setAttribute('aria-live','polite');
  el.innerHTML='<span class="nexus-cargo-label">CARGO / PERFIL</span><strong id="nexus-cargo-nome"></strong><span id="nexus-cargo-desc"></span><span id="nexus-cargo-ferramenta"></span><div class="nexus-cargo-xp"><span id="nexus-cargo-xp-text"></span><span id="nexus-cargo-proximo"></span></div><div class="nexus-cargo-track"><i id="nexus-cargo-barra"></i></div>';
  document.body.appendChild(el);
  const toast=document.createElement('div');toast.id='nexus-recompensa';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.appendChild(toast);
  // Os estilos ficam em css/; evita um bloco tardio que sobrescrevia o fundo das telas.
  atualizarCargoNexus();
}
// Atualiza cargo/perfil, ferramenta desbloqueada e progresso de XP no HUD.
function atualizarCargoNexus(){
  const box=document.getElementById('nexus-cargo');if(!box)return;
  const cargo=cargoAtualNexus(),idx=cargosNexus.indexOf(cargo),proximo=cargosNexus[idx+1];
  const perfil=perfisProfissionaisQuiz.find(p=>p.id===estado.perfilProfissional)||cargo;
  document.getElementById('nexus-cargo-nome').textContent=perfil.nome;
  document.getElementById('nexus-cargo-desc').textContent=perfil.descricao;
  document.getElementById('nexus-cargo-ferramenta').textContent='Ferramenta: '+perfil.ferramenta;
  document.getElementById('nexus-cargo-xp-text').textContent=`${estado.xp} XP`;
  document.getElementById('nexus-cargo-proximo').textContent=proximo?`${proximo.min-estado.xp} XP para promoção`:'Cargo máximo alcançado';
  const base=cargo.min,limite=proximo?proximo.min:cargo.min+1;
  document.getElementById('nexus-cargo-barra').style.width=(proximo?Math.max(0,Math.min(100,(estado.xp-base)/(limite-base)*100)):100)+'%';
}
function mostrarRecompensaNexus(mensagem){
  const toast=document.getElementById('nexus-recompensa');if(!toast)return;
  toast.textContent=mensagem;toast.classList.add('visivel');
  clearTimeout(window.__nexusToastTimer);window.__nexusToastTimer=setTimeout(()=>toast.classList.remove('visivel'),2600);
}
function addXP(valor) {
  const cargoAntes=cargoAtualNexus();
  estado.xp += valor;
  const hudXp = document.getElementById('hud-xp');
  if(hudXp) hudXp.innerText = estado.xp;
  salvarEstado();
  atualizarCargoNexus();
  const cargoDepois=cargoAtualNexus();
  if(cargoDepois.nome!==cargoAntes.nome)mostrarRecompensaNexus(`Promoção conquistada: ${cargoDepois.nome} · +${valor} XP`);
  else mostrarRecompensaNexus(`+${valor} XP · ${cargoDepois.nome}`);
}
function reiniciar() {
  respostasQuizPerfil=[];
  localStorage.removeItem(CHAVE_SAVE);
  location.reload();
}

function mostrarSeletorSkin(destino = 'tela-quiz') {
  const opcoes = document.getElementById('skin-opcoes-iniciais');
  opcoes.innerHTML = '';
  skinsJogador.forEach(skin => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'secundario skin-opcao';
    btn.setAttribute('aria-pressed', String(skin.id === skinJogadorSelecionada));

    const preview = document.createElement('canvas');
    preview.className = 'skin-opcao-previa';
    preview.width = 64;
    preview.height = 96;
    const pctx = preview.getContext('2d');
    pctx.imageSmoothingEnabled = false;

    const previewImg = new Image();
    previewImg.onload = () => {
      pctx.clearRect(0, 0, 64, 96);
      if (skin.tipo === 'sheet') {
        pctx.drawImage(previewImg, 0, 0, previewImg.naturalWidth / 4, previewImg.naturalHeight / 4, 8, 0, 48, 96);
      } else {
        pctx.drawImage(previewImg, 0, 0, 64, 96);
      }
    };
    previewImg.src = skin.src;

    const nome = document.createElement('span');
    nome.className = 'skin-opcao-nome';
    nome.textContent = skin.nome;

    const estado = document.createElement('span');
    estado.className = 'skin-opcao-estado';
    estado.textContent = skin.id === skinJogadorSelecionada ? 'Selecionada' : 'Escolher';
    btn.append(preview,nome,estado);
    btn.onclick = () => { skinJogadorSelecionada=skin.id; if(skin.tipo==='sheet') imgSkinJogador.src=skin.src; mostrarSeletorSkin(destino); };
    opcoes.appendChild(btn);
  });
  document.getElementById('skin-confirmar').onclick = () => { salvarEstado(); mostrarTela(destino); };
  mostrarTela('tela-skins');
}

function montarBotoesInicio() {
  const salvo = localStorage.getItem(CHAVE_SAVE);
  const container = document.getElementById('botoes-inicio');
  container.innerHTML = '';

  if (salvo && estado.quizConcluido) {
    const btnContinuar = document.createElement('button');
    btnContinuar.textContent = 'Continuar Missão →';
    btnContinuar.onclick = continuarDeOndeParou;

    const btnNovo = document.createElement('button');
    btnNovo.textContent = 'Nova Missão';
    btnNovo.className = 'secundario';
    btnNovo.onclick = reiniciar;

    container.appendChild(btnContinuar);
    container.appendChild(btnNovo);
  } else {
    // Sem partida salva, o botão de conversa é a única ação inicial necessária.
    container.replaceChildren();
  }
}

function continuarDeOndeParou() {
  const prog = estado.progresso[estado.nivelAtual];
  if (prog && prog.tesouro) {
    mostrarTela('tela-fim');
  } else {
    mostrarTela('tela-mapa');
  }
}

function atualizarTelaInicial() {
  const nivel = niveis[estado.nivelAtual] || niveis[0];
  document.getElementById('inicial-sub').textContent = nivel.titulo;
  document.getElementById('inicial-texto').textContent = nivel.textoInicial;
}

const dialogosGuiaInicio=[
 {titulo:'Bem-vindo à Estação Nexus!',fala:'Olá! Eu sou o guia da Estação Nexus. Vou acompanhar você e explicar o que precisa saber sem exigir que saia procurando informações pelos menus.'},
 {titulo:'Como esta estação funciona',fala:'A estação é organizada por setores e missões. Você vai conversar com pessoas, analisar situações e tomar decisões. Cada atividade ensina uma competência usada no trabalho em equipe.'},
 {titulo:'Cargos e responsabilidades',fala:'Ao longo da jornada, vou apresentar os cargos e explicar o papel de cada pessoa quando ela aparecer. Por exemplo: o suporte técnico investiga falhas; quem trabalha com dados procura evidências; e quem coordena ajuda a equipe a decidir o próximo passo.'},
 {titulo:'Como interagir',fala:'Use WASD ou as setas para se mover. Quando estiver perto de alguém ou de um objeto, pressione E. Nas conversas, leia a fala e escolha uma resposta quando houver opções. Enter ou Espaço avança os cartões de diálogo; as setas navegam pelas opções.'},
 {titulo:'Vamos começar',fala:'Primeiro você vai definir seu perfil e conhecer a estação. Depois, eu volto nas transições importantes e explico o contexto da missão. Se surgir uma conversa ou desafio, pense na situação antes de responder. Preparado?'}
];
let indiceDialogoGuia=0;
// Usa o mesmo modal de conversa das missões para orientar a pessoa passo a passo.
function abrirCartaoGuia(indice){
  const d=dialogosGuiaInicio[indice]; if(!d)return;
  const modal=document.getElementById('modal');
  restaurarEstiloModal();
  modal.classList.add('guia-dialogo');
  modal.dataset.guiaIndice=String(indice);
  atualizarRetratoPersonagem({nome:'Guia Nexus',guia:true});
  document.getElementById('modal-titulo').textContent=d.titulo;
  document.getElementById('modal-texto').textContent=d.fala;
  document.getElementById('modal-conteudo').replaceChildren();
  const btn=document.getElementById('modal-btn-continuar');
  btn.textContent=indice===dialogosGuiaInicio.length-1?'Escolher personagem →':'Continuar →';
  modalCallback=()=>{
    if(indice < dialogosGuiaInicio.length-1){abrirCartaoGuia(indice+1);return;}
    restaurarEstiloModal();mostrarSeletorSkin('tela-quiz');
  };
  modal.classList.add('aberto');
  btn.focus({preventScroll:true});
}

function restaurarEstiloModal(){
 const modal=document.getElementById('modal'); modal.classList.remove('guia-dialogo','com-personagem','sem-personagem');
 [modal,document.getElementById('conversa-personagem'),modal.querySelector('.conversa-cartao'),modal.querySelector('.conversa-conteudo'),document.getElementById('modal-titulo'),document.getElementById('modal-texto'),document.getElementById('retrato-personagem'),document.getElementById('retrato-nome'),document.getElementById('modal-btn-continuar')].forEach(el=>{if(el)el.removeAttribute('style')});
}

// Abre a orientação inicial no mesmo modal de conversa usado pelas missões do mapa.
function iniciarTreinamentoPeloGuia() {
  indiceDialogoGuia = 0;
  abrirCartaoGuia(indiceDialogoGuia);
}

// Centraliza as mudanças de tela e chama a inicialização específica de cada etapa.
function mostrarTela(id) {
  document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
  const el = document.getElementById(id);
  if (el) el.classList.add('ativa');
  const cargoBox=document.getElementById('nexus-cargo');
  if(cargoBox) cargoBox.style.display=['tela-mapa','tela-lobby','tela-fim'].includes(id)?'block':'none';
  
  if(id === 'tela-quiz') renderizarQuiz();
  if(id === 'tela-lobby') renderizarLobby();
  if(id === 'tela-mapa') iniciarMapa();
}

/* ==========================================================================
   LÓGICA DO QUIZ INICIAL
   ========================================================================== */
function renderizarQuiz() {
  if (estado.quizConcluido) {
    mostrarTela('tela-lobby');
    return;
  }
  
  const q = perguntasQuiz[quizAtual];
  document.getElementById('quiz-progresso').innerText = `Pergunta ${quizAtual + 1} de ${perguntasQuiz.length}`;
  document.getElementById('quiz-pergunta').innerText = q.p;
  
  const op = document.getElementById('quiz-opcoes');
  op.innerHTML = '';
  q.r.forEach(resp => {
    const btn = document.createElement('button');
    btn.className = 'opcao';
    btn.innerText = resp.t;
    btn.onclick = () => responderQuiz(resp.a);
    op.appendChild(btn);
  });
}

let respostasQuizPerfil=[];
// Cada resposta aumenta o atributo correspondente e a sequência define o perfil profissional.
function responderQuiz(atributo) {
  respostasQuizPerfil.push(atributo);
  estado.atributos[atributo] += 25; 
  quizAtual++;
  
  if (quizAtual < perguntasQuiz.length) {
    renderizarQuiz();
  } else {
    let max = 0;
    let hab = '';
    for (const [k, v] of Object.entries(estado.atributos)) {
      if (v > max) { max = v; hab = k; }
    }
    const nomes = {
      conhecimento: "O Analista",
      colaboracao: "O Integrador",
      inovacao: "O Visionário",
      comunicacao: "O Diplomata"
    };
    estado.habilidadePrincipal = nomes[hab] || "O Generalista";
    escolherPerfilProfissional();
    estado.quizConcluido = true;
    addXP(100);
    mostrarTela('tela-lobby');
  }
}

/* ==========================================================================
   LÓGICA DO LOBBY
   ========================================================================== */
function renderizarLobby() {
  const perfil=perfisProfissionaisQuiz.find(p=>p.id===estado.perfilProfissional)||cargoAtualNexus();
  document.getElementById('lobby-habilidade').innerText = `Perfil profissional: ${perfil.nome} · ${estado.habilidadePrincipal}`;
  atualizarCargoNexus();
  
  setTimeout(() => {
    for (const attr in estado.atributos) {
      const vEl = document.getElementById(`v-${attr}`);
      const bEl = document.getElementById(`b-${attr}`);
      if (vEl) vEl.innerText = estado.atributos[attr];
      if (bEl) bEl.style.width = Math.min(estado.atributos[attr], 100) + '%';
    }
  }, 100);

  // Exibe selos já conquistados no lobby
  const selosEl = document.getElementById('lobby-selos');
  if (selosEl) {
    let html = '';
    niveis.forEach((n, idx) => {
      if (estado.progresso[idx] && estado.progresso[idx].tesouro && n.badge) {
        html += `<span class="badge-tag">${n.badge}</span>`;
      }
    });
    selosEl.innerHTML = html;
  }
}

function irParaMapa() {
  mostrarTela('tela-mapa');
}

/* ==========================================================================
   SPRITES PIXEL ART & PALETAS
   ========================================================================== */
function desenharSprite(ctx, matriz, palette, x, y, escala) {
  for (let linha = 0; linha < matriz.length; linha++) {
    for (let col = 0; col < matriz[linha].length; col++) {
      const cor = matriz[linha][col];
      if (cor === 0) continue;
      ctx.fillStyle = palette[cor];
      ctx.fillRect(x + col * escala, y + linha * escala, escala, escala);
    }
  }
}

// Personagens do pacote de pixel art 2D; os créditos completos estão em docs/CREDITOS.md.
// Crédito: Jephed / Game Between The Lines — uso comercial e não comercial permitido.
const npcSpriteImgs = Array.from({ length: 14 }, (_, i) => {
  const img = new Image();
  img.src = `assets/personagens/npcs/npc-${String(i).padStart(3, '0')}.png`;
  return img;
});

// Apenas alguns NPCs usam animação; os demais permanecem parados. Cada um tem seu próprio estado.
const npcVisual = {
  i1:{sprite:0,dir:0,anim:true,speed:210,phase:0},
  i2:{sprite:1,dir:1,anim:false},
  i3:{sprite:2,dir:2,anim:false},
  j1:{sprite:3,dir:0,anim:true,speed:245,phase:310},
  j2:{sprite:4,dir:1,anim:false},
  j3:{sprite:5,dir:2,anim:false},
  k1:{sprite:6,dir:0,anim:false},
  k2:{sprite:7,dir:1,anim:true,speed:225,phase:780},
  k3:{sprite:8,dir:2,anim:false},
  k4:{sprite:9,dir:0,anim:false},
  k5:{sprite:10,dir:1,anim:false},
  l1:{sprite:11,dir:2,anim:true,speed:260,phase:140},
  l2:{sprite:12,dir:0,anim:false},
  l3:{sprite:13,dir:1,anim:false}
};

function desenharPersonagemAnimado(ctx, e, tempo) {
  const cfg = npcVisual[e.id] || { sprite:0, dir:0, anim:false };
  const img = npcSpriteImgs[cfg.sprite];
  if (!img.complete || !img.naturalWidth) {
    desenharSprite(ctx, e.sprite, e.palette, e.x, e.y, 4);
    return;
  }

  // Pose parada usa o primeiro frame; apenas quatro NPCs usam ciclo de caminhada.
  const frame = cfg.anim ? Math.floor((tempo + cfg.phase) / cfg.speed) % 3 : 0;
  const cellW = img.naturalWidth / 3;
  const cellH = img.naturalHeight / 4;
  const sx = Math.round(frame * cellW);
  const sy = Math.round(cfg.dir * cellH);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, sx, sy, cellW, cellH, e.x - 4, e.y - 32, 32, 64);
  ctx.restore();
}

// Inimigo robô — 8x8
const spriteRobo = [
  [0,1,1,1,1,1,1,0],
  [1,2,2,2,2,2,2,1],
  [1,2,4,2,2,4,2,1],
  [1,2,2,2,2,2,2,1],
  [1,2,2,2,2,2,2,1],
  [0,1,3,1,1,3,1,0],
  [0,0,1,1,1,1,0,0],
  [0,1,1,0,0,1,1,0]
];
const paletteRoboQuiz     = { 1:'#0a0f18', 2:'#ef4444', 3:'#991b1b', 4:'#fef08a' };
const paletteRoboDialogo  = { 1:'#0a0f18', 2:'#38bdf8', 3:'#0284c7', 4:'#fef08a' };
const paletteRoboDesafio  = { 1:'#0a0f18', 2:'#22c55e', 3:'#15803d', 4:'#fef08a' };

// Colega aliado em resgate (Nível 3) — 8x8
const spriteColega = [
  [0,1,1,1,1,1,1,0],
  [1,2,2,2,2,2,2,1],
  [1,2,4,2,2,4,2,1],
  [1,2,2,2,2,2,2,1],
  [0,1,3,3,3,3,1,0],
  [0,1,2,2,2,2,1,0],
  [0,1,3,0,0,3,1,0],
  [0,1,1,0,0,1,1,0]
];
const paletteColega = { 1:'#0a0f18', 2:'#38bdf8', 3:'#0284c7', 4:'#ffffff' };

// Baú e Terminal do Portal — 8x8
const spriteBau = [
  [0,1,1,1,1,1,1,0],
  [1,2,2,2,2,2,2,1],
  [1,2,3,3,3,3,2,1],
  [1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,1],
  [1,2,2,2,2,2,2,1],
  [1,2,2,2,2,2,2,1],
  [0,1,1,1,1,1,1,0]
];
const paletteBau = { 1:'#0a0f18', 2:'#8a5a2b', 3:'#ffd23a' };

const spritePortal = [
  [0,1,3,3,3,3,1,0],
  [1,3,4,4,4,4,3,1],
  [3,4,2,2,2,2,4,3],
  [3,4,2,2,2,2,4,3],
  [3,4,2,2,2,2,4,3],
  [3,4,2,2,2,2,4,3],
  [1,3,4,4,4,4,3,1],
  [0,1,3,3,3,3,1,0]
];
const palettePortal = { 1:'#0a0f18', 2:'#7CA982', 3:'#5E795F', 4:'#38bdf8' };

const ESCALA_SPRITE = 3;
const TAM_SPRITE = 8 * ESCALA_SPRITE; // 24px

/* ==========================================================================
   OS 4 NÍVEIS COMPLETOS DA HISTÓRIA RPG
   ========================================================================== */
const niveis = [
  // --- NÍVEL 1: TREINAMENTOS (0 a 500 XP) ---
  {
    titulo: 'Nível 1 — Treinamentos',
    subtituloMapa: 'Setor de Treinamento e Reconhecimento',
    rotuloContador: 'Inimigos Descobertos',
    badge: '🌟 Selo de Integração',
    textoInicial: 'A estação sofreu uma invasão misteriosa. Como agente recém-chegado, você precisa praticar competências, descobrir inimigos infiltrados e destrancar a sala de dados.',
    textoFim: 'Excelente trabalho, {habilidade}. Você concluiu o Nível 1, validou suas competências iniciais e conquistou o Selo de Integração!',
    xpDesafio: 50,
    xpTesouro: 250,
    inimigos: [
      { id: 'i1', x: 150, y: 100, desafio: 'quiz', nome: 'Sentinela de Dados', sprite: spriteRobo, palette: paletteRoboQuiz,
        conteudo: {
          perguntas: [
            { texto: 'A Sentinela bloqueou o acesso com criptografia hostil. Qual sua abordagem?',
              opcoes: [
                { texto: 'Analiso os registros de tráfego com calma antes de agir', correta: true },
                { texto: 'Chuto uma senha qualquer na sorte', correta: false },
                { texto: 'Tento arrombar os cabos centrais na força bruta', correta: false }
              ]
            }
          ]
        }
      },
      { id: 'i2', x: 650, y: 350, desafio: 'dialogo', nome: 'Emissário Hostil', sprite: spriteRobo, palette: paletteRoboDialogo,
        conteudo: {
          fala: '"Vocês não deveriam estar aqui. Retirem-se agora, ou serão removidos à força."',
          respostas: [
            { texto: 'Viemos em paz — só queremos entender o que houve com a estação.', resultado: 'O Emissário hesita: "...poucos chegam dialogando assim." Ele abaixa a guarda.' },
            { texto: 'Não temos escolha. Precisamos avançar, com ou sem sua permissão.', resultado: 'O Emissário mede sua determinação: "Ao menos são diretos." Ele recua.' }
          ]
        }
      },
      { id: 'i3', x: 150, y: 350, desafio: 'desafio', nome: 'Núcleo de Segurança', sprite: spriteRobo, palette: paletteRoboDesafio,
        conteudo: { simbolos: ['⚡','🔷','🔺'] }
      }
    ],
    tesouro: { id: 't1', x: 400, y: 80, nome: 'Acesso Restrito', sprite: spriteBau, palette: paletteBau,
      texto: 'Você encontrou os relatórios vazados! Eles revelam que a invasão não é comum. Há algo muito maior por trás!' }
  },

  // --- NÍVEL 2: COLABORADOR ATIVO (501 a 1500 XP) ---
  {
    titulo: 'Nível 2 — Colaborador Ativo',
    subtituloMapa: 'Setor de Contenção Tática',
    rotuloContador: 'Inimigos Descobertos',
    badge: '🛡️ Reconhecimento Interno',
    textoInicial: 'Invasão em grande escala! Os adversários são espertos e ágeis. Sua equipe traçou um plano infalível para contê-los. Prepare-se para uma reviravolta.',
    textoFim: 'Você resistiu com coragem, {habilidade}. Mesmo com o plano falhando, você conquistou Reconhecimento Interno e agora sabe onde os inimigos foram!',
    xpDesafio: 100,
    xpTesouro: 650,
    inimigos: [
      { id: 'j1', x: 150, y: 100, desafio: 'quiz', nome: 'Vigia Adaptativo', sprite: spriteRobo, palette: paletteRoboQuiz,
        conteudo: {
          perguntas: [
            { texto: 'O Vigia muda seus padrões a cada abordagem. Qual é a estratégia?',
              opcoes: [
                { texto: 'Observo o ciclo de leitura antes de aplicar a estratégia', correta: true },
                { texto: 'Repito o mesmo padrão anterior esperando outro resultado', correta: false },
                { texto: 'Avanço sem observar os sinais', correta: false }
              ]
            }
          ]
        }
      },
      { id: 'j2', x: 650, y: 350, desafio: 'dialogo', nome: 'Estrategista Rival', sprite: spriteRobo, palette: paletteRoboDialogo,
        conteudo: {
          fala: '"O plano infalível de vocês era óbvio demais antes mesmo de começarem."',
          respostas: [
            { texto: 'Talvez. Mas você não previu a nossa capacidade de adaptação em equipe.', resultado: 'O Estrategista franze a testa, incerto pela primeira vez: "...surpreendente."' },
            { texto: 'Previsível não é o mesmo que derrotado.', resultado: 'Um silêncio breve. "...justo." Ele recua um passo.' }
          ]
        }
      },
      { id: 'j3', x: 150, y: 350, desafio: 'desafio', nome: 'Núcleo de Contenção', sprite: spriteRobo, palette: paletteRoboDesafio,
        conteudo: { simbolos: ['🔺','⚡','🔷','⚡'] }
      }
    ],
    tesouro: { id: 't2', x: 400, y: 80, nome: 'Sala do Portal', sprite: spritePortal, palette: palettePortal,
      texto: 'REVIRAVOLTA! O "tesouro" é um computador embutido com um portal para outro mundo. Os adversários ativam a máquina e fogem através dele!' }
  },

  // --- NÍVEL 3: MENTOR (1501 a 3500 XP) ---
  {
    titulo: 'Nível 3 — Mentor',
    subtituloMapa: 'Setor Central em Blackout — Operação de Mentoria',
    rotuloContador: 'Colegas Apoiados',
    badge: '👑 Badge Mentor Nexus',
    textoInicial: 'O plano infalível falhou! Os adversários usaram tecnologia avançada que acabou com toda a energia da nave e fugiram pelo portal. Agentes feridos começam a se ajudar: apoie os 5 colegas caídos para reativar os sistemas, transmitir o alerta de perigo e cruzar o portal!',
    textoFim: 'Espírito de equipe inigualável, {habilidade}! Você orientou e reergueu seus 5 colegas caídos, transmitiu o comunicado de socorro interdimensional e conquistou a Badge Mentor Nexus!',
    xpDesafio: 150,
    xpTesouro: 1250,
    verboSuperado: 'Colega Apoiado!',
    msgSuperado: 'Você ofereceu suporte e mentoria para {nome}.',
    msgTodosSuperados: 'Todos os 5 colegas foram reerguidos! O Terminal do Portal está reenergizado para a transmissão!',
    inimigos: [
      { id: 'k1', x: 140, y: 110, desafio: 'quiz', nome: 'Agente Maya (Energia)', sprite: spriteColega, palette: paletteColega,
        conteudo: {
          perguntas: [
            { texto: 'O pulso dos invasores travou os geradores. Como reativar a energia sem queimar os barramentos?',
              opcoes: [
                { texto: 'Isolo o barramento secundário e injeto uma carga estabilizada em paralelo', correta: true },
                { texto: 'Forço uma sobrecarga manual direta na rede', correta: false },
                { texto: 'Desligo os cabos de suporte de vida aleatoriamente', correta: false }
              ]
            }
          ]
        }
      },
      { id: 'k2', x: 660, y: 120, desafio: 'dialogo', nome: 'Agente Lucas (Defesa)', sprite: spriteColega, palette: paletteColega,
        conteudo: {
          fala: '"Eles eram rápidos demais... nosso plano não adiantou nada. Não temos como vencer isso."',
          respostas: [
            { texto: 'Um plano que falha nos dá dados valiosos. Levanta, a equipe precisa da sua leitura tática agora.', resultado: 'Lucas respira fundo e recupera a postura: "Você tem razão. Vamos reagrupar e contra-atacar juntos."' },
            { texto: 'Não estamos sozinhos. Se cada um fizer sua parte, revertemos qualquer situação.', resultado: 'Lucas sorri: "Obrigado pela mentoria. Pronto para a missão!"' }
          ]
        }
      },
      { id: 'k3', x: 150, y: 350, desafio: 'desafio', nome: 'Agente Sofia (Telecom)', sprite: spriteColega, palette: paletteColega,
        conteudo: { simbolos: ['📡', '⚡', '🌐', '🔷', '⚡'] }
      },
      { id: 'k4', x: 650, y: 350, desafio: 'quiz', nome: 'Agente Davi (Navegação)', sprite: spriteColega, palette: paletteColega,
        conteudo: {
          perguntas: [
            { texto: 'Os adversários deixaram 3 assinaturas de salto. Qual a melhor decisão coletiva?',
              opcoes: [
                { texto: 'Cruzamos os dados de telemetria de Sofia e Maya para achar o rastro exato', correta: true },
                { texto: 'Cada agente entra em um salto diferente sozinho', correta: false },
                { texto: 'Ficamos esperando reforços sem fazer nada', correta: false }
              ]
            }
          ]
        }
      },
      { id: 'k5', x: 400, y: 370, desafio: 'dialogo', nome: 'Agente Elena (Tática)', sprite: spriteColega, palette: paletteColega,
        conteudo: {
          fala: '"Se atravessarmos o portal sem avisar ninguém do outro lado, seremos encurralados."',
          respostas: [
            { texto: 'Exato. Usaremos o terminal para transmitir um comunicado de emergência antes do salto.', resultado: 'Elena concorda: "Excelente visão de equipe! Vamos preparar a transmissão de socorro."' },
            { texto: 'Vamos em formação coordenada. Ninguém fica para trás do outro lado.', resultado: 'Elena recarrega seu visor tático: "Entendido! Protocolo de proteção mútua ativado."' }
          ]
        }
      }
    ],
    tesouro: { id: 't3', x: 400, y: 80, nome: 'Terminal do Portal & Comunicador', sprite: spritePortal, palette: palettePortal,
      texto: 'COMUNICADO TRANSMITIDO! Você e sua equipe transmitem o alerta de perigo para o outro mundo: "ESTAMOS EM PERIGO. INVASORES ATRAVESSARAM O PORTAL". Coordenadas sincronizadas. É hora de saltar!' }
  },

  // --- NÍVEL 4: ESPECIALISTA (Acima de 3500 XP — Final do Processo Seletivo) ---
  {
    titulo: 'Nível 4 — Especialista',
    subtituloMapa: 'Reino Secreto — Fronteira da Resistência',
    rotuloContador: 'Frentes de Liderança',
    badge: '⚡ Badge Especialista Nexus',
    textoInicial: 'Ao cruzar o portal, a dura realidade: o reino secreto ancestral está sitiado e em destruição pelos adversários! De cabeça erguida, os agentes assumem a liderança da resistência para defender o reino secreto.',
    textoFim: 'Parabéns, {habilidade}! Você provou autonomia máxima e liderança estratégica! Você conquistou o nível Especialista Nexus.\n\n🎮 ETAPA FINAL DO PROCESSO SELETIVO CONCLUÍDA:\nA libertação definitiva do reino aguarda por você quando você integrar oficialmente o nosso time!',
    xpDesafio: 250,
    xpTesouro: 1250,
    verboSuperado: 'Frente Conquistada!',
    msgSuperado: 'Você liderou com êxito a resolução da frente: {nome}.',
    msgTodosSuperados: 'Todas as frentes de cerco foram rompidas! O Grande Altar da Resistência está acessível!',
    inimigos: [
      { id: 'l1', x: 180, y: 140, desafio: 'quiz', nome: 'Sentinela de Cerco', sprite: spriteRobo, palette: paletteRoboQuiz,
        conteudo: {
          perguntas: [
            { texto: 'A blindagem da Sentinela se adapta aos ataques frontais. O que você comanda como líder?',
              opcoes: [
                { texto: 'Descentralizo: um grupo distrai o fogo enquanto especialistas desativam os geradores laterais', correta: true },
                { texto: 'Ordeno investida cega de todos no mesmo ponto', correta: false },
                { texto: 'Recuamos e abandonamos a posição da resistência', correta: false }
              ]
            }
          ]
        }
      },
      { id: 'l2', x: 640, y: 220, desafio: 'dialogo', nome: 'Comandante da Vanguarda', sprite: spriteRobo, palette: paletteRoboDialogo,
        conteudo: {
          fala: '"Vocês chegaram tarde demais. O reino já caiu e a tecnologia ancestral pertence a nós."',
          respostas: [
            { texto: 'Uma fortaleza não é feita de pedras ou máquinas, mas das pessoas que lutam por ela. Nós estamos de pé.', resultado: 'O comandante hesita: "Sua determinação é impressionante... não subestimarei sua liderança."' },
            { texto: 'Nossa equipe superou cada desafio na estação espacial. Aqui não será diferente.', resultado: 'O comandante recua um passo: "Veremos se sua equipe resistirá ao teste do tempo."' }
          ]
        }
      },
      { id: 'l3', x: 220, y: 360, desafio: 'desafio', nome: 'Núcleo Rúnico Ancestral', sprite: spriteRobo, palette: paletteRoboDesafio,
        conteudo: { simbolos: ['🔮', '⚡', '🛡️', '🔷', '✨'] }
      }
    ],
    tesouro: { id: 't4', x: 400, y: 80, nome: 'Grande Altar da Resistência', sprite: spritePortal, palette: palettePortal,
      texto: 'BASE CONSOLIDADA! Você ativou as defesas ancestrais, unificou a resistência e estabeleceu a base para a libertação final do reino secreto!' }
  }
];

/* ==========================================================================
// Conteúdo extra: bancos de perguntas e novas rotas de diálogo.
const perguntasExtras = {
 i1:[
 {texto:'Você encontrou um arquivo de configuração alterado. Qual é o próximo passo mais seguro?',opcoes:[{texto:'Comparar com uma cópia confiável e registrar a diferença',correta:true},{texto:'Apagar os registros para esconder o incidente',correta:false},{texto:'Dar acesso administrativo a qualquer solicitante',correta:false},{texto:'Reiniciar tudo sem preservar evidências',correta:false}]},
 {texto:'Um alerta pode ser falso positivo. Como confirmar?',opcoes:[{texto:'Correlacionar horário, origem e outros registros',correta:true},{texto:'Ignorar todos os alertas futuros',correta:false},{texto:'Concluir que houve ataque só pelo aviso',correta:false},{texto:'Desativar o monitoramento',correta:false}]},
 {texto:'Um colega pede uma senha compartilhada para acelerar o trabalho. O que fazer?',opcoes:[{texto:'Usar acesso individual autorizado e mínimo necessário',correta:true},{texto:'Enviar a senha por mensagem pública',correta:false},{texto:'Usar a conta de qualquer pessoa',correta:false},{texto:'Deixar a senha anotada no terminal',correta:false}]}
 ],
 j1:[
 {texto:'O padrão de ataque mudou depois da primeira defesa. Qual resposta é melhor?',opcoes:[{texto:'Reavaliar os sinais e adaptar a estratégia com base nas evidências',correta:true},{texto:'Repetir indefinidamente a tática que falhou',correta:false},{texto:'Desativar toda a defesa sem análise',correta:false},{texto:'Dividir a equipe sem compartilhar informações',correta:false}]},
 {texto:'Dois alertas contraditórios chegam ao mesmo tempo. Como priorizar?',opcoes:[{texto:'Comparar impacto, urgência e confiabilidade das fontes',correta:true},{texto:'Atender sempre o último alerta',correta:false},{texto:'Escolher aleatoriamente',correta:false},{texto:'Ignorar os dois',correta:false}]},
 {texto:'Uma correção rápida pode interromper o serviço. O que considerar?',opcoes:[{texto:'Risco, impacto, plano de reversão e comunicação',correta:true},{texto:'Somente a velocidade',correta:false},{texto:'Aplicar em produção sem testar',correta:false},{texto:'Ocultar o risco da equipe',correta:false}]}
 ],
 k1:[
 {texto:'Um gerador aquece após a estabilização. Qual é a decisão mais segura?',opcoes:[{texto:'Isolar o módulo e verificar carga e temperatura antes de religar',correta:true},{texto:'Aumentar a carga para testar o limite',correta:false},{texto:'Desconectar o suporte de vida',correta:false},{texto:'Ignorar os sensores',correta:false}]},
 {texto:'A equipe precisa priorizar sistemas durante o blackout. O que fazer?',opcoes:[{texto:'Restaurar primeiro os sistemas vitais e validar cada etapa',correta:true},{texto:'Ligar todos os circuitos de uma vez',correta:false},{texto:'Priorizar apenas as luzes decorativas',correta:false},{texto:'Esperar sem comunicar a equipe',correta:false}]},
 {texto:'Um reparo funcionou, mas não foi documentado. Qual é o próximo passo?',opcoes:[{texto:'Registrar a alteração e verificar estabilidade',correta:true},{texto:'Apagar o histórico',correta:false},{texto:'Repetir em todos os módulos sem testar',correta:false},{texto:'Não contar à equipe',correta:false}]}
 ],
 k4:[
 {texto:'Dois rastros apontam para rotas diferentes. Como decidir?',opcoes:[{texto:'Cruzar horários, telemetria e confiabilidade dos sinais',correta:true},{texto:'Escolher a rota mais curta sem verificar',correta:false},{texto:'Enviar todos sozinhos para rotas distintas',correta:false},{texto:'Descartar os dados',correta:false}]},
 {texto:'A rota mais rápida tem sinal instável. Qual é a melhor abordagem?',opcoes:[{texto:'Comparar riscos e preparar uma rota alternativa',correta:true},{texto:'Seguir sem informar a equipe',correta:false},{texto:'Desligar a navegação',correta:false},{texto:'Separar a equipe sem plano',correta:false}]},
 {texto:'Um colega identifica uma coordenada incompatível. O que fazer?',opcoes:[{texto:'Pausar e validar a coordenada em outra fonte',correta:true},{texto:'Ignorar a observação por pressa',correta:false},{texto:'Alterar coordenadas ao acaso',correta:false},{texto:'Ocultar a divergência',correta:false}]}
 ],
 l1:[
 {texto:'A resistência tem recursos limitados e três frentes em risco. Como liderar?',opcoes:[{texto:'Priorizar por risco às pessoas, impacto e chance de sucesso',correta:true},{texto:'Distribuir recursos sem avaliar urgência',correta:false},{texto:'Concentrar tudo no objetivo mais fácil',correta:false},{texto:'Deixar cada grupo decidir isoladamente',correta:false}]},
 {texto:'Uma ordem foi mal compreendida durante o combate. O que fazer?',opcoes:[{texto:'Confirmar entendimento e esclarecer responsabilidades',correta:true},{texto:'Culpar o grupo imediatamente',correta:false},{texto:'Repetir a ordem sem contexto',correta:false},{texto:'Cancelar tudo sem avaliar alternativas',correta:false}]},
 {texto:'A estratégia inicial falhou. Qual postura demonstra liderança?',opcoes:[{texto:'Assumir o erro, avaliar dados e ajustar o plano com a equipe',correta:true},{texto:'Esconder a falha e insistir',correta:false},{texto:'Transferir toda a culpa',correta:false},{texto:'Abandonar a comunicação',correta:false}]}
 ]
};
const respostasExtras = {
 i2:[{texto:'Antes de avançar, conte o que aconteceu com a estação.',resultado:'O Emissário revela que recebeu ordens incompletas e compartilha uma pista.'},{texto:'Podemos cooperar: você nos dá informações e protegemos este setor.',resultado:'O Emissário considera a proposta e aceita uma trégua provisória.'}],
 j2:[{texto:'Qual parte do nosso plano você explorou primeiro?',resultado:'O Estrategista revela uma falha de contingência e compartilha uma vulnerabilidade.'},{texto:'Vamos comparar evidências antes de decidir quem tem razão.',resultado:'O Estrategista aceita analisar os dados; a conversa vira uma disputa de argumentos.'}],
 k2:[{texto:'O que você percebeu durante o ataque que ainda pode nos ajudar?',resultado:'Lucas compartilha uma observação tática útil para preparar a defesa.'},{texto:'Você pode recuperar o equipamento ou coordenar a evacuação.',resultado:'Lucas recupera o foco e escolhe uma função adequada ao estado da equipe.'}],
 k5:[{texto:'Que informação precisa seguir no comunicado para evitar outra emboscada?',resultado:'Elena sugere enviar coordenadas, assinatura do portal e rota segura.'},{texto:'Vamos confirmar se todos estão prontos antes do salto.',resultado:'Elena organiza a checagem e identifica um equipamento que precisa de reparo.'}],
 l2:[{texto:'Por que você acredita que o reino já está perdido?',resultado:'O comandante revela que depende de uma fonte de energia instável.'},{texto:'Proponho uma trégua para retirar os civis antes do confronto.',resultado:'O comandante concorda em suspender o ataque por alguns instantes.'}]
};
for (const nivel of niveis) for (const npc of nivel.inimigos) {
 if (perguntasExtras[npc.id] && npc.conteudo.perguntas) npc.conteudo.perguntas.push(...perguntasExtras[npc.id]);
 if (respostasExtras[npc.id] && npc.conteudo.respostas) npc.conteudo.respostas.push(...respostasExtras[npc.id]);
}

   LÓGICA DO MAPA E MOVIMENTAÇÃO
   ========================================================================== */
let animFrame;
let mapaAtivo = false;
let entidades = [];
let interacaoTrava = false;
let pertoDe = null;

const imgMapaFundo = new Image(); imgMapaFundo.src = 'assets/imagens/imagem1.png';
const imgMapaCamada2 = new Image(); imgMapaCamada2.src = 'assets/imagens/imagem2.png';
const imgJogador = new Image(); imgJogador.src = 'assets/imagens/jogador.png';
const skinsJogador = [{id:'original',nome:'Original',src:'assets/imagens/jogador.png',tipo:'original'},{id:'azul',nome:'Explorador azul',src:'assets/personagens/folhas/explorador-azul.png',tipo:'sheet'},{id:'verde',nome:'Explorador verde',src:'assets/personagens/folhas/explorador-verde.png',tipo:'sheet'}];
let skinJogadorSelecionada = 'original';
const imgSkinJogador = new Image();
const SPRITE_JOGADOR_W = 34;
const SPRITE_JOGADOR_H = 46;

const p = { x: 400, y: 240, s: 4, w: 20, h: 20, olhandoEsquerda: false, andando: false };
const keys = { ArrowUp:false, ArrowDown:false, ArrowLeft:false, ArrowRight:false, w:false, a:false, s:false, d:false, e:false };

// Cenário do mapa: peças desenhadas em canvas para criar um espaço explorável por fase.
// Os tons tecnológicos mais fortes são reservados a detalhes do cenário, sem competir com a interface.
const paletasAmbiente = [
  {chao:'#F0F1E8', chao2:'#E5E9DD', grade:'#D4DED1', parede:'#2B422B', paredeTopo:'#5E795F', borda:'#203520', metal:'#667B68', metalLuz:'#A9C4A8', tela:'#7CA982', acento:'#7CA982', luz:'#A9C4A8'},
  {chao:'#E8ECE1', chao2:'#DCE5D9', grade:'#C8D7C6', parede:'#2B422B', paredeTopo:'#557257', borda:'#203520', metal:'#607662', metalLuz:'#9FBA9F', tela:'#7CA982', acento:'#7CA982', luz:'#A9C4A8'},
  {chao:'#E0E7DA', chao2:'#D4DFD1', grade:'#BECFBD', parede:'#263D29', paredeTopo:'#4E6B50', borda:'#1D301F', metal:'#596E5B', metalLuz:'#96B296', tela:'#6F9D75', acento:'#7CA982', luz:'#A9C4A8'},
  {chao:'#F4F5EC', chao2:'#E6EBE2', grade:'#D1DCCF', parede:'#2B422B', paredeTopo:'#638064', borda:'#203520', metal:'#718572', metalLuz:'#B0C9AE', tela:'#7CA982', acento:'#7CA982', luz:'#A9C4A8'}
];
let colisoesAmbiente = [];
function retangulo(ctx,x,y,w,h,fill,stroke=null,sw=1){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=sw;ctx.strokeRect(x,y,w,h);}}
function desenharPlanta(ctx,x,y){
  ctx.fillStyle='rgba(10,16,20,.25)';ctx.beginPath();ctx.ellipse(x,y+10,15,7,0,0,Math.PI*2);ctx.fill();
  retangulo(ctx,x-9,y+2,18,9,'#8d9aa0','#35434a',2);retangulo(ctx,x-6,y-3,12,6,'#667780');
  ctx.strokeStyle='#405f4b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y+2);ctx.lineTo(x,y-13);ctx.stroke();
  for(const [dx,dy] of [[-8,-12],[7,-16],[-5,-21],[9,-7],[0,-25]]){ctx.fillStyle=dy%2?'#6e9b78':'#88ad83';ctx.beginPath();ctx.ellipse(x+dx,y+dy,6,3,dx/10,0,Math.PI*2);ctx.fill();}
}
function desenharMesa(ctx,x,y,w=76){
  ctx.fillStyle='rgba(8,13,18,.28)';ctx.fillRect(x+4,y+10,w,24);
  retangulo(ctx,x,y+5,w,21,'#5e6b77','#303b46',2);
  retangulo(ctx,x+3,y+7,w-6,5,'#8996a0');
  retangulo(ctx,x+12,y-13,27,18,'#202d3a','#1b2530',2);
  retangulo(ctx,x+15,y-10,21,11,'#79a8b6','#c0d4d7',1);
  retangulo(ctx,x+21,y+2,9,3,'#b5c1c8');
  retangulo(ctx,x+w-20,y-1,12,6,'#a6aeb3','#56616a',1);
  retangulo(ctx,x+7,y+26,5,9,'#36414b');retangulo(ctx,x+w-12,y+26,5,9,'#36414b');
}
function desenharServidor(ctx,x,y,h=60){
  ctx.fillStyle='rgba(5,9,14,.3)';ctx.fillRect(x+5,y+7,27,h);
  retangulo(ctx,x,y,27,h,'#283441','#131c25',2);retangulo(ctx,x+3,y+3,21,h-6,'#455463','#71808d',1);
  for(let yy=y+8;yy<y+h-5;yy+=12){retangulo(ctx,x+6,yy,15,7,'#26323d');retangulo(ctx,x+8,yy+2,3,2,'#7b9eaa');retangulo(ctx,x+15,yy+2,3,2,'#9c75d7');}
}
// Letreiros de setor em placas físicas para dar identidade e escala ao espaço.
function desenharPlaca(ctx,x,y,texto,largura=106){
  ctx.fillStyle='rgba(5,10,16,.3)';ctx.fillRect(x+3,y+5,largura,27);
  retangulo(ctx,x,y,largura,25,'#253441','#111c26',2);
  retangulo(ctx,x+3,y+3,largura-6,19,'#405463','#82939d',1);
  retangulo(ctx,x+7,y+6,3,13,'#a58bd2');
  ctx.fillStyle='#e3e9eb';ctx.font='bold 9px monospace';ctx.fillText(texto,x+14,y+15);
}
// Balão ambiental para NPCs próximos: sinalização pequena, não confundir com o diálogo principal.
function desenharIndicadorNPC(ctx,x,y,cor='#c5a8f2'){
  ctx.fillStyle='rgba(12,16,24,.85)';ctx.beginPath();ctx.roundRect(x-7,y-30,14,14,4);ctx.fill();
  ctx.strokeStyle=cor;ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle=cor;ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillText('!',x,y-19);ctx.textAlign='start';
}
function desenharAmbiente(ctx){
  const c=paletasAmbiente[Math.min(estado.nivelAtual,paletasAmbiente.length-1)];
  colisoesAmbiente=[];
  // Piso modular com variação de placas e juntas discretas.
  retangulo(ctx,0,0,800,480,c.chao);
  for(let y=0,row=0;y<480;y+=32,row++)for(let x=(row%2)*24;x<800;x+=48){
    retangulo(ctx,x+1,y+1,46,30,(Math.floor(x/48+row)%5===0)?c.chao2:c.chao);
    ctx.strokeStyle='rgba(17,25,34,.19)';ctx.lineWidth=1;ctx.strokeRect(x+1,y+1,46,30);
    if((Math.floor(x/48)+row)%7===0)retangulo(ctx,x+8,y+5,1,1,'rgba(230,238,245,.25)');
  }
  // Passarela central e linhas de orientação do complexo.
  retangulo(ctx,350,0,100,480,'rgba(183,194,205,.12)');
  retangulo(ctx,0,207,800,66,'rgba(183,194,205,.10)');
  for(let y=10;y<470;y+=26)retangulo(ctx,397,y,6,12,'rgba(206,214,224,.32)');
  for(let x=18;x<790;x+=32){retangulo(ctx,x,237,12,2,'rgba(206,214,224,.25)');}
  // Paredes perimetrais em camadas, com janelas e suportes.
  retangulo(ctx,0,0,800,28,c.borda);retangulo(ctx,0,0,800,19,c.paredeTopo);retangulo(ctx,0,19,800,9,c.parede);
  retangulo(ctx,0,0,13,480,c.borda);retangulo(ctx,0,0,9,480,c.paredeTopo);
  retangulo(ctx,787,0,13,480,c.borda);retangulo(ctx,791,0,9,480,c.paredeTopo);
  retangulo(ctx,0,452,800,28,c.borda);retangulo(ctx,0,452,800,10,c.parede);retangulo(ctx,0,462,800,18,c.paredeTopo);
  for(let x=30;x<770;x+=112){retangulo(ctx,x,4,76,12,'#9db7c4','#394956',2);retangulo(ctx,x+5,6,66,7,'#b4d2d8');retangulo(ctx,x+35,5,2,10,'#647b89');}
  // Painéis de parede, cabos e iluminação branca-roxa contida.
  for(let x=35;x<760;x+=150){retangulo(ctx,x,29,54,5,c.metal);retangulo(ctx,x+5,30,44,2,c.acento);}
  // Planta própria para cada fase: a disposição das salas, paredes e rotas muda de verdade.
  const paredeSetor=(x,y,w,h)=>{retangulo(ctx,x,y,w,h,c.borda,c.paredeTopo,2);if(w>18&&h>18)retangulo(ctx,x+3,y+3,w-6,h-6,c.parede);colisoesAmbiente.push({x,y,w,h});};
  const consoleSetor=(x,y,w=68)=>{desenharMesa(ctx,x,y,w);colisoesAmbiente.push({x,y:y-13,w,h:48});};
  const paredeComodo=(x,y,w,h)=>{
    const pw=w<=12?18:w, ph=h<=12?18:h;
    ctx.fillStyle='rgba(7,12,18,.38)';ctx.fillRect(x+5,y+7,pw,ph+4);
    retangulo(ctx,x,y,pw,ph,c.borda,c.paredeTopo,2);
    retangulo(ctx,x+3,y+3,Math.max(4,pw-6),Math.max(4,ph-6),c.parede);
    retangulo(ctx,x+2,y+1,Math.max(4,pw-4),3,c.metalLuz);
    colisoesAmbiente.push({x,y,w:pw,h:ph});
  };
  if(estado.nivelAtual===0){
    // Fase 1: laboratório de pesquisa acolhedor, organizado em alas e com núcleo de dados.
    // Detalhes discretos no piso original: marcações técnicas, sem trocar sua cor.
    retangulo(ctx,28,52,744,1,'rgba(206,214,224,.24)');
    retangulo(ctx,28,428,744,1,'rgba(206,214,224,.24)');
    for(const [x,y] of [[30,58],[565,58],[30,310],[565,310]]){
      retangulo(ctx,x,y,205,1,'rgba(206,214,224,.28)');
      retangulo(ctx,x,y,1,112,'rgba(206,214,224,.28)');
      retangulo(ctx,x+204,y,1,112,'rgba(206,214,224,.28)');
    }
    // Bancadas de trabalho nas quatro alas; o corredor central permanece livre.
    consoleSetor(48,105,72);consoleSetor(145,105,72);consoleSetor(48,345,72);consoleSetor(145,345,72);
    consoleSetor(580,105,72);consoleSetor(677,105,72);consoleSetor(580,345,72);consoleSetor(677,345,72);
    // Armários baixos e terminais secundários nas paredes.
    retangulo(ctx,42,68,68,17,'#75635b','#45383a',2);retangulo(ctx,47,72,18,8,'#9bcbd0');retangulo(ctx,70,72,18,8,'#9bcbd0');
    retangulo(ctx,690,68,64,17,'#75635b','#45383a',2);retangulo(ctx,695,72,16,8,'#9bcbd0');retangulo(ctx,716,72,16,8,'#9bcbd0');
    retangulo(ctx,42,393,68,17,'#75635b','#45383a',2);retangulo(ctx,690,393,64,17,'#75635b','#45383a',2);
    desenharServidor(ctx,690,185,54);desenharServidor(ctx,724,185,54);desenharServidor(ctx,758,185,54);
    desenharPlanta(ctx,270,85);desenharPlanta(ctx,530,85);desenharPlanta(ctx,270,400);desenharPlanta(ctx,530,400);
    // Núcleo holográfico de dados com base física e indicadores de estado.
    retangulo(ctx,340,207,120,57,'#55474b','#302a36',3);retangulo(ctx,347,213,106,44,'#9a8b80','#d8c5aa',1);
    retangulo(ctx,362,220,76,25,'#34434d','#7962a6',2);retangulo(ctx,370,225,60,3,'#8fcbd0');retangulo(ctx,370,233,38,3,'#A9C4A8');
    ctx.fillStyle='#7CA982';ctx.beginPath();ctx.arc(400,201,5,0,Math.PI*2);ctx.fill();
    // Paredes altas da Fase 1: face frontal, topo visível e sombra para sugerir cômodos.
    // Mantém vãos de passagem entre as alas e registra a colisão na área da parede.
    const paredeAlta=(x,y,w,h=18)=>{
      ctx.fillStyle='rgba(7,12,18,.38)';ctx.fillRect(x+5,y+7,w,h+5);
      retangulo(ctx,x,y,w,h,c.borda,c.paredeTopo,2);
      retangulo(ctx,x+3,y+3,w-6,Math.max(4,h-6),c.parede);
      retangulo(ctx,x+2,y+1,w-4,3,c.metalLuz);
      colisoesAmbiente.push({x,y,w,h});
    };
    paredeAlta(240,165,74);paredeAlta(486,165,74);paredeAlta(240,307,74);paredeAlta(486,307,74);
    desenharPlaca(ctx,246,135,'PESQUISA',82);desenharPlaca(ctx,492,135,'ANÁLISE',82);
    desenharPlaca(ctx,246,278,'PROTOTIPAGEM',108);desenharPlaca(ctx,492,278,'ARQUIVO',82);
    // Guias de circulação discretas no piso, sem vinheta nem partículas.
    retangulo(ctx,386,64,28,120,'rgba(155,117,215,.12)');retangulo(ctx,386,296,28,120,'rgba(155,117,215,.12)');
    retangulo(ctx,315,235,25,3,'#7CA982');retangulo(ctx,460,235,25,3,'#7CA982');
  }else if(estado.nivelAtual===1){
    // Fase 2: contenção, com corredor em zigue-zague e salas de acesso controlado.
    desenharServidor(ctx,55,65,68);desenharServidor(ctx,90,65,68);consoleSetor(610,78,70);consoleSetor(80,365,64);consoleSetor(650,360,70);
    paredeComodo(155,55,10,135);paredeComodo(155,180,180,10);paredeComodo(325,180,10,95);paredeComodo(325,265,165,10);
    paredeComodo(480,95,10,95);paredeComodo(490,95,160,10);paredeComodo(650,95,10,90);
    paredeComodo(610,290,10,115);paredeComodo(430,350,180,10);paredeComodo(220,310,10,100);
    retangulo(ctx,355,215,90,42,'#452d38','#d45d67',3);retangulo(ctx,365,223,70,22,'#8e3d4b');
    // Novos cômodos e pontos de permanência: controle, quarentena, celas e manutenção.
    consoleSetor(365,135,62);consoleSetor(520,365,66);desenharServidor(ctx,555,300,58);
    desenharPlaca(ctx,170,70,'QUARENTENA',104);desenharPlaca(ctx,500,110,'COMANDO',90);desenharPlaca(ctx,235,325,'CELAS',65);desenharPlaca(ctx,370,115,'CONTROLE',82);desenharPlaca(ctx,525,335,'MANUTENÇÃO',105);
  }else if(estado.nivelAtual===2){
    // Fase 3: blackout e setor médico, com passagens estreitas e escotilhas.
    desenharServidor(ctx,75,60,72);consoleSetor(590,95,65);consoleSetor(610,365,65);desenharPlanta(ctx,110,385);desenharPlanta(ctx,700,80);
    paredeComodo(205,45,10,135);paredeComodo(205,170,120,10);paredeComodo(315,170,10,120);paredeComodo(315,280,150,10);
    paredeComodo(455,205,10,95);paredeComodo(455,205,135,10);paredeComodo(580,45,10,100);paredeComodo(580,135,110,10);
    paredeComodo(680,135,10,140);paredeComodo(515,330,175,10);paredeComodo(515,330,10,80);
    retangulo(ctx,365,215,70,48,'#252b38','#8b789f',3);retangulo(ctx,375,224,50,6,'#d45d67');
    // Salas legíveis com espaços livres para personagens e pontos de interação.
    consoleSetor(235,95,64);consoleSetor(535,285,62);desenharServidor(ctx,90,300,58);
    retangulo(ctx,70,190,82,38,'#343d4b','#8b789f',2);retangulo(ctx,78,198,66,22,'#9bb9c8');
    desenharPlaca(ctx,220,60,'MEDBAY',80);desenharPlaca(ctx,470,218,'NAVEGAÇÃO',108);desenharPlaca(ctx,530,265,'TRIAGEM',78);desenharPlaca(ctx,70,165,'RECUPERAÇÃO',112);
  }else{
    // Fase 4: fortaleza ancestral com muralhas laterais e pátio de pedra.
    desenharPlanta(ctx,100,105);desenharPlanta(ctx,700,105);desenharPlanta(ctx,110,390);desenharPlanta(ctx,690,390);
    retangulo(ctx,330,210,140,60,'#4b443c','#c6aa74',3);for(let x=350;x<455;x+=28)retangulo(ctx,x,225,18,28,'#6e604d','#c6aa74',1);
    paredeComodo(140,55,12,130);paredeComodo(140,185,150,12);paredeComodo(290,185,12,90);paredeComodo(290,275,115,12);
    paredeComodo(650,55,12,130);paredeComodo(510,185,152,12);paredeComodo(500,185,12,90);paredeComodo(395,275,117,12);
    paredeComodo(140,315,12,105);paredeComodo(140,315,150,12);paredeComodo(290,315,12,75);paredeComodo(510,315,12,75);paredeComodo(510,315,152,12);paredeComodo(650,315,12,105);
    // Salas adicionais na fortaleza: guarda, arquivo e preparação; pátio central livre.
    consoleSetor(175,115,62);consoleSetor(555,115,62);consoleSetor(175,375,62);consoleSetor(555,375,62);
    retangulo(ctx,65,205,78,52,'#4b443c','#c6aa74',2);retangulo(ctx,73,213,62,36,'#76664f','#c6aa74',1);
    retangulo(ctx,657,205,78,52,'#4b443c','#c6aa74',2);retangulo(ctx,665,213,62,36,'#76664f','#c6aa74',1);
    desenharPlaca(ctx,155,68,'TORRE OESTE',110);desenharPlaca(ctx,520,198,'TORRE LESTE',110);desenharPlaca(ctx,175,90,'GUARDA',70);desenharPlaca(ctx,555,90,'ARQUIVO',75);desenharPlaca(ctx,175,350,'PREPARAÇÃO',100);desenharPlaca(ctx,555,350,'ARSENAL',78);
  }
  // Luminárias, setas e sinalização de nível.
  for(const [x,y] of [[200,60],[600,60],[200,420],[600,420]]){
    retangulo(ctx,x-12,y-4,24,8,'#303a48','#19232f',1);retangulo(ctx,x-7,y-2,14,4,c.luz);
    ctx.save();ctx.globalAlpha=.10;ctx.fillStyle=c.luz;ctx.beginPath();ctx.ellipse(x,y+13,25,14,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  // Sem partículas ou vinheta: a leitura do mapa depende da arquitetura e dos setores.
  // Sinais do setor, em vez de uma grade neon sobre todo o mapa.
  ctx.fillStyle='#e0e6eb';ctx.font='bold 10px monospace';ctx.fillText(['NEXUS HUB','SETOR TÉCNICO','SETOR EM ALERTA','NÚCLEO NEXUS'][estado.nivelAtual]||'NEXUS',22,43);
  ctx.fillStyle=c.acento;ctx.fillRect(22,49,48,2);
  // Limites sólidos e obstáculos principais para o jogador não atravessar o cenário.
  colisoesAmbiente.push({x:0,y:0,w:800,h:28},{x:0,y:0,w:13,h:480},{x:787,y:0,w:13,h:480},{x:0,y:452,w:800,h:28});
  // As colisões específicas são registradas junto às paredes e aos móveis de cada fase.
  // Não usar obstáculos fixos compartilhados: isso criava paredes invisíveis em outros mapas.
}
function colideComAmbiente(x,y,w,h){
  return colisoesAmbiente.some(o=>x<o.x+o.w&&x+w>o.x&&y<o.y+o.h&&y+h>o.y);
}

// Prepara o setor atual, repõe entidades descobertas e inicia o ciclo de desenho do mapa.
function iniciarMapa() {
  const nivel = niveis[estado.nivelAtual] || niveis[0];
  const prog = estado.progresso[estado.nivelAtual];

  interacaoTrava = false;

  // Atualiza cabeçalhos dinâmicos do nível
  const mapaTitulo = document.getElementById('mapa-titulo');
  if (mapaTitulo) mapaTitulo.innerText = nivel.subtituloMapa || nivel.titulo;

  const rotuloContador = document.getElementById('hud-inimigos-rotulo');
  if (rotuloContador) rotuloContador.innerText = nivel.rotuloContador || 'Inimigos Descobertos';

  document.getElementById('hud-xp').innerText = estado.xp;
  document.getElementById('hud-inimigos').innerText = prog.descobertos.length;
  document.getElementById('hud-inimigos-total').innerText = nivel.inimigos.length;

  p.x = 390; p.y = 294;

  entidades = nivel.inimigos.map(inimigo => ({
    ...inimigo,
    tipo: 'inimigo',
    descoberto: prog.descobertos.includes(inimigo.id)
  }));
  if (prog.descobertos.length >= nivel.inimigos.length && !prog.tesouro) {
    entidades.push({ ...nivel.tesouro, tipo: 'tesouro' });
  }

  if (!mapaAtivo) {
    mapaAtivo = true;
    loopMapa();
  }
  if(!window.__nexusGuiaNiveisVistos) window.__nexusGuiaNiveisVistos=new Set();
  if(!window.__nexusGuiaNiveisVistos.has(estado.nivelAtual)){
    window.__nexusGuiaNiveisVistos.add(estado.nivelAtual);
    const falasNivel=[
      {titulo:'Guia Nexus — Primeiro treinamento',fala:'Vamos começar pelo básico. Observe o ambiente e converse com as pessoas indicadas. Cada desafio apresenta uma situação de trabalho: leia o contexto, escolha sua resposta e veja o resultado. Você não precisa decorar tudo agora; vou explicar conforme avançarmos.'},
      {titulo:'Guia Nexus — Novo setor',fala:'Chegamos a um novo setor. Antes de agir, observe o que mudou e pense no objetivo da equipe. Procure pistas no cenário e use as conversas para entender responsabilidades e riscos. Se uma resposta não funcionar, releia o contexto e tente outra abordagem.'},
      {titulo:'Guia Nexus — Trabalho em equipe',fala:'Nesta etapa, preste atenção em como as funções se complementam. Resolver o problema não é apenas escolher rápido: identifique quem pode ajudar, compartilhe informações e escolha uma ação justificável.'},
      {titulo:'Guia Nexus — Desafio final',fala:'Última etapa! Use o que aprendeu sobre análise, comunicação e colaboração. Leia cada situação com cuidado, escolha a opção mais segura e explique mentalmente por que ela ajuda a equipe.'}
    ];
    const d=falasNivel[Math.min(estado.nivelAtual,falasNivel.length-1)];
    setTimeout(()=>{if(document.getElementById('tela-mapa')?.classList.contains('ativa')){atualizarRetratoPersonagem({nome:'Guia Nexus',guia:true});document.getElementById('modal-titulo').textContent=d.titulo;document.getElementById('modal-texto').textContent=d.fala;document.getElementById('modal-conteudo').innerHTML='';document.getElementById('modal-btn-continuar').textContent='Entendi, vamos lá →';document.getElementById('modal-btn-continuar').style.display='';document.getElementById('modal').classList.add('aberto');modalCallback=()=>{document.getElementById('modal-btn-continuar').textContent='Continuar';};}},120);
  }
}

window.addEventListener('keydown', e => {
  // Na tela de conclusão de fase, Enter/Seta/atalhos também permitem avançar sem mouse.
  const telaFim = document.getElementById('tela-fim');
  const modalAberto = document.getElementById('modal')?.classList.contains('aberto');
  if (!modalAberto && telaFim?.classList.contains('ativa')) {
    const botoesFim = [...document.querySelectorAll('#fim-botoes button')].filter(b => !b.disabled && b.offsetParent !== null);
    if ((e.key === 'Enter' || e.key === ' ') && botoesFim.length) { e.preventDefault(); (document.activeElement?.closest('#fim-botoes button') || botoesFim[0]).click(); return; }
    if (/^[1-9]$/.test(e.key) && botoesFim.length) { e.preventDefault(); botoesFim[Number(e.key)-1]?.click(); return; }
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && botoesFim.length) { e.preventDefault(); const i=botoesFim.indexOf(document.activeElement); botoesFim[(i + (e.key === 'ArrowRight' ? 1 : -1) + botoesFim.length) % botoesFim.length].focus(); return; }
  }
  const modal = document.getElementById('modal');
  if (modal && modal.classList.contains('aberto')) {
    const botoes = [...modal.querySelectorAll('#modal-conteudo button, #modal-btn-continuar')].filter(b => b.offsetParent !== null && !b.disabled);
    if (/^[1-9]$/.test(e.key) && botoes.length) { e.preventDefault(); botoes[Number(e.key)-1]?.click(); return; }
    if (e.key === 'Enter' || e.key === ' ') {
      if (document.activeElement && document.activeElement.tagName === 'BUTTON') { e.preventDefault(); document.activeElement.click(); }
      else if (botoes.length) { e.preventDefault(); botoes[0].focus(); botoes[0].click(); }
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (botoes.length) { e.preventDefault(); const i=botoes.indexOf(document.activeElement); botoes[(i + (e.key === 'ArrowDown' ? 1 : -1) + botoes.length) % botoes.length].focus(); }
      return;
    }
  }
  if(keys.hasOwnProperty(e.key)) keys[e.key] = true;
});
window.addEventListener('keyup', e => {
  if(keys.hasOwnProperty(e.key)) keys[e.key] = false;
  if(e.key === 'e' || e.key === 'E') tentarInteragir();
});

function pararMapa() {
  mapaAtivo = false;
  cancelAnimationFrame(animFrame);
}

function loopMapa() {
  if(!mapaAtivo) return;
  
  if (!interacaoTrava) {
    let nx=p.x, ny=p.y;
    if (keys.ArrowUp || keys.w) ny -= p.s;
    if (keys.ArrowDown || keys.s) ny += p.s;
    if (keys.ArrowLeft || keys.a) { nx -= p.s; p.olhandoEsquerda = true; }
    if (keys.ArrowRight || keys.d) { nx += p.s; p.olhandoEsquerda = false; }
    nx=Math.max(13,Math.min(800-p.w-13,nx));ny=Math.max(28,Math.min(452-p.h,ny));
    if(!colideComAmbiente(nx,p.y,p.w,p.h))p.x=nx;
    if(!colideComAmbiente(p.x,ny,p.w,p.h))p.y=ny;
  }

  const cvs = document.getElementById('mapa-canvas');
  const ctx = cvs.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  
  desenharAmbiente(ctx);

  let achouAlvo = null;

  entidades.forEach(e => {
    if (e.tipo === 'inimigo' && e.descoberto) return;

    // Sombra alinhada aos pés dos novos sprites 20x32 ampliados 2x.
    ctx.fillStyle='rgba(5,9,15,.32)';ctx.beginPath();ctx.ellipse(e.x+16,e.y+31,15,5,0,0,Math.PI*2);ctx.fill();
    if (e.tipo === 'inimigo') desenharPersonagemAnimado(ctx, e, performance.now());
    else {
      const pulsoTesouro = Math.sin(performance.now() / 240) * 1.2;
      desenharSprite(ctx, e.sprite, e.palette, e.x, e.y + pulsoTesouro, 4);
    }
    desenharIndicadorNPC(ctx,e.x+16,e.y-35,e.tipo==='tesouro'?'#e8c77b':'#c5a8f2');

    if (!interacaoTrava) {
      const dist = Math.hypot((p.x + p.w/2) - (e.x + TAM_SPRITE/2), (p.y + p.h/2) - (e.y + TAM_SPRITE/2));
      if (dist < 64) achouAlvo = e;
    }
  });

  // Desenha Jogador
  p.andando = (keys.ArrowUp || keys.w || keys.ArrowDown || keys.s || keys.ArrowLeft || keys.a || keys.ArrowRight || keys.d);
  const balanco = p.andando ? Math.sin(Date.now() / 90) * 2 : 0;
  const drawX = p.x + p.w/2 - SPRITE_JOGADOR_W/2;
  const drawY = p.y + p.h - SPRITE_JOGADOR_H + balanco;

  const skinAtiva = skinsJogador.find(s => s.id === skinJogadorSelecionada) || skinsJogador[0];
  const imagemAtiva = skinAtiva.tipo === 'sheet' ? imgSkinJogador : imgJogador;
  if (imagemAtiva.complete && imagemAtiva.naturalWidth) {
    ctx.save();
    if (p.olhandoEsquerda) { ctx.translate(drawX * 2 + SPRITE_JOGADOR_W, 0); ctx.scale(-1, 1); }
    if (skinAtiva.tipo === 'sheet') ctx.drawImage(imagemAtiva, 0, 0, imagemAtiva.naturalWidth/4, imagemAtiva.naturalHeight/4, drawX, drawY, SPRITE_JOGADOR_W, SPRITE_JOGADOR_H);
    else ctx.drawImage(imagemAtiva, drawX, drawY, SPRITE_JOGADOR_W, SPRITE_JOGADOR_H);
    ctx.restore();
  } else {
    ctx.fillStyle = '#7CA982';
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }

  // Prompt de Interação
  const prompt = document.getElementById('prompt-mapa');
  if (achouAlvo && !interacaoTrava) {
    pertoDe = achouAlvo;
    prompt.innerText = `E  ·  INTERAGIR: ${achouAlvo.nome}`;
    
    const scaleX = cvs.clientWidth / 800;
    const scaleY = cvs.clientHeight / 480;
    prompt.style.left = (achouAlvo.x * scaleX) + 'px';
    prompt.style.top = (achouAlvo.y * scaleY - 30) + 'px';
    prompt.classList.add('visivel');
  } else {
    pertoDe = null;
    prompt.classList.remove('visivel');
  }

  animFrame = requestAnimationFrame(loopMapa);
}

function tentarInteragir() {
  if (!pertoDe || interacaoTrava) return;
  interacaoTrava = true;
  document.getElementById('prompt-mapa').classList.remove('visivel');
  
  if (pertoDe.tipo === 'inimigo') {
    iniciarDesafioInimigo(pertoDe);
  }
  
  if (pertoDe.tipo === 'tesouro') {
    const nivel = niveis[estado.nivelAtual];
    const xpGanho = nivel.xpTesouro || 250;
    abrirModal(`Missão Cumprida`, pertoDe.texto + ` (+${xpGanho} XP)`, () => {
      estado.progresso[estado.nivelAtual].tesouro = true;
      addXP(xpGanho);
      interacaoTrava = false;
      finalizarNivel();
    });
  }
}

/* ==========================================================================
   DESAFIOS DE TREINAMENTO E MENTORIA
   ========================================================================== */
function atualizarRetratoPersonagem(entidade){
  const cartao=document.querySelector('#modal .conversa-cartao');
  const box=document.getElementById('conversa-personagem');
  const canvas=document.getElementById('retrato-personagem');
  const nome=document.getElementById('retrato-nome');
  if(!cartao||!box||!canvas)return;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const modal=document.getElementById('modal');
  if(!entidade||(!entidade.sprite&&!entidade.guia)){
    modal.classList.remove('com-personagem');modal.classList.add('sem-personagem');
    cartao.classList.add('sem-personagem');
    box.style.display='none';
    return;
  }
  modal.classList.remove('sem-personagem');modal.classList.add('com-personagem');
  cartao.classList.remove('sem-personagem');
  box.style.display='flex';
  nome.textContent=entidade.nome||'Personagem';
  ctx.imageSmoothingEnabled=true;
  if(entidade.guia){
    const guiaImg=new Image();
    guiaImg.onload=()=>{if(document.getElementById('modal').classList.contains('aberto')&&document.getElementById('retrato-nome').textContent==='Guia Nexus'){ctx.clearRect(0,0,canvas.width,canvas.height);const scale=Math.min((canvas.width-8)/guiaImg.naturalWidth,(canvas.height-8)/guiaImg.naturalHeight);const w=guiaImg.naturalWidth*scale,h=guiaImg.naturalHeight*scale;ctx.drawImage(guiaImg,(canvas.width-w)/2,(canvas.height-h)/2,w,h);}};
    guiaImg.src='assets/imagens/Crocodilo.png';
    if(guiaImg.complete&&guiaImg.naturalWidth){const scale=Math.min((canvas.width-8)/guiaImg.naturalWidth,(canvas.height-8)/guiaImg.naturalHeight);const w=guiaImg.naturalWidth*scale,h=guiaImg.naturalHeight*scale;ctx.drawImage(guiaImg,(canvas.width-w)/2,(canvas.height-h)/2,w,h);}
    return;
  }
  ctx.imageSmoothingEnabled=false;
  const visual = npcVisual[entidade.id];
  const img = visual && npcSpriteImgs[visual.sprite];
  if (img) {
    if (img.complete && img.naturalWidth) {
      const frameW=img.naturalWidth/3, frameH=img.naturalHeight/4;
      const drawW=104, drawH=144;
      ctx.drawImage(img,0,Math.round(visual.dir*frameH),frameW,frameH,Math.round((canvas.width-drawW)/2),canvas.height-drawH-4,drawW,drawH);
      return;
    }
    img.addEventListener('load', () => { if (document.getElementById('modal').classList.contains('aberto') && document.getElementById('modal-titulo').textContent === entidade.nome) atualizarRetratoPersonagem(entidade); }, {once:true});
  }
  const sprite=entidade.sprite, palette=entidade.palette||{};
  const escala=Math.min(16,Math.floor(Math.min((canvas.width-16)/8,(canvas.height-18)/8)));
  desenharSprite(ctx,sprite,palette,Math.floor((canvas.width-8*escala)/2),canvas.height-8*escala-8,escala);
}

function iniciarDesafioInimigo(entidade) {
  atualizarRetratoPersonagem(entidade);
  document.getElementById('modal-titulo').textContent = entidade.nome;
  document.getElementById('modal-btn-continuar').style.display = 'none';
  document.getElementById('modal').classList.add('aberto');

  if (entidade.desafio === 'quiz') renderQuizInimigo(entidade, 0);
  else if (entidade.desafio === 'dialogo') renderDialogoInimigo(entidade);
  else renderSequenciaInimigo(entidade);
}

// 1. Quiz (Conhecimento / Liderança)
function renderQuizInimigo(entidade, indice) {
  const perguntas = entidade.conteudo.perguntas;
  const q = perguntas[indice];
  document.getElementById('modal-texto').textContent = q.texto;

  const cont = document.getElementById('modal-conteudo');
  cont.innerHTML = '';
  q.opcoes.forEach(op => {
    const btn = document.createElement('button');
    btn.className = 'opcao';
    btn.textContent = op.texto;
    btn.onclick = () => {
      if (op.correta) {
        if (indice + 1 < perguntas.length) {
          renderQuizInimigo(entidade, indice + 1);
        } else {
          concluirDesafioInimigo(entidade, 'conhecimento');
        }
      } else {
        document.getElementById('modal-texto').textContent = q.texto + '\n\nEssa abordagem pode trazer riscos. Revise as pistas e tente outra opção.';
      }
    };
    cont.appendChild(btn);
  });
}

// 2. Diálogo / Persuasão (Comunicação & Colaboração)
function renderDialogoInimigo(entidade) {
  const d = entidade.conteudo;
  document.getElementById('modal-titulo').textContent = entidade.nome || 'Personagem';
  document.getElementById('modal-texto').textContent = d.fala;

  const cont = document.getElementById('modal-conteudo');
  cont.innerHTML = '';
  // Nem toda resposta resolve o conflito. A opção ideal depende do contexto de cada NPC.
  const respostaIdeal = ({ i2: 1, j2: 1, k2: 0, k5: 0, l2: 0 })[entidade.id] ?? 0;
  const respostas = d.respostas.map((r, indice) => ({ ...r, indiceOriginal: indice }));
  respostas.sort(() => Math.random() - 0.5);
  respostas.forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'opcao';
    btn.textContent = r.texto;
    btn.onclick = () => {
      if (r.indiceOriginal !== respostaIdeal) {
        document.getElementById('modal-texto').textContent = 'A resposta não resolveu a situação. Reavalie o que o personagem disse, considere os riscos e tente outra abordagem.';
        btn.disabled = true;
        btn.style.opacity = '.55';
        btn.setAttribute('aria-disabled','true');
        // Nunca deixar a conversa sem saída, mesmo se o conteúdo de uma missão mudar.
        if(![...cont.querySelectorAll('button.opcao')].some(opcao=>!opcao.disabled)){
          const tentar=document.createElement('button');
          tentar.type='button';tentar.textContent='Rever respostas';tentar.className='opcao';
          tentar.onclick=()=>renderDialogoInimigo(entidade);
          cont.appendChild(tentar);
        }
        return;
      }
      document.getElementById('modal-texto').textContent = r.resultado;
      cont.innerHTML = '';
      const btnOk = document.createElement('button');
      btnOk.textContent = 'Concluir conversa';
      btnOk.onclick = () => concluirDesafioInimigo(entidade, 'comunicacao');
      cont.appendChild(btnOk);
    };
    cont.appendChild(btn);
  });
}

// 3. Mini-desafio de Sequência (Inovação)
function renderSequenciaInimigo(entidade) {
  const simbolos = entidade.conteudo.simbolos;
  const cont = document.getElementById('modal-conteudo');
  document.getElementById('modal-texto').textContent = 'Memorize a sequência de segurança...';
  cont.innerHTML = `<div class="sequencia-simbolos">${simbolos.join(' ')}</div>`;

  setTimeout(() => {
    document.getElementById('modal-texto').textContent = 'Agora repita os símbolos na ordem exata:';
    const embaralhado = [...simbolos].sort(() => Math.random() - 0.5);
    let escolha = [];
    cont.innerHTML = `
      <div id="seq-progresso" class="sequencia-progresso"></div>
      <div id="seq-botoes" class="sequencia-botoes"></div>`;
    const botoesEl = document.getElementById('seq-botoes');
    embaralhado.forEach(sym => {
      const btn = document.createElement('button');
      btn.textContent = sym;
      btn.classList.add('botao-sequencia');
      btn.onclick = () => {
        escolha.push(sym);
        document.getElementById('seq-progresso').textContent = escolha.join(' ');
        const idx = escolha.length - 1;
        if (escolha[idx] !== simbolos[idx]) {
          document.getElementById('modal-texto').textContent = 'Sequência rompida. Reiniciando os padrões...';
          setTimeout(() => renderSequenciaInimigo(entidade), 900);
          return;
        }
        if (escolha.length === simbolos.length) {
          concluirDesafioInimigo(entidade, 'inovacao');
        }
      };
      botoesEl.appendChild(btn);
    });
  }, 2000);
}

// Conclusão Comum dos Desafios
function concluirDesafioInimigo(entidade, atributo) {
  const nivel = niveis[estado.nivelAtual];
  const xpDesafio = nivel.xpDesafio || 50;
  document.getElementById('modal-conteudo').innerHTML = '';
  document.getElementById('modal-btn-continuar').style.display = '';
  document.getElementById('modal-titulo').textContent = nivel.verboSuperado || 'Desafio Superado!';
  document.getElementById('modal-texto').textContent = (nivel.msgSuperado ? nivel.msgSuperado.replace('{nome}', entidade.nome) : `Você superou ${entidade.nome}.`) + ` (+${xpDesafio} XP)`;

  modalCallback = () => {
    const prog = estado.progresso[estado.nivelAtual];
    entidade.descoberto = true;
    prog.descobertos.push(entidade.id);
    estado.atributos[atributo] = (estado.atributos[atributo] || 0) + 15;
    document.getElementById('hud-inimigos').innerText = prog.descobertos.length;
    addXP(xpDesafio);

    if (prog.descobertos.length === nivel.inimigos.length) {
      entidades.push({ ...nivel.tesouro, tipo: 'tesouro' });
      setTimeout(() => abrirModal('Alerta do Sistema', nivel.msgTodosSuperados || 'Todos os pontos foram concluídos. O acesso central foi destrancado!', () => {
        interacaoTrava = false;
      }), 500);
    } else {
      interacaoTrava = false;
    }
  };
}

/* ==========================================================================
   SISTEMA DE MODAL
   ========================================================================== */
let modalCallback = null;
function abrirModal(titulo, texto, callback) {
  restaurarEstiloModal();
  atualizarRetratoPersonagem(null);
  document.getElementById('modal-titulo').textContent = titulo;
  document.getElementById('modal-texto').textContent = texto;
  document.getElementById('modal-conteudo').innerHTML = '';
  document.getElementById('modal-btn-continuar').style.display = '';
  document.getElementById('modal').classList.add('aberto');
  modalCallback = callback;
}
// Fecha a conversa uma única vez e executa a ação associada ao avanço.
function fecharModal() {
  const modal=document.getElementById('modal');
  if(!modal.classList.contains('aberto'))return;
  modal.classList.remove('aberto');
  const callback=modalCallback;
  modalCallback=null;
  if(typeof callback==='function')callback();
}

/* ==========================================================================
   FIM DO NÍVEL & GALERIA DE SELOS
   ========================================================================== */
function finalizarNivel() {
  pararMapa();
  const nivel = niveis[estado.nivelAtual];
  document.getElementById('fim-xp').innerText = estado.xp;
  document.getElementById('fim-titulo').textContent = nivel.titulo + ' concluído';
  document.getElementById('fim-texto').innerText = nivel.textoFim.replace('{habilidade}', estado.habilidadePrincipal);

  // Badge do nível
  const badgeEl = document.getElementById('fim-badge');
  if (badgeEl && nivel.badge) {
    badgeEl.innerHTML = `<span class="badge-tag badge-tag-destaque">${nivel.badge}</span>`;
  }

  const container = document.getElementById('fim-botoes');
  container.innerHTML = '';

  // A skin escolhida no início permanece ativa até o final; não reapresentar seletor aqui.
  const skinAtual = skinsJogador.find(s => s.id === skinJogadorSelecionada) || skinsJogador[0];
  const skinResumo = document.createElement('p');
  skinResumo.className = 'resumo-skin';
  skinResumo.textContent = 'Explorador selecionado: ' + skinAtual.nome;
  container.appendChild(skinResumo);
  if (estado.nivelAtual + 1 < niveis.length) {
    const btnAvancar = document.createElement('button');
    btnAvancar.textContent = `Avançar para o ${niveis[estado.nivelAtual + 1].titulo.split(' —')[0]} →`;
    btnAvancar.onclick = avancarNivel;
    container.appendChild(btnAvancar);
  } else {
    // Fim da jornada (Nível 4)
    const msg = document.createElement('div');
    msg.className = 'mensagem-recompensa-final';
    msg.innerHTML = `<strong>🏆 JORNADA COMPLETA — NÍVEL 4 CONCLUÍDO!</strong><br><span class="texto-recompensa-final">Você concluiu todos os níveis da simulação com pontuação de elite. Esta etapa do processo seletivo foi encerrada com sucesso!</span>`;
    container.appendChild(msg);
  }

  const btnReiniciar = document.createElement('button');
  btnReiniciar.textContent = 'Jogar novamente (do início)';
  btnReiniciar.className = 'secundario';
  btnReiniciar.onclick = reiniciar;
  container.appendChild(btnReiniciar);

  mostrarTela('tela-fim');
}

function avancarNivel() {
  if(estado.nivelAtual+1>=niveis.length)return;
  estado.nivelAtual++;
  salvarEstado();
  atualizarCargoNexus();
  mostrarTela('tela-mapa');
}


/* A identidade visual fica em css/04-identidade-visual.css. */

// Importa um salvamento da URL quando a pessoa abre o atalho legado NexusGame.html.
// A chave original é mantida; o parâmetro é removido do endereço após a importação.
function importarSalvamentoLegadoDaUrl() {
  const parametros = new URLSearchParams(window.location.search);
  const salvamento = parametros.get('migrar-save');
  if (!salvamento) return;

  try {
    const dados = JSON.parse(salvamento);
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
      throw new TypeError('O conteúdo não representa uma partida válida.');
    }

    localStorage.setItem(CHAVE_SAVE, salvamento);
    parametros.delete('migrar-save');
    const consulta = parametros.toString();
    const urlLimpa = window.location.pathname + (consulta ? `?${consulta}` : '') + window.location.hash;
    try { window.history.replaceState(null, '', urlLimpa); } catch (_) { /* Alguns navegadores restringem replaceState em file://. */ }
  } catch (erro) {
    console.warn('[NexusGame] Não foi possível importar o salvamento legado; o conteúdo recebido foi preservado na URL para recuperação.', erro);
  }
}

// Inicialização
importarSalvamentoLegadoDaUrl();
carregarEstado();
atualizarTelaInicial();
montarBotoesInicio();
document.getElementById('btn-entrar-missao')?.addEventListener('click',irParaMapa);
document.getElementById('modal-btn-continuar')?.addEventListener('click',fecharModal);
document.getElementById('inicio-abrir-conversa')?.addEventListener('click', iniciarTreinamentoPeloGuia);
inicializarProgressoCarreira();
window.addEventListener('keydown',e=>{
  const telaInicial=document.getElementById('tela-inicial');
  if(!telaInicial?.classList.contains('ativa')||document.getElementById('modal')?.classList.contains('aberto'))return;
  if(e.target instanceof HTMLElement && (e.target.closest('button,a,input,textarea,select,[contenteditable="true"]')))return;
  if(e.key==='ArrowRight'||e.key==='Enter'||e.key===' '){e.preventDefault();iniciarTreinamentoPeloGuia();}
});
