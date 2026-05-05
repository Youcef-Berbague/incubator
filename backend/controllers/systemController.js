const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const {
  readSettingsFile,
  validateSettingsPatch,
  updateSettingsFile,
} = require("../config/systemSettings");
const { prisma } = require("../config/db");

const logsDir = path.join(__dirname, "..", "logs");
const allowedLogFiles = {
  reqLog: "reqLog.txt",
  errLog: "errLog.txt",
  securityLog: "securityLog.txt",
  unauthorizedReqLog: "unauthorizedReqLog.txt",
};

const tailLines = (content, limit = 100) => {
  const lines = content.split(/\r?\n/).filter(Boolean);
  return lines.slice(-limit);
};

const getSystemConfig = async (req, res) => {
  try {
    const config = await readSettingsFile();
    const [userCount, projectCount, registrationCount] = await Promise.all([
      prisma.users.count(),
      prisma.project.count(),
      prisma.project_registrations.count(),
    ]);

    return res.json({
      success: true,
      data: {
        config,
        runtime: {
          nodeEnv: process.env.NODE_ENV || "development",
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          uptimeSeconds: Math.floor(process.uptime()),
          memoryUsage: process.memoryUsage(),
          hostname: os.hostname(),
        },
        counts: {
          users: userCount,
          projects: projectCount,
          registrations: registrationCount,
        },
      },
    });
  } catch (error) {
    console.error("[system] config error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load system config.",
      error: error.message,
    });
  }
};

const updateSystemConfig = async (req, res) => {
  try {
    const { errors, validated } = validateSettingsPatch(req.body || {});
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const current = await readSettingsFile();
    const updated = await updateSettingsFile(validated);

    return res.json({
      success: true,
      message: "System configuration updated successfully.",
      data: {
        previous: current,
        current: updated,
      },
    });
  } catch (error) {
    console.error("[system] update error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update system config.",
      error: error.message,
    });
  }
};

const getAuditSummary = async (req, res) => {
  try {
    const fileNames = Object.values(allowedLogFiles);
    const stats = {};

    for (const fileName of fileNames) {
      try {
        const content = await fs.readFile(path.join(logsDir, fileName), "utf8");
        const lines = content.split(/\r?\n/).filter(Boolean);
        stats[fileName] = {
          lineCount: lines.length,
          tail: tailLines(content, 10),
        };
      } catch {
        stats[fileName] = {
          lineCount: 0,
          tail: [],
        };
      }
    }

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("[audit] summary error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load audit summary.",
      error: error.message,
    });
  }
};

const getAuditLog = async (req, res) => {
  try {
    const { type = "securityLog", limit = 100 } = req.query;
    const fileName = allowedLogFiles[type];

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: "Invalid audit log type.",
      });
    }

    const content = await fs.readFile(path.join(logsDir, fileName), "utf8");
    const lines = tailLines(
      content,
      Math.min(Math.max(parseInt(limit, 10) || 100, 1), 500),
    );

    return res.json({
      success: true,
      data: {
        type,
        fileName,
        lineCount: lines.length,
        lines,
      },
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.json({
        success: true,
        data: {
          type: req.query.type || "securityLog",
          fileName: allowedLogFiles[req.query.type || "securityLog"],
          lineCount: 0,
          lines: [],
        },
      });
    }

    console.error("[audit] log error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load audit log.",
      error: error.message,
    });
  }
};

module.exports = {
  getSystemConfig,
  updateSystemConfig,
  getAuditSummary,
  getAuditLog,
};
