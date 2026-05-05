const fs = require("fs/promises");
const path = require("path");

const settingsFilePath = path.join(__dirname, "systemSettings.json");
const SETTINGS_CACHE_MS = 5000;

let cachedSettings = null;
let cachedAt = 0;

const defaultSettings = {
  registration: {
    minProjectTitleLength: 5,
    maxProjectTitleLength: 255,
    maxStudentsPerProject: 6,
    maxSupervisorsPerProject: 3,
  },
  security: {
    fingerprintMinSimilarity: 70,
    fingerprintSoftFail: true,
    refreshRotationThresholdMs: 24 * 60 * 60 * 1000,
    rotateAfterRequests: 50,
    probabilisticRotatePercent: 0,
  },
  features: {
    aiChatPublic: true,
    projectRegistrationPublic: true,
  },
};

const deepMerge = (base, patch) => {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return base;
  }

  const result = Array.isArray(base) ? [...base] : { ...base };

  for (const [key, value] of Object.entries(patch)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      result[key] = deepMerge(base[key], value);
    } else {
      result[key] = value;
    }
  }

  return result;
};

const ensureSettingsFile = async () => {
  try {
    await fs.access(settingsFilePath);
  } catch {
    await fs.writeFile(
      settingsFilePath,
      `${JSON.stringify(defaultSettings, null, 2)}\n`,
      "utf8",
    );
  }
};

const readSettingsFile = async () => {
  await ensureSettingsFile();

  try {
    const raw = await fs.readFile(settingsFilePath, "utf8");
    const parsed = JSON.parse(raw);
    return deepMerge(defaultSettings, parsed);
  } catch {
    return { ...defaultSettings };
  }
};

const getSystemSettings = async ({ forceRefresh = false } = {}) => {
  const now = Date.now();
  if (!forceRefresh && cachedSettings && now - cachedAt < SETTINGS_CACHE_MS) {
    return cachedSettings;
  }

  const settings = await readSettingsFile();
  cachedSettings = settings;
  cachedAt = now;
  return settings;
};

const validateSettingsPatch = (patch = {}) => {
  const errors = [];
  const validated = {};

  if (patch.registration) {
    validated.registration = {};
    for (const [key, value] of Object.entries(patch.registration)) {
      if (
        [
          "minProjectTitleLength",
          "maxProjectTitleLength",
          "maxStudentsPerProject",
          "maxSupervisorsPerProject",
        ].includes(key)
      ) {
        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed < 1) {
          errors.push({
            field: `registration.${key}`,
            message: "Must be a positive integer.",
          });
        } else {
          validated.registration[key] = parsed;
        }
      }
    }
  }

  if (patch.security) {
    validated.security = {};
    for (const [key, value] of Object.entries(patch.security)) {
      if (
        [
          "fingerprintMinSimilarity",
          "refreshRotationThresholdMs",
          "rotateAfterRequests",
        ].includes(key)
      ) {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 0) {
          errors.push({
            field: `security.${key}`,
            message: "Must be a non-negative number.",
          });
        } else {
          validated.security[key] = parsed;
        }
      } else if (key === "probabilisticRotatePercent") {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
          errors.push({
            field: `security.${key}`,
            message: "Must be a number between 0 and 1.",
          });
        } else {
          validated.security[key] = parsed;
        }
      } else if (key === "fingerprintSoftFail") {
        validated.security[key] = Boolean(value);
      }
    }
  }

  if (patch.features) {
    validated.features = {};
    for (const [key, value] of Object.entries(patch.features)) {
      if (["aiChatPublic", "projectRegistrationPublic"].includes(key)) {
        validated.features[key] = Boolean(value);
      }
    }
  }

  return { errors, validated };
};

const updateSettingsFile = async (patch) => {
  const current = await readSettingsFile();
  const merged = deepMerge(current, patch);

  await fs.writeFile(
    settingsFilePath,
    `${JSON.stringify(merged, null, 2)}\n`,
    "utf8",
  );

  cachedSettings = merged;
  cachedAt = Date.now();

  return merged;
};

module.exports = {
  defaultSettings,
  readSettingsFile,
  getSystemSettings,
  validateSettingsPatch,
  updateSettingsFile,
};