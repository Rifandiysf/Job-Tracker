import dashboardService from "../services/dashboard.service.mjs";
import { success } from "../utils/response.mjs";

async function summary(req, res, next) {
  try {
    const data = await dashboardService.getSummary(req.user.id);
    return success(res, 200, "Dashboard summary retrieved successfully", data);
  } catch (err) {
    next(err);
  }
}

export default { summary };
