"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker en production et demande une vérification
 * à chaque retour sur l’app installée. Un nouveau worker prend la main
 * tout de suite, puis la page se recharge une fois.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const hadController = Boolean(navigator.serviceWorker.controller);
    let reloaded = false;

    const onControllerChange = () => {
      if (!hadController || reloaded) return;
      reloaded = true;
      window.location.reload();
    };

    const checkForUpdate = () => {
      navigator.serviceWorker.getRegistration().then((registration) => {
        registration?.update().catch(() => {});
      }).catch(() => {});
    };

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => checkForUpdate())
        .catch(() => {});
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    const onVisible = () => {
      if (document.visibilityState === "visible") checkForUpdate();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
