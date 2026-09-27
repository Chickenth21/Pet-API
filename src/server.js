const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares cấu hình
app.use(cors({
  origin: '*', // Cho phép gọi từ Vite client hoặc mọi origin môi trường dev
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger đơn giản
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString('vi-VN')}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes chính
app.use('/api', routes);

// 404 handler cho các route không xác định
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy tài nguyên: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler kết nối Discord Alert
app.use(errorHandler);

const { sendDiscordError } = require('./utils/discordLogger');

// Bắt mọi ngoại lệ Node.js chưa xử lý (Uncaught Exceptions)
process.on('uncaughtException', (err) => {
  console.error('💥 [FATAL UNCAUGHT EXCEPTION]:', err);
  sendDiscordError(err, { source: 'NodeJS Uncaught Exception', url: 'Fatal Crash' })
    .catch(() => {});
});

// Bắt mọi Promise bị từ chối chưa xử lý (Unhandled Rejections)
process.on('unhandledRejection', (reason) => {
  console.error('💥 [FATAL UNHANDLED REJECTION]:', reason);
  const err = reason instanceof Error ? reason : new Error(String(reason));
  sendDiscordError(err, { source: 'NodeJS Unhandled Promise Rejection', url: 'Async Error' })
    .catch(() => {});
});

const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`==============================================`);
  console.log(`🚀 Pet Paw API Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${config.nodeEnv}`);
  console.log(`📡 Supabase Endpoint: ${config.supabase.url}`);
  console.log(`💬 Discord Channel Alert: ${config.discord.channelId}`);
  console.log(`==============================================`);
});

module.exports = { app, server };
