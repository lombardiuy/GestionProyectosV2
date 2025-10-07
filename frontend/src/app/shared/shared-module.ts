import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing-module';

import { SideNavbarComponent } from './components/side-navbar/side-navbar.component';
import { TopNavbarComponent } from './components/top-navbar/top-navbar.component';
import { FormMessageComponent } from './components/form-message/form-message.component';
import { TableHeaderFilterCheckboxesMultipleComponent } from './components/table-header-filter-checkboxes-multiple/table-header-filter-checkboxes-multiple.component';


@NgModule({
  declarations: [
    TopNavbarComponent, SideNavbarComponent, FormMessageComponent, TableHeaderFilterCheckboxesMultipleComponent ],
  imports: [
    CommonModule,
    SharedRoutingModule
  ], 
  exports:[
    TopNavbarComponent, SideNavbarComponent, FormMessageComponent, TableHeaderFilterCheckboxesMultipleComponent
  ]
})
export class SharedModule { }
