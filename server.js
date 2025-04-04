process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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
  { name: 'AVAX/USDT', gate: 'AVAX_USDT', mexc: 'AVAXUSDT' },
  { name: 'APT/USDT', gate: 'APT_USDT', mexc: 'APTUSDT' },
  { name: 'ARB/USDT', gate: 'ARB_USDT', mexc: 'ARBUSDT' },
  { name: 'XRP/USDT', gate: 'XRP_USDT', mexc: 'XRPUSDT' },
  { name: 'DOGE/USDT', gate: 'DOGE_USDT', mexc: 'DOGEUSDT' },
  { name: 'ADA/USDT', gate: 'ADA_USDT', mexc: 'ADAUSDT' },
  { name: 'LTC/USDT', gate: 'LTC_USDT', mexc: 'LTCUSDT' },
  { name: 'MATIC/USDT', gate: 'MATIC_USDT', mexc: 'MATICUSDT' },
  { name: 'PEPE/USDT', gate: 'PEPE_USDT', mexc: 'PEPEUSDT' },
  { name: 'INJ/USDT', gate: 'INJ_USDT', mexc: 'INJUSDT' },
  { name: 'BNB/USDT', gate: 'BNB_USDT', mexc: 'BNBUSDT' },
  { name: 'WIF/USDT', gate: 'WIF_USDT', mexc: 'WIFUSDT' },
  { name: 'FLOKI/USDT', gate: 'FLOKI_USDT', mexc: 'FLOKIUSDT' },
  { name: 'TIA/USDT', gate: 'TIA_USDT', mexc: 'TIAUSDT' },
  { name: '1000SATS/USDT', gate: '1000SATS_USDT', mexc: '1000SATSUSDT' },
  { name: 'SEI/USDT', gate: 'SEI_USDT', mexc: 'SEIUSDT' }
];

async function getPrices() {
  const results = [];

  try {
    const [gateSpotAll, gateFutAll] = await Promise.all([
      axios.get(`https://api.gate.io/api/v4/spot/tickers`),
      axios.get(`https://api.gate.io/api/v4/futures/usdt/tickers`)
    ]);

    const gateSpotMap = {};
    gateSpotAll.data.forEach(ticker => {
      gateSpotMap[ticker.currency_pair] = parseFloat(ticker.last);
    });

    const gateFutMap = {};
    gateFutAll.data.forEach(ticker => {
      gateFutMap[ticker.contract] = parseFloat(ticker.last);
    });

    for (const pair of pairs) {
      try {
        const [mexcSpotRes, mexcFutRes] = await Promise.all([
          axios.get(`https://api.mexc.com/api/v3/ticker/bookTicker?symbol=${pair.mexc}`),
          axios.get(`https://contract.mexc.com/api/v1/contract/ticker?symbol=${pair.gate}`)
        ]);

        const gateSpot = gateSpotMap[pair.gate];
        const gateFut = gateFutMap[pair.gate];
        const mexcSpot = parseFloat(mexcSpotRes.data.askPrice);
        const mexcFut = parseFloat(mexcFutRes.data.data.lastPrice);

        if (!gateSpot || !gateFut) throw new Error('Dados da Gate.io ausentes');

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
      } catch (innerError) {
        console.error(`Erro ao processar ${pair.name}:`, innerError.message);
      }
    }
  } catch (error) {
    console.error('Erro geral ao buscar dados da Gate.io:', error.message);
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
