import BaseGenerator from './base.js';
import { Buffer } from 'buffer';

class GenericGenerator extends BaseGenerator {
  constructor(params) {
    super(params);
  }

  async createImage() { // Removed outputPath parameter
    console.time('Generic Image Creation');
    try {
      // --- 1. Initialize Sharp ---
      const sharpPromise = this.initAndSetBackground();

      const compositeOperations = [];
      const metOrigins = new Set();
      const elementsData = {};
      const svgTextElements = [];

      // --- 2. Process Elements (Handle potential dependencies for origin) ---
      for (const element of this.elements) {
        if (element.origin && element.origin !== 'center' && !metOrigins.has(element.origin)) {
          throw new Error(`-> Element ${element.id} with origin '${element.origin}' cannot be processed, make sure it is processed before this element`);
        }

        const result = await this.processElement(element, this, elementsData);
        if (result) {
          metOrigins.add(element.id);
          elementsData[element.id] = result.elementsData;
          if (result.type === 'composite') {
            compositeOperations.push(result.data);
          } else if (result.type === 'svg') {
            svgTextElements.push(result.data);
          }
        } else {
          throw new Error(`-> Element ${element.id} failed to process`);
        }
      }
      console.log("Element processing finished.");

      // Await the initial image creation/resizing *before* compositing
      let sharpInstance = await sharpPromise;

      // --- 3. Add SVG Text Overlay ---
      if (svgTextElements.length > 0) {
        // Ensure SVG has proper namespace and potentially style block if needed later
        // Add encoding attribute
        const svgOverlay = `<svg width="${this.imageWidth}" height="${this.imageHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" encoding="UTF-8">${svgTextElements.join('')}</svg>`;
        console.log('Generated SVG:', svgOverlay); // Log SVG for debugging
        const svgBuffer = Buffer.from(svgOverlay, 'utf8'); // Specify buffer encoding
        compositeOperations.push({ input: svgBuffer, top: 0, left: 0, blend: 'over' }); // Use 'over' blend mode
      }

      // --- 4. Composite All ---
      if (compositeOperations.length > 0) {
        console.log(`Compositing ${compositeOperations.length} operations...`);
        sharpInstance = sharpInstance.composite(compositeOperations);
      }

      // --- 5. Return Output Buffer ---
      // Ensure the final format is PNG for consistency and transparency support
      const outputBuffer = await sharpInstance.png().toBuffer();
      console.log(`Image generation complete. Returning buffer (size: ${outputBuffer.length} bytes).`);
      console.timeEnd('Generic Image Creation');
      return outputBuffer; // Return the buffer

    } catch (error) {
      console.error('Error creating generic image:', error);
      console.timeEnd('Generic Image Creation'); // Ensure timer ends on error
      throw error; // Re-throw the error to be caught by the handler
    }
  }
}

export default GenericGenerator; 