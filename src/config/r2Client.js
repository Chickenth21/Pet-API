const { S3Client } = require('@aws-sdk/client-s3');

const isR2Configured = () => {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
};

let r2ClientInstance = null;

const getR2Client = () => {
  if (!isR2Configured()) return null;
  if (!r2ClientInstance) {
    r2ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return r2ClientInstance;
};

module.exports = {
  getR2Client,
  isR2Configured,
  get bucketName() {
    return process.env.R2_BUCKET_NAME || 'petpaw-images';
  },
  get publicUrl() {
    return process.env.R2_PUBLIC_URL || 'https://img.sangnv.id.vn';
  }
};
