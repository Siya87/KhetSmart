import { useState } from "react";
import { IconMic } from "./icons";
import { useVoiceInput } from "../hooks/useVoiceInput";
import type { AppLanguage } from "../hooks/useAppSettings";
import { tFarmer } from "../i18n/farmerSimple";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  inputError?: string | null;
  language?: AppLanguage;
};

export function FarmerVoiceInput({
  value,
  onChange,
  placeholder = "Amar 50 quintal Jyoti aloo ache",
  disabled = false,
  inputError = null,
  language = "bn",
}: Props) {
  const t = tFarmer(language);
  const [showType, setShowType] = useState(false);

  const voice = useVoiceInput((spoken) => {
    const merged = value.trim() ? `${value.trim()} ${spoken}` : spoken;
    onChange(merged);
  });

  return (
    <div className="farmer-voice farmer-voice--simple">
      <div className="farmer-voice__head">
        <span className="farmer-voice__label-text">{t.speakOrWrite}</span>
        <button
          type="button"
          className={`farmer-voice__mic farmer-voice__mic--lg ${voice.isListening ? "farmer-voice__mic--on" : ""}`}
          onClick={voice.toggle}
          disabled={disabled || voice.status === "unsupported"}
          aria-pressed={voice.isListening}
          aria-label={voice.isListening ? "Stop listening" : "Start voice input"}
        >
          <IconMic className="farmer-voice__mic-icon" />
          {voice.isListening && <span className="farmer-voice__mic-ring" aria-hidden />}
        </button>
      </div>

      {voice.isListening && (
        <p className="farmer-voice__listening">
          <span className="farmer-voice__dot" aria-hidden />
          {t.listening}
        </p>
      )}

      {(voice.error || voice.status === "unsupported") && (
        <p className="farmer-voice__hint">{voice.error}</p>
      )}

      {inputError && (
        <p className="farmer-voice__input-error" role="alert">
          {inputError}
        </p>
      )}

      {!showType ? (
        <button
          type="button"
          className="farmer-voice__type-toggle"
          onClick={() => setShowType(true)}
          disabled={disabled}
        >
          {t.typeOptional}
        </button>
      ) : (
        <textarea
          className={`input-area input-area--simple ${voice.isListening ? "input-area--listening" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Farmer message"
          disabled={disabled}
          rows={2}
        />
      )}
    </div>
  );
}
