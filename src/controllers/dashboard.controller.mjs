import dashboardService from "../services/dashboard.service";
import { success } from "../utils/response";

async function summary(req, res, next) {
  try {
    const data = await dashboardService.getSummary(req.user.id);
    return success(res, 200, "Ringkasan dashboard berhasil diambil", data);
  } catch (err) {
    next(err);
  }
}

export default { summary };
