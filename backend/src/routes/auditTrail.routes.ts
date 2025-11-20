import { Router } from "express";
import { getAuditTrail, getAuditTrailFilters, getAuditTrailByEntity } from "../controllers/auditTrail.controller";

const router = Router();

router.get("/",  getAuditTrail);
router.get("/versionControl/:entity/:id",  getAuditTrailByEntity);
router.get("/filters",getAuditTrailFilters);

export default router;
