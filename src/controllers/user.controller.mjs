import userService from "../services/user.service.mjs";
import { success } from "../utils/response.mjs";

async function getProfile(req, res, next) {
  try {
    const user = await userService.getProfile(req.user.id);
    return success(res, 200, "Profil berhasil diambil", user);
  } catch (err) {
    next(err);
  }
}

async function updateHomeAddress(req, res, next) {
  try {
    const user = await userService.updateHomeAddress(req.user.id, req.body.homeAddress);
    return success(res, 200, "Alamat rumah berhasil diperbarui", user);
  } catch (err) {
    next(err);
  }
}

async function updateTheme(req, res, next) {
  try {
    const user = await userService.updateTheme(req.user.id, req.body.theme);
    return success(res, 200, "Tema berhasil diperbarui", user);
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(req.user.id, { currentPassword, newPassword });
    return success(res, 200, "Password berhasil diubah");
  } catch (err) {
    next(err);
  }
}

export { getProfile, updateHomeAddress, updateTheme, changePassword };
