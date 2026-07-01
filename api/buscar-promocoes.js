const cheerio = require('cheerio');

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function buscarMercadoLivre(query) {
    try {
        const response = await fetch(
            `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&sort=price_asc&limit=10`
        );

        if (!response.ok) throw new Error('ML API error');

        const data = await response.json();

        return {
            source: 'Mercado Livre',
            results: (data.results || []).slice(0, 8).map((item) => ({
                id: item.id,
                title: item.title,
                price: item.price,
                currency_id: item.currency_id,
                permalink: item.permalink,
                thumbnail: item.thumbnail,
                condition: item.condition,
                seller_name: item.seller && item.seller.nickname,
                shipping: item.shipping && item.shipping.free_shipping ? 'Frete Grátis' : 'Frete a calcular'
            }))
        };
    } catch (error) {
        console.error('Erro em Mercado Livre:', error.message);
        return { source: 'Mercado Livre', results: [], error: error.message };
    }
}

function normalizarTermos(texto) {
    return (texto || '')
        .toLowerCase()
        .replace(/[.,;:!?()\[\]{}"'`]/g, ' ')
        .split(/\s+/)
        .map((termo) => termo.trim())
        .filter(Boolean)
        .filter((termo) => termo.length > 2)
        .filter((termo) => !['que', 'uma', 'um', 'para', 'com', 'sem', 'pra', 'e', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'tipo', 'parece', 'imita'].includes(termo));
}

function construirConsultas(itemName, notes) {
    const termosNotas = normalizarTermos(notes).slice(0, 4);
    const consultas = [];

    if (itemName && termosNotas.length > 0) {
        consultas.push(`${itemName} ${termosNotas.join(' ')}`.trim());
    }

    if (itemName) {
        consultas.push(itemName.trim());
    }

    if (termosNotas.length > 0) {
        consultas.push(termosNotas.join(' '));
    }

    return [...new Set(consultas)];
}

async function buscarAmazon(query) {
    try {
        const searchUrl = `https://www.amazon.com.br/s?k=${encodeURIComponent(query)}`;

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) throw new Error('Amazon error');

        const html = await response.text();
        const $ = cheerio.load(html);

        const results = [];
        $('[data-component-type="s-search-result"]').each((index, element) => {
            if (results.length >= 8) return;

            const title = $(element).find('h2 a span').text().trim();
            const priceText = $(element).find('.a-price-whole').text().trim();
            const link = $(element).find('h2 a').attr('href');
            const image = $(element).find('img').attr('src');

            if (title && priceText) {
                results.push({
                    title,
                    price: parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')),
                    link: link ? `https://www.amazon.com.br${link}` : '#',
                    image,
                    source: 'Amazon'
                });
            }
        });

        return {
            source: 'Amazon',
            results
        };
    } catch (error) {
        console.error('Erro em Amazon:', error.message);
        return { source: 'Amazon', results: [], error: error.message };
    }
}

async function buscarMagazineLuiza(query) {
    try {
        const searchUrl = `https://www.magazineluiza.com.br/busca/${encodeURIComponent(query)}/`;

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) throw new Error('Magazine Luiza error');

        const html = await response.text();
        const $ = cheerio.load(html);

        const results = [];
        $('[data-testid="product-item"]').each((index, element) => {
            if (results.length >= 8) return;

            const title = $(element).find('[data-testid="product-title"]').text().trim();
            const priceText = $(element).find('[data-testid="product-price"]').text().trim();
            const link = $(element).find('a').attr('href');
            const image = $(element).find('img').attr('src');

            if (title && priceText) {
                results.push({
                    title,
                    price: parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')),
                    link: link || '#',
                    image,
                    source: 'Magazine Luiza'
                });
            }
        });

        return {
            source: 'Magazine Luiza',
            results
        };
    } catch (error) {
        console.error('Erro em Magazine Luiza:', error.message);
        return { source: 'Magazine Luiza', results: [], error: error.message };
    }
}

module.exports = async (req, res) => {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { itemName, notes } = req.body || {};

    if (!itemName) {
        return res.status(400).json({ error: 'itemName é obrigatório' });
    }

    const consultas = construirConsultas(itemName, notes);
    const queryPrincipal = consultas[0] || itemName;

    try {
        const fontes = [buscarMercadoLivre, buscarAmazon, buscarMagazineLuiza];
        const sources = [];

        for (const fonte of fontes) {
            let resultadoFonte = { results: [] };

            for (const consulta of consultas) {
                resultadoFonte = await fonte(consulta);
                if (resultadoFonte.results && resultadoFonte.results.length > 0) {
                    resultadoFonte.searchUsed = consulta;
                    break;
                }
            }

            if (resultadoFonte.results && resultadoFonte.results.length > 0) {
                sources.push(resultadoFonte);
            }
        }

        return res.status(200).json({
            query: queryPrincipal,
            consultas,
            timestamp: new Date().toISOString(),
            sources
        });
    } catch (error) {
        console.error('Erro na busca:', error);
        return res.status(500).json({
            error: 'Erro ao buscar promoções',
            message: error.message
        });
    }
};
