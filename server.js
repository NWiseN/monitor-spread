const express = require('express');
const axios = require('axios');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Ignora verificação de SSL apenas para chamadas da Gate.io (teste)
const agent = new https.Agent({ rejectUnauthorized: false });

const pairs = [
    { name: 'BTC/USDT', gate: 'BTC_USDT', mexc: 'BTCUSDT' },
    { name: 'ETH/USDT', gate: 'ETH_USDT', mexc: 'ETHUSDT' },
    { name: 'SOL/USDT', gate: 'SOL_USDT', mexc: 'SOLUSDT' },
];

async function getPrices() {
    const results = [];

    for (const pair of pairs) {
        try {
            const [gateSpotRes, gateFutRes, mexcSpotRes, mexcFutRes] = await Promise.all([
                axios.get(`https://api.gate.io/api/v4/spot/tickers?currency_pair=${pair.gate}`, { httpsAgent: agent }),
                axios.get(`https://api.gate.io/api/v4/futures/usdt/tickers?contract=${pair.gate}`, { httpsAgent: agent }),
                axios.get(`https://api.mexc.com/api/v3/ticker/bookTicker?symbol=${pair.mexc}`),
                axios.get(`https://contract.mexc.com/api/v1/contract/ticker?symbol=${pair.gate}`)
            ]);

            const gateSpot = parseFloat(gateSpotRes.data[0].last);
            const gateFut = parseFloat(gateFutRes.data.last);
            const mexcSpot = parseFloat(mexcSpotRes.data.askPrice);
            const mexcFut = parseFloat(mexcFutRes.data.data.lastPrice);

            const gateSpread = ((gateFut - gateSpot) / gateSpot) * 100;
            const mexcSpread = ((mexcFut - mexcSpot) / mexcSpot) * 100;

            // Adiciona somente se spread >= 1% em ambas
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
