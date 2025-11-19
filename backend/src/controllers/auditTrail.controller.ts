import { Request, Response } from "express";
import * as auditTrailService from "../services/auditTrail.service";


export const getAuditTrail = async (req: Request, res: Response) => {
  try {
    // 📌 Leer query params con defaults
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const search = req.query.search as string | undefined;
    const entity = req.query.entity as string | undefined;
    const action = req.query.action as string | undefined;
    const author = req.query.author as string | undefined;
    const entityId = req.query.entityId ? Number(req.query.entityId) : undefined;

    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;

    // 📌 Llamar al servicio
    const result = await auditTrailService.getAuditTrail({
      page,
      pageSize,
      search,
      entity,
      entityId,
      author,
      action,
      dateFrom,
      dateTo
    });

    res.json(result);

  } catch (error: any) {
    console.error("Error al obtener auditTrail:", error);
    res.status(500).json({ error: error.message || "Error interno" });
  }
};

export const getAuditTrailFilters = async (req: Request, res: Response) => {
  try {
    const data = await auditTrailService.getFilterOptions();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

