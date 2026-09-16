import prisma from "../utils/prismaClient";

function create(data) {
  return prisma.jobApplication.create({ data });
}

function findMany({ where, skip, take }) {
  return prisma.jobApplication.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
}

function count(where) {
  return prisma.jobApplication.count({ where });
}

function findFirstByUser(id, userId) {
  return prisma.jobApplication.findFirst({ where: { id, userId } });
}

function update(id, data) {
  return prisma.jobApplication.update({ where: { id }, data });
}

function remove(id) {
  return prisma.jobApplication.delete({ where: { id } });
}

// Dipakai untuk dashboard: jumlah lamaran per status
function groupByStatus(userId) {
  return prisma.jobApplication.groupBy({
    by: ["status"],
    where: { userId },
    _count: { status: true },
  });
}

function averageDistance(userId) {
  return prisma.jobApplication.aggregate({
    where: { userId, distanceKm: { not: null } },
    _avg: { distanceKm: true },
  });
}

function findAppliedDatesByUser(userId) {
  return prisma.jobApplication.findMany({
    where: { userId, appliedDate: { not: null } },
    select: { appliedDate: true },
  });
}

export {
  create,
  findMany,
  count,
  findFirstByUser,
  update,
  remove,
  groupByStatus,
  averageDistance,
  findAppliedDatesByUser,
};
