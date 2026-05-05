const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // If no roles were attached, the user is unauthenticated
    if (!req?.roles) {
      return res.sendStatus(401);
    }

    const rolesArray = [...allowedRoles];
    const hasAllowed = req.roles.map((role) => rolesArray.includes(role)).find((val) => val === true);

    // Authenticated but not authorized -> 403 Forbidden
    if (!hasAllowed) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }

    next();
  };
}

module.exports = verifyRoles;