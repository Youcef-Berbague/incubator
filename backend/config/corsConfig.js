const whitelist = require('./allowedOrigins'); 

const corsOptions = {
  origin: function (origin, callback) {
    // قبول جميع الطلبات المحلية بدون origin
    if (
      !origin ||
      origin.includes("localhost") ||
      origin.includes("::1") ||
      whitelist.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 1000 * 60 * 60 * 24, // تخزين إعدادات CORS لمدة يوم
};

module.exports = corsOptions;