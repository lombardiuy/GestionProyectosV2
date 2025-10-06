import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing-module';

import { SideNavbarComponent } from './components/side-navbar/side-navbar.component';
import { TopNavbarComponent } from './components/top-navbar/top-navbar.component';
import { FormMessageComponent } from './components/form-message/form-message.component';


@NgModule({
  declarations: [
    TopNavbarComponent, SideNavbarComponent, FormMessageComponent ],
  imports: [
    CommonModule,
    SharedRoutingModule
  ], 
  exports:[
    TopNavbarComponent, SideNavbarComponent, FormMessageComponent
  ]
})
export class SharedModule { }
