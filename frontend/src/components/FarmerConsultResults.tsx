import { useState } from "react";
import type { ConsultOverrides, ConsultResponse } from "../api";
import type { AppLanguage } from "../hooks/useAppSettings";
import { glutLabelBnEn, tFarmer } from "../i18n/farmerSimple";
import { DistressPriceCard } from "./DistressPriceCard";
import { RouteFlow } from "./RouteFlow";
import { IconTruck } from "./icons";

type Props = {
  result: ConsultResponse;
  selection?: ConsultOverrides;
  planRefreshing?: boolean;
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
  selection,
  planRefreshing = false,
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<"razorpay" | "upi" | "cod" | "cash">("razorpay");
  const [confirmedPayment, setConfirmedPayment] = useState<string>("");

  const quantity = selection?.quantity_quintals ?? result.parsed.quantity_quintals;
  const cropLabel = selection?.crop ?? result.parsed.crop;
  const livePricePerQ = result.route.market_price_per_quintal;
  const baseQty = result.parsed.quantity_quintals || 50;
  const selectionDrift =
    quantity !== result.parsed.quantity_quintals ||
    cropLabel !== result.parsed.crop;
  const estLogistics =
    selectedVendor?.estimated_quote_inr ??
    Math.round((quantity / baseQty) * result.route.logistics_cost_inr);
  const profitInr =
    planRefreshing || selectionDrift
      ? Math.max(0, Math.round(quantity * livePricePerQ) - estLogistics)
      : result.route.estimated_profit_inr;
  const storageFee = quantity * 120; // Standard booking fee: ₹120 per quintal
  const logisticsCost = selectedVendor ? selectedVendor.estimated_quote_inr : result.route.logistics_cost_inr;
  const totalAmount = storageFee + logisticsCost;

  const startPaymentFlow = () => {
    setShowPaymentModal(true);
  };

  const handleCheckout = (paymentMethod: "razorpay" | "upi" | "cod" | "cash") => {
    setCheckoutLoading(true);
    setShowPaymentModal(false);
    const newReceiptId = Math.floor(100000 + Math.random() * 900000);
    setReceiptId(newReceiptId);

    let paymentLabel = "Razorpay (Online - Cards/Netbanking)";
    if (paymentMethod === "upi") paymentLabel = "Instant UPI (GPay/PhonePe/Paytm)";
    if (paymentMethod === "cod") paymentLabel = "Cash on Delivery (COD - Pay at Storage)";
    if (paymentMethod === "cash") paymentLabel = "Cash Payment (Direct at Farm)";

    setConfirmedPayment(paymentLabel);

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
💳 PAYMENT INFORMATION:
Payment Method: ${paymentLabel}
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

      // Save order to localStorage
      const newOrder = {
        id: `GRN-${newReceiptId}`,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        crop: result.parsed.crop,
        quantity: quantity,
        storageFee: storageFee,
        logisticsCost: logisticsCost,
        totalAmount: totalAmount,
        storageName: result.route.storage_name,
        storageDistrict: result.route.district,
        storageLat: result.route.storage_lat,
        storageLng: result.route.storage_lng,
        farmDistrict: result.parsed.district || result.route.district || "Purba Bardhaman",
        farmLat: result.route.origin_lat,
        farmLng: result.route.origin_lng,
        vendorName: selectedVendor?.name,
        status: "Stored in Cold Storage" as const,
        receiptContent: receiptContent,
        paymentMethod: paymentLabel,
      };

      const existingOrdersStr = localStorage.getItem("khetsmart_orders") || "[]";
      const existingOrders = JSON.parse(existingOrdersStr);
      existingOrders.unshift(newOrder);
      localStorage.setItem("khetsmart_orders", JSON.stringify(existingOrders));

      setCheckoutLoading(false);
      setCheckoutSuccess(true);
    }, 1800);
  };

  return (
    <div className="farmer-results farmer-results--simple animate-in">
      {showPaymentModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fadeIn 0.2s ease-out",
            color: "#0f172a"
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              maxWidth: "400px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden"
            }}
          >
            {/* Razorpay Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #3393df 0%, #1c66d5 100%)",
                color: "#fff",
                padding: "20px",
                textAlign: "left",
                position: "relative"
              }}
            >
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: "1.4rem",
                  cursor: "pointer"
                }}
              >
                ×
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "1.6rem" }}>💳</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "bold" }}>KhetSmart Checkout</h4>
                  <small style={{ opacity: 0.85, fontSize: "0.72rem" }}>Secure gateway by Razorpay</small>
                </div>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "1px" }}>Amount to Pay</span>
                <strong style={{ fontSize: "1.3rem" }}>{formatInr(totalAmount)}</strong>
              </div>
            </div>

            {/* Payment Options Selection Body */}
            <div style={{ padding: "20px" }}>
              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 16px 0", fontWeight: "bold", textAlign: "left", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Select Payment Method
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {/* Razorpay Card option */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px",
                    borderRadius: "10px",
                    border: `2px solid ${selectedPayment === "razorpay" ? "#1c66d5" : "#e2e8f0"}`,
                    backgroundColor: selectedPayment === "razorpay" ? "#f8fafc" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <input
                    type="radio"
                    name="payment_choice"
                    value="razorpay"
                    checked={selectedPayment === "razorpay"}
                    onChange={() => setSelectedPayment("razorpay")}
                    style={{ marginRight: "12px", width: "16px", height: "16px" }}
                  />
                  <div style={{ textAlign: "left" }}>
                    <strong style={{ display: "block", fontSize: "0.85rem", color: "#1e293b" }}>💳 Razorpay Secure Online</strong>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Pay via Cards, Netbanking, or Wallet</span>
                  </div>
                </label>

                {/* UPI option */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px",
                    borderRadius: "10px",
                    border: `2px solid ${selectedPayment === "upi" ? "#1c66d5" : "#e2e8f0"}`,
                    backgroundColor: selectedPayment === "upi" ? "#f8fafc" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <input
                    type="radio"
                    name="payment_choice"
                    value="upi"
                    checked={selectedPayment === "upi"}
                    onChange={() => setSelectedPayment("upi")}
                    style={{ marginRight: "12px", width: "16px", height: "16px" }}
                  />
                  <div style={{ textAlign: "left" }}>
                    <strong style={{ display: "block", fontSize: "0.85rem", color: "#1e293b" }}>📱 Instant UPI</strong>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Pay instantly via Google Pay, PhonePe, or Paytm</span>
                  </div>
                </label>

                {/* COD option */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px",
                    borderRadius: "10px",
                    border: `2px solid ${selectedPayment === "cod" ? "#1c66d5" : "#e2e8f0"}`,
                    backgroundColor: selectedPayment === "cod" ? "#f8fafc" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <input
                    type="radio"
                    name="payment_choice"
                    value="cod"
                    checked={selectedPayment === "cod"}
                    onChange={() => setSelectedPayment("cod")}
                    style={{ marginRight: "12px", width: "16px", height: "16px" }}
                  />
                  <div style={{ textAlign: "left" }}>
                    <strong style={{ display: "block", fontSize: "0.85rem", color: "#1e293b" }}>🚚 Cash on Delivery (COD)</strong>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Pay at cold storage during potato drop-off</span>
                  </div>
                </label>

                {/* Cash option */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px",
                    borderRadius: "10px",
                    border: `2px solid ${selectedPayment === "cash" ? "#1c66d5" : "#e2e8f0"}`,
                    backgroundColor: selectedPayment === "cash" ? "#f8fafc" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <input
                    type="radio"
                    name="payment_choice"
                    value="cash"
                    checked={selectedPayment === "cash"}
                    onChange={() => setSelectedPayment("cash")}
                    style={{ marginRight: "12px", width: "16px", height: "16px" }}
                  />
                  <div style={{ textAlign: "left" }}>
                    <strong style={{ display: "block", fontSize: "0.85rem", color: "#1e293b" }}>💵 Cash (Direct at Farm)</strong>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Hand cash payment to pickup truck driver</span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#fff",
                    color: "#475569",
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCheckout(selectedPayment)}
                  style={{
                    flex: 2,
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#1c66d5",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(28, 102, 213, 0.3)"
                  }}
                >
                  Confirm & Pay
                </button>
              </div>
            </div>

            {/* Razorpay Footer */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "12px",
                fontSize: "0.68rem",
                color: "#64748b",
                textAlign: "center",
                borderTop: "1px solid #e2e8f0"
              }}
            >
              🔒 PCI-DSS Compliant Secure Gateway
            </div>
          </div>
        </div>
      )}

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

                {confirmedPayment && (
                  <div>
                    <strong style={{ color: "#475569", display: "block" }}>💳 PAYMENT METHOD:</strong>
                    <select
                      value={confirmedPayment}
                      onChange={(e) => {
                        const newMethod = e.target.value;
                        setConfirmedPayment(newMethod);
                        const existingOrdersStr = localStorage.getItem("khetsmart_orders") || "[]";
                        const existingOrders = JSON.parse(existingOrdersStr);
                        if (existingOrders.length > 0) {
                          existingOrders[0].paymentMethod = newMethod;
                          let updatedReceipt = existingOrders[0].receiptContent;
                          const lines = updatedReceipt.split("\n");
                          const idx = lines.findIndex((l: string) => l.includes("Payment Method:"));
                          if (idx !== -1) {
                            lines[idx] = `Payment Method: ${newMethod}`;
                            updatedReceipt = lines.join("\n");
                          }
                          existingOrders[0].receiptContent = updatedReceipt;
                          localStorage.setItem("khetsmart_orders", JSON.stringify(existingOrders));
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "6px",
                        marginTop: "4px",
                        borderRadius: "6px",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.8rem",
                        backgroundColor: "#fff",
                        color: "#0f172a",
                        fontWeight: "bold",
                        fontFamily: "monospace"
                      }}
                    >
                      <option value="Razorpay (Online - Cards/Netbanking)">Razorpay Secure Online</option>
                      <option value="Instant UPI (GPay/PhonePe/Paytm)">Instant UPI</option>
                      <option value="Cash on Delivery (COD - Pay at Storage)">Cash on Delivery (COD)</option>
                      <option value="Cash Payment (Direct at Farm)">Cash (Direct at Farm)</option>
                    </select>
                  </div>
                )}

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

      <div
        className={`simple-hero-strip ${planRefreshing ? "simple-hero-strip--refreshing" : ""}`}
      >
        <div className="simple-hero-strip__item simple-hero-strip__item--gold">
          <span className="simple-hero-strip__lbl">{t.profit}</span>
          <strong>{planRefreshing ? "…" : formatInr(profitInr)}</strong>
          <span className="simple-hero-strip__sub">
            {planRefreshing
              ? t.updatingPlan
              : `${quantity} q × ₹${livePricePerQ.toLocaleString("en-IN")}/q − ${formatInr(estLogistics)} ${t.transportCost.toLowerCase()}`}
          </span>
        </div>
        <div className="simple-hero-strip__item">
          <span className="simple-hero-strip__lbl">{t.liveMandi}</span>
          <strong>
            ₹{livePricePerQ.toLocaleString("en-IN")}/q
          </strong>
          <span className="simple-hero-strip__sub">
            {result.route.market_name ?? "Corridor mandi"}
          </span>
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
            {quantity} q · {cropLabel}
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
          profitInr={profitInr}
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
          onClick={startPaymentFlow}
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
