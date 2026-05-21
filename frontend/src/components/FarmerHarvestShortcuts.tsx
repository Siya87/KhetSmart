import { useState } from "react";
import type { ConsultOverrides } from "../api";
import type { AppLanguage } from "../hooks/useAppSettings";
import { tFarmer } from "../i18n/farmerSimple";

export const FARMER_CROP_OPTIONS = [
  "Jyoti Potato",
  "Potato",
  "Chipsona-1",
  "Kufri Jyoti",
] as const;

export const QUANTITY_PRESETS = [25, 50, 75, 100] as const;

export const DEFAULT_HARVEST_SELECTION: ConsultOverrides = {
  quantity_quintals: 50,
  crop: "Potato",
  district: null,
};

const CROP_LABEL: Record<string, { en: string; bn: string }> = {
  "Jyoti Potato": { en: "Jyoti potato", bn: "জ্যোতি আলু" },
  Potato: { en: "Potato", bn: "আলু" },
  "Chipsona-1": { en: "Chipsona", bn: "চিপসোনা" },
  "Kufri Jyoti": { en: "Kufri Jyoti", bn: "কুফরি জ্যোতি" },
};

export function harvestShortcutText(selection: ConsultOverrides): string {
  const cropLabel =
    selection.crop === "Potato" ? "aloo" : selection.crop.replace(" Potato", "");
  return `Amar ${selection.quantity_quintals} quintal ${cropLabel} ache`;
}

type Props = {
  selection: ConsultOverrides;
  onChange: (next: ConsultOverrides) => void;
  disabled?: boolean;
  language?: AppLanguage;
};

export function FarmerHarvestShortcuts({
  selection,
  onChange,
  disabled = false,
  language = "bn",
}: Props) {
  const t = tFarmer(language);
  const [showMoreCrops, setShowMoreCrops] = useState(false);
  const primaryCrops = FARMER_CROP_OPTIONS.slice(0, 2);
  const extraCrops = FARMER_CROP_OPTIONS.slice(2);

  return (
    <div className="farmer-shortcuts" aria-label={t.quickPick}>
      <p className="farmer-shortcuts__heading">{t.quickPick}</p>

      <p className="farmer-shortcuts__field-label">{t.quantity}</p>
      <div className="farmer-shortcuts__chips farmer-shortcuts__chips--lg">
        {QUANTITY_PRESETS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={disabled}
            className={`chip chip--tap ${selection.quantity_quintals === q ? "chip--gold" : "chip--outline"}`}
            onClick={() => onChange({ ...selection, quantity_quintals: q })}
          >
            {q} {language === "bn" ? "কুই" : "q"}
          </button>
        ))}
      </div>

      <p className="farmer-shortcuts__field-label">{t.crop}</p>
      <div className="farmer-shortcuts__chips farmer-shortcuts__chips--lg">
        {primaryCrops.map((crop) => (
          <button
            key={crop}
            type="button"
            disabled={disabled}
            className={`chip chip--tap ${selection.crop === crop ? "chip--gold" : "chip--outline"}`}
            onClick={() => onChange({ ...selection, crop })}
          >
            {language === "bn" ? CROP_LABEL[crop].bn : CROP_LABEL[crop].en}
          </button>
        ))}
        {!showMoreCrops ? (
          <button
            type="button"
            className="chip chip--outline chip--more"
            disabled={disabled}
            onClick={() => setShowMoreCrops(true)}
          >
            + {t.moreCrops}
          </button>
        ) : (
          extraCrops.map((crop) => (
            <button
              key={crop}
              type="button"
              disabled={disabled}
              className={`chip chip--tap ${selection.crop === crop ? "chip--gold" : "chip--outline"}`}
              onClick={() => onChange({ ...selection, crop })}
            >
              {language === "bn" ? CROP_LABEL[crop].bn : CROP_LABEL[crop].en}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
