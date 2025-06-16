import sharp from 'sharp';
import BaseGenerator from './base.js';

const DEFAULT_AVATAR_WIDTH = 950;
const DEFAULT_AVATAR_HEIGHT = 950;
const DEFAULT_IMAGE_WIDTH = 1024;
const DEFAULT_IMAGE_HEIGHT = 1024;

class AvatarGenerator extends BaseGenerator {
  constructor(params) {
    super({
      imageWidth: params.imageWidth || DEFAULT_IMAGE_WIDTH,
      imageHeight: params.imageHeight || DEFAULT_IMAGE_HEIGHT,
      defaultBackground: { r: 255, g: 255, b: 255, alpha: 0 },
      ...params,
    });
  }

  async createImage() { // Removed outputPath parameter
    console.time('Avatar Image Creation');
    try {
      let sharpInstance = await this.initAndSetBackground();

      const avatarElement = this.elements[0];
      let avatarInstance = sharp(avatarElement.src);
      const width = avatarElement.width || DEFAULT_AVATAR_WIDTH;
      const height = avatarElement.height || DEFAULT_AVATAR_HEIGHT;

      // first, crop the image to the avatarElement.width and avatarElement.height
      avatarInstance = avatarInstance.trim();

      // then, resize the image and apply any needed transformations
      // const avatarInfo = await this.processElement(avatarElement, this, {}, avatarInstance);
      avatarInstance = await avatarInstance.resize({ width, height, fit: 'inside', position: 'bottom', background: { r: 255, g: 255, b: 255, alpha: 0 } }).toBuffer();

      sharpInstance = sharpInstance.composite([{ input: avatarInstance, gravity: 'south' }]);

      // --- 5. Return Output Buffer ---
      // Ensure the final format is PNG for consistency and transparency support
      const outputBuffer = await sharpInstance.png().toBuffer();
      console.log(`Image generation complete. Returning buffer (size: ${outputBuffer.length} bytes).`);
      console.timeEnd('Avatar Image Creation');
      return outputBuffer; // Return the buffer

    } catch (error) {
      console.error('Error creating avatar image:', error);
      console.timeEnd('Avatar Image Creation'); // Ensure timer ends on error
      throw error; // Re-throw the error to be caught by the handler
    }
  }
}

export default AvatarGenerator; 