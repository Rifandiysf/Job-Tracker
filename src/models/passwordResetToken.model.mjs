import prisma from "../utils/prismaClient";

function create(data) {
  return prisma.passwordResetToken.create({ data });
}

function findByToken(token) {
  return prisma.passwordResetToken.findUnique({ where: { token } });
}

function markUsed(id) {
  return prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
}

export default { create, findByToken, markUsed };
