const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const https = require('https');

// --- Configuration ---
const IMAGE_WIDTH = 500;
const IMAGE_HEIGHT = 500;
const OUTPUT_PATH = '../outputs/output-canvas.png';
const AVATAR_PATH = 'https://upload.wikimedia.org/wikipedia/en/8/86/Avatar_Aang.png'; // Use the URL for the avatar
const STAR_PATH = '../assets/star.png'; // Updated star path
const CIRCLE_COLOR = 'yellow';
const BACKGROUND_COLOR = 'white';

// --- Random Helpers ---
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

async function createCanvasImage() {
    console.log('Creating image with node-canvas...');
    try {
        // --- Setup Canvas ---
        const canvas = createCanvas(IMAGE_WIDTH, IMAGE_HEIGHT);
        const ctx = canvas.getContext('2d');

        // --- Draw Background ---
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);

        // --- Draw Yellow Circle ---
        const centerX = IMAGE_WIDTH / 2;
        const centerY = IMAGE_HEIGHT / 2;
        const radius = Math.min(IMAGE_WIDTH, IMAGE_HEIGHT) / 4; // Circle radius
        ctx.fillStyle = CIRCLE_COLOR;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // --- Load Star Image ---
        let starImage;
        try {
            starImage = await loadImage(STAR_PATH);
        } catch (starErr) {
            console.warn(`Could not load star image at ${STAR_PATH}: ${starErr.message}. Skipping stars.`);
            starImage = null; // Set to null so we skip drawing stars
        }

        // --- Draw Stars ---
        if (starImage) {
            const numStars = getRandomInt(15, 20);
            console.log(`Drawing ${numStars} stars...`);
            for (let i = 0; i < numStars; i++) {
                const scale = getRandomFloat(0.5, 1.3);
                const angle = getRandomFloat(0, Math.PI * 2);
                const starW = starImage.width * scale;
                const starH = starImage.height * scale;
                // Ensure stars are within bounds (considering their scaled size)
                const x = getRandomFloat(starW / 2, IMAGE_WIDTH - starW / 2);
                const y = getRandomFloat(starH / 2, IMAGE_HEIGHT - starH / 2);

                ctx.save(); // Save context state
                ctx.translate(x, y); // Move origin to star position
                ctx.rotate(angle); // Rotate
                // Draw the star centered on the new origin
                ctx.drawImage(starImage, -starImage.width * scale / 2, -starImage.height * scale / 2, starW, starH);
                ctx.restore(); // Restore context state
            }
        }

        // --- Load and Draw Avatar ---
        let avatar;
        try {
            avatar = await loadImage(AVATAR_PATH);
        } catch (imgError) {
            console.error(`Error loading avatar image at ${AVATAR_PATH}:`, imgError.message);
            console.error('Please ensure avatar.png exists in the correct directory.');
            // Optionally draw a placeholder or just stop
             // Draw a placeholder rectangle if avatar fails to load
            ctx.fillStyle = 'gray';
            ctx.fillRect(centerX - radius / Math.SQRT2, centerY - radius / Math.SQRT2, radius * Math.SQRT2, radius * Math.SQRT2);
            ctx.fillStyle = 'black';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Avatar N/A', centerX, centerY);

            // Save image even if avatar failed
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(OUTPUT_PATH, buffer);
            console.log(`Image with placeholder saved as ${OUTPUT_PATH}`);
            return; // Exit function early
        }


        // Calculate avatar dimensions to fit inside the circle
        const avatarAspect = avatar.width / avatar.height;
        const maxDim = radius * Math.SQRT2; // Max width/height within the circle bounds (diameter of inner square)

         // Center the avatar within the circle
        const drawX = centerX - avatar.width * 0.5 / 2;
        const drawY = centerY - avatar.height * 0.5 / 2;


        // Set smoothing quality before drawing
        ctx.imageSmoothingEnabled = true; // Ensure smoothing is on
        ctx.imageSmoothingQuality = 'high'; // Request higher quality smoothing

        // Draw the avatar centered within the circle area
        ctx.drawImage(avatar, drawX, drawY, avatar.width * 0.5, avatar.height * 0.5);


        // --- Save Image ---
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(OUTPUT_PATH, buffer);
        console.log(`Image saved as ${OUTPUT_PATH}`);

    } catch (error) {
        console.error('Error creating image with node-canvas:', error);
    }
}

createCanvasImage(); 