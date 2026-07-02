const express = require('express');
const cors = require('cors');
const { buscarPromocoes } = require('./backend/services/promocoes-service');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/buscar-promocoes', async (req, res) => {
    const { itemName, notes } = req.body || {};

    if (!itemName) {
        return res.status(400).json({ error: 'itemName é obrigatório' });
    }

    try {
        const results = await buscarPromocoes(itemName, notes);
        const totalComResultado = results.sources.filter((source) => source.results.length > 0).length;

        console.log(`🔍 Buscando: "${results.query}"`);
        console.log(`✅ Resultados encontrados: ${totalComResultado} fontes`);

        return res.status(200).json(results);
    } catch (error) {
        console.error('Erro na busca:', error);
        return res.status(500).json({
            error: 'Erro ao buscar promoções',
            message: error.message
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

process.on('SIGTERM', () => {
    console.log('⛔ SIGTERM recebido. Encerrando...');
    process.exit(0);
});
