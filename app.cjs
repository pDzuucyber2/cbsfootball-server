const { TronWeb } = require('tronweb');
const bip39 = require('bip39');
const hdkey = require('hdkey');

// 🔐 WEKA SEED PHRASE YAKO (MUHIMU SANA)
const mnemonic = "rival banner turkey curve position wash input warfare jungle wing lake outside";

// STEP 1: seed
const seed = bip39.mnemonicToSeedSync(mnemonic);
const root = hdkey.fromMasterSeed(seed);

// TRON path
const BASE_PATH = "m/44'/195'/0'/0/";

// TronWeb
const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io'
});


// 🔑 1. GET ADDRESS
function getAddress(index) {
  const child = root.derive(BASE_PATH + index);
  const privateKey = child.privateKey.toString('hex');
  return tronWeb.address.fromPrivateKey(privateKey);
}


// 🔐 2. GET PRIVATE KEY
function getPrivateKey(index) {
  const child = root.derive(BASE_PATH + index);
  return child.privateKey.toString('hex');
}


// 💰 3. SEND TRX (WITHDRAW TEST)
async function sendTRX(fromIndex, toAddress, amount) {
  try {
    const privateKey = getPrivateKey(fromIndex);

    const tronWebWithPK = new TronWeb({
      fullHost: 'https://api.trongrid.io',
      privateKey: privateKey
    });

    const tx = await tronWebWithPK.trx.sendTransaction(
      toAddress,
      tronWeb.toSun(amount) // TRX → SUN
    );

    console.log("✅ Transaction sent:", tx);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}


// 🧪 TEST

// Generate users
const user1 = getAddress(0);
const user2 = getAddress(1);

console.log("User 1:", user1);
console.log("User 2:", user2);

// Private keys
console.log("User 1 PK:", getPrivateKey(0));
console.log("User 2 PK:", getPrivateKey(1));


// ⚠️ TEST SEND (hakikisha una TRX kwenye wallet)
// mfano: tuma 1 TRX kutoka user1 kwenda user2

// sendTRX(0, user2, 1);