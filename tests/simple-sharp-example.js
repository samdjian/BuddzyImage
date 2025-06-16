import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration Constants ---
const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 1422;

const BACKGROUND_PATH = path.join(__dirname, '../assets/bg.jpg');
const AVATAR_PATH = path.join(__dirname, '../assets/avatar.webp');
const LOGO_PATH = path.join(__dirname, '../assets/logo.png');
const CROWN_PATH = path.join(__dirname, '../assets/crown.webp');
const OUTPUT_PATH = path.join(__dirname, '../outputs/output-simple-sharp.png');

const TEXT_COLOR = '#000000';

const TITLE_FONT_FAMILY = 'Arial';
const TITLE_FONT_SIZE = '90px';
const TITLE_FONT_WEIGHT = 'bold';
const TITLE_Y = 180;

const AVATAR_TARGET_WIDTH = 410;
const AVATAR_Y_OFFSET = 20;

const CROWN_TARGET_WIDTH = 400;
const CROWN_X_OFFSET = -80; // Relative to avatar X
const CROWN_Y_OFFSET = 100; // Relative to avatar Y after crown height adjustment

const LOGO_TARGET_WIDTH = 300;
const LOGO_X_MARGIN = 20;
const LOGO_Y_MARGIN = 20;

const BOTTOM_TEXT_LINE1_Y = IMAGE_HEIGHT - 290;
const BOTTOM_TEXT_LINE2_Y = IMAGE_HEIGHT - 200;
const BOTTOM_TEXT_SPACING = 30;
const BOTTOM_TEXT_FONTS = [
  { family: 'Arial', style: 'normal', weight: 'bold', size: '70px' },
  { family: 'Times New Roman', style: 'italic', weight: 'normal', size: '70px' },
  { family: 'Comic Sans MS', style: 'normal', weight: 'bold', size: '70px' },
  { family: 'Georgia', style: 'normal', weight: 'bold', size: '150px' }
];

// --- Helper Function for Generating SVG Overlay ---
function generateSvgOverlay() {
  return `
    <svg width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}">
      <style>
        .title { font: ${TITLE_FONT_WEIGHT} ${TITLE_FONT_SIZE} ${TITLE_FONT_FAMILY}; fill: ${TEXT_COLOR}; }
        /* Subtitle styles applied inline via tspan */
      </style>

      <text x="50%" y="${TITLE_Y}" text-anchor="middle" class="title">Jeremy</text>

      <text x="50%" y="${BOTTOM_TEXT_LINE1_Y}" text-anchor="middle">
        <tspan font-family="${BOTTOM_TEXT_FONTS[0].family}" font-style="${BOTTOM_TEXT_FONTS[0].style}" font-weight="${BOTTOM_TEXT_FONTS[0].weight}" font-size="${BOTTOM_TEXT_FONTS[0].size}" fill="${TEXT_COLOR}">est</tspan>
        <tspan dx="${BOTTOM_TEXT_SPACING}" font-family="${BOTTOM_TEXT_FONTS[1].family}" font-style="${BOTTOM_TEXT_FONTS[1].style}" font-weight="${BOTTOM_TEXT_FONTS[1].weight}" font-size="${BOTTOM_TEXT_FONTS[1].size}" fill="${TEXT_COLOR}">mon</tspan>
      </text>

      <text x="50%" y="${BOTTOM_TEXT_LINE2_Y}" text-anchor="middle">
        <tspan font-family="${BOTTOM_TEXT_FONTS[2].family}" font-style="${BOTTOM_TEXT_FONTS[2].style}" font-weight="${BOTTOM_TEXT_FONTS[2].weight}" font-size="${BOTTOM_TEXT_FONTS[2].size}" fill="${TEXT_COLOR}">numéro</tspan>
        <tspan dx="${BOTTOM_TEXT_SPACING}" font-family="${BOTTOM_TEXT_FONTS[3].family}" font-style="${BOTTOM_TEXT_FONTS[3].style}" font-weight="${BOTTOM_TEXT_FONTS[3].weight}" font-size="${BOTTOM_TEXT_FONTS[3].size}" fill="${TEXT_COLOR}">1</tspan>
      </text>
    </svg>
  `;
}

// --- Main Image Creation Function ---
async function createSharpImage() {
  console.time('Sharp Image Creation'); // Start timer
  try {
    // Resize images concurrently
    const [resizedAvatar, resizedCrown, resizedLogo] = await Promise.all([
      sharp(AVATAR_PATH)
        .resize(AVATAR_TARGET_WIDTH, null, { fit: 'inside' })
        .toBuffer({ resolveWithObject: true }),
      sharp(CROWN_PATH)
        .resize(CROWN_TARGET_WIDTH, null, { fit: 'inside' })
        .toBuffer({ resolveWithObject: true }),
      sharp(LOGO_PATH)
        .resize(LOGO_TARGET_WIDTH, null, { fit: 'inside' })
        .toBuffer({ resolveWithObject: true })
    ]);

    // Generate SVG overlay
    const svgOverlay = generateSvgOverlay();
    const svgBuffer = Buffer.from(svgOverlay);

    // --- Calculate Positions ---
    const avatarX = Math.round((IMAGE_WIDTH - resizedAvatar.info.width) / 2);
    const avatarY = Math.round((IMAGE_HEIGHT - resizedAvatar.info.height) / 2 + AVATAR_Y_OFFSET);

    const crownX = avatarX + CROWN_X_OFFSET;
    const crownY = avatarY - resizedCrown.info.height + CROWN_Y_OFFSET;

    const logoX = IMAGE_WIDTH - resizedLogo.info.width - LOGO_X_MARGIN;
    const logoY = IMAGE_HEIGHT - resizedLogo.info.height - LOGO_Y_MARGIN;

    // --- Composite Image ---
    await sharp(BACKGROUND_PATH)
      .resize(IMAGE_WIDTH, IMAGE_HEIGHT) // Ensure background is correct size
      .composite([
        { input: svgBuffer, top: 0, left: 0 },
        { input: resizedAvatar.data, top: avatarY, left: avatarX },
        { input: resizedCrown.data, top: crownY, left: crownX },
        { input: resizedLogo.data, top: logoY, left: logoX }
      ])
      .toFile(OUTPUT_PATH);

    console.log(`Image saved as ${OUTPUT_PATH}`);
    console.timeEnd('Sharp Image Creation'); // End timer after file is saved

  } catch (error) {
    console.error('Error creating image with Sharp:', error);
    console.timeEnd('Sharp Image Creation'); // Ensure timer ends even on error
  }
}

// Run the image creation
createSharpImage(); 