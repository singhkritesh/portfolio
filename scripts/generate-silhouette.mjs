// Converts the Everest photo into a clean silhouette PNG with transparent background.
// Strategy:
//   1. Convert to greyscale
//   2. Apply threshold — pixels darker than cutoff become opaque (mountain), lighter become transparent (sky)
//   3. Colour the opaque pixels white (so they can be tinted via CSS filter)
//   4. Output to public/images/everest-silhouette.png

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const SRC  = new URL('../public/images/everest.jpg',            import.meta.url).pathname;
const DEST = new URL('../public/images/everest-silhouette.png', import.meta.url).pathname;

const WIDTH  = 400;
const THRESH = 160; // pixels darker than this = mountain (keep), lighter = sky (cut)

// Step 1: resize + greyscale raw pixel buffer
const { data, info } = await sharp(SRC)
  .resize({ width: WIDTH })
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height } = info;

// Step 2: build RGBA buffer — mountain pixels white+opaque, sky pixels transparent
const rgba = Buffer.alloc(width * height * 4);

for (let i = 0; i < width * height; i++) {
  const grey = data[i];
  const isMountain = grey < THRESH;
  const base = i * 4;
  rgba[base]     = 255; // R
  rgba[base + 1] = 255; // G
  rgba[base + 2] = 255; // B
  rgba[base + 3] = isMountain ? 255 : 0; // A
}

// Step 3: output PNG
await sharp(rgba, { raw: { width, height, channels: 4 } })
  .png()
  .toFile(DEST);

console.log(`✓ ${DEST}`);
console.log(`  ${width}x${height}px — threshold: ${THRESH}`);
