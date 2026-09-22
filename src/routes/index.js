const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const petRoutes = require('./petRoutes');
const healthRoutes = require('./healthRoutes');
const productRoutes = require('./productRoutes');
const affiliateRoutes = require('./affiliateRoutes');
const blogRoutes = require('./blogRoutes');
const aiRoutes = require('./aiRoutes');
const adminRoutes = require('./adminRoutes');

// Root API Healthcheck
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Pet Paw API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/pets', petRoutes);
router.use('/health-records', healthRoutes);
router.use('/products', productRoutes);
router.use('/affiliate', affiliateRoutes);
router.use('/blogs', blogRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
