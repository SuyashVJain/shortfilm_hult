// Converts the textless source backdrops in bg_img/ to WebP at about 300 KB.
// Originals are left untouched. Run: npm run backdrops
import sharp from "sharp";
import { statSync } from "node:fs";

const TARGET = 300 * 1024;
const jobs = [
  { src: "bg_img/bg-desktop.png", out: "public/cinema/bg-desktop.webp", width: 2560 },
  { src: "bg_img/bg-mobile.png", out: "public/cinema/bg-mobile.webp", width: 1080 },
];

for (const { src, out, width } of jobs) {
  let quality = 82;
  let size = Infinity;
  // Step quality down until the file fits the budget.
  while (quality >= 40) {
    await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality, effort: 6 }).toFile(out);
    size = statSync(out).size;
    if (size <= TARGET) break;
    quality -= 4;
  }
  console.log(`${out}: ${(size / 1024).toFixed(0)} KB at q${quality}`);
}
