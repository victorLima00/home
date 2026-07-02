const fetchHttp = require('node-fetch');
const cheerio = require('cheerio');
const { limparTexto, normalizarPreco, extrairLinkAbsoluto } = require('./source-utils');
const { createHttpStatusError, normalizeSourceFailure } = require('./source-error');

const KABUM_BASE_URL = 'https://www.kabum.com.br';

async function buscarKaBuM(query) {
  try {
    const response = await fetchHttp(`${KABUM_BASE_URL}/busca/${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
      }
    });

    if (!response.ok) throw createHttpStatusError('KaBuM', response.status);

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
    return normalizeSourceFailure('KaBuM', error);
  }
}

module.exports = {
  kabumSource: {
    name: 'KaBuM',
    search: buscarKaBuM
  }
};
