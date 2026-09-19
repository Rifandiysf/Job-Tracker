import { createJob, deleteJob, getJobById, listJobs, updateJob } from "../services/job.service.mjs";
import { success } from "../utils/response.mjs";

async function create(req, res, next) {
  try {
    const job = await createJob(req.user.id, req.body);
    return success(res, 201, "Job application added successfully", job);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { status, search, page, limit } = req.query;
    const result = await listJobs(req.user.id, { status, search, page, limit });
    return success(res, 200, "Job applications retrieved successfully", result.items, {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
}

async function detail(req, res, next) {
  try {
    const job = await getJobById(req.user.id, req.params.id);
    return success(res, 200, "Job application details retrieved successfully", job);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const job = await updateJob(req.user.id, req.params.id, req.body);
    return success(res, 200, "Job application updated successfully", job);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await deleteJob(req.user.id, req.params.id);
    return success(res, 200, "Job application deleted successfully");
  } catch (err) {
    next(err);
  }
}

export default { create, list, detail, update, remove };
