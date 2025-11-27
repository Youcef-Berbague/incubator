const _ = require("lodash");

function normalizedString(str) {
  if (!str) return "";
  return String(str).toLowerCase().replace(/\s+/g, "").trim();
}

function stringSimilarity(a, b) {
  if (!a || !b) return 0;
  a = normalizedString(a);
  b = normalizedString(b);
  if (a === b) return 1;
  const minLen = Math.min(a.length, b.length);
  let matches = 0;
  for (let i = 0; i < minLen; i++) if (a[i] === b[i]) matches++;
  return matches / Math.max(a.length, b.length);
}

function jaccardSimilarity(arrA, arrB) {
  if (!Array.isArray(arrA) || !Array.isArray(arrB)) return 0;
  const setA = new Set(arrA);
  const setB = new Set(arrB);
  const inter = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : inter / union;
}

function getFingerprintSimilarity(current, stored) {
  const weights = {
    visitorId: 0.35,
    confidence: 0.1,
    paltform: 0.1,
    webGlBasics: 0.15,
    dateTimeLocale: 0.05,
    timezone: 0.05,
    vendor: 0.05,
    screenResolution: 0.05,
    touchSupport: 0.05,
    vendorFlavors: 0.05,
  };

  let totalScore = 0;
  let availableWeight = 0;
  const details = {};

  for (const [key, weight] of Object.entries(weights)) {
    const oldVal = stored?.[key]?.value ?? stored?.[key];
    const curVal = current?.[key]?.value ?? current?.[key];
    if (oldVal === undefined || curVal === undefined) {
      details[key] = { used: false, reason: "missing" };
      continue;
    }

    availableWeight += weight;
    let score = 0;
    let method = "unknown";

    switch (key) {
      case "visitorId":
        method = "exact";
        score = oldVal === curVal ? 1 : 0;
        break;

      case "confidence":
        method = "numeric";
        score = 1 - Math.abs((oldVal?.score ?? oldVal) - (curVal?.score ?? curVal));
        break;

      case "paltform":
      case "vendor":
      case "dateTimeLocale":
      case "timezone":
        method = "string-fuzzy";
        score = stringSimilarity(oldVal, curVal);
        break;

      case "webGlBasics":
        method = "deep-fields";
        const keys = ["renderer", "rendererUnmasked", "vendor", "vendorUnmasked", "version"];
        let subScores = keys.map(k => stringSimilarity(oldVal?.[k], curVal?.[k]));
        score = _.mean(subScores);
        break;

      case "screenResolution":
        method = "array-numeric";
        try {
          const [w1, h1] = oldVal;
          const [w2, h2] = curVal;
          const diff = Math.abs((w1 * h1) - (w2 * h2));
          const maxArea = Math.max(w1 * h1, w2 * h2);
          score = 1 - diff / maxArea;
        } catch {
          score = 0.5;
        }
        break;

      case "touchSupport":
        method = "object";
        score = _.isEqual(oldVal, curVal) ? 1 : 0.7; // تسامح بسيط
        break;

      case "vendorFlavors":
        method = "jaccard";
        score = jaccardSimilarity(oldVal, curVal);
        break;
    }

    totalScore += score * weight;
    details[key] = { used: true, method, score, contribution: score * weight };
  }

  const similarity = +(totalScore / availableWeight * 100).toFixed(2);
  return { similarity, details, totalScore, availableWeight };
}

module.exports = {
  getFingerPrint: (req) => {
    try {
      const rawHeader = req.headers["x-fingerprint"];
      const fingerprint =
        typeof rawHeader === "string" ? JSON.parse(rawHeader) : rawHeader;
      return fingerprint;
    } catch (err) {
      console.error("❌ Fingerprint parse error:", err);
      return null;
    }
  },
  getFingerprintSimilarity,
};
