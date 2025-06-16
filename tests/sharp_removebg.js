import sharp from 'sharp';

// Tolerance function
function colorWithinTolerance(c1, c2, tolerance = 10) {
  return Math.abs(c1[0] - c2[0]) <= tolerance &&
         Math.abs(c1[1] - c2[1]) <= tolerance &&
         Math.abs(c1[2] - c2[2]) <= tolerance;
}

// Flood fill algorithm
function floodFillTransparent(pixels, width, height, startX, startY, targetColor, tolerance = 10) {
  const visited = new Set();
  const queue = [[startX, startY]];

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    const idx = (y * width + x) * 4;
    if (visited.has(idx)) continue;
    visited.add(idx);

    const color = [pixels[idx], pixels[idx + 1], pixels[idx + 2]];

    if (!colorWithinTolerance(color, targetColor, tolerance)) continue;

    // Make transparent
    pixels[idx + 3] = 0;

    // Add neighbors
    if (x > 0) queue.push([x - 1, y]);
    if (x < width - 1) queue.push([x + 1, y]);
    if (y > 0) queue.push([x, y - 1]);
    if (y < height - 1) queue.push([x, y + 1]);
  }
}

const processImage = async (inputPath, outputPath) => {
  const image = sharp(inputPath).ensureAlpha();
  const { width, height } = await image.metadata();

  const { data } = await image.raw().toBuffer({ resolveWithObject: true });

  const clonedData = Buffer.from(data); // avoid modifying original buffer

  // Sample color from top-left corner
  const cornerIndex = 0;
  const bgColor = [clonedData[cornerIndex], clonedData[cornerIndex + 1], clonedData[cornerIndex + 2]];

  // Run flood fill from each corner
  floodFillTransparent(clonedData, width, height, 0, 0, bgColor); // top-left
  floodFillTransparent(clonedData, width, height, width - 1, 0, bgColor); // top-right
  floodFillTransparent(clonedData, width, height, 0, height - 1, bgColor); // bottom-left
  floodFillTransparent(clonedData, width, height, width - 1, height - 1, bgColor); // bottom-right

  // Save result
  await sharp(clonedData, {
    raw: { width, height, channels: 4 }
  }).png().toFile(outputPath);

  console.log('Saved output to', outputPath);
};

processImage('tmp_assets/Trop_Petit.png', 'outputs/Trop_Petit_Trimmed.png');
