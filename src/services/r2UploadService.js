const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getR2Client, isR2Configured, bucketName, publicUrl } = require('../config/r2Client');

class R2UploadService {
  /**
   * Xử lý nén ảnh sang WebP bằng Sharp và tải lên Cloudflare R2
   * @param {Object} file - File object từ Multer (file.buffer, file.originalname, file.size)
   * @param {string} folder - Thư mục phân loại (vd: 'pets', 'products', 'blogs')
   * @returns {Promise<{ url: string, key: string, originalSize: number, compressedSize: number, savingsPercent: string }>}
   */
  async processAndUploadImage(file, folder = 'pets') {
    if (!file || !file.buffer) {
      throw new Error('Không tìm thấy dữ liệu ảnh để xử lý');
    }

    const originalSize = file.size;

    // 1. Sharp nén ảnh sang định dạng WebP (giảm ~90% dung lượng)
    const compressedWebpBuffer = await sharp(file.buffer)
      .rotate() // Tự động xoay đúng chiều theo EXIF
      .resize({
        width: 1920,
        height: 1920,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    const compressedSize = compressedWebpBuffer.length;
    const savingsPercent = originalSize > 0 
      ? (((originalSize - compressedSize) / originalSize) * 100).toFixed(1) + '%'
      : '0%';

    // 2. Tạo tên file duy nhất định dạng .webp
    const randomHex = crypto.randomBytes(6).toString('hex');
    const timestamp = Date.now();
    const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    const fileKey = `${cleanFolder}/${timestamp}-${randomHex}.webp`;

    const r2Client = getR2Client();

    // 3. Upload lên Cloudflare R2 nếu đã cấu hình API Key
    if (isR2Configured() && r2Client) {
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: compressedWebpBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable'
      });

      await r2Client.send(putCommand);

      const normalizedPublicUrl = publicUrl.replace(/\/+$/, '');
      const finalUrl = `${normalizedPublicUrl}/${fileKey}`;

      return {
        url: finalUrl,
        key: fileKey,
        originalSize,
        compressedSize,
        savingsPercent,
        storage: 'cloudflare_r2'
      };
    }

    // 4. Cơ chế Dự Phòng (Fallback Local): Nếu chưa điền key R2, lưu vào thư mục public để dev không bị gián đoạn
    const localDir = path.join(__dirname, '../../public/uploads', cleanFolder);
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    const localFilePath = path.join(localDir, `${timestamp}-${randomHex}.webp`);
    fs.writeFileSync(localFilePath, compressedWebpBuffer);

    const port = process.env.PORT || 5000;
    const localUrl = `http://localhost:${port}/uploads/${cleanFolder}/${timestamp}-${randomHex}.webp`;

    return {
      url: localUrl,
      key: fileKey,
      originalSize,
      compressedSize,
      savingsPercent,
      storage: 'local_fallback',
      notice: 'Ảnh đã được nén WebP và lưu tạm cục bộ. Vui lòng cấu hình R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY trong server/.env để tải trực tiếp lên Cloudflare R2.'
    };
  }

  /**
   * Xử lý tải lên nhiều ảnh đồng thời
   */
  async processAndUploadMultipleImages(files, folder = 'pets') {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('Vui lòng chọn ít nhất một file ảnh');
    }

    const results = await Promise.all(
      files.map(file => this.processAndUploadImage(file, folder))
    );

    return results;
  }
}

module.exports = new R2UploadService();
