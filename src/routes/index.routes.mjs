import express from "express";
import authRoutes from "./auth.routes.mjs";
import jobRoutes from "./job.routes.mjs";
import usersRoutes from "./user.routes.mjs";
import dashboardRoutes from "./dashboard.routes.mjs";

const router = express.Router();

router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Job Tracker API is running' });
});

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes)
router.use('/users', usersRoutes)
router.use('/dashboard', dashboardRoutes)

export default router