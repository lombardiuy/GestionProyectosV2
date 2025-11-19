export interface AuditTrail {
  id: number;
  module: string;
  entity: string;
  entityId: number;
  version: number;
  action: string;
  description: string | null;
  changes: string;
  author: string;
  created: string;
  changesParsed: Record<string, { oldValue: any, newValue: any }>;
}
