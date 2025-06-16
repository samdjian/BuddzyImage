import https from 'https';
import sharp from 'sharp';

const fetchImage = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
};

export const handler = async (event) => {
  console.log('event', event);
  try {
    const { imageUrl, width } = event;

    if (!imageUrl || !width) {
      return { statusCode: 400, body: 'Missing imageUrl or width?!' };
    }

    const imageBuffer = await fetchImage(imageUrl);

    const resizedBuffer = await sharp(imageBuffer)
      .resize(parseInt(width))
      .toFormat('jpeg')
      .toBuffer();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'image/jpeg' },
      body: resizedBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Error processing image' };
  }
};
