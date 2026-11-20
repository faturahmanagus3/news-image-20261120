// main.ts — "The World in One Day: 20 November 2026" news-poster entry.
//
// The poster artwork ships with this entry as poster.png (rendered ahead of
// time from poster.html). At run time this program simply installs that
// asset as the competition output file /output/entry.png, byte for byte.
//
// Node 22, standard library only, no network access.

import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUTPUT_PATH = "/output/entry.png";

function assetPath(): string {
  // poster.png sits next to this file in the entry directory.
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "poster.png");
}

function main(): void {
  const src = assetPath();
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  copyFileSync(src, OUTPUT_PATH);
  const { size } = statSync(OUTPUT_PATH);

  // Self-check: the installed output must hash identically to the shipped
  // asset, so a truncated or corrupted copy fails loudly instead of
  // silently submitting a broken poster.
  const digest = (buf: Buffer): string =>
    createHash("sha256").update(buf).digest("hex");
  const srcHash = digest(readFileSync(src));
  const outHash = digest(readFileSync(OUTPUT_PATH));
  if (srcHash !== outHash) {
    throw new Error(
      `sha256 mismatch: asset ${srcHash} != output ${outHash}`,
    );
  }
  console.log(
    `entry.png written: ${size} bytes, sha256 ${outHash} (verified against ${src})`,
  );
}

main();
