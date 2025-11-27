// src/utils/getFingerprint.js
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const LOCAL_KEY = 'persistent_visitor_id';
let cachedFp = null;

export async function loadFingerprint() {
  try {
    if (cachedFp) return cachedFp;

    // نتحقق من وجود visitorId محفوظ مسبقًا
    let storedVisitorId = localStorage.getItem(LOCAL_KEY);

    // تحميل FingerprintJS
    const fp = await FingerprintJS.load();
    const result = await fp.get();

    // إن لم يوجد visitorId محلي نخزنه أول مرة فقط
    if (!storedVisitorId) {
      storedVisitorId = result.visitorId;
      localStorage.setItem(LOCAL_KEY, storedVisitorId);
    }

    // نبني fingerprint النهائي بنفس الهيكل المتوقع من الخادم
    const fingerprint = {
      visitorId: storedVisitorId,
      confidence: result.confidence,
      paltform: result.components.platform?.value,
      webGlBasics: result.components.webGlBasics?.value,
      dateTimeLocale: result.components.dateTimeLocale?.value,
      timezone: result.components.timezone?.value,
      vendor: result.components.vendor?.value,
      screenResolution: result.components.screenResolution?.value,
      touchSupport: result.components.touchSupport?.value,
      vendorFlavors: result.components.vendorFlavors?.value,
    };

    cachedFp = fingerprint;
    return fingerprint;
  } catch (err) {
    console.error('Fingerprint generation failed:', err);
    return null;
  }
}
