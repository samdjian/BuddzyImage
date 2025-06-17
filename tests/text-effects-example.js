import fs from 'fs';
import GenericGenerator from '../generators/generic.js';

async function run() {
  const generator = new GenericGenerator({
    imageWidth: 400,
    imageHeight: 200,
    elements: [
      {
        id: 'outline-text',
        type: 'text',
        text: 'Outlined',
        fontFamily: 'Arial',
        fontSize: '40px',
        color: '#ffffff',
        strokeColor: '#ff0000',
        strokeWidth: 3,
        x: 20,
        y: 60
      },
      {
        id: 'shadow-text',
        type: 'text',
        text: 'Shadow',
        fontFamily: 'Arial',
        fontSize: '40px',
        color: '#000000',
        shadow: { color: '#888888', offsetX: 4, offsetY: 4, blur: 3 },
        x: 20,
        y: 130
      }
    ]
  });

  const buffer = await generator.createImage();
  fs.writeFileSync('./outputs/output-text-effects.png', buffer);
}

run().catch(err => console.error(err));
