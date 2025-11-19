import { Router } from "express";
import { getAuditTrail, getAuditTrailFilters } from "../controllers/auditTrail.controller";

const router = Router();

router.get("/",  getAuditTrail);
router.get("/filters",getAuditTrailFilters);

export default router;
