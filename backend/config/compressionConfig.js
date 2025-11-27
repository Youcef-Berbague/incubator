// config/compressionConfig.js

const compression = require('compression');

/**
 * Middleware للضغط الأمثل في خوادم API حديثة
 * - يُفعّل GZIP فقط
 * - يضغط فقط JSON ونص عادي
 * - يستثني مسارات غير ضرورية
 */
const compressionMiddleware = compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    // ⛔ تجاهل إذا طُلب عدم الضغط
    if (req.headers['x-no-compression']) return false;

    // ⛔ استثناء مسارات معينة
    const excludedPaths = [
      '/api/ai',
      '/health'
    ];
    if (excludedPaths.some(path => req.path.startsWith(path))) {
      return false;
    }

    // ✅ اضغط فقط JSON والنص العادي
    const contentType = res.getHeader('Content-Type') || '';
    const shouldCompress = /json|text\/plain/i.test(contentType);

    return shouldCompress && compression.filter(req, res);
  }
});

module.exports = compressionMiddleware;