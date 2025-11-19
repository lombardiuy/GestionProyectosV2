import { AuditTrail } from "./audit-trail.interface";


export interface AuditTrailResponse {
  data: AuditTrail[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}