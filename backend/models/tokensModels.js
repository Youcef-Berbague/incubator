const { prisma } = require("../config/db");

const deleteTokenByDevice = async (userId, ip, userAgent) => {
  await prisma.refresh_tokens.deleteMany({
    where: {
      user_id: userId,
      ip_address: ip,
      user_agent: userAgent,
    },
  });
};

const addNewRefreshToken = async (
  userId,
  hashedToken,
  ip,
  userAgent,
  tokenid,
  fingerprint,
  rememberMe
) => {
  await deleteTokenByDevice(userId, ip, userAgent);

  await prisma.refresh_tokens.create({
    data: {
      user_id: userId,
      token: hashedToken,
      uuid: tokenid,
      fingerprint: fingerprint,
      user_agent: userAgent,
      ip_address: ip,
      remembreme: rememberMe,
      request_count: 0,
      created_at: new Date(),
    },
  });
};

const findUserByRefreshTokenId = async (id) => {
  const tokenRecord = await prisma.refresh_tokens.findFirst({
    where: { uuid: id },
    include: { users: true },
  });

  return tokenRecord || null;
};

const deleteAllRefreshTokens = async (userId) => {
  return await prisma.refresh_tokens.deleteMany({
    where: { user_id: userId },
  });
};

const deleteSingleRefreshToken = async (tokenid) => {
  return await prisma.refresh_tokens.deleteMany({
    where: { uuid: tokenid },
  });
};

const incrementRequestCount = async (tokenid) => {
  await prisma.refresh_tokens.updateMany({
    where: { uuid: tokenid },
    data: { request_count: { increment: 1 } },
  });
};

module.exports = {
  addNewRefreshToken,
  findUserByRefreshTokenId,
  deleteAllRefreshTokens,
  deleteSingleRefreshToken,
  incrementRequestCount,
};
