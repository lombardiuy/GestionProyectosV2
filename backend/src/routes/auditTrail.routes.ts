import { Router } from "express";
import { getAuditTrail, getAuditTrailFilters, getAuditTrailByEntity } from "../controllers/auditTrail.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requirePermissionMiddleware } from "../middleware/requirePermission.middleware";


const router = Router();

router.get("/", authMiddleware, requirePermissionMiddleware("AUDIT_TRAIL_VIEW"), getAuditTrail);
router.get("/versionControl/:entity/:id", authMiddleware, getAuditTrailByEntity);
router.get("/filters",requirePermissionMiddleware("AUDIT_TRAIL_VIEW"),getAuditTrailFilters);

export default router;
