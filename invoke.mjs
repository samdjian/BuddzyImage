import { handler } from './index.mjs';
import fs from 'fs';

const outName = `users/1/shared/1/20250430120000.png`;
const event = {
    "shouldReturnAsBase64": true,
    "generator": "generic",
    "region": "eu-west-3",
    "outName": outName,
    "params": {
        "imageWidth": 800,
        "imageHeight": 1422,
        "background": "assets/bg.jpg",
        "elements": [
            {
                "id": "avatar",
                "type": "image",
                "src": "assets/avatar.webp",
                "width": 410,
                "height": null,
                "origin": "center",
                "x": null,
                "y": -300
            },
            {
                "id": "crown",
                "type": "image",
                "src": "assets/crown.webp",
                "width": 400,
                "height": null,
                "origin": "avatar",
                "x": -80,
                "y": -200
            },
             {
                 "id": "logo",
                 "type": "image",
                 "src": "assets/logo.png",
                 "width": 300,
                 "height": null,
                 "rotation": -10,
                 "origin": null,
                 "x": 480,
                 "y": 1252
             },
             {
               "id": "title",
               "type": "text",
               "text": "Sam",
               "fontFamily": "sans-serif",
               "fontSize": "180px",
               "fontWeight": "800",
               "origin": "avatar",
               "y": -250,
               "x": -50
             },
             {
               "id": "text-line1.1",
               "type": "text",
               "text": "est",
               "fontFamily": "sans-serif",
               "fontSize": "80px",
               "fontWeight": "bold",
               "color": "#000000",
               "x": 250,
               "y": 1132
             },
             {
               "id": "text-line1.2",
               "type": "text",
               "text": "mon",
               "fontFamily": "serif",
               "fontStyle": "italic",
               "fontSize": "80px",
               "color": "#000000",
               "x": 400,
               "y": 1132
             },
             {
               "id": "text-line2.1",
               "type": "text",
               "text": "numéro",
               "fontFamily": "sans-serif",
               "fontSize": "80px",
               "color": "#05A2FC",
               "x": 200,
               "y": 1222
             },
             {
               "id": "text-line2.2",
               "type": "text",
               "text": "1",
               "fontFamily": "serif",
               "fontSize": "150px",
               "fontWeight": "bold",
               "color": "#FBCF1C",
               "x": 480,
               "y": 1222
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
      const outputPath = './outputs/output-generic.png'; // Save with specific name
      fs.writeFileSync(outputPath, Buffer.from(result.body, 'base64'));
      console.log(`Image saved as ${outputPath}`);
    } else {
       console.error('Handler failed or did not return base64 image. Body:', result.body);
    }

  } catch (error) {
    console.error('Error calling handler:', error);
  }
})();