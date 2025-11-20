import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing-module';

import { SideNavbarComponent } from './components/side-navbar/side-navbar.component';
import { TopNavbarComponent } from './components/top-navbar/top-navbar.component';
import { FormMessageComponent } from './components/form-message/form-message.component';
import { TableHeaderFilterCheckboxesMultipleComponent } from './components/table-header-filter-checkboxes-multiple/table-header-filter-checkboxes-multiple.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { LoadingPointsComponent } from './components/loading-points/loading-points.component';

import { UnauthorizedPage } from './pages/unauthorized/unauthorized.page';
import { VersionControlComponent } from './components/version-control/version-control.component';

@NgModule({
  declarations: [
     UnauthorizedPage,
     TopNavbarComponent,
     SideNavbarComponent, 
     FormMessageComponent, 
     TableHeaderFilterCheckboxesMultipleComponent, 
     LoadingPointsComponent,
    LoadingSpinnerComponent, 
    VersionControlComponent
    
    ],
  imports: [
    CommonModule,
    SharedRoutingModule
  ], 
  exports:[
     UnauthorizedPage,
    TopNavbarComponent, 
    SideNavbarComponent, 
    FormMessageComponent, 
    TableHeaderFilterCheckboxesMultipleComponent, 
    LoadingPointsComponent, 
    LoadingSpinnerComponent,
    VersionControlComponent
   

  ]
})
export class SharedModule { }
