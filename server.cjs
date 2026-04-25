require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bip39 = require("bip39");
const hdkey = require("hdkey");
const { ethers } = require("ethers");
const bitcoin = require("bitcoinjs-lib");
const { derivePath } = require("ed25519-hd-key");
const nacl = require("tweetnacl");
const { Keypair, Connection, PublicKey } = require("@solana/web3.js");

let TronWebImport = require("tronweb");
let TronWeb =
  TronWebImport?.default || TronWebImport?.TronWeb || TronWebImport;

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://cbscontrabetscore.com",
      "https://contrabetssore-cbc.web.app",
      "https://contrabetssore-cbc.firebaseapp.com",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

const MNEMONIC = process.env.MNEMONIC;
const PORT = process.env.PORT || 5000;

if (!MNEMONIC) {
  console.error("❌ MNEMONIC haipo kwenye .env");
  process.exit(1);
}

if (!bip39.validateMnemonic(MNEMONIC)) {
  console.error("❌ MNEMONIC sio sahihi");
  process.exit(1);
}

if (typeof TronWeb !== "function") {
  console.error("❌ TronWeb import failed");
  process.exit(1);
}

const fetchFn = (...args) =>
  typeof fetch !== "undefined"
    ? fetch(...args)
    : import("node-fetch").then(({ default: fetch }) => fetch(...args));

const seed = bip39.mnemonicToSeedSync(MNEMONIC);
const root = hdkey.fromMasterSeed(seed);

const tronWeb = new TronWeb({
  fullHost: process.env.TRON_RPC || "https://api.trongrid.io",
});

const ETH_RPC = process.env.ETH_RPC || "";
const BNB_RPC = process.env.BNB_RPC || "";
const SOL_RPC = process.env.SOL_RPC || "https://api.mainnet-beta.solana.com";

const USDT_TRC20_CONTRACT =
  process.env.USDT_TRC20_CONTRACT ||
  "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj";

const MAIN_TRON_ADDRESS = process.env.MAIN_TRON_ADDRESS || "";

const MAIN_TRC20_ADDRESS =
  process.env.MAIN_TRC20_ADDRESS || process.env.MAIN_TRON_ADDRESS || "";

const MAIN_EVM_ADDRESS = process.env.MAIN_EVM_ADDRESS || "";

const MAIN_BNB_ADDRESS =
  process.env.MAIN_BNB_ADDRESS || process.env.MAIN_EVM_ADDRESS || "";

const MAIN_SOL_ADDRESS = process.env.MAIN_SOL_ADDRESS || "";
const MAIN_BTC_ADDRESS = process.env.MAIN_BTC_ADDRESS || "";

const isValidIndex = (index) => {
  const n = Number(index);
  return Number.isInteger(n) && n >= 0 && n <= 2147483647;
};

function getETHWallet(index) {
  const path = `m/44'/60'/0'/0/${index}`;
  const wallet = ethers.HDNodeWallet.fromPhrase(MNEMONIC, undefined, path);

  return {
    network: "ERC20",
    coin: "ETH",
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

function getBNBWallet(index) {
  const path = `m/44'/60'/0'/0/${index}`;
  const wallet = ethers.HDNodeWallet.fromPhrase(MNEMONIC, undefined, path);

  return {
    network: "BEP20",
    coin: "BNB",
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

function getTRONWallet(index) {
  const path = `m/44'/195'/0'/0/${index}`;
  const child = root.derive(path);
  const privateKey = child.privateKey.toString("hex");
  const address = tronWeb.address.fromPrivateKey(privateKey);

  return {
    network: "TRON",
    coin: "TRX",
    address,
    privateKey,
  };
}

function getBTCWallet(index) {
  const path = `m/84'/0'/0'/0/${index}`;
  const child = root.derive(path);

  const { address } = bitcoin.payments.p2wpkh({
    pubkey: Buffer.from(child.publicKey),
    network: bitcoin.networks.bitcoin,
  });

  return {
    network: "BTC",
    coin: "BTC",
    address,
  };
}

function getSOLWallet(index) {
  const path = `m/44'/501'/${index}'/0'`;
  const derivedSeed = derivePath(path, MNEMONIC).key;
  const keyPair = nacl.sign.keyPair.fromSeed(derivedSeed);
  const solanaKeypair = Keypair.fromSecretKey(Buffer.from(keyPair.secretKey));

  return {
    network: "SOLANA",
    coin: "SOL",
    address: solanaKeypair.publicKey.toBase58(),
  };
}

function getAllWallets(index) {
  const tron = getTRONWallet(index);
  const eth = getETHWallet(index);
  const bnb = getBNBWallet(index);
  const sol = getSOLWallet(index);
  const btc = getBTCWallet(index);

  return {
    index: Number(index),

    TRC20: {
      network: "TRC20",
      coin: "USDT",
      address: tron.address,
    },

    TRON_TRX: {
      network: "TRON",
      coin: "TRX",
      address: tron.address,
    },

    ERC20: {
      network: "ERC20",
      coin: "ETH",
      address: eth.address,
    },

    BNB_BEP20: {
      network: "BEP20",
      coin: "BNB",
      address: bnb.address,
    },

    SOLANA: sol,

    BITCOIN: btc,
  };
}

async function getTRXBalance(index) {
  const wallet = getTRONWallet(index);
  const balance = await tronWeb.trx.getBalance(wallet.address);
  return Number(tronWeb.fromSun(balance));
}

async function getUSDTTRC20Balance(index) {
  const wallet = getTRONWallet(index);
  const contract = await tronWeb.contract().at(USDT_TRC20_CONTRACT);
  const balance = await contract.balanceOf(wallet.address).call();
  return Number(balance.toString()) / 1_000_000;
}

async function getEVMBalance(address, rpcUrl) {
  if (!rpcUrl) return null;

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const balance = await provider.getBalance(address);

  return Number(ethers.formatEther(balance));
}

async function getSOLBalance(address) {
  const connection = new Connection(SOL_RPC, "confirmed");
  const lamports = await connection.getBalance(new PublicKey(address));
  return lamports / 1_000_000_000;
}

async function sendTRX(fromIndex, toAddress, amount) {
  const wallet = getTRONWallet(fromIndex);

  const tronWebWithPK = new TronWeb({
    fullHost: process.env.TRON_RPC || "https://api.trongrid.io",
    privateKey: wallet.privateKey,
  });

  return await tronWebWithPK.trx.sendTransaction(
    toAddress,
    tronWeb.toSun(Number(amount))
  );
}

async function sendUSDTTRC20(fromIndex, toAddress, amount) {
  const wallet = getTRONWallet(fromIndex);

  const tronWebWithPK = new TronWeb({
    fullHost: process.env.TRON_RPC || "https://api.trongrid.io",
    privateKey: wallet.privateKey,
  });

  const contract = await tronWebWithPK.contract().at(USDT_TRC20_CONTRACT);
  const amountInSun = Math.floor(Number(amount) * 1_000_000);

  return await contract.transfer(toAddress, amountInSun).send({
    feeLimit: 100_000_000,
  });
}

/* =======================
   ROUTES
======================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Wallet server is running",
  });
});

app.post("/wallet", (req, res) => {
  try {
    const { index } = req.body;

    if (!isValidIndex(index)) {
      return res.status(400).json({
        success: false,
        error: "Valid index required",
      });
    }

    res.json({
      success: true,
      wallets: getAllWallets(Number(index)),
    });
  } catch (err) {
    console.error("WALLET ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Failed to generate wallets",
      details: err.message,
    });
  }
});

app.post("/admin/wallet-balances", async (req, res) => {
  try {
    const { index } = req.body;

    if (!isValidIndex(index)) {
      return res.status(400).json({
        success: false,
        error: "Valid index required",
      });
    }

    const walletIndex = Number(index);
    const wallets = getAllWallets(walletIndex);

    let trx = 0;
    let usdtTRC20 = 0;
    let eth = null;
    let bnb = null;
    let sol = null;

    try {
      trx = await getTRXBalance(walletIndex);
    } catch (e) {
      console.error("TRX BALANCE ERROR:", e.message);
    }

    try {
      usdtTRC20 = await getUSDTTRC20Balance(walletIndex);
    } catch (e) {
      console.error("USDT TRC20 BALANCE ERROR:", e.message);
    }

    try {
      eth = await getEVMBalance(wallets.ERC20.address, ETH_RPC);
    } catch (e) {
      console.error("ETH BALANCE ERROR:", e.message);
    }

    try {
      bnb = await getEVMBalance(wallets.BNB_BEP20.address, BNB_RPC);
    } catch (e) {
      console.error("BNB BALANCE ERROR:", e.message);
    }

    try {
      sol = await getSOLBalance(wallets.SOLANA.address);
    } catch (e) {
      console.error("SOL BALANCE ERROR:", e.message);
    }

    res.json({
      success: true,
      index: walletIndex,
      address: wallets.TRON_TRX.address,
      wallets,
      trx,
      usdt: usdtTRC20,
      balances: {
        TRX: trx,
        USDT_TRC20: usdtTRC20,
        ETH_ERC20: eth,
        BNB_BEP20: bnb,
        SOLANA: sol,
        BITCOIN: "Use BTC explorer/API",
      },
    });
  } catch (err) {
    console.error("BALANCES ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Failed to get balances",
      details: err.message,
    });
  }
});

app.post("/balance", async (req, res) => {
  try {
    const { index } = req.body;

    if (!isValidIndex(index)) {
      return res.status(400).json({
        success: false,
        error: "Valid index required",
      });
    }

    const walletIndex = Number(index);

    let trx = 0;
    let usdt = 0;

    try {
      trx = await getTRXBalance(walletIndex);
    } catch (e) {
      console.error("TRX BALANCE ERROR:", e.message);
    }

    try {
      usdt = await getUSDTTRC20Balance(walletIndex);
    } catch (e) {
      console.error("USDT BALANCE ERROR:", e.message);
    }

    res.json({
      success: true,
      index: walletIndex,
      trx,
      usdt,
    });
  } catch (err) {
    console.error("BALANCE ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Failed to get balance",
      details: err.message,
    });
  }
});

app.post("/send-trx", async (req, res) => {
  try {
    const { fromIndex, toAddress, amount } = req.body;

    if (!isValidIndex(fromIndex)) {
      return res.status(400).json({
        success: false,
        error: "Valid fromIndex required",
      });
    }

    if (!toAddress || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid data",
      });
    }

    const tx = await sendTRX(Number(fromIndex), toAddress, Number(amount));

    res.json({
      success: true,
      tx,
    });
  } catch (err) {
    console.error("SEND TRX ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Transaction failed",
      details: err.message,
    });
  }
});

app.post("/admin/sweep-trx-to-main", async (req, res) => {
  try {
    const { fromIndex, amount } = req.body;

    if (!MAIN_TRON_ADDRESS) {
      return res.status(400).json({
        success: false,
        error: "MAIN_TRON_ADDRESS missing in .env",
      });
    }

    if (!isValidIndex(fromIndex)) {
      return res.status(400).json({
        success: false,
        error: "Valid fromIndex required",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid amount required",
      });
    }

    const tx = await sendTRX(
      Number(fromIndex),
      MAIN_TRON_ADDRESS,
      Number(amount)
    );

    res.json({
      success: true,
      coin: "TRX",
      to: MAIN_TRON_ADDRESS,
      tx,
    });
  } catch (err) {
    console.error("SWEEP TRX ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Sweep failed",
      details: err.message,
    });
  }
});

app.post("/admin/sweep-usdt-trc20-to-main", async (req, res) => {
  try {
    const { fromIndex, amount } = req.body;

    if (!MAIN_TRC20_ADDRESS) {
      return res.status(400).json({
        success: false,
        error: "MAIN_TRC20_ADDRESS missing in .env",
      });
    }

    if (!isValidIndex(fromIndex)) {
      return res.status(400).json({
        success: false,
        error: "Valid fromIndex required",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid amount required",
      });
    }

    const tx = await sendUSDTTRC20(
      Number(fromIndex),
      MAIN_TRC20_ADDRESS,
      Number(amount)
    );

    res.json({
      success: true,
      coin: "USDT_TRC20",
      to: MAIN_TRC20_ADDRESS,
      tx,
    });
  } catch (err) {
    console.error("SWEEP USDT ERROR:", err);
    res.status(500).json({
      success: false,
      error: "USDT sweep failed. Wallet must have enough TRX for network fee.",
      details: err.message,
    });
  }
});

app.post("/admin/sweep-tron", async (req, res) => {
  try {
    const { fromIndex, coin, amount } = req.body;

    if (!isValidIndex(fromIndex)) {
      return res.status(400).json({
        success: false,
        error: "Valid fromIndex required",
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: "Valid amount required",
      });
    }

    if (coin === "TRX") {
      if (!MAIN_TRON_ADDRESS) {
        return res.status(400).json({
          success: false,
          error: "MAIN_TRON_ADDRESS missing in .env",
        });
      }

      const tx = await sendTRX(
        Number(fromIndex),
        MAIN_TRON_ADDRESS,
        Number(amount)
      );

      return res.json({
        success: true,
        coin: "TRX",
        to: MAIN_TRON_ADDRESS,
        tx,
      });
    }

    if (coin === "USDT_TRC20") {
      if (!MAIN_TRC20_ADDRESS) {
        return res.status(400).json({
          success: false,
          error: "MAIN_TRC20_ADDRESS missing in .env",
        });
      }

      const tx = await sendUSDTTRC20(
        Number(fromIndex),
        MAIN_TRC20_ADDRESS,
        Number(amount)
      );

      return res.json({
        success: true,
        coin: "USDT_TRC20",
        to: MAIN_TRC20_ADDRESS,
        tx,
      });
    }

    res.status(400).json({
      success: false,
      error: "Unsupported coin",
    });
  } catch (err) {
    console.error("SWEEP TRON ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Sweep failed",
      details: err.message,
    });
  }
});

app.get("/main", (req, res) => {
  try {
    res.json({
      success: true,
      mainAddresses: {
        TRON: MAIN_TRON_ADDRESS,
        TRC20: MAIN_TRC20_ADDRESS,
        EVM: MAIN_EVM_ADDRESS,
        BNB: MAIN_BNB_ADDRESS,
        SOLANA: MAIN_SOL_ADDRESS,
        BITCOIN: MAIN_BTC_ADDRESS,
      },
      mainWalletFromIndex0: getAllWallets(0),
    });
  } catch (err) {
    console.error("MAIN ERROR:", err);
    res.status(500).json({
      success: false,
      error: "Failed to get main wallet",
      details: err.message,
    });
  }
});

/* =======================
   LOGO PROXY
======================= */
app.get("/logo", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).send("No URL");

    const cleanUrl = decodeURIComponent(url);

    const headers = {
      "User-Agent": "Mozilla/5.0",
      Accept: "image/,/*;q=0.8",
      Referer: "https://www.sofascore.com/",
    };

    const urlsToTry = [cleanUrl];

    // SofaScore fallback
    const sofaMatch = cleanUrl.match(/team\/(\d+)\/image/);
    if (sofaMatch) {
      const teamId = sofaMatch[1];
      urlsToTry.push(`https://api.sofascore.com/api/v1/team/${teamId}/image`);
      urlsToTry.push(`https://img.sofascore.com/api/v1/team/${teamId}/image`);
    }

    // weserv fallback
    urlsToTry.push(
      `https://images.weserv.nl/?url=${cleanUrl.replace(/^https?:\/\//, "")}&w=120&h=120&fit=contain`
    );

    for (const u of urlsToTry) {
      try {
        const response = await fetchFn(u, { headers });

        if (!response.ok) continue;

        const contentType = response.headers.get("content-type") || "image/png";
        const buffer = await response.arrayBuffer();

        res.set("Content-Type", contentType);
        res.set("Cache-Control", "public, max-age=86400");
        return res.send(Buffer.from(buffer));
      } catch (e) {
        console.log("Logo try failed:", u);
      }
    }

    return res.status(404).send("Image not found");
  } catch (err) {
    console.error("LOGO ERROR:", err.message);
    res.status(500).send("Error loading image");
  }
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});