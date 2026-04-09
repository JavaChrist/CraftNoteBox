/**
 * Génère les PNG de marque dans public/images/icones/ (placeholder jusqu'à tes exports finaux).
 * Exécution : node scripts/generate-brand-icons.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "images", "icones");

const svg512 = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#1e293b"/>
  <text x="256" y="330" text-anchor="middle" fill="#cbd5e1" font-family="ui-sans-serif,system-ui,sans-serif" font-size="260" font-weight="700">C</text>
</svg>
`;

async function main() {
  await mkdir(outDir, { recursive: true });
  const base = sharp(Buffer.from(svg512)).png();

  await base.clone().resize(512, 512).toFile(join(outDir, "icon-512.png"));
  await base.clone().resize(192, 192).toFile(join(outDir, "icon-192.png"));
  await base.clone().resize(32, 32).toFile(join(outDir, "favicon.png"));

  const ico32 = await base.clone().resize(32, 32).png().toBuffer();
  // ICO minimal : une entrée 32x32 PNG intégrée (Windows / navigateurs récents)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const dir = Buffer.alloc(16);
  dir.writeUInt8(32, 0);
  dir.writeUInt8(32, 1);
  dir.writeUInt8(0, 2);
  dir.writeUInt8(0, 3);
  dir.writeUInt16LE(1, 4);
  dir.writeUInt16LE(32, 6);
  dir.writeUInt32LE(ico32.length, 8);
  dir.writeUInt32LE(6 + 16, 12);

  await writeFile(
    join(outDir, "favicon.ico"),
    Buffer.concat([header, dir, ico32]),
  );

  console.log("OK →", outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
