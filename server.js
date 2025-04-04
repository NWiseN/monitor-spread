const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

const pairs = [
    { name: 'BTC/USDT', gate: 'BTC_USDT', mexc: 'BTCUSDT' },
    { name: 'ETH/USDT', gate: 'ETH_USDT', mexc: 'ETHUSDT' },
    { name: 'SOL/USDT', gate: 'SOL_USDT', mexc: 'SOLUSDT' },
    { name: 'OP/USDT', gate: 'OP_USDT', mexc: 'OPUSDT' },
    { name: 'ARB/USDT', gate: 'ARB_USDT', mexc: 'ARBUSDT' },
    { name: 'BLUR/USDT', gate: 'BLUR_USDT', mexc: 'BLURUSDT' },
    { name: 'FET/USDT', gate: 'FET_USDT', mexc: 'FETUSDT' },
    { name: 'INJ/USDT', gate: 'INJ_USDT', mexc: 'INJUSDT' },
    { name: 'RNDR/USDT', gate: 'RNDR_USDT', mexc: 'RNDRUSDT' },
    { name: 'APT/USDT', gate: 'APT_USDT', mexc: 'APTUSDT' },
    { name: 'SUI/USDT', gate: 'SUI_USDT', mexc: 'SUIUSDT' },
    { name: 'PEPE/USDT', gate: 'PEPE_USDT', mexc: 'PEPEUSDT' },
    { name: 'LDO/USDT', gate: 'LDO_USDT', mexc: 'LDOUSDT' },
    { name: 'DYDX/USDT', gate: 'DYDX_USDT', mexc: 'DYDXUSDT' },
    { name: 'MAGIC/USDT', gate: 'MAGIC_USDT', mexc: 'MAGICUSDT' },
    { name: '1000SATS/USDT', gate: '1000SATS_USDT', mexc: '1000SATSUSDT' },
    { name: 'HOOK/USDT', gate: 'HOOK_USDT', mexc: 'HOOKUSDT' },
    { name: 'CFX/USDT', gate: 'CFX_USDT', mexc: 'CFXUSDT' },
    { name: 'WOO/USDT', gate: 'WOO_USDT', mexc: 'WOOUSDT' },
    { name: 'GMX/USDT', gate: 'GMX_USDT', mexc: 'GMXUSDT' },
    { name: 'LINA/USDT', gate: 'LINA_USDT', mexc: 'LINAUSDT' },
    { name: 'TOMO/USDT', gate: 'TOMO_USDT', mexc: 'TOMOUSDT' },
    { name: 'MAV/USDT', gate: 'MAV_USDT', mexc: 'MAVUSDT' },
    { name: 'SSV/USDT', gate: 'SSV_USDT', mexc: 'SSVUSDT' },
    { name: 'STX/USDT', gate: 'STX_USDT', mexc: 'STXUSDT' },
    { name: 'ID/USDT', gate: 'ID_USDT', mexc: 'IDUSDT' },
    { name: 'XVS/USDT', gate: 'XVS_USDT', mexc: 'XVSUSDT' },
    { name: 'CTSI/USDT', gate: 'CTSI_USDT', mexc: 'CTSIUSDT' },
    { name: 'AGIX/USDT', gate: 'AGIX_USDT', mexc: 'AGIXUSDT' },
    { name: 'BICO/USDT', gate: 'BICO_USDT', mexc: 'BICOUSDT' },
    { name: 'BAND/USDT', gate: 'BAND_USDT', mexc: 'BANDUSDT' },
    { name: 'HIGH/USDT', gate: 'HIGH_USDT', mexc: 'HIGHUSDT' },
    { name: 'BEL/USDT', gate: 'BEL_USDT', mexc: 'BELUSDT' },
    { name: 'FLM/USDT', gate: 'FLM_USDT', mexc: 'FLMUSDT' },
    { name: 'SFP/USDT', gate: 'SFP_USDT', mexc: 'SFPUSDT' },
    { name: 'TWT/USDT', gate: 'TWT_USDT', mexc: 'TWTUSDT' },
    { name: 'MDT/USDT', gate: 'MDT_USDT', mexc: 'MDTUSDT' },
    { name: 'ONG/USDT', gate: 'ONG_USDT', mexc: 'ONGUSDT' },
    { name: 'POND/USDT', gate: 'POND_USDT', mexc: 'PONDUSDT' },
    { name: 'QKC/USDT', gate: 'QKC_USDT', mexc: 'QKCUSDT' },
    { name: 'CTK/USDT', gate: 'CTK_USDT', mexc: 'CTKUSDT' },
    { name: 'BETA/USDT', gate: 'BETA_USDT', mexc: 'BETAUSDT' },
    { name: 'PERP/USDT', gate: 'PERP_USDT', mexc: 'PERPUSDT' },
    { name: 'LIT/USDT', gate: 'LIT_USDT', mexc: 'LITUSDT' },
    { name: 'PHA/USDT', gate: 'PHA_USDT', mexc: 'PHAUSDT' },
    { name: 'FLOKI/USDT', gate: 'FLOKI_USDT', mexc: 'FLOKIUSDT' },
    { name: 'RAY/USDT', gate: 'RAY_USDT', mexc: 'RAYUSDT' },
    { name: 'VRA/USDT', gate: 'VRA_USDT', mexc: 'VRAUSDT' },
    { name: 'ZIL/USDT', gate: 'ZIL_USDT', mexc: 'ZILUSDT' }
];

async function getPrices() {
    const results = [];

    for (const pair of pairs) {
        try {
            const [gateSpotRes, gateFutRes, mexcSpotRes, mexcFutRes] = await Promise.all([
                axios.get(`https://api.gate.io/api/v4/spot/tickers?currency_pair=${pair.gate}`),
                axios.get(`https://api.gate.io/api/v4/futures/usdt/tickers?contract=${pair.gate}`),
                axios.get(`https://api.mexc.com/api/v3/ticker/bookTicker?symbol=${pair.mexc}`),
                axios.get(`https://contract.mexc.com/api/v1/contract/ticker?symbol=${pair.gate}`)
            ]);

            const gateSpot = parseFloat(gateSpotRes.data[0].last);
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
