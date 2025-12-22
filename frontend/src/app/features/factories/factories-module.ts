import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FactoriesRoutingModule } from './factories-routing-module';
import { SharedModule } from '../../shared/shared-module';
import { NgSelectModule } from '@ng-select/ng-select';

import {FactoriesManagerPage} from './pages/factories-manager/factories-manager.page';
import { FactoryPanelPage } from './pages/factory-panel/factory-panel.page';



import { FactoriesListComponent } from './components/factory/factories-list/factories-list.component';
import { FactoryRoutePanelComponent } from './components/factory-route/factory-route-panel/factory-route-panel.component';
import { FactoryAreaSummaryComponent } from './components/factory-area/factory-area-summary/factory-area-summary.component';
import { FactoryRouteAreaCreateComponent } from './components/factory-area/factory-route-area-create/factory-route-area-create.component';
import { FactoryCreateComponent } from './components/factory/factory-create/factory-create.component';
import { FactoryRoutesFilterComponent } from './components/factory-route/factory-routes-filter/factory-routes-filter.component';
import { FactoryRouteCreateComponent } from './components/factory-route/factory-route-create/factory-route-create.component';
import { FactoryRouteSuspensionComponent } from './components/factory-route/factory-route-suspension/factory-route-suspension.component';
import { FactorySuspensionComponent } from './components/factory/factory-suspension/factory-suspension.component';
import { FactorySummaryComponent } from './components/factory/factory-summary/factory-summary.component';




@NgModule({
  declarations: [
    FactoriesManagerPage, FactoryPanelPage,
    FactorySummaryComponent, FactoriesListComponent, FactoryRoutePanelComponent, FactoryAreaSummaryComponent, FactoryRouteAreaCreateComponent,
    FactoryCreateComponent, FactoryRoutesFilterComponent, FactoryRouteCreateComponent, FactorySuspensionComponent, FactoryRouteSuspensionComponent,

  ],
  imports: [
    CommonModule,
    FactoriesRoutingModule, 
    FormsModule,
    ReactiveFormsModule, 
    SharedModule,
    NgSelectModule
  ], 

})
export class FactoriesModule { }
