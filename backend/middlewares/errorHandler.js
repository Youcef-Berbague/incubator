const { logEvents } = require('./logEvents');
const { sendTelegramAlert } = require("../config/notifier");

const errorHandler = (err, req, res, next) => {
  const getRealIP = require("../utils/getRealIP");
  const ip = getRealIP(req);

  const userAgent = req.headers["user-agent"] || "unknown";

  const errorMessage = `${err.name}: ${err.message}`;
  const metaData = `URL: ${req.url} | Method: ${req.method} | IP: ${ip}`;
  
  logEvents(`${errorMessage}\t${metaData}`, 'errLog.txt');
  sendTelegramAlert(`❌ ${errorMessage}\nURL: ${req.url}`, ip, userAgent);

  console.error(`[${new Date().toISOString()}] ${err.stack}`);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal error',
  });
};

module.exports = errorHandler;