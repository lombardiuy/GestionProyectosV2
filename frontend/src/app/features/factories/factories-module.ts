import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FactoriesRoutingModule } from './factories-routing-module';
import { SharedModule } from '../../shared/shared-module';

import {FactoriesPanelPage} from './pages/factories-panel/factories-panel.page'
import { FactoriesListComponent } from './components/factory/factories-list/factories-list.component';
import { FactoryRoutePanelComponent } from './components/factory-route/factory-route-panel/factory-route-panel.component';
import { FactoryAreaSummaryComponent } from './components/factory-area/factory-area-summary/factory-area-summary.component';
import { FactoryAreaCreateComponent } from './components/factory-area/factory-area-create/factory-area-create.component';
import { FactoryCreateComponent } from './components/factory/factory-create/factory-create.component';
import { FactoryRoutesFilterComponent } from './components/factory-route/factory-routes-filter/factory-routes-filter.component';
import { FactoryRouteCreateComponent } from './components/factory-route/factory-route-create/factory-route-create.component';
import { FactoryRouteSuspensionComponent } from './components/factory-route/factory-route-suspension/factory-route-suspension.component';
import { FactorySuspensionComponent } from './components/factory/factory-suspension/factory-suspension.component';



@NgModule({
  declarations: [
    FactoriesPanelPage, 
    FactoriesListComponent, FactoryRoutePanelComponent, FactoryAreaSummaryComponent, FactoryAreaCreateComponent,
    FactoryCreateComponent, FactoryRoutesFilterComponent, FactoryRouteCreateComponent, FactorySuspensionComponent, FactoryRouteSuspensionComponent

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
