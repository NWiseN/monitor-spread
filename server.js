// server.js
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const pairs = [
  "BTC/USDT", "ETH/USDT", "SOL/USDT", "OP/USDT", "AVAX/USDT",
  "APT/USDT", "ARB/USDT", "XRP/USDT", "DOGE/USDT", "ADA/USDT",
  "LTC/USDT", "MATIC/USDT", "PEPE/USDT", "INJ/USDT", "BNB/USDT",
  "WIF/USDT", "FLOKI/USDT", "TIA/USDT", "1000SATS/USDT", "SEI/USDT",
  "SHIB/USDT", "DYDX/USDT", "SUI/USDT", "GMT/USDT", "BCH/USDT",
  "NEAR/USDT", "RNDR/USDT", "STX/USDT", "AAVE/USDT", "FIL/USDT",
  "UNI/USDT", "CRV/USDT", "XLM/USDT", "FTM/USDT", "CAKE/USDT",
  "ZIL/USDT", "MASK/USDT", "COMP/USDT", "ENS/USDT", "LDO/USDT",
  "AGIX/USDT", "CFX/USDT", "WOO/USDT", "LUNA/USDT", "GALA/USDT",
  "ONE/USDT", "TRX/USDT", "KAVA/USDT", "CHZ/USDT", "SAND/USDT"
];

async function getGatePrices(symbol) {
  try {
    const market = symbol.replace("/", "_").toUpperCase();

    const [spotRes, futuresRes] = await Promise.all([
      axios.get(`https://api.gate.io/api2/1/ticker/${market}`),
      axios.get(`https://api.gate.io/api/v4/futures/usdt/tickers`)
    ]);

    const futureData = futuresRes.data.find(f => f.name === market.replace("_", "."));

    if (!futureData) return null;

    return {
      pair: symbol,
      spot: parseFloat(spotRes.data.last),
      future: parseFloat(futureData.last),
      spread: parseFloat((futureData.last - spotRes.data.last).toFixed(4)),
      percentage: parseFloat(((futureData.last - spotRes.data.last) / spotRes.data.last * 100).toFixed(2))
    };
  } catch (err) {
    console.error(`Erro ao buscar dados para ${symbol}:`, err.message);
    return null;
  }
}

app.get("/api/gate", async (req, res) => {
  try {
    const data = await Promise.all(pairs.map(getGatePrices));
    res.json(data.filter(Boolean));
  } catch (err) {
    console.error("Erro geral ao buscar dados da Gate.io:", err.message);
    res.status(500).json({ error: "Erro ao buscar dados da Gate.io" });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
