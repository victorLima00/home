const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ==================== MERCADO LIVRE API ====================

async function buscarMercadoLivre(query) {
    try {
        const response = await fetch(
            `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(query)}&sort=price_asc&limit=10`,
            { timeout: 10000 }
        );
        
        if (!response.ok) throw new Error('ML API error');
        
        const data = await response.json();
        
        return {
            source: 'Mercado Livre',
            results: (data.results || []).slice(0, 8).map(item => ({
                id: item.id,
                title: item.title,
                price: item.price,
                currency_id: item.currency_id,
                permalink: item.permalink,
                thumbnail: item.thumbnail,
                condition: item.condition,
                seller_name: item.seller.nickname,
                shipping: item.shipping.free_shipping ? 'Frete Grátis' : 'Frete a calcular'
            }))
        };
    } catch (error) {
        console.error('Erro em Mercado Livre:', error.message);
        return { source: 'Mercado Livre', results: [], error: error.message };
    }
}

// ==================== AMAZON SCRAPING SIMPLES ====================

async function buscarAmazon(query) {
    try {
        const searchUrl = `https://www.amazon.com.br/s?k=${encodeURIComponent(query)}`;
        
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
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
                    title: title,
                    price: parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')),
                    link: link ? `https://www.amazon.com.br${link}` : '#',
                    image: image,
                    source: 'Amazon'
                });
            }
        });
        
        return {
            source: 'Amazon',
            results: results
        };
    } catch (error) {
        console.error('Erro em Amazon:', error.message);
        return { source: 'Amazon', results: [], error: error.message };
    }
}

// ==================== MAGAZINE LUIZA SCRAPING ====================

async function buscarMagazineLuiza(query) {
    try {
        const searchUrl = `https://www.magazineluiza.com.br/busca/${encodeURIComponent(query)}/`;
        
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
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
                    title: title,
                    price: parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')),
                    link: link || '#',
                    image: image,
                    source: 'Magazine Luiza'
                });
            }
        });
        
        return {
            source: 'Magazine Luiza',
            results: results
        };
    } catch (error) {
        console.error('Erro em Magazine Luiza:', error.message);
        return { source: 'Magazine Luiza', results: [], error: error.message };
    }
}

// ==================== MAIN ENDPOINT ====================

app.post('/api/buscar-promocoes', async (req, res) => {
    const { itemName, notes } = req.body;
    
    if (!itemName) {
        return res.status(400).json({ error: 'itemName é obrigatório' });
    }
    
    // Formatar query com as notas
    const query = notes ? `${itemName} ${notes}` : itemName;
    
    console.log(`🔍 Buscando: "${query}"`);
    
    try {
        // Fazer buscas em paralelo
        const [mlResults, amazonResults, magazineResults] = await Promise.all([
            buscarMercadoLivre(query),
            buscarAmazon(query),
            buscarMagazineLuiza(query)
        ]);
        
        const results = {
            query: query,
            timestamp: new Date().toISOString(),
            sources: [mlResults, amazonResults, magazineResults].filter(s => s.results.length > 0)
        };
        
        console.log(`✅ Resultados encontrados: ${results.sources.length} fontes`);
        res.json(results);
    } catch (error) {
        console.error('Erro na busca:', error);
        res.status(500).json({ 
            error: 'Erro ao buscar promoções',
            message: error.message 
        });
    }
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== STARTUP ====================

app.listen(PORT, () => {
    console.log('');
    console.log('🚀 Servidor de Promoções iniciado!');
    console.log(`📍 Rodando em: http://localhost:${PORT}`);
    console.log(`🔍 Endpoint: POST http://localhost:${PORT}/api/buscar-promocoes`);
    console.log('');
    console.log('Exemplo de request:');
    console.log(JSON.stringify({
        itemName: 'Sofá',
        notes: 'azul, 3 lugares'
    }, null, 2));
    console.log('');
});

// ==================== GRACEFUL SHUTDOWN ====================

process.on('SIGTERM', () => {
    console.log('⛔ SIGTERM recebido. Encerrando...');
    process.exit(0);
});
