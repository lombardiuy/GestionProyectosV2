import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AuditTrailService } from '../../../core/services/audit-trail.service';
import { Router } from '@angular/router';

@Component({
  selector: 'version-control',
  templateUrl: './version-control.component.html',
  styleUrls: ['./version-control.component.scss'],
  standalone:false
})
export class VersionControlComponent implements OnChanges {

  @Input() entity!: string;
  @Input() entityId!: number;

  versions: any[] = [];
  latestVersion: any = null;   // ⭐ NUEVO
  loading = true;

  displayVersionControl: boolean = true;

  constructor(private auditService: AuditTrailService, public router:Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['entity'] || changes['entityId']) && this.entity && this.entityId) {
      this.loadVersions();
    }
  }

  loadVersions() {
    this.loading = true;
    this.auditService.getAuditTrailByEntity(this.entity, this.entityId)
      .subscribe({
        next: (res) => {
          this.versions = res.data || [];

          // ⭐ Tomar la última versión (asumiendo orden ASC → la última es la mayor)
          this.latestVersion = this.versions.length ? this.versions[this.versions.length - 1] : null;

          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  goToAuditTrail(id: number) {
   window.location.href = `/auditTrail/${id}`;
  
 
}

}
