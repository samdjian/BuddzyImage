import sharp from 'sharp';



const image = await sharp('tmp_assets/Fond_Blanc.png').trim().resize({ width: 900, height: 900, fit: 'contain', position: 'bottom', background: { r: 255, g: 255, b: 255, alpha: 0 } }).toBuffer();

sharp({
  create: {
    width: 1024,
    height: 1024,
    channels: 4, // RGBA
    background: { r: 255, g: 255, b: 255, alpha: 0 }
  }
})
.composite([{ input: image, gravity: 'south' }])
.toFile('outputs/trimmed_image.webp');