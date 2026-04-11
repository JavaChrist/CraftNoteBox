import { createLowlight, common } from "lowlight";

/** Instance partagée (grammaires highlight.js « common »). */
export const codeLowlight = createLowlight(common);
