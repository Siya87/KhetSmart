import { useState } from "react";
import type { ConsultResponse } from "../api";
import type { AppLanguage } from "../hooks/useAppSettings";
import { glutLabelBnEn, tFarmer } from "../i18n/farmerSimple";
import { DistressPriceCard } from "./DistressPriceCard";
import { RouteFlow } from "./RouteFlow";
import { IconTruck } from "./icons";

type Props = {
  result: ConsultResponse;
  formatInr: (n: number) => string;
  selectedVendor?: any; // LogisticsVendor | null
  onViewFinance?: () => void;
  onShowAllVendors?: () => void;
  language?: AppLanguage;
};

function truncateStorage(name: string, max = 22) {
  if (name.length <= max) return name;
  return `${name.slice(0, max)}…`;
}

export function FarmerConsultResults({
  result,
  formatInr,
  selectedVendor = null,
  onViewFinance,
  onShowAllVendors,
  language = "bn",
}: Props) {
  const t = tFarmer(language);
  const glutWord = glutLabelBnEn(language, result.yield_signal.alert_level);
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [receiptId, setReceiptId] = useState(100000);

  // Calculations
  const quantity = result.parsed.quantity_quintals;
  const storageFee = quantity * 120; // Standard booking fee: ₹120 per quintal
  const logisticsCost = selectedVendor ? selectedVendor.estimated_quote_inr : result.route.logistics_cost_inr;
  const totalAmount = storageFee + logisticsCost;

  const handleCheckout = () => {
    setCheckoutLoading(true);
    const newReceiptId = Math.floor(100000 + Math.random() * 900000);
    setReceiptId(newReceiptId);

    const receiptContent = `
========================================
       KHETSMART BOOKING RECEIPT
========================================
Receipt Number: GRN-${newReceiptId}
Date:           ${new Date().toLocaleDateString()}
Time:           ${new Date().toLocaleTimeString()}
----------------------------------------
📍 PICKUP LOCATION (FARM):
District:       ${result.parsed.district || result.route.district || "Purba Bardhaman"}
GPS Position:   ${result.route.origin_lat?.toFixed(4)}°N, ${result.route.origin_lng?.toFixed(4)}°E
----------------------------------------
🏢 DELIVERY LOCATION (COLD STORAGE):
Facility Name:  ${result.route.storage_name}
District:       ${result.route.district}
GPS Position:   ${result.route.storage_lat?.toFixed(4)}°N, ${result.route.storage_lng?.toFixed(4)}°E
----------------------------------------
🥔 LOAD DETAILS:
Quantity:       ${quantity} Quintals
Crop Type:      ${result.parsed.crop}
----------------------------------------
💵 FARE BREAKDOWN:
Cold Storage Booking Fee:  ${formatInr(storageFee)}
Logistics Transport Fee:   ${formatInr(logisticsCost)}
----------------------------------------
TOTAL AMOUNT PAID:         ${formatInr(totalAmount)}
========================================
   Thank you for using KhetSmart!
========================================
    `;

    setTimeout(() => {
      // Trigger download
      const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `khetsmart_receipt_GRN-${newReceiptId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setCheckoutLoading(false);
      setCheckoutSuccess(true);
    }, 1200);
  };

  return (
    <div className="farmer-results farmer-results--simple animate-in">
      {checkoutSuccess && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fadeIn 0.3s ease-out"
          }}
        >
          <div
            style={{
              backgroundColor: "#1e293b",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "420px",
              width: "100%",
              textAlign: "center",
              border: "1px solid #3d8f5f",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "rgba(61, 143, 95, 0.2)",
                color: "#3d8f5f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                margin: "0 auto 12px auto"
              }}
            >
              ✓
            </div>
            
            <h3 style={{ color: "#fff", fontSize: "1.3rem", marginBottom: "4px" }}>
              {language === "bn" ? "বুকিং সফল হয়েছে!" : language === "hi" ? "बुकिंग सफल रही!" : "Booking Successful!"}
            </h3>
            
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "16px" }}>
              {language === "bn"
                ? "আপনার রসিদটি স্বয়ংক্রিয়ভাবে ডাউনলোড হয়েছে।"
                : "Your receipt has been automatically downloaded to your device."}
            </p>

            {/* VIRTUAL PAPER RECEIPT */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                color: "#0f172a",
                borderRadius: "12px",
                padding: "20px 16px",
                textAlign: "left",
                fontFamily: "monospace",
                fontSize: "0.78rem",
                lineHeight: "1.4",
                boxShadow: "inset 0 0 8px rgba(0,0,0,0.1)",
                marginBottom: "20px",
                border: "1px solid #cbd5e1"
              }}
            >
              <div style={{ textAlign: "center", borderBottom: "1px dashed #94a3b8", paddingBottom: "8px", marginBottom: "10px" }}>
                <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "bold", letterSpacing: "1px" }}>KHETSMART RECEIPT</h4>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>GRN-{receiptId} · {new Date().toLocaleDateString()}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div>
                  <strong style={{ color: "#475569", display: "block" }}>📍 PICKUP (FARM):</strong>
                  <span>District: {result.parsed.district || result.route.district || "Purba Bardhaman"}</span><br />
                  <span>GPS: {result.route.origin_lat?.toFixed(4)}°N, {result.route.origin_lng?.toFixed(4)}°E</span>
                </div>

                <div>
                  <strong style={{ color: "#475569", display: "block" }}>🏢 DELIVERY (STORAGE):</strong>
                  <span>Name: {result.route.storage_name}</span><br />
                  <span>District: {result.route.district}</span><br />
                  <span>GPS: {result.route.storage_lat?.toFixed(4)}°N, {result.route.storage_lng?.toFixed(4)}°E</span>
                </div>

                <div>
                  <strong style={{ color: "#475569", display: "block" }}>🥔 LOAD DETAILS:</strong>
                  <span>Quantity: {quantity} Quintals ({result.parsed.crop})</span>
                </div>

                <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "8px", marginTop: "4px" }}>
                  <strong style={{ color: "#475569", display: "block" }}>💵 FARE BREAKDOWN:</strong>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Cold Storage Booking Fee:</span>
                    <span>{formatInr(storageFee)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Logistics Transport Fee:</span>
                    <span>{formatInr(logisticsCost)}</span>
                  </div>
                </div>

                <div style={{ borderTop: "1px dashed #cbd5e1", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "0.85rem", color: "#0f172a" }}>
                  <span>TOTAL AMOUNT PAID:</span>
                  <span>{formatInr(totalAmount)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCheckoutSuccess(false)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#3d8f5f",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              {language === "bn" ? "ঠিক আছে" : language === "hi" ? "ठीक है" : "Done"}
            </button>
          </div>
        </div>
      )}

      <div className="farmer-results__header">
        <span className="farmer-results__badge">{t.planReady}</span>
        <h2 className="farmer-results__title">{t.planTitle}</h2>
      </div>

      <div className="simple-hero-strip">
        <div className="simple-hero-strip__item simple-hero-strip__item--gold">
          <span className="simple-hero-strip__lbl">{t.profit}</span>
          <strong>{formatInr(result.route.estimated_profit_inr)}</strong>
        </div>
        <div className="simple-hero-strip__item">
          <span className="simple-hero-strip__lbl">{t.glutLabel}</span>
          <strong>
            {result.yield_signal.glut_risk_pct}% · {glutWord}
          </strong>
        </div>
        <div className="simple-hero-strip__item">
          <span className="simple-hero-strip__lbl">{t.yourLoad}</span>
          <strong>
            {quantity} q · {result.parsed.crop}
          </strong>
        </div>
      </div>

      <section className="pro-card pro-card--route pro-card--simple">
        <div className="pro-card__head pro-card__head--with-action">
          <span className="pro-card__icon pro-card__icon--route">
            <IconTruck className="pro-card__icon-svg" />
          </span>
          <div className="pro-card__head-main">
            <h3 className="pro-card__title-simple">{t.transport}</h3>
          </div>
          {onShowAllVendors && (
            <button
              type="button"
              className="route-show-map route-show-map--head route-show-map--simple"
              onClick={onShowAllVendors}
            >
              <span className="route-show-map__icon" aria-hidden>
                🚛
              </span>
              {selectedVendor ? (language === "bn" ? "পরিবর্তন করুন" : "Change") : t.allVendors}
            </button>
          )}
        </div>
        <RouteFlow
          storageName={truncateStorage(result.route.storage_name)}
          storageNameFull={result.route.storage_name}
          distanceKm={result.route.distance_km}
          costInr={logisticsCost}
          profitInr={result.route.estimated_profit_inr}
          language={language}
          simple
        />
        <ul className="pro-checklist pro-checklist--simple">
          <li>
            {t.coldStorage}: {truncateStorage(result.route.storage_name, 36)}
          </li>
          <li>
            {selectedVendor ? (
              <span>
                {language === "bn" ? "নির্বাচিত ট্রাক পার্টনার" : "Chosen partner"}: <strong>{selectedVendor.name}</strong>
              </span>
            ) : (
              <span>{Math.round(result.route.distance_km)} {t.km} · {t.transportCost} {formatInr(logisticsCost)}</span>
            )}
          </li>
        </ul>
      </section>

      {result.price_comparison && result.price_comparison.uplift_vs_distress_inr > 0 && (
        <DistressPriceCard
          distressPerQ={result.price_comparison.distress_price_per_quintal}
          livePerQ={result.price_comparison.live_mandi_price_per_quintal}
          cultivationPerQ={result.price_comparison.cultivation_cost_per_quintal}
          quantityQ={result.price_comparison.quantity_quintals}
          revenueLive={result.price_comparison.revenue_at_live_inr}
          revenueDistress={result.price_comparison.revenue_at_distress_inr}
          uplift={result.price_comparison.uplift_vs_distress_inr}
          headline={result.price_comparison.headline}
          detail={result.price_comparison.detail}
          inDistressZone={result.price_comparison.in_distress_zone}
          simple
          language={language}
        />
      )}

      {onViewFinance && (
        <section className="pro-card pro-card--finance-teaser pro-card--simple">
          <div className="finance-teaser finance-teaser--simple">
            <div>
              <h3 className="pro-card__title-simple" style={{ color: "#d4af37", fontWeight: "bold" }}>
                ⚡ {language === "bn" ? "সম্পূর্ণ পেপারলেস ঋণ উপলব্ধ" : language === "hi" ? "बिना कागजी कार्रवाई का लोन उपलब्ध" : "Paperless Loan Available"}
              </h3>
              <p className="finance-teaser__line finance-teaser__line--big" style={{ fontSize: "1.2rem", marginTop: "4px" }}>
                {result.loan.approved
                  ? `${language === "bn" ? "অনুমোদিত রাশি" : language === "hi" ? "स्वीकृत राशि" : "Approved Amt"}: ${formatInr(result.loan.amount_inr)}`
                  : "—"}
              </p>
              <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                {result.loan.interest_rate_pa}% p.a. {language === "bn" ? "সুদের হার · ইনস্ট্যান্ট ব্যাংক ট্রান্সফার" : language === "hi" ? "ब्याज दर · तत्काल बैंक ट्रांसफर" : "interest · Instant bank transfer"}
              </span>
            </div>
            <button type="button" className="finance-teaser__btn finance-teaser__btn--lg" onClick={onViewFinance}>
              {t.loanBtn} →
            </button>
          </div>
        </section>
      )}

      {/* FINAL CHECKOUT & BOOKING CARD */}
      <section
        style={{
          marginTop: "20px",
          padding: "16px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          border: "1.5px dashed #e8b923",
          boxShadow: "0 4px 20px rgba(232, 185, 35, 0.15)",
          color: "#fff"
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#e8b923",
            fontWeight: "bold",
            marginBottom: "8px"
          }}
        >
          💳 {language === "bn" ? "ফাইনাল বুকিং সামারি" : "FINAL BOOKING SUMMARY"}
        </span>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
            <span style={{ color: "#94a3b8" }}>
              🏢 {language === "bn" ? "কোল্ড স্টোরেজ বুকিং ফি" : "Cold Storage Fee"} (₹120/q)
            </span>
            <span style={{ fontWeight: "bold" }}>
              {formatInr(storageFee)}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
            <span style={{ color: "#94a3b8" }}>
              🚛 {language === "bn" ? "লজিস্টিক পরিবহন ফি" : "Logistics Transport Fee"}
              {selectedVendor && <span style={{ fontSize: "0.75rem", display: "block", color: "#3d8f5f" }}>({selectedVendor.name})</span>}
            </span>
            <span style={{ fontWeight: "bold" }}>
              {formatInr(logisticsCost)}
            </span>
          </div>

          <div style={{ height: "1px", backgroundColor: "#334155", margin: "6px 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "1rem", fontWeight: "bold", color: "#f8fafc" }}>
              {language === "bn" ? "মোট প্রদেয় রাশি" : "Total Amount to Pay"}
            </span>
            <strong style={{ fontSize: "1.3rem", color: "#e8b923" }}>
              {formatInr(totalAmount)}
            </strong>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          disabled={checkoutLoading}
          style={{
            marginTop: "16px",
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#e8b923",
            color: "#0f172a",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(232, 185, 35, 0.4)",
            transition: "all 0.2s ease"
          }}
        >
          {checkoutLoading ? (
            <>
              <span className="spinner" style={{ borderColor: "#0f172a", borderTopColor: "transparent" }} />
              {language === "bn" ? "প্রসেসিং হচ্ছে…" : "Processing…"}
            </>
          ) : (
            <>
              ⚡ {language === "bn" ? "বুকিং নিশ্চিত করুন এবং পে করুন" : "Confirm Booking & Pay"}
            </>
          )}
        </button>
      </section>
    </div>
  );
}

export default FarmerConsultResults;
