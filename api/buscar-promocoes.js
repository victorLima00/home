const { buscarPromocoes } = require('../backend/services/promocoes-service');

function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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

    try {
        const results = await buscarPromocoes(itemName, notes);
        return res.status(200).json(results);
    } catch (error) {
        console.error('Erro na busca:', error);
        return res.status(500).json({
            error: 'Erro ao buscar promoções',
            message: error.message
        });
    }
};
