import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FactoriesRoutingModule } from './factories-routing-module';
import { SharedModule } from '../../shared/shared-module';

import {FactoriesPanelPage} from './pages/factories-panel/factories-panel.page'

@NgModule({
  declarations: [
    FactoriesPanelPage

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
