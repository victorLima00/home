const fetchHttp = require('node-fetch');
const cheerio = require('cheerio');
const { createBuscarPromocoesUseCase } = require('../../packages/application/promocoes');

const ZOOM_BASE_URL = 'https://www.zoom.com.br';
const KABUM_BASE_URL = 'https://www.kabum.com.br';

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

async function buscarZoom(query) {
  try {
    const response = await fetchHttp(`${ZOOM_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
      }
    });

    if (!response.ok) throw new Error(`Zoom error (${response.status})`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $('[data-testid="product-card::card"]').each((index, element) => {
      if (results.length >= 8) return;

      const card = $(element);
      const title = limparTexto(card.find('[data-testid="product-card::name"]').first().text());
      const priceText = limparTexto(
        card.find('[data-testid="product-card::price"]').first().text()
      );
      const link = card.find('a[href]').first().attr('href');
      const image = card.find('img').first().attr('src');

      if (title) {
        results.push({
          title,
          price: normalizarPreco(priceText),
          link: extrairLinkAbsoluto(ZOOM_BASE_URL, link),
          image: image || '',
          source: 'Zoom'
        });
      }
    });

    return {
      source: 'Zoom',
      results
    };
  } catch (error) {
    return { source: 'Zoom', results: [], error: error.message };
  }
}

async function buscarKaBuM(query) {
  try {
    const response = await fetchHttp(`${KABUM_BASE_URL}/busca/${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
      }
    });

    if (!response.ok) throw new Error(`KaBuM error (${response.status})`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $('[data-testid="product-card::card"]').each((index, element) => {
      if (results.length >= 8) return;

      const card = $(element);
      const title = limparTexto(card.find('[data-testid="product-card::name"]').first().text());
      const priceText = limparTexto(
        card.find('[data-testid="product-card::price"]').first().text()
      );
      const link = card.find('a[href]').first().attr('href');
      const image = card.find('img').first().attr('src');

      if (title) {
        results.push({
          title,
          price: normalizarPreco(priceText),
          link: extrairLinkAbsoluto(KABUM_BASE_URL, link),
          image: image || '',
          source: 'KaBuM'
        });
      }
    });

    return {
      source: 'KaBuM',
      results
    };
  } catch (error) {
    return { source: 'KaBuM', results: [], error: error.message };
  }
}

const buscarPromocoesUseCase = createBuscarPromocoesUseCase({
  sources: [
    {
      name: 'Zoom',
      search: buscarZoom
    },
    {
      name: 'KaBuM',
      search: buscarKaBuM
    }
  ]
});

async function buscarPromocoes(itemName, notes) {
  return buscarPromocoesUseCase.execute({ itemName, notes });
}

module.exports = {
  buscarPromocoes
};
