import fs from 'fs';
import GenericGenerator from '../generators/generic.js';

async function run() {
  const generator = new GenericGenerator({
    imageWidth: 400,
    imageHeight: 400,
    elements: [
      {
        id: 'curved-text',
        type: 'text',
        text: 'Curved Text Example',
        fontFamily: 'Arial',
        fontSize: '28px',
        color: '#0000ff',
        origin: 'center',
        x: 0,
        y: 0,
        curve: { radius: 150, startAngle: -90, endAngle: 90 }
      }
    ]
  });

  const buffer = await generator.createImage();
  fs.mkdirSync('./outputs', { recursive: true });
  fs.writeFileSync('./outputs/output-curved-text.png', buffer);
}

run().catch(err => console.error(err));
