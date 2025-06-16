const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const https = require('https'); // Import the https module

// --- Configuration ---
const IMAGE_WIDTH = 500;
const IMAGE_HEIGHT = 500;
const OUTPUT_PATH = '../outputs/output-sharp.png';
const AVATAR_URL = 'https://upload.wikimedia.org/wikipedia/en/8/86/Avatar_Aang.png'; // Use the URL for the avatar
const STAR_PATH = '../assets/star.png'; // Updated star path
const CIRCLE_COLOR = 'yellow';
const BACKGROUND_COLOR = 'white';

// --- Helper to fetch image from URL ---
function fetchImage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                return reject(new Error(`Failed to fetch image: Status Code ${response.statusCode}`));
            }
            const data = [];
            response.on('data', chunk => data.push(chunk));
            response.on('end', () => resolve(Buffer.concat(data)));
        }).on('error', reject);
    });
}

// --- Random Helpers ---
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

async function createSharpImage() {
    console.log('Creating image with sharp...');
    try {
        // --- Calculate Circle Properties ---
        const centerX = IMAGE_WIDTH / 2;
        const centerY = IMAGE_HEIGHT / 2;
        const radius = Math.min(IMAGE_WIDTH, IMAGE_HEIGHT) / 4;

        // --- Create SVG for Yellow Circle ---
        const circleSvg = `
            <svg width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}">
                <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${CIRCLE_COLOR}" />
            </svg>
        `;
        const circleBuffer = Buffer.from(circleSvg);

        // --- Prepare Base Image (White Background) ---
        const baseImage = sharp({
            create: {
                width: IMAGE_WIDTH,
                height: IMAGE_HEIGHT,
                channels: 4, // Use 4 channels for RGBA
                background: BACKGROUND_COLOR
            }
        });

        // --- Prepare Stars ---
        const starCompositeLayers = [];
        try {
            const starBuffer = await fs.promises.readFile(STAR_PATH);
            const starMetadata = await sharp(starBuffer).metadata();
            const numStars = getRandomInt(15, 20);
            console.log(`Preparing ${numStars} stars for composition...`);

            for (let i = 0; i < numStars; i++) {
                const scale = getRandomFloat(0.5, 1.3);
                const angle = getRandomFloat(0, 360);
                const targetWidth = Math.round(starMetadata.width * scale);
                const targetHeight = Math.round(starMetadata.height * scale);

                // Create transformed star
                const transformedStar = await sharp(starBuffer)
                    .resize(targetWidth, targetHeight)
                    .rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }) // Use transparent background for rotation
                    .toBuffer({ resolveWithObject: true });

                 // Calculate position for the center of the star
                const randomX = getRandomFloat(transformedStar.info.width / 2, IMAGE_WIDTH - transformedStar.info.width / 2);
                const randomY = getRandomFloat(transformedStar.info.height / 2, IMAGE_HEIGHT - transformedStar.info.height / 2);

                const starLeft = Math.round(randomX - transformedStar.info.width / 2);
                const starTop = Math.round(randomY - transformedStar.info.height / 2);

                starCompositeLayers.push({ input: transformedStar.data, top: starTop, left: starLeft });
            }
        } catch (starErr) {
            console.warn(`Could not load or process star image at ${STAR_PATH}: ${starErr.message}. Skipping stars.`);
        }

        // --- Fetch and Prepare Avatar ---
        let avatarBuffer;
        let avatarCompositeLayer = null; // Initialize as null
        try {
            console.log(`Fetching avatar from ${AVATAR_URL}...`);
            avatarBuffer = await fetchImage(AVATAR_URL);
            console.log('Avatar fetched successfully.');

            const avatarMaxDim = Math.floor(radius * Math.SQRT2); // Max width/height within the circle
            const avatarBufferWithMeta = await sharp(avatarBuffer) // Use the fetched buffer
                .resize(avatarMaxDim, avatarMaxDim, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toBuffer({ resolveWithObject: true });

            // Calculate position to center the resized avatar
            const avatarDrawX = Math.round(centerX - avatarBufferWithMeta.info.width / 2);
            const avatarDrawY = Math.round(centerY - avatarBufferWithMeta.info.height / 2);

            avatarCompositeLayer = {
                input: avatarBufferWithMeta.data,
                top: avatarDrawY,
                left: avatarDrawX
            };
            console.log('Avatar prepared for composition.');

        } catch(fetchError) {
             console.warn(`Failed to fetch or process avatar from ${AVATAR_URL}: ${fetchError.message}. Using placeholder.`);
             // Create placeholder SVG if avatar fetch/processing fails
             const placeholderSvg = `
                <svg width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}">
                    <rect x="${centerX - radius / Math.SQRT2}" y="${centerY - radius / Math.SQRT2}" width="${radius * Math.SQRT2}" height="${radius * Math.SQRT2}" fill="grey" />
                     <text x="${centerX}" y="${centerY}" font-family="Arial" font-size="20" fill="black" text-anchor="middle" dominant-baseline="middle">Avatar N/A</text>
                </svg>
            `;
            avatarCompositeLayer = { input: Buffer.from(placeholderSvg), top: 0, left: 0 };
        }

        // --- Composite Layers ---
        const compositeOperations = [
            { input: circleBuffer, top: 0, left: 0 }, // Draw circle first
            ...starCompositeLayers, // Add stars on top of circle
        ];

        if (avatarCompositeLayer) {
            compositeOperations.push(avatarCompositeLayer); // Add avatar (or placeholder) on top
        }

        await baseImage
            .composite(compositeOperations)
            .png() // Ensure output is png
            .toFile(OUTPUT_PATH);

        console.log(`Image saved as ${OUTPUT_PATH}`);

    } catch (error) {
        console.error('Error creating image with sharp:', error);
    }
}

createSharpImage(); 