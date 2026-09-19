import bcrypt from "bcryptjs";
import userModel from "../models/user.model.mjs";
import { geocodeAddress } from "./route.service.mjs";
import authService from "./auth.service.mjs";

async function getProfile(userId) {
  const user = await userModel.findById(userId);
  return authService.sanitizeUser(user);
}

async function updateHomeAddress(userId, homeAddress) {
  const { lat, lng } = await geocodeAddress(homeAddress);
  const user = await userModel.update(userId, { homeAddress, homeLat: lat, homeLng: lng });
  return authService.sanitizeUser(user);
}

async function updateTheme(userId, theme) {
  if (!["light", "dark"].includes(theme)) {
    const err = new Error("Theme must be either 'light' or 'dark'.");
    err.statusCode = 422;
    throw err;
  }

  const user = await userModel.update(userId, { theme });
  return authService.sanitizeUser(user);
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await userModel.findById(userId);

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const err = new Error("Current password is incorrect.");
    err.statusCode = 401;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userModel.update(userId, { password: hashedPassword });
}

export default { getProfile, updateHomeAddress, updateTheme, changePassword };
