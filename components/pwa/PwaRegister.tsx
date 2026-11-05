"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker en production.
 * La première installation s’active toute seule. Une mise à jour reste en
 * attente jusqu’au choix « Mettre à jour » de la modale.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const activateIfFirstInstall = (worker: ServiceWorker) => {
      if (!navigator.serviceWorker.controller) {
        worker.postMessage({ type: "SKIP_WAITING" });
      }
    };

    const watch = (registration: ServiceWorkerRegistration) => {
      const installing = registration.installing;
      installing?.addEventListener("statechange", () => {
        if (installing.state === "installed") activateIfFirstInstall(installing);
      });
      registration.addEventListener("updatefound", () => {
        const next = registration.installing;
        next?.addEventListener("statechange", () => {
          if (next.state === "installed") activateIfFirstInstall(next);
        });
      });
    };

    const checkForUpdate = () => {
      navigator.serviceWorker.getRegistration().then((registration) => {
        registration?.update().catch(() => {});
      }).catch(() => {});
    };

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          watch(registration);
          return checkForUpdate();
        })
        .catch(() => {});
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    const onVisible = () => {
      if (document.visibilityState === "visible") checkForUpdate();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
