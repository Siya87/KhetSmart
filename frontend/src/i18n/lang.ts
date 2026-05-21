import type { InsurancePlan } from "../api";
import type { AppLanguage } from "../hooks/useAppSettings";

export const SPEECH_LANG: Record<AppLanguage, string> = {
  en: "en-IN",
  bn: "bn-IN",
  hi: "hi-IN",
};

export function htmlLangAttr(lang: AppLanguage): string {
  if (lang === "bn") return "bn";
  if (lang === "hi") return "hi";
  return "en";
}

/** Bengali + Hindi use the simplified farmer UI; English keeps fuller labels where needed. */
export function isSimpleLang(lang: AppLanguage): boolean {
  return lang !== "en";
}

export function languageMenuLabel(
  lang: AppLanguage,
  labels: { english: string; bengali: string; hindi: string }
): string {
  if (lang === "bn") return labels.bengali;
  if (lang === "hi") return labels.hindi;
  return labels.english;
}

export function insurancePlanDisplay(plan: InsurancePlan, lang: AppLanguage) {
  if (lang === "bn") {
    return { name: plan.name_bn, highlights: plan.highlights_bn };
  }
  if (lang === "hi") {
    return {
      name: plan.name_hi ?? plan.name_en,
      highlights: plan.highlights_hi ?? plan.highlights_en,
    };
  }
  return { name: plan.name_en, highlights: plan.highlights_en };
}
