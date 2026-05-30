const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

async function main() {
  const logoJpgPath = path.resolve(__dirname, '../public/logo.jpg');
  const logoPngPath = path.resolve(__dirname, '../public/logo.png');
  const faviconPngPath = path.resolve(__dirname, '../public/favicon.png');

  console.log('Loading logo.jpg...');
  const image = await Jimp.read(logoJpgPath);
  console.log(`Image loaded. Size: ${image.width}x${image.height}`);

  // Create a transparent image of same size
  image.scan(0, 0, image.width, image.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];

    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    const diff = maxVal - minVal;

    // Check if pixel is neutral (gray/white checkered background)
    // The logo is blue/cyan, which means R is much lower than G/B, diff is large.
    // Checkerboard squares have small diff and high values.
    const isGrayOrWhite = diff < 45 || (maxVal > 220 && diff < 65);

    if (isGrayOrWhite) {
      this.bitmap.data[idx + 3] = 0; // Transparent
    }
  });

  console.log('Writing logo.png...');
  await image.write(logoPngPath);

  console.log('Creating favicon.png...');
  const favicon = image.clone().resize({ w: 48, h: 48 });
  await favicon.write(faviconPngPath);

  console.log('Successfully processed logo and created favicon.png!');
}

main().catch(err => {
  console.error('Error processing image:', err);
});
