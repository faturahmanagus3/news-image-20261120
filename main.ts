// news-image-20261120 — "Sum up 20 November's world news in one image".
//
// The poster ships in this repository as poster.png: it was drawn in
// poster.html (inline CSS and SVG) and rendered to a 1024x1024 PNG.
// This program's whole job is to deliver those exact bytes to the
// output directory under the name entry.png. Node standard library
// only, no network, fully deterministic: every run writes the same
// file, byte for byte.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// (MAKEFUN_OUTPUT_DIR stands in for the grader's /output.)
//
// Before anything is written, the shipped image is validated: it must
// carry the PNG signature and stay within the contest's 1 MiB cap.
// After the copy, the delivered file is read back and compared with
// the source both byte for byte and by SHA-256 fingerprint, so a short
// or corrupted write fails the run loudly instead of handing the
// grader a bad image. Any failure is reported on stderr and exits
// non-zero.

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_IMAGE_BYTES = 1_048_576; // the contest's 1 MiB gate

function sha256(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex');
}

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const sourceFile = join(here, 'poster.png');
  const targetDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  const outFile = join(targetDir, 'entry.png');

  const source = readFileSync(sourceFile);
  if (source.length > MAX_IMAGE_BYTES) {
    throw new Error(`poster.png is ${source.length} bytes, over the 1 MiB cap`);
  }
  if (!source.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
    throw new Error('poster.png does not start with the PNG signature');
  }

  mkdirSync(targetDir, { recursive: true });
  copyFileSync(sourceFile, outFile);

  const delivered = readFileSync(outFile);
  if (!delivered.equals(source)) {
    throw new Error('delivered entry.png differs from the shipped poster');
  }
  const fingerprint = sha256(source);
  if (sha256(delivered) !== fingerprint) {
    throw new Error('delivered entry.png has a different SHA-256 fingerprint');
  }
  console.log(
    `entry.png delivered: ${statSync(outFile).size} bytes, sha256 ${fingerprint} (verified identical)`,
  );
}

try {
  main();
} catch (err) {
  console.error(`news-image-20261120: delivery failed: ${(err as Error).message}`);
  process.exitCode = 1;
}
