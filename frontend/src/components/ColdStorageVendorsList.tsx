import { useMemo } from "react";
import type { ColdStorage } from "../api";

type Props = {
  storages: ColdStorage[];
  recommendedName?: string;
  recommendedId?: string;
  selectedId?: string | null;
  onSelect?: (storage: ColdStorage) => void;
};

export function ColdStorageVendorsList({
  storages,
  recommendedName,
  recommendedId,
  selectedId,
  onSelect,
}: Props) {
  const sorted = useMemo(() => {
    const isRecommended = (s: ColdStorage) =>
      (recommendedId && s.id === recommendedId) ||
      (recommendedName && s.name === recommendedName);

    return [...storages].sort((a, b) => {
      const aRec = isRecommended(a) ? 1 : 0;
      const bRec = isRecommended(b) ? 1 : 0;
      if (aRec !== bRec) return bRec - aRec;
      if (a.utilization_pct !== b.utilization_pct) {
        return a.utilization_pct - b.utilization_pct;
      }
      return b.available_quintals - a.available_quintals;
    });
  }, [storages, recommendedId, recommendedName]);

  return (
    <section className="vendors-panel" aria-label="All cold storage vendors">
      <div className="vendors-panel__head">
        <div>
          <span className="vendors-panel__eyebrow">Cold storage vendors</span>
          <h3 className="vendors-panel__title">
            {sorted.length} facilities · West Bengal
          </h3>
        </div>
        {recommendedName && (
          <p className="vendors-panel__nearby">
            Nearby pick: <strong>{recommendedName}</strong>
          </p>
        )}
      </div>

      <div className="vendors-panel__list storage-cards">
        {sorted.map((s) => {
          const hot = s.utilization_pct >= 85;
          const isRecommended =
            (recommendedId && s.id === recommendedId) ||
            (recommendedName && s.name === recommendedName);
          const isSelected = selectedId === s.id;

          return (
            <button
              key={s.id}
              type="button"
              className={`storage-card storage-card--vendor ${hot ? "storage-card--hot" : ""} ${isSelected ? "storage-card--selected" : ""}`}
              onClick={() => onSelect?.(s)}
            >
              <div
                className="storage-card__ring"
                style={{ "--pct": `${s.utilization_pct}` } as React.CSSProperties}
              >
                <span>{s.utilization_pct}%</span>
              </div>
              <div className="storage-card__body">
                <strong>{s.name}</strong>
                <span>{s.district}</span>
                <span className="storage-card__free">
                  {s.available_quintals.toLocaleString("en-IN")} q free
                </span>
                {isRecommended && (
                  <span className="storage-card__route-badge">
                    Recommended · nearby route
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
