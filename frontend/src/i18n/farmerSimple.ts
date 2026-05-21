import type { AppLanguage } from "../hooks/useAppSettings";

export const FARMER_SIMPLE = {
  en: {
    speakOrWrite: "Speak or write",
    quickPick: "Quick pick",
    quantity: "How much? (quintals)",
    crop: "Which potato?",
    moreCrops: "More types",
    getRoute: "Get route + loan",
    planReady: "Your plan is ready",
    planTitle: "Best plan for you",
    glutLabel: "Market pressure",
    yourLoad: "Your harvest",
    transport: "Truck & cold storage",
    allVendors: "All truck vendors",
    profit: "You may earn",
    farm: "Your farm",
    coldStorage: "Cold storage",
    km: "km",
    transportCost: "Transport cost",
    betterPrice: "Better than distress sell",
    loan: "Small loan",
    loanBtn: "See loan",
    typeOptional: "Type yourself (optional)",
    listening: "Listening… speak now",
    cropJyoti: "Jyoti potato",
    cropPotato: "Potato",
    cropChipsona: "Chipsona",
    cropKufri: "Kufri Jyoti",
    glutLow: "Low",
    glutMid: "Medium",
    glutHigh: "High",
    farmGps: "Your farm location on",
    farmGpsOff: "Turn on location for route",
    enableGps: "On",
    vendorsTitle: "Truck partners",
    vendorsBack: "Back to plan",
    vendorsSub: "Trucks for your load to cold storage",
    vendorsBest: "Best for you",
    vendorsPrice: "Transport price",
    vendorsTrucks: "trucks free",
    vendorsCall: "Call now",
    vendorsKm: "km from farm",
    vendorsNoTruck: "Call to book",
    vendorsEmpty: "No trucks available now",
    vehicleBig: "Big truck",
    vehicleTractor: "Tractor trailer",
    vehicleSmall: "Small truck",
  },
  bn: {
    speakOrWrite: "বলুন বা লিখুন",
    quickPick: "দ্রুত বেছে নিন",
    quantity: "কত কুইন্টাল?",
    crop: "কোন আলু?",
    moreCrops: "আরও ধরন",
    getRoute: "রুট + ঋণ দেখুন",
    planReady: "আপনার প্ল্যান তৈরি",
    planTitle: "আপনার জন্য সেরা প্ল্যান",
    glutLabel: "বাজার চাপ",
    yourLoad: "আপনার ফসল",
    transport: "গাড়ি ও কোল্ড স্টোরেজ",
    allVendors: "সব ট্রাক ভেন্ডর",
    profit: "আয় হতে পারে",
    farm: "আপনার খামার",
    coldStorage: "কোল্ড স্টোরেজ",
    km: "কিমি",
    transportCost: "পরিবহন খরচ",
    betterPrice: "বিপন্ন বিক্রির চেয়ে ভালো",
    loan: "ক্ষুদ্র ঋণ",
    loanBtn: "ঋণ দেখুন",
    typeOptional: "নিজে লিখুন (ঐচ্ছিক)",
    listening: "শুনছি… এখন বলুন",
    cropJyoti: "জ্যোতি আলু",
    cropPotato: "আলু",
    cropChipsona: "চিপসোনা",
    cropKufri: "কুফরি জ্যোতি",
    glutLow: "কম",
    glutMid: "মাঝারি",
    glutHigh: "বেশি",
    farmGps: "খামারের লোকেশন চালু",
    farmGpsOff: "রুটের জন্য লোকেশন চালু করুন",
    enableGps: "চালু",
    vendorsTitle: "ট্রাক ভাড়া",
    vendorsBack: "প্ল্যানে ফিরুন",
    vendorsSub: "আপনার আলু কোল্ড স্টোরেজে নিয়ে যাবে",
    vendorsBest: "আপনার জন্য সেরা",
    vendorsPrice: "ভাড়া",
    vendorsTrucks: "গাড়ি খালি",
    vendorsCall: "ফোন করুন",
    vendorsKm: "কিমি দূরে",
    vendorsNoTruck: "ফোন করে বুক করুন",
    vendorsEmpty: "এখন কোনো ট্রাক নেই",
    vehicleBig: "বড় ট্রাক",
    vehicleTractor: "ট্রাক্টর ট্রেলার",
    vehicleSmall: "ছোট ট্রাক",
  },
} as const;

function shortVehicleLabel(type: string, lang: AppLanguage): string {
  const t = FARMER_SIMPLE[lang];
  const lower = type.toLowerCase();
  if (lower.includes("10-wheel") || lower.includes("6-wheel")) return t.vehicleBig;
  if (lower.includes("tractor") || lower.includes("trailer")) return t.vehicleTractor;
  if (lower.includes("mini") || lower.includes("ace") || lower.includes("pickup") || lower.includes("bolero")) {
    return t.vehicleSmall;
  }
  return lang === "bn" ? "ট্রাক" : "Truck";
}

export function vehicleSummary(
  vehicles: { type: string; capacity_quintals: number; available: number }[],
  lang: AppLanguage
): string {
  const ready = vehicles.filter((v) => v.available > 0);
  if (ready.length === 0) return FARMER_SIMPLE[lang].vendorsNoTruck;
  const top = ready[0];
  const label = shortVehicleLabel(top.type, lang);
  return `${label} · ${top.capacity_quintals} ${lang === "bn" ? "কুই" : "q"}`;
}

export const PREDICT_SIMPLE = {
  en: {
    title: "Potato market watch",
    glut: "Too much potato in market",
    next: "What to do",
    map: "See storages on map",
    mandi: "Mandi price",
    storage: "Storages full",
  },
  bn: {
    title: "আলুর বাজার খবর",
    glut: "বাজারে আলু বেশি",
    next: "এখন কী করবেন",
    map: "ম্যাপে স্টোরেজ দেখুন",
    mandi: "মান্ডি দাম",
    storage: "স্টোরেজ ভর্তি",
  },
} as const;

export function tFarmer(lang: AppLanguage) {
  return FARMER_SIMPLE[lang];
}

export function tPredict(lang: AppLanguage) {
  return PREDICT_SIMPLE[lang];
}

export function glutLabelBnEn(lang: AppLanguage, level: string) {
  const t = tFarmer(lang);
  if (level === "HIGH") return t.glutHigh;
  if (level === "MEDIUM") return t.glutMid;
  return t.glutLow;
}
