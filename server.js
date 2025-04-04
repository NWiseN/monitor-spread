const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const pairs = [
  "BTC/USDT", "ETH/USDT", "SOL/USDT", "OP/USDT", "AVAX/USDT", "APT/USDT",
  "ARB/USDT", "XRP/USDT", "DOGE/USDT", "ADA/USDT", "LTC/USDT", "MATIC/USDT",
  "PEPE/USDT", "INJ/USDT", "BNB/USDT", "WIF/USDT", "FLOKI/USDT", "TIA/USDT",
  "1000SATS/USDT", "SEI/USDT", "GRT/USDT", "FTM/USDT", "RNDR/USDT",
  "LDO/USDT", "SUI/USDT", "UNI/USDT", "RUNE/USDT", "DYDX/USDT", "CAKE/USDT",
  "NEAR/USDT", "AAVE/USDT", "LINK/USDT", "FIL/USDT", "TRX/USDT", "XLM/USDT",
  "ATOM/USDT", "ETC/USDT", "HBAR/USDT", "EGLD/USDT", "COMP/USDT", "ENS/USDT",
  "KAVA/USDT", "CELO/USDT", "ALGO/USDT", "ZIL/USDT", "BCH/USDT", "STX/USDT",
  "MINA/USDT", "GMX/USDT", "SAND/USDT"
];

app.get("/spreads", async (req, res) => {
  try {
    const headers = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/117.0.0.0 Safari/537.36",
      },
    };

    const [gateSpotAll, gateFutAll] = await Promise.all([
      axios.get("https://api.gate.io/api/v4/spot/tickers", headers),
      axios.get("https://api.gate.io/api/v4/futures/usdt/tickers", headers),
    ]);

    const gateSpotMap = {};
    gateSpotAll.data.forEach((ticker) => {
      gateSpotMap[ticker.currency_pair] = parseFloat(ticker.last);
    });

    const gateFutMap = {};
    gateFutAll.data.forEach((ticker) => {
      gateFutMap[ticker.contract] = parseFloat(ticker.last);
    });

    const result = pairs.map((pair) => {
      const spot = gateSpotMap[pair.replace("/", "_")];
      const future = gateFutMap[pair.replace("/", "_")];

      if (!spot || !future) return null;

      const spread = ((future - spot) / spot) * 100;

      return {
        pair,
        spot,
        future,
        spread: spread.toFixed(2),
      };
    }).filter(Boolean);

    res.json(result);
  } catch (error) {
    console.error("Erro geral ao buscar dados da Gate.io:", error.message);
    res.status(500).json({ error: "Erro ao buscar dados da Gate.io" });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
