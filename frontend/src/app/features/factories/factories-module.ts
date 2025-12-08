import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FactoriesRoutingModule } from './factories-routing-module';
import { SharedModule } from '../../shared/shared-module';

import {FactoriesPanelPage} from './pages/factories-panel/factories-panel.page'
import { FactoriesListComponent } from './components/factories-list/factories-list.component';
import { FactoryRoutePanelComponent } from './components/factory-route-panel/factory-route-panel.component';
import { FactoryAreaSummaryComponent } from './components//factory-area-summary/factory-area-summary.component';
import { FactoryAreaCreateComponent } from './components/factory-area-create/factory-area-create.component';
import { FactoryCreateComponent } from './components/factory-create/factory-create.component';
import { FactoryRoutesFilterComponent } from './components/factory-routes-filter/factory-routes-filter.component';
import { FactoryRouteCreateComponent } from './components/factory-route-create/factory-route-create.component';

@NgModule({
  declarations: [
    FactoriesPanelPage, 
    FactoriesListComponent, FactoryRoutePanelComponent, FactoryAreaSummaryComponent, FactoryAreaCreateComponent, FactoryCreateComponent, FactoryRoutesFilterComponent, FactoryRouteCreateComponent

  ],
  imports: [
    CommonModule,
    FactoriesRoutingModule, 
    FormsModule,
    ReactiveFormsModule, 
    SharedModule
  ], 

})
export class FactoriesModule { }
