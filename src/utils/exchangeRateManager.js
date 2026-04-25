import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const API_URL = "https://api.exchangerate-api.com/v4/latest/USD";
const COLLECTION_NAME = "exchangeRatesHistory";

function withManualCurrencies(rates = {}) {
  return {
    ...rates,
    USD: 1,
    USDT: 1, // treat USDT = USD
  };
}

export async function fetchLatestRatesFromApi() {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error("Failed to fetch exchange rates");
  }

  const data = await res.json();

  if (!data || !data.rates) {
    throw new Error("Rates data not found");
  }

  return {
    base: data.base || "USD",
    rates: withManualCurrencies(data.rates),
    provider: "ExchangeRate-API",
  };
}

export async function getLatestSavedRateDoc() {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  const docSnap = snap.docs[0];
  return {
    id: docSnap.id,
    ...docSnap.data(),
  };
}

export async function saveCurrentRatesSnapshot() {
  const latest = await fetchLatestRatesFromApi();

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    base: latest.base,
    rates: latest.rates,
    provider: latest.provider,
    createdAt: serverTimestamp(),
    createdAtMs: Date.now(),
  });

  return {
    id: docRef.id,
    ...latest,
    createdAtMs: Date.now(),
  };
}

export async function ensureHourlyRateSnapshot() {
  const lastDoc = await getLatestSavedRateDoc();

  if (!lastDoc) {
    return await saveCurrentRatesSnapshot();
  }

  const now = Date.now();
  const lastTime = Number(lastDoc.createdAtMs || 0);
  const oneHour = 60 * 60 * 1000;

  if (!lastTime || now - lastTime >= oneHour) {
    return await saveCurrentRatesSnapshot();
  }

  return lastDoc;
}

export async function getPreviousHourRateSnapshot() {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy("createdAt", "desc"),
    limit(10)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error("Hakuna rate history iliyohifadhiwa bado");
  }

  const docs = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  let target = null;

  for (const item of docs) {
    const t = Number(item.createdAtMs || 0);
    if (t && t <= oneHourAgo) {
      target = item;
      break;
    }
  }

  // fallback: kama hakuna ya saa 1 nyuma kabisa, tumia ya zamani zaidi iliyopo
  if (!target) {
    target = docs[docs.length - 1];
  }

  if (!target?.rates) {
    throw new Error("Rate snapshot haijapatikana");
  }

  return target;
}

export function convertCurrency(amount, fromCurrency, toCurrency, rates) {
  const num = Number(amount);
  if (!num || num <= 0) return 0;

  const from = String(fromCurrency || "").toUpperCase();
  const to = String(toCurrency || "").toUpperCase();

  if (from === to) return num;

  let usdAmount = 0;

  if (from === "USD" || from === "USDT") {
    usdAmount = num;
  } else {
    const fromRate = Number(rates?.[from] || 0);
    if (!fromRate) throw new Error(`Rate ya ${from} haipo`);
    usdAmount = num / fromRate;
  }

  if (to === "USD" || to === "USDT") {
    return usdAmount;
  }

  const toRate = Number(rates?.[to] || 0);
  if (!toRate) throw new Error(`Rate ya ${to} haipo`);

  return usdAmount * toRate;
}