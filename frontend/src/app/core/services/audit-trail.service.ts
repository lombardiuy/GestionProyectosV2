import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import {AuditTrailResponse} from '../../features/auditTrail/interfaces/audit-trail-response.interface'
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class AuditTrailService {
  private apiUrl = environment.apiURL + 'auditTrail';


 constructor(private http: HttpClient) {}

  getAuditTrail(options: {
    page?: number;
    pageSize?: number;
    search?: string;
    entity?: string;
    entityId?: number;
    author?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<AuditTrailResponse> {

    let params = new HttpParams()
      .set('page', options.page ?? 1)
      .set('pageSize', options.pageSize ?? 20);

    if (options.search) params = params.set('search', options.search);
    if (options.entity) params = params.set('entity', options.entity);
    if (options.action) params = params.set('action', options.action);
    if (options.author) params = params.set('author', options.author);
    if (options.entityId) params = params.set('entityId', options.entityId);
    if (options.dateFrom) params = params.set('dateFrom', options.dateFrom);
    if (options.dateTo) params = params.set('dateTo', options.dateTo);

    return this.http.get<AuditTrailResponse>(this.apiUrl, { params });
  }

  getAuditFilters() {
  return this.http.get<any>(`${this.apiUrl}/filters`);
}


}