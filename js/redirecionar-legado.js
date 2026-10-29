/*
 * Compatibilidade com o arquivo NexusGame.html usado nas versões anteriores.
 * Transfere o save local na URL antes de abrir a nova entrada index.html.
 */
(() => {
  const chaveSalvamento = 'nexus_estado_completo_v3';
  const destino = new URL('./index.html', window.location.href);

  try {
    const salvamento = window.localStorage.getItem(chaveSalvamento);
    if (salvamento) destino.searchParams.set('migrar-save', salvamento);
  } catch (erro) {
    // Se o navegador bloquear o armazenamento, ainda abrimos a página principal.
    console.warn('[NexusGame] O salvamento legado não pôde ser lido nesta origem.', erro);
  }

  window.location.replace(destino.toString());
})();
