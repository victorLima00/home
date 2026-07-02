const STOPWORDS = new Set([
  'que',
  'uma',
  'um',
  'para',
  'com',
  'sem',
  'pra',
  'e',
  'de',
  'do',
  'da',
  'dos',
  'das',
  'em',
  'no',
  'na',
  'nos',
  'nas',
  'tipo',
  'parece',
  'imita'
]);

function normalizarTermos(texto) {
  return (texto || '')
    .toLowerCase()
    .replace(/[.,;:!?()[\]{}"'`]/g, ' ')
    .split(/\s+/)
    .map((termo) => termo.trim())
    .filter(Boolean)
    .filter((termo) => termo.length > 2)
    .filter((termo) => !STOPWORDS.has(termo));
}

function construirConsultas(itemName, notes) {
  const termosNome = normalizarTermos(itemName);
  const termosNotas = normalizarTermos(notes).slice(0, 4);
  const consultas = [];

  if (itemName && termosNotas.length > 0) {
    consultas.push(`${itemName} ${termosNotas.join(' ')}`.trim());
  }

  if (itemName) {
    consultas.push(itemName.trim());
  }

  if (termosNome.length > 1) {
    consultas.push(termosNome.slice(0, 2).join(' '));
    consultas.push(termosNome[0]);
  }

  if (termosNotas.length > 0) {
    consultas.push(termosNotas.join(' '));
  }

  return [...new Set(consultas.filter(Boolean))];
}

function consolidarSources(itemName, consultas, resultados) {
  return resultados.map((resultado, index) => ({
    source: resultado.source || (index === 0 ? 'Zoom' : 'KaBuM'),
    results: Array.isArray(resultado.results) ? resultado.results : [],
    status:
      resultado.status || (resultado.results && resultado.results.length > 0 ? 'success' : 'empty'),
    error: resultado.error || null,
    searchUsed: resultado.searchUsed || consultas[0] || itemName,
    attempts: Array.isArray(resultado.attempts) ? resultado.attempts : []
  }));
}

module.exports = {
  normalizarTermos,
  construirConsultas,
  consolidarSources
};
