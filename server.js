const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const pairs = [
    { name: 'BTC/USDT', gate: 'BTC_USDT', mexc: 'BTC_USDT' },
    { name: 'ETH/USDT', gate: 'ETH_USDT', mexc: 'ETH_USDT' },
    { name: 'SOL/USDT', gate: 'SOL_USDT', mexc: 'SOL_USDT' },
];

async function getPrices() {
    const results = [];

    for (const pair of pairs) {
        try {
            const [gateSpotRes, gateFutRes, mexcSpotRes, mexcFutList] = await Promise.all([
                axios.get(`https://api.gate.io/api/v4/spot/tickers?currency_pair=${pair.gate}`),
                axios.get(`https://api.gate.io/api/v4/futures/usdt/tickers?contract=${pair.gate}`),
                axios.get(`https://api.mexc.com/api/v3/ticker/bookTicker?symbol=${pair.mexc.replace('_', '')}`),
                axios.get(`https://contract.mexc.com/api/v1/contract/ticker`)
            ]);

            const gateSpot = parseFloat(gateSpotRes.data.last);
            const gateFut = parseFloat(gateFutRes.data.last);

            const mexcSpot = parseFloat(mexcSpotRes.data.askPrice);

            const mexcFutData = mexcFutList.data.data.find(d => d.symbol === pair.mexc);
            if (!mexcFutData) throw new Error(`Par ${pair.mexc} não encontrado nos futuros da MEXC`);

            const mexcFut = parseFloat(mexcFutData.lastPrice);

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
