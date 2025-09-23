import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing-module';

import { SideNavbarComponent } from './components/side-navbar/side-navbar.component';
import { TopNavbarComponent } from './components/top-navbar/top-navbar.component';


@NgModule({
  declarations: [
    TopNavbarComponent, SideNavbarComponent],
  imports: [
    CommonModule,
    SharedRoutingModule
  ], 
  exports:[
    TopNavbarComponent, SideNavbarComponent
  ]
})
export class SharedModule { }
