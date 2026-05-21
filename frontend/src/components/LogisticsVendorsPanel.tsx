import type { LogisticsVendor } from "../api";
import { IconTruck } from "./icons";

type Props = {
  vendors: LogisticsVendor[];
  recommendedId?: string | null;
  destinationName?: string;
  quantityQ: number;
  routeDistanceKm?: number;
  loading?: boolean;
  onBack: () => void;
  formatInr: (n: number) => string;
};

export function LogisticsVendorsPanel({
  vendors,
  recommendedId,
  destinationName,
  quantityQ,
  routeDistanceKm,
  loading = false,
  onBack,
  formatInr,
}: Props) {
  return (
    <div className="logistics-vendors animate-in" role="region" aria-labelledby="logistics-vendors-title">
      <header className="logistics-vendors__banner">
        <button
          type="button"
          className="logistics-vendors__back"
          onClick={onBack}
          aria-label="Back to your corridor plan"
        >
          <span className="logistics-vendors__back-icon" aria-hidden>
            ←
          </span>
          Back to plan
        </button>
        <div className="logistics-vendors__banner-body">
          <span className="logistics-vendors__eyebrow">Transport partners</span>
          <h2 id="logistics-vendors-title" className="logistics-vendors__title">
            All logistics vendors
          </h2>
          <p className="logistics-vendors__sub">
            Hauliers who move your <strong>{quantityQ} q</strong> load to cold storage
            {destinationName ? (
              <>
                {" "}
                · <strong>{destinationName}</strong>
              </>
            ) : null}
            {routeDistanceKm != null ? <> · ~{routeDistanceKm} km corridor</> : null}
          </p>
        </div>
      </header>

      {loading && (
        <div className="loading-cards">
          <div className="skeleton skeleton--tall" />
          <div className="skeleton" />
        </div>
      )}

      {!loading && vendors.length === 0 && (
        <p className="logistics-vendors__empty">No transport vendors available right now.</p>
      )}

      {!loading && (
        <div className="logistics-vendors__list">
          {vendors.map((v) => {
            const isRecommended = v.id === recommendedId;
            const vehicles = v.vehicles.filter((veh) => veh.available > 0);

            return (
              <article
                key={v.id}
                className={`logistics-vendor-card ${isRecommended ? "logistics-vendor-card--rec" : ""} ${!v.can_carry_load ? "logistics-vendor-card--muted" : ""}`}
              >
                <div className="logistics-vendor-card__head">
                  <span className="logistics-vendor-card__icon" aria-hidden>
                    <IconTruck className="logistics-vendor-card__icon-svg" />
                  </span>
                  <div className="logistics-vendor-card__meta">
                    <strong>{v.name}</strong>
                    <span>
                      {v.district} · ★ {v.rating.toFixed(1)} · {v.pickup_distance_km} km to
                      farm
                    </span>
                  </div>
                  {isRecommended && (
                    <span className="logistics-vendor-card__badge">Best match</span>
                  )}
                </div>

                <div className="logistics-vendor-card__quote">
                  <span>Est. haul quote</span>
                  <strong>{formatInr(v.estimated_quote_inr)}</strong>
                  <span className="logistics-vendor-card__units">
                    {v.vehicles_available} vehicle{v.vehicles_available !== 1 ? "s" : ""}{" "}
                    free now
                  </span>
                </div>

                <div className="logistics-vendor-card__vehicles">
                  <p className="logistics-vendor-card__vehicles-label">Available vehicles</p>
                  <ul>
                    {vehicles.length === 0 ? (
                      <li className="logistics-vendor-card__vehicle logistics-vendor-card__vehicle--none">
                        No units free — call to reserve
                      </li>
                    ) : (
                      vehicles.map((veh) => (
                        <li key={`${v.id}-${veh.plate}`} className="logistics-vendor-card__vehicle">
                          <span className="logistics-vendor-card__vehicle-type">
                            {veh.type}
                          </span>
                          <span className="logistics-vendor-card__vehicle-cap">
                            up to {veh.capacity_quintals} q
                          </span>
                          <span className="logistics-vendor-card__vehicle-plate">
                            {veh.plate} · {veh.available} ready
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                <div className="logistics-vendor-card__services">
                  {v.services.map((s) => (
                    <span key={s} className="chip chip--outline">
                      {s}
                    </span>
                  ))}
                </div>

                <a className="logistics-vendor-card__call" href={`tel:${v.phone.replace(/\s/g, "")}`}>
                  Call {v.phone}
                </a>

                {!v.can_carry_load && (
                  <p className="logistics-vendor-card__warn">
                    May need multiple trips for {quantityQ} q — confirm with operator.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
