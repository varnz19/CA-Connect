"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.getDownloadUrl = exports.uploadFile = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const isS3Configured = () => {
    return (process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.S3_BUCKET_NAME);
};
let s3Client = null;
if (isS3Configured()) {
    s3Client = new client_s3_1.S3Client({
        region: process.env.AWS_REGION || 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });
}
// Local storage fallback directory
const UPLOADS_DIR = path_1.default.join(__dirname, '../../../uploads');
if (!fs_1.default.existsSync(UPLOADS_DIR)) {
    fs_1.default.mkdirSync(UPLOADS_DIR, { recursive: true });
}
const uploadFile = async (file, folder = 'documents') => {
    const fileKey = `${folder}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    if (s3Client && isS3Configured()) {
        // S3 upload path
        await s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));
        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${fileKey}`;
        return { fileUrl, key: fileKey };
    }
    else {
        // Local storage fallback path
        const localFilePath = path_1.default.join(UPLOADS_DIR, path_1.default.basename(fileKey));
        fs_1.default.writeFileSync(localFilePath, file.buffer || fs_1.default.readFileSync(file.path));
        // Construct local serving URL
        const PORT = process.env.PORT || 3000;
        const fileUrl = `http://localhost:${PORT}/uploads/${path_1.default.basename(fileKey)}`;
        return { fileUrl, key: fileKey };
    }
};
exports.uploadFile = uploadFile;
const getDownloadUrl = async (key) => {
    if (s3Client && isS3Configured()) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 }); // Signed URL valid for 1 hour
    }
    else {
        const PORT = process.env.PORT || 3000;
        return `http://localhost:${PORT}/uploads/${path_1.default.basename(key)}`;
    }
};
exports.getDownloadUrl = getDownloadUrl;
const deleteFile = async (key) => {
    if (s3Client && isS3Configured()) {
        await s3Client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
        }));
    }
    else {
        const localFilePath = path_1.default.join(UPLOADS_DIR, path_1.default.basename(key));
        if (fs_1.default.existsSync(localFilePath)) {
            fs_1.default.unlinkSync(localFilePath);
        }
    }
};
exports.deleteFile = deleteFile;
//# sourceMappingURL=s3.js.map