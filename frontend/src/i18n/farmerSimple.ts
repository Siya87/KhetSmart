import type { AppLanguage } from "../hooks/useAppSettings";

export const FARMER_SIMPLE = {
  en: {
    speakOrWrite: "Speak or write",
    quickPick: "Quick pick",
    quantity: "How much? (quintals)",
    crop: "Which potato?",
    moreCrops: "More types",
    getRoute: "Get route",
    planReady: "Your plan is ready",
    planTitle: "Best plan for you",
    glutLabel: "Market pressure",
    yourLoad: "Your harvest",
    transport: "Truck & cold storage",
    allVendors: "Choose",
    chooseVendor: "Select",
    selectedVendor: "Selected",
    profit: "You may earn",
    liveMandi: "Live mandi price",
    updatingPlan: "Updating live price…",
    farm: "Your farm",
    coldStorage: "Cold storage",
    km: "km",
    transportCost: "Transport cost",
    betterPrice: "Better than distress sell",
    notDistressSell: "not distress sell",
    loan: "Small loan",
    loanBtn: "See loan",
    tapMic: "Tap to speak",
    stopMic: "Stop listening",
    listening: "Listening… speak now",
    cropJyoti: "Jyoti potato",
    cropPotato: "Potato",
    cropChipsona: "Chipsona",
    cropKufri: "Kufri Jyoti",
    glutLow: "Low",
    glutMid: "Medium",
    glutHigh: "High",
    farmGps: "Your farm location on",
    farmGpsOff: "GPS is off",
    enableGps: "Turn on GPS",
    gpsLive: "Live GPS",
    gpsAcquiring: "Finding your farm…",
    gpsUpdated: "Updated",
    gpsOffHint: "Routes work best from your field location",
    gpsFarmLive: "Your farm · live GPS",
    gpsShowMap: "Map",
    gpsHideMap: "Hide",
    yourFarm: "Your farm",
    nearFarm: "Near",
    setLocation: "Set farm location",
    locationTitle: "Allow your farm location",
    locationSub:
      "KhetSmart needs GPS to route your harvest to the nearest cold storage from your field.",
    locationAllow: "Allow location",
    locationBusy: "Getting location…",
    locationSkip: "Not now (use default area)",
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
    unitQuintal: "q",
  },
  bn: {
    speakOrWrite: "বলুন বা লিখুন",
    quickPick: "দ্রুত বেছে নিন",
    quantity: "কত কুইন্টাল?",
    crop: "কোন আলু?",
    moreCrops: "আরও ধরন",
    getRoute: "রুট দেখুন",
    planReady: "আপনার প্ল্যান তৈরি",
    planTitle: "আপনার জন্য সেরা প্ল্যান",
    glutLabel: "বাজার চাপ",
    yourLoad: "আপনার ফসল",
    transport: "গাড়ি ও কোল্ড স্টোরেজ",
    allVendors: "বাছুন",
    chooseVendor: "বেছে নিন",
    selectedVendor: "বাছা হয়েছে",
    profit: "আয় হতে পারে",
    liveMandi: "লাইভ মান্ডি দাম",
    updatingPlan: "লাইভ দাম আপডেট…",
    farm: "আপনার খামার",
    coldStorage: "কোল্ড স্টোরেজ",
    km: "কিমি",
    transportCost: "পরিবহন খরচ",
    betterPrice: "বিপন্ন বিক্রির চেয়ে ভালো",
    notDistressSell: "বিপন্ন বিক্রি নয়",
    loan: "ক্ষুদ্র ঋণ",
    loanBtn: "ঋণ দেখুন",
    tapMic: "বলতে চাপুন",
    stopMic: "বন্ধ করুন",
    listening: "শুনছি… এখন বলুন",
    cropJyoti: "জ্যোতি আলু",
    cropPotato: "আলু",
    cropChipsona: "চিপসোনা",
    cropKufri: "কুফরি জ্যোতি",
    glutLow: "কম",
    glutMid: "মাঝারি",
    glutHigh: "বেশি",
    farmGps: "খামারের লোকেশন চালু",
    farmGpsOff: "GPS বন্ধ",
    enableGps: "GPS চালু",
    gpsLive: "লাইভ GPS",
    gpsAcquiring: "খামার খুঁজছি…",
    gpsUpdated: "আপডেট",
    gpsOffHint: "মাঠের লোকেশনে রুট সবচেয়ে ঠিক",
    gpsFarmLive: "আপনার খামার · লাইভ GPS",
    gpsShowMap: "ম্যাপ",
    gpsHideMap: "লুকান",
    yourFarm: "আপনার খামার",
    nearFarm: "কাছে",
    setLocation: "খামারের লোকেশন সেট করুন",
    locationTitle: "খামারের লোকেশন দিন",
    locationSub:
      "আপনার মাঠ থেকে কাছের কোল্ড স্টোরেজে রুট দেখাতে GPS দরকার।",
    locationAllow: "লোকেশন অনুমতি",
    locationBusy: "লোকেশন নিচ্ছি…",
    locationSkip: "এখন নয় (ডিফল্ট এলাকা)",
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
    unitQuintal: "কুই",
    vehicleBig: "বড় ট্রাক",
    vehicleTractor: "ট্রাক্টর ট্রেলার",
    vehicleSmall: "ছোট ট্রাক",
  },
  hi: {
    speakOrWrite: "बोलें या लिखें",
    quickPick: "जल्दी चुनें",
    quantity: "कितने क्विंटल?",
    crop: "कौन सा आलू?",
    moreCrops: "और किस्में",
    getRoute: "रास्ता देखें",
    planReady: "आपकी योजना तैयार",
    planTitle: "आपके लिए सबसे अच्छी योजना",
    glutLabel: "बाजार दबाव",
    yourLoad: "आपकी फसल",
    transport: "ट्रक और कोल्ड स्टोरेज",
    allVendors: "चुनें",
    chooseVendor: "चुनें",
    selectedVendor: "चुना गया",
    profit: "कमाई हो सकती है",
    liveMandi: "लाइव मंडी भाव",
    updatingPlan: "लाइव भाव अपडेट…",
    farm: "आपका खेत",
    coldStorage: "कोल्ड स्टोरेज",
    km: "किमी",
    transportCost: "ढुलाई खर्च",
    betterPrice: "मजबूर बिक्री से बेहतर",
    notDistressSell: "मजबूर बिक्री नहीं",
    loan: "छोटा ऋण",
    loanBtn: "ऋण देखें",
    tapMic: "बोलने के लिए दबाएं",
    stopMic: "बंद करें",
    listening: "सुन रहा हूँ… अब बोलें",
    cropJyoti: "ज्योति आलू",
    cropPotato: "आलू",
    cropChipsona: "चिपसोना",
    cropKufri: "कुफरी ज्योति",
    glutLow: "कम",
    glutMid: "मध्यम",
    glutHigh: "ज्यादा",
    farmGps: "खेत की लोकेशन चालू",
    farmGpsOff: "GPS बंद है",
    enableGps: "GPS चालू करें",
    gpsLive: "लाइव GPS",
    gpsAcquiring: "खेत ढूँढ रहे हैं…",
    gpsUpdated: "अपडेट",
    gpsOffHint: "खेत की लोकेशन पर रास्ता सबसे सही",
    gpsFarmLive: "आपका खेत · लाइव GPS",
    gpsShowMap: "मैप",
    gpsHideMap: "छुपाएँ",
    yourFarm: "आपका खेत",
    nearFarm: "पास",
    setLocation: "खेत की लोकेशन सेट करें",
    locationTitle: "खेत की लोकेशन दें",
    locationSub:
      "आपके खेत से नजदीकी कोल्ड स्टोरेज का रास्ता दिखाने के लिए GPS चाहिए।",
    locationAllow: "लोकेशन की अनुमति",
    locationBusy: "लोकेशन ले रहे हैं…",
    locationSkip: "अभी नहीं (डिफॉल्ट क्षेत्र)",
    vendorsTitle: "ट्रक भाड़ा",
    vendorsBack: "योजना पर वापस",
    vendorsSub: "आपका आलू कोल्ड स्टोरेज तक",
    vendorsBest: "आपके लिए सबसे अच्छा",
    vendorsPrice: "भाड़ा",
    vendorsTrucks: "ट्रक खाली",
    vendorsCall: "फोन करें",
    vendorsKm: "किमी दूर",
    vendorsNoTruck: "फोन से बुक करें",
    vendorsEmpty: "अभी कोई ट्रक नहीं",
    vehicleBig: "बड़ा ट्रक",
    vehicleTractor: "ट्रैक्टर ट्रेलर",
    vehicleSmall: "छोटा ट्रक",
    unitQuintal: "क्विं",
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
  if (lang === "bn") return "ট্রাক";
  if (lang === "hi") return "ट्रक";
  return "Truck";
}

export function vehicleSummary(
  vehicles: { type: string; capacity_quintals: number; available: number }[],
  lang: AppLanguage
): string {
  const ready = vehicles.filter((v) => v.available > 0);
  if (ready.length === 0) return FARMER_SIMPLE[lang].vendorsNoTruck;
  const top = ready[0];
  const label = shortVehicleLabel(top.type, lang);
  return `${label} · ${top.capacity_quintals} ${FARMER_SIMPLE[lang].unitQuintal}`;
}

export const PREDICT_SIMPLE = {
  en: {
    title: "Potato market watch",
    glut: "Too much potato in market",
    next: "What to do",
    map: "See storages on map",
    mandi: "Mandi price",
    storage: "Storages full",
    storageFull: "full",
  },
  bn: {
    title: "আলুর বাজার খবর",
    glut: "বাজারে আলু বেশি",
    next: "এখন কী করবেন",
    map: "ম্যাপে স্টোরেজ দেখুন",
    mandi: "মান্ডি দাম",
    storage: "স্টোরেজ ভর্তি",
    storageFull: "ভর্তি",
  },
  hi: {
    title: "आलू बाजार खबर",
    glut: "बाजार में आलू ज्यादा",
    next: "अब क्या करें",
    map: "मैप पर स्टोरेज देखें",
    mandi: "मंडी भाव",
    storage: "स्टोरेज भरा",
    storageFull: "भरा",
  },
} as const;

export const NAV_LABELS = {
  en: { farmer: "Farmer", predict: "Predict", network: "Network", finance: "Finance", orders: "Orders" },
  bn: { farmer: "ফার্মার", predict: "বাজার", network: "ম্যাপ", finance: "ঋণ", orders: "অর্ডার" },
  hi: { farmer: "किसान", predict: "बाजार", network: "मैप", finance: "पैसा", orders: "ऑर्डर" },
} as const;

export function tNav(lang: AppLanguage) {
  return NAV_LABELS[lang];
}

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
