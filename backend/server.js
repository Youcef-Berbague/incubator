require("dotenv").config(); // Load environment variables from .env file
// Importing required modules
const express = require("express");
const { testDBConnection } = require("./config/db");
const path = require("path");
const { sendTelegramAlert } = require("./config/notifier");
const app = express();

// 👇 مهم جدًا لحل مشاكل proxy على Render أو Nginx
app.set("trust proxy", 1);

// using helmet for security headers
const helmet = require("./config/helmetConfig");
app.use(helmet);

// security headers config
const SheadersConfig = require("./config/headersConfig");
app.use(SheadersConfig);

// using compression for response size reduction
const compression = require("./config/compressionConfig");
app.use(compression);

// Rate limiting for ddos protection
const { limiter } = require("./config/limiterConfig");
app.use(limiter);

// CORS config
const corsOptions = require("./config/corsConfig");
const cors = require("cors");
app.use(cors(corsOptions));

// Built-in middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "150kb" }));
app.use(express.static(path.join(__dirname, "public")));

// Cookie parser for handling cookies
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// using logger
const { logger } = require("./middlewares/logEvents");
app.use(logger);

// security routing middleware
const { secureMiddleware } = require("./middlewares/secureMiddleware");
app.use("/", secureMiddleware);

// using advanced IDM (Intrusion detection middleware)
const refreshOnRequest = require("./middlewares/refreshOnRequest");
app.use(refreshOnRequest());

// optionalJwt advanced
const optionalJWT = require("./middlewares/optionalJwt");
app.use(optionalJWT);

// auth routes
app.use("/api/auth", require("./routes/authRoutes"));

// faculties and departments routes (public access for registration forms)
app.use("/api", require("./routes/facultiesRoutes"));

// project registration routes
app.use("/api", require("./routes/registrationRoutes"));

// Public API routes (no authentication required)
app.use("/api", require("./routes/accelerationStatusRoutes"));
app.use("/api", require("./routes/faqRoutes"));
app.use("/api", require("./routes/locationsRoutes"));
app.use("/api", require("./routes/preIncubationStatusRoutes"));
app.use("/api", require("./routes/partnersRoutes"));

const verifyJWT = require("./middlewares/verifyJWT");

app.use("/api/users", verifyJWT, require("./routes/usersRoutes"));

app.use("/api/ai", require("./routes/aiRoutes"));

// Jury management routes (authenticated, SuperAdmin/Admin access)
app.use("/api/juries", require("./routes/juryRoutes"));
app.use("/api/jury-members", require("./routes/juryMembreRoutes"));
app.use("/api/jury-member-roles", require("./routes/juryMembreRoleRoutes"));

// Projects routes (authenticated, SuperAdmin/Admin/Coach/Supervisor access)
app.use("/api/projects", require("./routes/projectsRoutes"));

// Error handling
const errorHandler = require("./middlewares/errorHandler");
app.use(errorHandler);

// الاتصال بقاعدة البيانات ثم تشغيل السيرفر
(async () => {
  const dbConnected = await testDBConnection();
  if (!dbConnected) return process.exit(1);

  const PORT = process.env.PORT || 4444;
  const server = app.listen(PORT, async () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    if (process.env.NODE_ENV === "production") {
      await sendTelegramAlert(
        "✅ PrintyDZ Server Started Successfully",
        "localhost",
        "System"
      );
    }
  });

  // تحسين إعدادات Keep-Alive
  server.keepAliveTimeout = 30000; // 60 ثانية
  server.headersTimeout = 35000; // 65 ثانية
})();

// إعدادات لتحسين الأداء
app.disable("x-powered-by"); // إخفاء معلومات Express
