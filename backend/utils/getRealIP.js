function getRealIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const realIP = req.headers["x-real-ip"];
  const cfIP = req.headers["cf-connecting-ip"];
  const proxyIP = forwarded?.split(",")[0]?.trim();

  return cfIP || realIP || proxyIP || req.connection.remoteAddress || req.ip;
}

module.exports = getRealIP;