const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // If no roles were attached, the user is unauthenticated
    if (req?.roles === undefined || req?.roles === null) {
      return res.sendStatus(401);
    }

    const normalizeRole = (role) => {
      const parsed = Number(role);
      return Number.isFinite(parsed) ? parsed : role;
    };

    const rolesArray = allowedRoles.map(normalizeRole);
    const requesterRoles = (Array.isArray(req.roles) ? req.roles : [req.roles])
      .filter((role) => role !== undefined && role !== null)
      .map(normalizeRole);

    const hasAllowed = requesterRoles.some((role) => rolesArray.includes(role));

    // Authenticated but not authorized -> 403 Forbidden
    if (!hasAllowed) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }

    next();
  };
}

module.exports = verifyRoles;
