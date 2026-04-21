// Generates two WebP sizes for each photo in photography/photographs/
// thumbs/  → 900px wide,  85% quality  (grid display)
// display/ → 2400px wide, 92% quality  (lightbox)
//
// Run once: node scripts/generate-photos.mjs

import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';

const SRC  = new URL('../photography/photographs', import.meta.url).pathname;
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']);

const SIZES = [
  { dir: 'thumbs',  width: 900,  quality: 85 },
  { dir: 'display', width: 2400, quality: 92 },
];

const files = (await readdir(SRC)).filter(f => EXTS.has(extname(f)));

for (const { dir, width, quality } of SIZES) {
  await mkdir(join(SRC, dir), { recursive: true });
}

for (const file of files) {
  const stem = basename(file, extname(file));
  const src  = join(SRC, file);

  for (const { dir, width, quality } of SIZES) {
    const dest = join(SRC, dir, `${stem}.webp`);
    try {
      await sharp(src)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality })
        .toFile(dest);
      console.log(`✓ ${dir}/${stem}.webp`);
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
    }
  }
}

console.log('\nDone.');
