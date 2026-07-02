const fetch = require('node-fetch');
const cheerio = require('cheerio');

const ZOOM_BASE_URL = 'https://www.zoom.com.br';
const KABUM_BASE_URL = 'https://www.kabum.com.br';

function limparTexto(texto) {
    return String(texto || '').replace(/\s+/g, ' ').trim();
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

async function buscarZoom(query) {
    try {
        const response = await fetch(`${ZOOM_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
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
            const priceText = limparTexto(card.find('[data-testid="product-card::price"]').first().text());
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
        const response = await fetch(`${KABUM_BASE_URL}/busca/${encodeURIComponent(query)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
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
            const priceText = limparTexto(card.find('[data-testid="product-card::price"]').first().text());
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

async function buscarComFallback(fonte, consultas) {
    const attempts = [];
    let ultimoErro = null;

    for (const consulta of consultas) {
        const resultado = await fonte(consulta);
        const total = Array.isArray(resultado.results) ? resultado.results.length : 0;

        attempts.push({
            query: consulta,
            total,
            error: resultado.error || null
        });

        if (total > 0) {
            return {
                ...resultado,
                status: 'success',
                searchUsed: consulta,
                attempts
            };
        }

        if (resultado.error) {
            ultimoErro = resultado.error;
        }
    }

    return {
        source: attempts[0] ? undefined : 'Fonte',
        results: [],
        status: ultimoErro ? 'error' : 'empty',
        error: ultimoErro,
        searchUsed: consultas[0] || '',
        attempts
    };
}

async function buscarPromocoes(itemName, notes) {
    const consultas = construirConsultas(itemName, notes);
    const queryPrincipal = consultas[0] || itemName;

    const fontes = [buscarZoom, buscarKaBuM];
    const resultados = await Promise.all(fontes.map((fonte) => buscarComFallback(fonte, consultas)));

    const sources = resultados.map((resultado, index) => ({
        source: resultado.source || (index === 0 ? 'Zoom' : 'KaBuM'),
        results: Array.isArray(resultado.results) ? resultado.results : [],
        status: resultado.status || (resultado.results && resultado.results.length > 0 ? 'success' : 'empty'),
        error: resultado.error || null,
        searchUsed: resultado.searchUsed || consultas[0] || itemName,
        attempts: Array.isArray(resultado.attempts) ? resultado.attempts : []
    }));

    return {
        query: queryPrincipal,
        consultas,
        timestamp: new Date().toISOString(),
        sources
    };
}

module.exports = {
    buscarPromocoes
};
