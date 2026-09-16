import prisma from "../utils/prismaClient";

function findById(id) {
  return prisma.user.findUnique({ where: { id } });
}

function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

function findByGoogleId(googleId) {
  return prisma.user.findUnique({ where: { googleId } });
}

function create(data) {
  return prisma.user.create({ data });
}

function update(id, data) {
  return prisma.user.update({ where: { id }, data });
}

export default { findById, findByEmail, findByGoogleId, create, update };
