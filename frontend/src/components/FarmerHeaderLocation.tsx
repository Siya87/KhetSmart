import type { FarmerCoords, LocationStatus } from "../hooks/useFarmerLocation";
import type { AppLanguage } from "../hooks/useAppSettings";
import { tFarmer } from "../i18n/farmerSimple";

type Props = {
  status: LocationStatus;
  coords: FarmerCoords | null;
  error: string | null;
  onEnable: () => void;
  language?: AppLanguage;
};

export function FarmerHeaderLocation({
  status,
  coords,
  error,
  onEnable,
  language = "bn",
}: Props) {
  const t = tFarmer(language);

  if (status === "requesting") {
    return (
      <div className="header-loc header-loc--pending">
        <span className="spinner header-loc__spinner" />
        <span>GPS…</span>
      </div>
    );
  }

  if (status === "active" && coords) {
    return (
      <div className="header-loc header-loc--live header-loc--simple" aria-live="polite">
        <span className="header-loc__pin" aria-hidden>
          📍
        </span>
        <span className="header-loc__title">{t.farmGps}</span>
      </div>
    );
  }

  return (
    <div className="header-loc header-loc--off header-loc--simple">
      <span className="header-loc__pin header-loc__pin--muted" aria-hidden>
        ○
      </span>
      <span className="header-loc__title">{error ?? t.farmGpsOff}</span>
      <button type="button" className="header-loc__enable" onClick={onEnable}>
        {t.enableGps}
      </button>
    </div>
  );
}
