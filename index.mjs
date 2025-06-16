import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const handler = async (event) => {
  console.log('event', event);
  try {
    let payload;
    if (event.body) {
      try {
        payload = typeof event.body === 'string'
          ? JSON.parse(event.body)
          : event.body;
      } catch (err) {
        console.error('Invalid JSON body:', err);
        return { statusCode: 400, body: 'Invalid JSON payload' };
      }
    } else {
      payload = event;
    }
    
    let { generator, region, outName, params, desiredFileType = 'png', shouldReturnAsBase64 = false } = payload;

    if (!params || !region || !outName) {
      console.error('Missing required parameters:', { params, region, outName }); // Log the error server-side
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json' // Specify the content type
        },
        // Stringify the JSON payload
        body: JSON.stringify({ error: 'Missing required parameters: params, region, outName.' })
      };
    }

    if (!generator) {
      generator = 'generic';
    }

    const generatorClass = await import(`./generators/${generator}.js`);
    const generatorInstance = new generatorClass.default(params);

    const imageBuffer = await generatorInstance.createImage();

    // Ensure image buffer is valid before proceeding
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error("Image generation returned empty buffer.");
    }

    // Convert to desired file type for consistency before saving/returning
    const buffer = await sharp(imageBuffer)
      .toFormat(desiredFileType)
      .toBuffer();

    let url = null;
    if (!shouldReturnAsBase64) {
      const bucketName = 'buddzy-assets';
      const key = outName;

      // Initialize S3 client without region, letting SDK detect from environment
      const s3Client = new S3Client({});
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: `image/${desiredFileType}`
      });

      console.log(`Attempting to upload to s3://${bucketName}/${key}`);
      await s3Client.send(command);
      console.log(`Successfully uploaded to s3://${bucketName}/${key}`);

      // Construct the correct public URL
      url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, outKey: key }),
        isBase64Encoded: false,
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': `image/${desiredFileType}` },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error('Error during handler execution:', err);
    // Provide more specific error in response body if possible
    return { statusCode: 500, body: `Error processing image: ${err.message || 'Unknown error'}` };
  }
};
