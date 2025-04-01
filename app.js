const express = require('express');
const axios = require('axios');
const cache = require('memory-cache');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/ticker/price', async (req, res) => {
    const symbol = req.query.symbol || 'BTCUSDT';
    const cacheKey = `price_${symbol}`;

    // Verifica se o valor está no cache
    const cachedPrice = cache.get(cacheKey);
    if (cachedPrice) {
        return res.json({
            symbol,
            price: cachedPrice,
            fromCache: true
        });
    }

    try {
        const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        const price = response.data.price;

        // Armazena no cache por 5 minutos
        cache.put(cacheKey, price, 5 * 60 * 1000);

        res.json({
            symbol,
            price,
            fromCache: false
        });
    } catch (error) {
        res.status(500).json({
            error: 'Erro ao consultar a API da Binance.'
        });
    }
});

app.get('/clear-cache', (req, res) => {
    cache.clear();
    res.json({
        message: 'Cache limpo com sucesso!'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

