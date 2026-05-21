import { useEffect, useState } from "react";
import { fetchAuctions, type MandiAuction } from "../api";
import type { ConsultResponse } from "../api";
import type { AppLanguage } from "../hooks/useAppSettings";
import { tFinance } from "../i18n/financeSimple";

type Props = {
  result: ConsultResponse | null;
  language: AppLanguage;
  formatInr: (n: number) => string;
};

export function FinanceAuctionPanel({ result, language, formatInr }: Props) {
  const t = tFinance(language);
  const [auctions, setAuctions] = useState<MandiAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAuctions({
      crop: result?.parsed.crop ?? "Potato",
      district: result?.parsed.district ?? undefined,
      quantity_quintals: result?.parsed.quantity_quintals,
    })
      .then((data) => setAuctions(data.auctions))
      .catch(() => setAuctions([]))
      .finally(() => setLoading(false));
  }, [result]);

  function handleBid() {
    setToast(t.bidSent);
    window.setTimeout(() => setToast(null), 3500);
  }

  if (loading) {
    return <div className="skeleton skeleton--tall" />;
  }

  return (
    <div className="finance-section finance-section--auction">
      <p className="finance-section__lead">{t.auctionSub}</p>
      {toast && <p className="finance-toast">{toast}</p>}

      <div className="finance-card-list">
        {auctions.map((a) => {
          const isLive = a.status === "live";
          const estTotal = a.current_bid_per_quintal * a.quantity_quintals;
          return (
            <article
              key={a.id}
              className={`finance-offer-card ${isLive ? "finance-offer-card--live" : ""}`}
            >
              <div className="finance-offer-card__head">
                <strong>{a.mandi_name}</strong>
                <span className={`finance-offer-card__status ${isLive ? "finance-offer-card__status--live" : ""}`}>
                  {isLive ? t.liveNow : a.status}
                </span>
              </div>
              <p className="finance-offer-card__meta">
                {a.district} · {a.quantity_quintals} q · {a.grade}
              </p>
              <div className="finance-offer-card__nums finance-offer-card__nums--auction">
                <span>
                  {t.startingPrice}: ₹{a.start_price_per_quintal}/q
                </span>
                <span className="finance-offer-card__bid">
                  {t.currentBid}: <strong>₹{a.current_bid_per_quintal}/q</strong>
                </span>
              </div>
              <p className="finance-offer-card__total">
                ~{formatInr(estTotal)} {t.total}
              </p>
              <p className="finance-offer-card__meta">
                {a.bidders} {t.bidders} · {t.ends} {a.ends_in_hours} {t.hours}
              </p>
              {result &&
                result.parsed.quantity_quintals <= a.quantity_quintals + 30 &&
                result.parsed.quantity_quintals >= a.quantity_quintals - 80 && (
                  <p className="finance-offer-card__match">{t.yourLot} {result.parsed.quantity_quintals} q</p>
                )}
              <button
                type="button"
                className="btn-primary finance-offer-card__btn"
                onClick={handleBid}
                disabled={!isLive}
              >
                {t.placeBid}
              </button>
            </article>
          );
        })}
      </div>
      <p className="finance-disclaimer">{t.disclaimer}</p>
    </div>
  );
}
