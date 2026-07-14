import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export const uploadToS3 = async (buffer: Buffer, filename: string, mimeType: string): Promise<string> => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) throw new Error('AWS_S3_BUCKET_NAME is not configured');

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: filename,
    Body: buffer,
    ContentType: mimeType,
    CacheControl: 'max-age=31536000, public',
  });

  await s3Client.send(command);

  // Return the public URL
  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
};

export const deleteFromS3 = async (fileUrl: string) => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName || !fileUrl) return;

  try {
    // Extract the key (filename) from the URL
    // e.g. https://my-bucket.s3.us-east-1.amazonaws.com/uploads/123-image.jpg
    const urlParts = new URL(fileUrl);
    // remove leading slash
    const key = urlParts.pathname.substring(1);

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
  }
};
