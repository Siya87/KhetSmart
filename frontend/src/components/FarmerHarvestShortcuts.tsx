import type { ConsultOverrides } from "../api";

export const FARMER_CROP_OPTIONS = [
  "Jyoti Potato",
  "Potato",
  "Chipsona-1",
  "Kufri Jyoti",
] as const;

export const QUANTITY_PRESETS = [25, 50, 75, 100, 150, 200] as const;

export const DEFAULT_HARVEST_SELECTION: ConsultOverrides = {
  quantity_quintals: 50,
  crop: "Potato",
  district: null,
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
};

export function FarmerHarvestShortcuts({
  selection,
  onChange,
  disabled = false,
}: Props) {
  return (
    <div className="farmer-shortcuts" aria-label="Harvest shortcuts">
      <p className="farmer-shortcuts__heading">দ্রুত বেছে নিন · Quick pick</p>

      <label className="farmer-shortcuts__field">
        <span>Quantity (quintals)</span>
        <input
          type="number"
          min={1}
          max={10000}
          step={1}
          value={selection.quantity_quintals}
          disabled={disabled}
          onChange={(e) =>
            onChange({
              ...selection,
              quantity_quintals: Math.max(1, Number(e.target.value) || 1),
            })
          }
        />
      </label>
      <div className="farmer-shortcuts__chips">
        {QUANTITY_PRESETS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={disabled}
            className={`chip ${selection.quantity_quintals === q ? "chip--gold" : "chip--outline"}`}
            onClick={() =>
              onChange({ ...selection, quantity_quintals: q })
            }
          >
            {q} q
          </button>
        ))}
      </div>

      <p className="farmer-shortcuts__field-label">Crop variety</p>
      <div className="farmer-shortcuts__chips">
        {FARMER_CROP_OPTIONS.map((crop) => (
          <button
            key={crop}
            type="button"
            disabled={disabled}
            className={`chip ${selection.crop === crop ? "chip--gold" : "chip--outline"}`}
            onClick={() => onChange({ ...selection, crop })}
          >
            {crop}
          </button>
        ))}
      </div>
    </div>
  );
}
