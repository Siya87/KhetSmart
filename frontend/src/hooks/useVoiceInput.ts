import { useCallback, useEffect, useRef, useState } from "react";
import type { AppLanguage } from "./useAppSettings";
import { SPEECH_LANG } from "../i18n/lang";

export type VoiceStatus = "idle" | "listening" | "unsupported" | "denied" | "error";

function getRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function useVoiceInput(
  onFinalText: (text: string) => void,
  language: AppLanguage = "bn"
) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const listeningRef = useRef(false);
  const mountedRef = useRef(true);
  const onFinalRef = useRef(onFinalText);

  onFinalRef.current = onFinalText;

  const supported = getRecognitionCtor() != null;

  const releaseRecognition = useCallback(() => {
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    listeningRef.current = false;
    if (!rec) return;
    try {
      rec.abort();
    } catch {
      try {
        rec.stop();
      } catch {
        /* ignore — already stopped */
      }
    }
  }, []);

  const stop = useCallback(() => {
    releaseRecognition();
    if (mountedRef.current) {
      setStatus("idle");
      setInterim("");
    }
  }, [releaseRecognition]);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setStatus("unsupported");
      setError("Voice not supported — use Chrome or Edge, or type instead.");
      return;
    }

    if (listeningRef.current) {
      stop();
      return;
    }

    releaseRecognition();

    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = SPEECH_LANG[language];
    recognition.maxAlternatives = 1;

    (recognition as SpeechRecognition & { onstart?: () => void }).onstart = () => {
      if (!mountedRef.current) {
        try {
          recognition.abort();
        } catch {
          /* ignore */
        }
        return;
      }
      listeningRef.current = true;
      setStatus("listening");
    };

    recognition.onresult = (event) => {
      let interimText = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const part = event.results[i][0]?.transcript ?? "";
        if (event.results[i].isFinal) {
          finalText += part;
        } else {
          interimText += part;
        }
      }
      if (finalText.trim()) {
        onFinalRef.current(finalText.trim());
        setInterim("");
      } else {
        setInterim(interimText);
      }
    };

    recognition.onerror = (event) => {
      listeningRef.current = false;
      if (event.error === "aborted") {
        return;
      }
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setStatus("denied");
        setError("Microphone blocked — allow mic in browser settings.");
      } else if (event.error === "no-speech") {
        setStatus("error");
        setError("No speech heard — try again.");
      } else {
        setStatus("error");
        setError("Voice error — try English or type instead.");
      }
    };

    recognition.onend = () => {
      listeningRef.current = false;
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
      if (mountedRef.current) {
        setStatus((s) => (s === "listening" ? "idle" : s));
        setInterim("");
      }
    };

    recognitionRef.current = recognition;
    setError(null);
    setInterim("");

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      listeningRef.current = false;
      setStatus("error");
      setError("Could not start microphone — wait a moment and try again.");
    }
  }, [language, releaseRecognition, stop]);

  useEffect(() => {
    mountedRef.current = true;
    if (!supported) setStatus("unsupported");
    return () => {
      mountedRef.current = false;
      releaseRecognition();
    };
  }, [supported, releaseRecognition]);

  useEffect(() => {
    function onUnhandledRejection(ev: PromiseRejectionEvent) {
      const reason = ev.reason;
      const name = reason?.name ?? "";
      const message = String(reason?.message ?? reason ?? "");
      if (
        name === "AbortError" &&
        message.includes("play()") &&
        message.includes("pause()")
      ) {
        ev.preventDefault();
      }
    }
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => window.removeEventListener("unhandledrejection", onUnhandledRejection);
  }, []);

  return {
    supported,
    status,
    interim,
    error,
    isListening: status === "listening",
    start,
    stop,
    toggle: start,
  };
}
