"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  UPDATE_CHECK_INTERVAL_MS,
  UPDATE_LATER_SNOOZE_MS,
  shouldOfferUpdate,
} from "@/lib/updates/offer";

/**
 * Modale de mise à jour, sur le même principe que SousPli.
 *
 * La page embarque la version du déploiement qui l'a servie. On interroge
 * /api/version, toujours servie par le déploiement le plus récent. Si les
 * versions diffèrent, une nouvelle version est en ligne.
 *
 * « Plus tard » masque la fenêtre pour la session et pendant six heures.
 * « Mettre à jour » recharge la page, après avoir activé le nouveau service
 * worker s'il attend.
 */

const snoozeKey = "cnb-update-snooze-until";
const ackKey = "cnb-update-acknowledged";
const sessionKey = "cnb-update-dismissed-session";
const acceptKey = "cnb-update-accepted";
const reloadedKey = "cnb-update-reloaded";

type UpdateBannerProps = {
  /** Version du déploiement qui a rendu la page (SHA du commit, ou "dev"). */
  initialVersion: string;
};

function readSnoozeUntil(): number | null {
  try {
    const value = Number(localStorage.getItem(snoozeKey) || 0);
    return value > 0 ? value : null;
  } catch {
    return null;
  }
}

function anotherDialogIsOpen(): boolean {
  return Boolean(
    document.querySelector("[role='dialog']:not(#app-update-dialog)"),
  );
}

export default function UpdateBanner({ initialVersion }: UpdateBannerProps) {
  const [open, setOpen] = useState(false);
  const [remote, setRemote] = useState<string | null>(null);
  const [checkFailed, setCheckFailed] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [busy, setBusy] = useState(false);
  const [checkedAt, setCheckedAt] = useState(0);

  useEffect(() => {
    if (initialVersion === "dev" || typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const hadController = Boolean(navigator.serviceWorker.controller);

    const onControllerChange = () => {
      if (!hadController) return;
      if (sessionStorage.getItem(acceptKey) !== "1") return;
      if (sessionStorage.getItem(reloadedKey) === "1") return;
      sessionStorage.setItem(reloadedKey, "1");
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const track = (registration: ServiceWorkerRegistration) => {
      const worker = registration.waiting;
      if (worker && navigator.serviceWorker.controller) setWaiting(worker);
    };

    void navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;
      track(registration);
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        installing?.addEventListener("statechange", () => {
          if (installing.state === "installed") track(registration);
        });
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, [initialVersion]);

  useEffect(() => {
    if (initialVersion === "dev") return;

    let timer = 0;
    let cancelled = false;

    const check = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch("/api/version", { cache: "no-store" });
        if (!response.ok) throw new Error("version");
        const payload = (await response.json()) as { version?: string };
        if (cancelled) return;
        setRemote(payload.version ?? null);
        setCheckFailed(false);
        setCheckedAt(Date.now());
        if (payload.version && payload.version !== initialVersion && "serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          await registration?.update();
        }
      } catch {
        if (!cancelled) {
          setRemote(null);
          setCheckFailed(true);
        }
      }
    };

    const onReturn = () => {
      void check();
    };

    timer = window.setInterval(() => void check(), UPDATE_CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("focus", onReturn);
    window.addEventListener("pageshow", onReturn);
    void check();

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("focus", onReturn);
      window.removeEventListener("pageshow", onReturn);
    };
  }, [initialVersion]);

  useEffect(() => {
    let acknowledged: string | null = null;
    try {
      acknowledged = localStorage.getItem(ackKey);
    } catch {
      acknowledged = null;
    }
    const offer = shouldOfferUpdate({
      now: Date.now(),
      snoozeUntil: readSnoozeUntil(),
      pageVersion: initialVersion,
      remoteVersion: remote,
      acknowledgedVersion: acknowledged,
      checkFailed,
      dialogAlreadyOpen: anotherDialogIsOpen(),
    });
    if (offer && sessionStorage.getItem(sessionKey) !== "1") setOpen(true);
  }, [initialVersion, remote, checkFailed, checkedAt]);

  function later() {
    try {
      localStorage.setItem(snoozeKey, String(Date.now() + UPDATE_LATER_SNOOZE_MS));
      sessionStorage.setItem(sessionKey, "1");
    } catch {
      // Stockage indisponible : on ferme quand même la fenêtre.
    }
    setOpen(false);
  }

  function updateNow() {
    if (!remote || remote === initialVersion) return;
    setBusy(true);
    try {
      localStorage.setItem(ackKey, remote);
      sessionStorage.setItem(acceptKey, "1");
    } catch {
      // Le rechargement reste possible sans mémoriser le choix.
    }
    if (waiting) {
      waiting.postMessage({ type: "SKIP_WAITING" });
      window.setTimeout(() => {
        if (sessionStorage.getItem(reloadedKey) === "1") return;
        sessionStorage.setItem(reloadedKey, "1");
        window.location.reload();
      }, 1500);
      return;
    }
    window.location.reload();
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) later();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) later();
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        id="app-update-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-update-title"
        aria-describedby="app-update-description"
        className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="app-update-title" className="text-base font-semibold text-foreground">
          Une nouvelle version est disponible
        </h2>
        <p id="app-update-description" className="mt-2 text-sm leading-6 text-muted-foreground">
          Tu peux l’appliquer maintenant. Les pages déjà enregistrées restent en place.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={later}
            className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition hover:bg-secondary disabled:opacity-50"
          >
            Plus tard
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={updateNow}
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {busy ? "Mise à jour…" : "Mettre à jour"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
