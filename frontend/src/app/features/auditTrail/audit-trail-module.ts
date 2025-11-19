import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './audit-trail.routing-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../../shared/shared-module';
import { AuditTrailPage } from './pages/audit-trail/audit-trail.page';





@NgModule({
  declarations: [AuditTrailPage],
  imports: [
    CommonModule,
    FormsModule,
    AuthRoutingModule, 
    ReactiveFormsModule, 
    SharedModule
    
  ]
})
export class AuditTrailModule { }
