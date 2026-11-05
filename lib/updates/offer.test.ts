import { describe, expect, it } from "vitest";
import {
  UPDATE_LATER_SNOOZE_MS,
  shouldOfferUpdate,
  type UpdateOfferInput,
} from "./offer";

const ready: UpdateOfferInput = {
  now: 10_000,
  snoozeUntil: null,
  pageVersion: "ancien-commit",
  remoteVersion: "nouveau-commit",
  acknowledgedVersion: "ancien-commit",
  checkFailed: false,
  dialogAlreadyOpen: false,
};

describe("shouldOfferUpdate", () => {
  it("ouvre la modale quand le déploiement a changé", () => {
    expect(shouldOfferUpdate(ready)).toBe(true);
  });

  it("reste silencieux en local, sur la même version, ou après Plus tard", () => {
    expect(shouldOfferUpdate({ ...ready, pageVersion: "dev" })).toBe(false);
    expect(shouldOfferUpdate({ ...ready, remoteVersion: "dev" })).toBe(false);
    expect(shouldOfferUpdate({ ...ready, remoteVersion: "ancien-commit" })).toBe(false);
    expect(shouldOfferUpdate({ ...ready, remoteVersion: null })).toBe(false);
    expect(shouldOfferUpdate({ ...ready, checkFailed: true })).toBe(false);
    expect(shouldOfferUpdate({ ...ready, dialogAlreadyOpen: true })).toBe(false);
    expect(
      shouldOfferUpdate({ ...ready, snoozeUntil: ready.now + UPDATE_LATER_SNOOZE_MS }),
    ).toBe(false);
    expect(
      shouldOfferUpdate({ ...ready, acknowledgedVersion: "nouveau-commit" }),
    ).toBe(false);
  });
});
