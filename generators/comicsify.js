import fsPromises from 'fs/promises';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import OpenAI, { toFile } from 'openai';
import BaseGenerator from './base.js';
import AvatarGenerator from './avatar.js';

const PROMPT = `
Use the reference photo to accurately capture facial features and proportions of the person closest to the camera. If multiple people appear, focus only on that nearest individual.  
Ensure the entire head—from the very top of the hair to the chin—is fully visible, with a small margin above the hairline so nothing is cropped.  
Normalize the framing so that the head and upper bust occupy the same relative size in every output, regardless of the original photo's zoom or distance.  
Create a bust-only 2.5D cartoon avatar with vibrant cel-shading, soft directional shadows, and subtle depth.  
Position the head-and-shoulders so that the bottom edge of the bust sits exactly flush with the bottom edge of the image—no rounding, padding, or empty space below.  
Expression: youthful and dynamic.  
Style: modern 2D animation with semi-realistic textures, bold outlines, smooth gradients on hair and clothing, soft left-side lighting.  
Color palette: a full spectrum of fresh, vibrant colors with glossy accents—no muted or faded tones.  
Background: transparent.  
Art direction: inspired by Pixar and anime aesthetics.
`;

export default class ComicsifyGenerator extends BaseGenerator {
    constructor(params) {
        super({
            imageWidth: 1024,
            imageHeight: 1024,
            defaultBackground: { r: 255, g: 255, b: 255, alpha: 0 },
            ...params,
        });
    }

    async createImage() {
        console.time('Comicsify Image Creation');

        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not set in environment variables.");
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        let tempImagePath = null;

        try {
            if (!this.elements || this.elements.length === 0 || !this.elements[0].src) {
                throw new Error('Input image source (elements[0].src) is required for ComicsifyGenerator.');
            }
            const inputImageSrc = this.elements[0].src;

            const imageBuffer = await this.getImageBuffer(inputImageSrc);

            const randomFileNameBase = crypto.randomBytes(16).toString('hex');
            tempImagePath = path.join(os.tmpdir(), `comicsify-input-${randomFileNameBase}.png`);
            await fsPromises.writeFile(tempImagePath, imageBuffer);

            const image = await toFile(fs.createReadStream(tempImagePath), null, { type: "image/webp" });

            console.log(`Calling OpenAI images.edit with prompt and image: ${inputImageSrc}`);

            const response = await openai.images.edit({
                image: image,
                prompt: PROMPT,
                background: 'transparent',
                model: 'gpt-image-1',
                quality: 'low',
                output_format: 'webp',
                n: 1,
                size: `${this.imageWidth}x${this.imageHeight}`,
            });

            const responseImage = response.data[0].b64_json;
            if (!responseImage) {
                throw new Error("OpenAI API did not return b64_json content.");
            }
            console.log(`OpenAI responded with b64_json data.`);

            // 4. Decode Base64 image
            const openAiImageBuffer = Buffer.from(responseImage, 'base64');

            // 5. Instantiate AvatarGenerator and create image
            console.log('Passing to AvatarGenerator...');
            const avatarGenerator = new AvatarGenerator({
                elements: [{ src: openAiImageBuffer }], // Pass the buffer directly
                imageWidth: this.imageWidth,
                imageHeight: this.imageHeight,
                // Potentially pass other relevant params from this.params if needed by AvatarGenerator
            });

            const finalImageBuffer = await avatarGenerator.createImage();

            console.timeEnd('Comicsify Image Creation');
            return finalImageBuffer;

        } catch (error) {
            console.error('Error creating comicsify image:', error.response ? error.response.data : error);
            console.timeEnd('Comicsify Image Creation');
            throw error;
        } finally {
            // 6. Cleanup temporary files
            if (tempImagePath) {
                try { await fsPromises.unlink(tempImagePath); } catch (e) { console.warn(`Failed to delete temp image: ${tempImagePath}`, e); }
            }
        }
    }
}
