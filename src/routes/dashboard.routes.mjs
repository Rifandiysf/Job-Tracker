import express from "express";
import dashboardController from"../controllers/dashboard.controller.mjs";
import authGuard from"../middlewares/auth.middleware.mjs";

const router = express.Router();

router.use(authGuard);

router.get("/summary", dashboardController.summary);

export default router;
