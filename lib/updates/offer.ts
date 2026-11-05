export const UPDATE_CHECK_INTERVAL_MS = 60_000;
export const UPDATE_LATER_SNOOZE_MS = 6 * 60 * 60 * 1000;

export type UpdateOfferInput = {
  now: number;
  snoozeUntil: number | null;
  pageVersion: string;
  remoteVersion: string | null;
  acknowledgedVersion: string | null;
  checkFailed: boolean;
  dialogAlreadyOpen: boolean;
};

/** Vrai quand le déploiement servi n’est plus celui de la page ouverte. */
export function isNewerDeployment(
  pageVersion: string,
  remoteVersion: string | null,
): boolean {
  if (!remoteVersion || remoteVersion === "dev" || pageVersion === "dev") return false;
  return remoteVersion !== pageVersion;
}

/** Annonce une mise à jour après un nouveau déploiement, jamais par-dessus une autre fenêtre. */
export function shouldOfferUpdate(input: UpdateOfferInput): boolean {
  if (input.checkFailed || input.dialogAlreadyOpen) return false;
  if (!isNewerDeployment(input.pageVersion, input.remoteVersion)) return false;
  if (input.remoteVersion === input.acknowledgedVersion) return false;
  if (input.snoozeUntil !== null && input.now < input.snoozeUntil) return false;
  return true;
}
