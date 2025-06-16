import { handler } from './index.mjs';
import fs from 'fs';

const outName = `whatever.webp`;
const event = {
  "shouldReturnAsBase64": true,
  "desiredFileType": "webp",
  "generator": "avatar",
  "region": "eu-west-3",
  "outName": outName,
  "params": {
    "elements": [
      {
        "src": "tmp_assets/4.png"
      }
    ]
  }
};


// --- Invocation Logic --- Slightly modified to save with specific name
(async () => {
  try {
    console.log("Invoking handler with event:", JSON.stringify(event, null, 2)); // Log the event clearly
    const result = await handler(event);
    console.log('Handler result status:', result.statusCode);

    if (result.statusCode === 200 && result.isBase64Encoded) {
      const outputPath = './outputs/output-avatar.webp'; // Save with specific name
      fs.writeFileSync(outputPath, Buffer.from(result.body, 'base64'));
      console.log(`Image saved as ${outputPath}`);
    } else {
      console.error('Handler failed or did not return base64 image. Body:', result.body);
    }

  } catch (error) {
    console.error('Error calling handler:', error);
  }
})();