import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuditTrailService } from '../../../../core/services/audit-trail.service';
import { AuditTrail } from '../../interfaces/audit-trail.interface';
import { AuditTrailResponse } from '../../interfaces/audit-trail-response.interface';

@Component({
  selector: 'audit-trail-page',
  templateUrl: './audit-trail.page.html',
  styleUrls: ['./audit-trail.page.scss'],
  standalone: false
})
export class AuditTrailPage implements OnInit, OnDestroy {

  today = new Date().toISOString().split('T')[0];


  loading = true;

  logs: AuditTrail[] = [];

  entities: string[] = [];
  actions: string[] = [];
  authors: string[] = []; 

  // paginación
  page = 1;
  pageSize = 20;
  totalPages = 1;
  totalRecords = 0;

  // filtros
  search = '';
  entity = '';
  author = '';
  action = '';
  dateFrom = '';
  dateTo = '';

  // Para iterar keys en HTML
  objectKeys = Object.keys;

  constructor(private auditService: AuditTrailService) {}

  ngOnInit(): void {
    this.loadFilters();
    this.loadAuditTrail();
  }

  ngOnDestroy(): void {}

  loadFilters() {
  this.auditService.getAuditFilters().subscribe({
    next: (res) => {
      this.entities = res.entities;
      this.actions = res.actions;
      this.authors = res.authors;
    }
  })
}



  private parseChanges(changes: any) {
    try {
      return JSON.parse(changes);
    } catch {
      return {};
    }
  }

  loadAuditTrail() {
    this.loading = true;

    this.auditService.getAuditTrail({
      page: this.page,
      pageSize: this.pageSize,
      search: this.search,
      entity: this.entity,
      author: this.author,
      action: this.action,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    }).subscribe({
      next: (res: AuditTrailResponse) => {

        this.logs = res.data.map(item => ({
          ...item,
          changesParsed: this.parseChanges(item.changes)  // importante
        }));

        this.totalPages = res.totalPages;
        this.totalRecords = res.total;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.page = 1;
    this.loadAuditTrail();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadAuditTrail();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadAuditTrail();
    }
  }
}
