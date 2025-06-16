const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

// --- Configuration Constants ---
const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 1422;

const BACKGROUND_PATH = '../assets/bg.jpg';
const AVATAR_PATH = '../assets/avatar.webp';
const LOGO_PATH = '../assets/logo.png';
const CROWN_PATH = '../assets/crown.webp';
const OUTPUT_PATH = '../outputs/output-simple-canvas.png';

const TEXT_COLOR = '#000000';

const TITLE_FONT = 'bold 90px Arial';
const TITLE_Y = 180;

const AVATAR_TARGET_WIDTH = 410;
const AVATAR_Y_OFFSET = 20;

const CROWN_TARGET_WIDTH = 400;
const CROWN_X_OFFSET = -80; // Relative to avatar X
const CROWN_Y_OFFSET = 100; // Relative to avatar Y after crown height adjustment

const BOTTOM_TEXT_FONTS = [
  'bold 70px Arial',
  'italic 70px Times New Roman',
  'bold 70px Comic Sans MS',
  'bold 150px Georgia'
];
const BOTTOM_TEXT_LINE1 = ["est", "mon"];
const BOTTOM_TEXT_LINE2 = ["numéro", "1"];
const BOTTOM_TEXT_LINE1_Y = IMAGE_HEIGHT - 290;
const BOTTOM_TEXT_LINE2_Y = IMAGE_HEIGHT - 200;
const BOTTOM_TEXT_SPACING = 30;

const LOGO_TARGET_WIDTH = 300;
const LOGO_X_MARGIN = 20;
const LOGO_Y_MARGIN = 20;

// --- Helper Function for Drawing Multi-Font Text ---
function drawMultiFontTextLine(ctx, words, fonts, startFontIndex, lineY, spacing) {
  ctx.fillStyle = TEXT_COLOR;
  ctx.textAlign = 'left'; // Keep left alignment for calculation

  // Calculate total line width with specific fonts
  let totalWidth = 0;
  let currentFontIndex = startFontIndex;
  words.forEach((word, index) => {
    ctx.font = fonts[currentFontIndex % fonts.length];
    totalWidth += ctx.measureText(word).width;
    if (index < words.length - 1) {
      totalWidth += spacing;
    }
    currentFontIndex++;
  });

  // Draw the words centered
  let currentX = (IMAGE_WIDTH - totalWidth) / 2;
  currentFontIndex = startFontIndex;
  words.forEach((word) => {
    ctx.font = fonts[currentFontIndex % fonts.length];
    ctx.fillText(word, currentX, lineY);
    currentX += ctx.measureText(word).width + spacing;
    currentFontIndex++;
  });

  return currentFontIndex; // Return the next font index to use
}

// Function to create the image
async function createImage() {
  console.time('Canvas Image Creation'); // Start timer
  const canvas = createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
  const ctx = canvas.getContext('2d');
  
  try {
    // Load all images
    const [backgroundImg, avatarImg, logoImg, crownImg] = await Promise.all([
      loadImage(BACKGROUND_PATH),
      loadImage(AVATAR_PATH),
      loadImage(LOGO_PATH),
      loadImage(CROWN_PATH)
    ]);
    
    // Draw background
    ctx.drawImage(backgroundImg, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
    
    // Draw Title
    ctx.font = TITLE_FONT;
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = 'center';
    ctx.fillText('Jeremy', IMAGE_WIDTH / 2, TITLE_Y);
    
    // Calculate Avatar dimensions and position
    const avatarAspectRatio = avatarImg.naturalWidth / avatarImg.naturalHeight;
    const avatarHeight = AVATAR_TARGET_WIDTH / avatarAspectRatio;
    const avatarX = (IMAGE_WIDTH - AVATAR_TARGET_WIDTH) / 2;
    const avatarY = (IMAGE_HEIGHT - avatarHeight) / 2 + AVATAR_Y_OFFSET;
    
    // Draw Avatar
    ctx.drawImage(avatarImg, avatarX, avatarY, AVATAR_TARGET_WIDTH, avatarHeight);
    
    // Calculate Crown dimensions and position
    const crownAspectRatio = crownImg.naturalWidth / crownImg.naturalHeight;
    const crownHeight = CROWN_TARGET_WIDTH / crownAspectRatio;
    const crownX = avatarX + CROWN_X_OFFSET;
    const crownY = avatarY - crownHeight + CROWN_Y_OFFSET;
    
    // Draw Crown
    ctx.drawImage(crownImg, crownX, crownY, CROWN_TARGET_WIDTH, crownHeight);
    
    // Draw Bottom Text Lines
    let nextFontIndex = drawMultiFontTextLine(
      ctx,
      BOTTOM_TEXT_LINE1,
      BOTTOM_TEXT_FONTS,
      0,
      BOTTOM_TEXT_LINE1_Y,
      BOTTOM_TEXT_SPACING
    );
    drawMultiFontTextLine(
      ctx,
      BOTTOM_TEXT_LINE2,
      BOTTOM_TEXT_FONTS,
      nextFontIndex, // Continue font index
      BOTTOM_TEXT_LINE2_Y,
      BOTTOM_TEXT_SPACING
    );
    
    // Calculate Logo dimensions and position
    const logoAspectRatio = logoImg.naturalWidth / logoImg.naturalHeight;
    const logoHeight = LOGO_TARGET_WIDTH / logoAspectRatio;
    const logoX = IMAGE_WIDTH - LOGO_TARGET_WIDTH - LOGO_X_MARGIN;
    const logoY = IMAGE_HEIGHT - logoHeight - LOGO_Y_MARGIN;
    
    // Draw Logo
    ctx.drawImage(logoImg, logoX, logoY, LOGO_TARGET_WIDTH, logoHeight);
    
    // Save the image to a file
    const out = fs.createWriteStream(OUTPUT_PATH);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    
    out.on('finish', () => {
      console.log(`Image saved as ${OUTPUT_PATH}`);
      console.timeEnd('Canvas Image Creation'); // End timer when file is saved
    });
    
  } catch (error) {
    console.error('Error creating image:', error);
    console.timeEnd('Canvas Image Creation'); // Ensure timer ends even on error
  }
}

// Run the image creation
createImage(); 