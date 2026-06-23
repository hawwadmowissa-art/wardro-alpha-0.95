/**
 * Fix white-corner artifacts in PWA icon PNGs.
 * Flood-fills near-white pixels from each corner with full transparency.
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ICONS_DIR = path.join(__dirname, '..', 'icons');
const WHITE_THRESHOLD = 240;

async function fixIcon(filePath) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info; // channels === 4 (RGBA)
  const buf = Buffer.from(data);

  function idx(x, y) { return (y * width + x) * channels; }

  function isNearWhite(x, y) {
    const i = idx(x, y);
    return buf[i] > WHITE_THRESHOLD &&
           buf[i+1] > WHITE_THRESHOLD &&
           buf[i+2] > WHITE_THRESHOLD &&
           buf[i+3] > 127; // opaque enough to matter
  }

  function floodFill(startX, startY) {
    const stack = [[startX, startY]];
    const visited = new Uint8Array(width * height);
    while (stack.length) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      const vi = y * width + x;
      if (visited[vi]) continue;
      visited[vi] = 1;
      if (!isNearWhite(x, y)) continue;
      // Make fully transparent
      const i = idx(x, y);
      buf[i] = 0; buf[i+1] = 0; buf[i+2] = 0; buf[i+3] = 0;
      stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
    }
  }

  floodFill(0, 0);
  floodFill(width - 1, 0);
  floodFill(0, height - 1);
  floodFill(width - 1, height - 1);

  await sharp(buf, { raw: { width, height, channels } })
    .png()
    .toFile(filePath + '.tmp');

  fs.renameSync(filePath + '.tmp', filePath);
  console.log(`  fixed: ${path.basename(filePath)} (${width}x${height})`);
}

async function main() {
  console.log(`Processing: ${ICONS_DIR}`);
  const files = fs.readdirSync(ICONS_DIR).filter(f => f.toLowerCase().endsWith('.png'));
  for (const f of files) {
    await fixIcon(path.join(ICONS_DIR, f));
  }
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
