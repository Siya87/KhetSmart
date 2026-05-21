import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  consultFarmer,
  fetchHealth,
  fetchLogisticsVendors,
  fetchStorages,
  parseFarmerText,
  type ConsultOverrides,
  type ConsultResponse,
  type ColdStorage,
  type FarmerParseResult,
  type LogisticsVendor,
  type LogisticsVendorsResponse,
} from "./api";
import { FinancePanel } from "./components/FinancePanel";
import { OpsOverlay } from "./components/OpsOverlay";
import { SettingsMenu } from "./components/SettingsMenu";
import { FarmerConsultResults } from "./components/FarmerConsultResults";
import { PredictPanel } from "./components/PredictPanel";
import { SelectedStorageCard } from "./components/SelectedStorageCard";
import { StorageMap, type RoutePath } from "./components/StorageMap";
import { FarmerHeaderLocation } from "./components/FarmerHeaderLocation";
import { LogisticsVendorsPanel } from "./components/LogisticsVendorsPanel";
import { FarmerParseConfirm } from "./components/FarmerParseConfirm";
import {
  DEFAULT_HARVEST_SELECTION,
  FarmerHarvestShortcuts,
  harvestShortcutText,
} from "./components/FarmerHarvestShortcuts";
import { FarmerVoiceInput } from "./components/FarmerVoiceInput";
import { LocationPermissionModal } from "./components/LocationPermissionModal";
import { IconMic, IconRupee, IconSatellite, IconWarehouse } from "./components/icons";
import { useAppSettings } from "./hooks/useAppSettings";
import { useFarmerLocation } from "./hooks/useFarmerLocation";

type Tab = "farmer" | "predict" | "network" | "finance";

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "farmer", label: "Farmer", icon: <IconMic className="tab-icon" /> },
  { id: "predict", label: "Predict", icon: <IconSatellite className="tab-icon" /> },
  { id: "network", label: "Network", icon: <IconWarehouse className="tab-icon" /> },
  { id: "finance", label: "Finance", icon: <IconRupee className="tab-icon" /> },
];

function formatInr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function App() {
  const [tab, setTab] = useState<Tab>("farmer");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [parsePreview, setParsePreview] = useState<FarmerParseResult | null>(null);
  const [harvestSelection, setHarvestSelection] = useState<ConsultOverrides>(
    DEFAULT_HARVEST_SELECTION
  );
  const [confirmOverrides, setConfirmOverrides] = useState<ConsultOverrides | null>(
    null
  );
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ConsultResponse | null>(null);
  const [storages, setStorages] = useState<ColdStorage[]>([]);
  const [selectedStorageId, setSelectedStorageId] = useState<string | null>(null);
  const [totalStorages, setTotalStorages] = useState(496);
  const farmerLocation = useFarmerLocation();
  const { language, fontSize, setLanguage, setFontSize } = useAppSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [opsOpen, setOpsOpen] = useState(false);
  const [mapFocusKey] = useState(0);
  const [showLogisticsVendors, setShowLogisticsVendors] = useState(false);
  const [logisticsVendors, setLogisticsVendors] = useState<LogisticsVendor[]>([]);
  const [logisticsMeta, setLogisticsMeta] = useState<LogisticsVendorsResponse | null>(
    null
  );
  const [vendorsLoading, setVendorsLoading] = useState(false);

  const loadPredict = useCallback(async () => {
    try {
      const [s, h] = await Promise.all([
        fetchStorages(tab === "network"),
        fetchHealth(),
      ]);
      setStorages(s);
      setTotalStorages(h.storages);
      setError(null);
    } catch {
      setError("Backend not running. Start API on port 8000.");
    }
  }, [tab]);

  useEffect(() => {
    loadPredict();
  }, [loadPredict]);

  function handleTextChange(value: string) {
    setText(value);
    setParsePreview(null);
    setConfirmOverrides(null);
    setAwaitingConfirm(false);
    if (inputError) setInputError(null);
  }

  function handleHarvestChange(next: ConsultOverrides) {
    setHarvestSelection(next);
    setConfirmOverrides((prev) => (prev ? { ...prev, ...next } : null));
    if (inputError) setInputError(null);
  }

  useEffect(() => {
    if (result?.route.storage_id) {
      setSelectedStorageId(result.route.storage_id);
    } else if (result?.route.storage_name) {
      const match = storages.find((s) => s.name === result.route.storage_name);
      if (match) setSelectedStorageId(match.id);
    }
  }, [result, storages]);

  const routePath: RoutePath | null =
    result?.route?.origin_lat != null &&
    result.route.storage_lat != null &&
    result.route.market_lat != null
      ? {
          origin: [result.route.origin_lat, result.route.origin_lng!],
          storage: [result.route.storage_lat, result.route.storage_lng!],
          market: [result.route.market_lat, result.route.market_lng!],
          storageName: result.route.storage_name,
          marketName: result.route.market_name ?? "Mandi",
          storageId: result.route.storage_id,
        }
      : null;

  const selectedStorage =
    storages.find((s) => s.id === selectedStorageId) ??
    storages.find((s) => s.name === result?.route.storage_name) ??
    null;

  const locationPayload = farmerLocation.coords
    ? { lat: farmerLocation.coords.lat, lng: farmerLocation.coords.lng }
    : null;

  async function runConsult(
    overrides?: ConsultOverrides | null,
    message?: string
  ) {
    setLoading(true);
    setError(null);
    const consultText =
      (message ?? text.trim()) || harvestShortcutText(harvestSelection);
    try {
      const data = await consultFarmer(consultText, locationPayload, overrides);
      setResult(data);
      setParsePreview(null);
      setConfirmOverrides(null);
      setAwaitingConfirm(false);
      setShowLogisticsVendors(false);
    } catch {
      setError("Could not reach KhetSmart API. Run: uvicorn main:app --reload");
    } finally {
      setLoading(false);
    }
  }

  async function handleGetRoute() {
    if (awaitingConfirm && confirmOverrides) {
      await runConsult(confirmOverrides);
      return;
    }

    const trimmed = text.trim();
    const consultText = trimmed || harvestShortcutText(harvestSelection);
    setInputError(null);

    setLoading(true);
    setError(null);
    try {
      let overrides: ConsultOverrides = { ...harvestSelection };

      if (trimmed) {
        const preview = await parseFarmerText(trimmed);
        overrides = {
          quantity_quintals: preview.quantity_quintals,
          crop: preview.crop,
          district: preview.district,
        };
        setHarvestSelection(overrides);

        if (preview.needs_confirmation) {
          setParsePreview(preview);
          setConfirmOverrides(overrides);
          setAwaitingConfirm(true);
          return;
        }
      }

      await runConsult(overrides, consultText);
    } catch {
      setError("Could not reach KhetSmart API. Run: uvicorn main:app --reload");
    } finally {
      setLoading(false);
    }
  }

  function handleCancelConfirm() {
    setParsePreview(null);
    setConfirmOverrides(null);
    setAwaitingConfirm(false);
  }

  async function handleShowAllVendors() {
    if (!result?.route) return;
    setShowLogisticsVendors(true);
    setVendorsLoading(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const data = await fetchLogisticsVendors({
        quantity_quintals: result.parsed.quantity_quintals,
        farmer_lat: farmerLocation.coords?.lat,
        farmer_lng: farmerLocation.coords?.lng,
        destination_lat: result.route.storage_lat,
        destination_lng: result.route.storage_lng,
        destination_name: result.route.storage_name,
      });
      setLogisticsVendors(data.vendors);
      setLogisticsMeta(data);
    } catch {
      setShowLogisticsVendors(false);
      setError("Could not load transport vendors. Start API on port 8000.");
    } finally {
      setVendorsLoading(false);
    }
  }

  return (
    <div
      className={`app-shell${showLogisticsVendors && tab === "farmer" ? " app-shell--logistics-vendors" : ""}`}
    >
      <LocationPermissionModal
        open={farmerLocation.showModal}
        status={
          farmerLocation.status === "requesting"
            ? "requesting"
            : farmerLocation.status === "denied" || farmerLocation.status === "unavailable"
              ? farmerLocation.status
              : "prompt"
        }
        error={farmerLocation.error}
        onAllow={farmerLocation.requestLocation}
        onDismiss={() => farmerLocation.setShowModal(false)}
      />

      <header className="header">
        <div className="header__glow" aria-hidden />
        <div className="header-top">
          <div>
            <p className="header__eyebrow">Agri-FinTech · West Bengal</p>
            <h1 className="brand">KhetSmart</h1>
            {tab === "farmer" && (
              <FarmerHeaderLocation
                status={farmerLocation.status}
                coords={farmerLocation.coords}
                error={farmerLocation.error}
                onEnable={farmerLocation.openPermissionModal}
              />
            )}
          </div>
          <button
            type="button"
            className="header__logo header__logo--btn"
            aria-label="Settings"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((o) => !o)}
          >
            <span aria-hidden>🥔</span>
          </button>
        </div>
        <SettingsMenu
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          language={language}
          fontSize={fontSize}
          onLanguageChange={setLanguage}
          onFontSizeChange={setFontSize}
          onOpenOps={() => setOpsOpen(true)}
        />
      </header>

      <main className="main">
        {error && <p className="error-banner">{error}</p>}

        {tab === "farmer" && (
          <div className="farmer-view">
            {!showLogisticsVendors && (
              <div className="phone-frame phone-frame--pro">
                <div className="phone-frame__screen">
                  <FarmerVoiceInput
                    value={text}
                    onChange={handleTextChange}
                    disabled={loading}
                    inputError={inputError}
                  />
                  <FarmerHarvestShortcuts
                    selection={
                      awaitingConfirm && confirmOverrides
                        ? confirmOverrides
                        : harvestSelection
                    }
                    onChange={
                      awaitingConfirm && confirmOverrides
                        ? (next) => {
                            setConfirmOverrides(next);
                            setHarvestSelection(next);
                          }
                        : handleHarvestChange
                    }
                    disabled={loading}
                  />
                  {awaitingConfirm && parsePreview && confirmOverrides && (
                    <FarmerParseConfirm
                      preview={parsePreview}
                      overrides={confirmOverrides}
                      onConfirm={() => runConsult(confirmOverrides)}
                      onCancel={handleCancelConfirm}
                      loading={loading}
                    />
                  )}
                  {!awaitingConfirm && (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleGetRoute}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="btn-loading">
                          <span className="spinner" />
                          Checking…
                        </span>
                      ) : (
                        "Get Route + Micro-loan"
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {loading && !showLogisticsVendors && (
              <div className="loading-cards">
                <div className="skeleton skeleton--tall" />
                <div className="skeleton" />
                <div className="skeleton" />
              </div>
            )}

            {showLogisticsVendors && (
              <LogisticsVendorsPanel
                vendors={logisticsVendors}
                recommendedId={logisticsMeta?.recommended_vendor_id}
                destinationName={logisticsMeta?.destination_name ?? result?.route.storage_name}
                quantityQ={logisticsMeta?.quantity_quintals ?? result?.parsed.quantity_quintals ?? 50}
                routeDistanceKm={logisticsMeta?.route_distance_km ?? result?.route.distance_km}
                loading={vendorsLoading}
                onBack={() => setShowLogisticsVendors(false)}
                formatInr={formatInr}
              />
            )}

            {result && !loading && !showLogisticsVendors && (
              <FarmerConsultResults
                result={result}
                formatInr={formatInr}
                onViewFinance={() => setTab("finance")}
                onShowAllVendors={handleShowAllVendors}
              />
            )}
          </div>
        )}

        {tab === "predict" && (
          <PredictPanel
            totalStorages={totalStorages}
            onGoNetwork={() => setTab("network")}
          />
        )}

        {tab === "finance" && (
          <FinancePanel
            result={result}
            formatInr={formatInr}
            onGoFarmer={() => setTab("farmer")}
            language={language}
          />
        )}

        {tab === "network" && (
          <div className="network-view animate-in">
            <section className="visual-card">
              <h3>{totalStorages} cold storages · live network</h3>
              <StorageMap
                storages={storages}
                totalCount={totalStorages}
                highlight={result?.route.storage_name}
                routePath={routePath}
                selectedId={selectedStorageId}
                focusRouteKey={mapFocusKey}
                onSelect={(s) => setSelectedStorageId(s.id)}
              />
            </section>

            {selectedStorage ? (
              <SelectedStorageCard
                storage={selectedStorage}
                isRouteTarget={result?.route.storage_name === selectedStorage.name}
              />
            ) : (
              <p className="network-hint">Tap a pin on the map to see facility details.</p>
            )}
          </div>
        )}

      </main>

      <OpsOverlay
        open={opsOpen}
        onClose={() => setOpsOpen(false)}
        language={language}
      />

      <nav className="tabs tabs--4" aria-label="Main navigation">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => {
              if (t.id !== "farmer") setShowLogisticsVendors(false);
              setTab(t.id);
            }}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
