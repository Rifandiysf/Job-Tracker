import prisma from "../utils/prisma.client.mjs";

function create(data) {
  return prisma.passwordResetToken.create({ data });
}

function findByToken(token) {
  return prisma.passwordResetToken.findUnique({ where: { token } });
}

function markUsed(id) {
  return prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
}

export { create, findByToken, markUsed };
