import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  page = 1;
  pageSize = 15;
  totalPages = 1;
  totalRecords = 0;

  search = '';
  entity = '';
  author = '';
  action = '';
  dateFrom = '';
  dateTo = '';

  objectKeys = Object.keys;

  constructor(
    private auditService: AuditTrailService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const idParam = params.get('id');
    if (idParam) {
      this.search = '#' + idParam;  // filtrar por ID solo si existe
    }
    this.loadFilters();
    this.loadAuditTrail();
  });
}

  




  ngOnDestroy(): void {}

  private parseChanges(changes: any) {
    try {
      return JSON.parse(changes);
    } catch {
      return {};
    }
  }

  loadFilters() {
    this.auditService.getAuditFilters().subscribe({
      next: (res) => {
        this.entities = res.entities;
        this.actions = res.actions;
        this.authors = res.authors;
      }
    })
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
          changesParsed: this.parseChanges(item.changes)
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

    // ⭐ Actualizar URL si hay filtro de ID
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.search ? { id: this.search } : {},
      queryParamsHandling: 'merge'
    });

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
