function limparTexto(texto) {
  return String(texto || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizarPreco(texto) {
  const valor = String(texto || '')
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '')
    .replace(',', '.');

  const numero = Number.parseFloat(valor);
  return Number.isFinite(numero) ? numero : null;
}

function extrairLinkAbsoluto(baseUrl, href) {
  if (!href) return '#';
  if (/^https?:\/\//i.test(href)) return href;
  return `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
}

module.exports = {
  limparTexto,
  normalizarPreco,
  extrairLinkAbsoluto
};
