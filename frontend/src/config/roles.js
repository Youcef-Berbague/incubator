export const ROLES = Object.freeze({
  superAdmin: 100,
  admin: 90,
  coach: 70,
  supervisor: 60,
  student: 40,
  guest: 10,
});

export const getHighestRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles].filter(Boolean);
  return roleArray.length > 0 ? Math.max(...roleArray) : ROLES.guest;
};

export const hasRoleAtLeast = (roles, minimumRole) =>
  getHighestRole(roles) >= minimumRole;
