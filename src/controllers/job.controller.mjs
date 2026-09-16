import jobService from "../services/job.service";
import { success } from "../utils/response";

async function create(req, res, next) {
  try {
    const job = await jobService.createJob(req.user.id, req.body);
    return success(res, 201, "Lamaran berhasil ditambahkan", job);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { status, search, page, limit } = req.query;
    const result = await jobService.listJobs(req.user.id, { status, search, page, limit });
    return success(res, 200, "Daftar lamaran berhasil diambil", result.items, {
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
    const job = await jobService.getJobById(req.user.id, req.params.id);
    return success(res, 200, "Detail lamaran berhasil diambil", job);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const job = await jobService.updateJob(req.user.id, req.params.id, req.body);
    return success(res, 200, "Lamaran berhasil diperbarui", job);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await jobService.deleteJob(req.user.id, req.params.id);
    return success(res, 200, "Lamaran berhasil dihapus");
  } catch (err) {
    next(err);
  }
}

export default { create, list, detail, update, remove };
