import jobModel from "../models/job.model.mjs";
import { geocodeAddress, calculateRoute } from "./route.service.mjs";
import userModel from "../models/user.model.mjs";

async function attachRouteData({ userId, companyAddress, data }) {
  const user = await userModel.findById(userId);

  if (!companyAddress || !user?.homeLat || !user?.homeLng) return data;

  const { lat, lng } = await geocodeAddress(companyAddress);
  const route = await calculateRoute({
    fromLat: Number(user.homeLat),
    fromLng: Number(user.homeLng),
    toLat: lat,
    toLng: lng,
  });

  return {
    ...data,
    companyLat: lat,
    companyLng: lng,
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
    routeGeometry: route.geometry,
    routeFetchedAt: new Date(),
  };
}

async function createJob(userId, payload) {
  let data = {
    userId,
    companyName: payload.companyName,
    position: payload.position,
    status: payload.status || "applied",
    appliedDate: payload.appliedDate ? new Date(payload.appliedDate) : null,
    companyAddress: payload.companyAddress,
    notes: payload.notes,
  };

  data = await attachRouteData({ userId, companyAddress: payload.companyAddress, data });

  return jobModel.create(data);
}

async function listJobs(userId, { status, search, page = 1, limit = 10 }) {
  const where = {
    userId,
    ...(status && { status }),
    ...(search && {
      OR: [
        { companyName: { contains: search } },
        { position: { contains: search } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    jobModel.findMany({ where, skip: (page - 1) * limit, take: Number(limit) }),
    jobModel.count(where),
  ]);

  return { items, total, page: Number(page), totalPages: Math.ceil(total / limit) };
}

async function getJobById(userId, id) {
  const job = await jobModel.findFirstByUser(Number(id), userId);
  if (!job) {
    const err = new Error("Lamaran tidak ditemukan");
    err.statusCode = 404;
    throw err;
  }
  return job;
}

async function updateJob(userId, id, payload) {
  await getJobById(userId, id);

  let data = {
    ...(payload.companyName !== undefined && { companyName: payload.companyName }),
    ...(payload.position !== undefined && { position: payload.position }),
    ...(payload.status !== undefined && { status: payload.status }),
    ...(payload.appliedDate !== undefined && { appliedDate: new Date(payload.appliedDate) }),
    ...(payload.companyAddress !== undefined && { companyAddress: payload.companyAddress }),
    ...(payload.notes !== undefined && { notes: payload.notes }),
  };

  if (payload.companyAddress !== undefined) {
    data = await attachRouteData({ userId, companyAddress: payload.companyAddress, data });
  }

  return jobModel.update(Number(id), data);
}

async function deleteJob(userId, id) {
  await getJobById(userId, id);
  return jobModel.remove(Number(id));
}

export { createJob, listJobs, getJobById, updateJob, deleteJob };
