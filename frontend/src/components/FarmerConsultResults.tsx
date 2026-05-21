import type { ConsultResponse } from "../api";
import type { AppLanguage } from "../hooks/useAppSettings";
import { glutLabelBnEn, tFarmer } from "../i18n/farmerSimple";
import { DistressPriceCard } from "./DistressPriceCard";
import { GlutGauge } from "./GlutGauge";
import { RouteFlow } from "./RouteFlow";
import { IconTruck } from "./icons";

type Props = {
  result: ConsultResponse;
  formatInr: (n: number) => string;
  onViewFinance?: () => void;
  onShowAllVendors?: () => void;
  language?: AppLanguage;
};

function truncateStorage(name: string, max = 22) {
  if (name.length <= max) return name;
  return `${name.slice(0, max)}…`;
}

function FarmerConsultResults({
  result,
  formatInr,
  onViewFinance,
  onShowAllVendors,
  language = "bn",
}: Props) {
  const t = tFarmer(language);
  const glutWord = glutLabelBnEn(language, result.yield_signal.alert_level);

  return (
    <div className="farmer-results farmer-results--simple animate-in">
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
            {result.parsed.quantity_quintals} q · {result.parsed.crop}
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
              {t.allVendors}
            </button>
          )}
        </div>
        <RouteFlow
          storageName={truncateStorage(result.route.storage_name)}
          storageNameFull={result.route.storage_name}
          distanceKm={result.route.distance_km}
          costInr={result.route.logistics_cost_inr}
          profitInr={result.route.estimated_profit_inr}
          language={language}
          simple
        />
        <ul className="pro-checklist pro-checklist--simple">
          <li>
            {t.coldStorage}: {truncateStorage(result.route.storage_name, 36)}
          </li>
          <li>
            {Math.round(result.route.distance_km)} {t.km} · {t.transportCost}{" "}
            {formatInr(result.route.logistics_cost_inr)}
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
              <h3 className="pro-card__title-simple">{t.loan}</h3>
              <p className="finance-teaser__line finance-teaser__line--big">
                {result.loan.approved
                  ? formatInr(result.loan.amount_inr)
                  : "—"}
              </p>
            </div>
            <button type="button" className="finance-teaser__btn finance-teaser__btn--lg" onClick={onViewFinance}>
              {t.loanBtn} →
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export { FarmerConsultResults };
export default FarmerConsultResults;
