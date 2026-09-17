import express from "express";
import jobController from "../controllers/job.controller.mjs";
import authGuard from "../middlewares/auth.middleware.mjs";

const router = express.Router();

router.use(authGuard);

router.post("/", jobController.create);
router.get("/", jobController.list);
router.get("/:id", jobController.detail);
router.put("/:id", jobController.update);
router.delete("/:id", jobController.remove);

export default router;
