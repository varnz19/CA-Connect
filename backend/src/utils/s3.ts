import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

const isS3Configured = () => {
  return (
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET_NAME
  );
};

let s3Client: S3Client | null = null;

if (isS3Configured()) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

// Local storage fallback directory
const UPLOADS_DIR = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const uploadFile = async (
  file: Express.Multer.File,
  folder = 'documents'
): Promise<{ fileUrl: string; key: string }> => {
  const fileKey = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

  if (s3Client && isS3Configured()) {
    // S3 upload path
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${fileKey}`;
    return { fileUrl, key: fileKey };
  } else {
    // Local storage fallback path
    const localFilePath = path.join(UPLOADS_DIR, path.basename(fileKey));
    fs.writeFileSync(localFilePath, file.buffer || fs.readFileSync(file.path));

    // Construct local serving URL
    const PORT = process.env.PORT || 3000;
    const fileUrl = `http://localhost:${PORT}/uploads/${path.basename(fileKey)}`;
    return { fileUrl, key: fileKey };
  }
};

export const getDownloadUrl = async (key: string): Promise<string> => {
  if (s3Client && isS3Configured()) {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn: 3600 }); // Signed URL valid for 1 hour
  } else {
    const PORT = process.env.PORT || 3000;
    return `http://localhost:${PORT}/uploads/${path.basename(key)}`;
  }
};

export const deleteFile = async (key: string): Promise<void> => {
  if (s3Client && isS3Configured()) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: key,
      })
    );
  } else {
    const localFilePath = path.join(UPLOADS_DIR, path.basename(key));
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
};
