import { createCanvas } from 'canvas';
import fs from 'fs';

[192, 512].forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#c8401a';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.35}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AI', size/2, size/2);
  fs.writeFileSync(`public/icon-${size}.png`, canvas.toBuffer('image/png'));
  console.log(`Created icon-${size}.png`);
});
