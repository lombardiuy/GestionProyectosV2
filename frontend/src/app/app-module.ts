//Modules
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';


import { CoreModule } from './core/core-module';
import { SharedModule } from './shared/shared-module';

import { AppComponent } from './app.component';
import { PubliclayoutComponent } from './layouts/public-layout/public-layout.component';
import { PrivatelayoutComponent } from './layouts/private-layout/private-layout.component';




@NgModule({
  declarations: [AppComponent, PubliclayoutComponent, PrivatelayoutComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule, 
    SharedModule
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
