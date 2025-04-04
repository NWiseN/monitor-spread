const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const pairs = [
    { name: 'BTC/USDT', gate: 'BTC_USDT', gateFuture: 'BTC_USDT', mexc: 'BTCUSDT' },
    { name: 'ETH/USDT', gate: 'ETH_USDT', gateFuture: 'ETH_USDT', mexc: 'ETHUSDT' },
    { name: 'SOL/USDT', gate: 'SOL_USDT', gateFuture: 'SOL_USDT', mexc: 'SOLUSDT' },
];

async function getPrices() {
    const results = [];

    for (const pair of pairs) {
        try {
            const [gateSpotRes, gateFutRes, mexcSpotRes, mexcFutRes] = await Promise.all([
                axios.get(`https://api.gate.io/api/v4/spot/tickers?currency_pair=${pair.gate}`),
                axios.get(`https://api.gate.io/api/v4/futures/usdt/tickers/${pair.gateFuture}`),
                axios.get(`https://api.mexc.com/api/v3/ticker/bookTicker?symbol=${pair.mexc}`),
                axios.get(`https://contract.mexc.com/api/v1/contract/ticker?symbol=${pair.mexc}`)
            ]);

            const gateSpot = parseFloat(gateSpotRes.data.last);
            const gateFut = parseFloat(gateFutRes.data.last);
            const mexcSpot = parseFloat(mexcSpotRes.data.askPrice);
            const mexcFut = parseFloat(mexcFutRes.data.data.lastPrice);

            const gateSpread = ((gateFut - gateSpot) / gateSpot) * 100;
            const mexcSpread = ((mexcFut - mexcSpot) / mexcSpot) * 100;

            if (gateSpread >= 1 && mexcSpread >= 1) {
                results.push({
                    pair: pair.name,
                    gate: {
                        spot: gateSpot,
                        future: gateFut,
                        spread: gateSpread
                    },
                    mexc: {
                        spot: mexcSpot,
                        future: mexcFut,
                        spread: mexcSpread
                    }
                });
            }

        } catch (error) {
            console.error(`Erro ao buscar dados para ${pair.name}:`, error.message);
        }
    }

    return results;
}

app.get('/api/prices', async (req, res) => {
    try {
        const data = await getPrices();
        res.json(data);
    } catch {
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
