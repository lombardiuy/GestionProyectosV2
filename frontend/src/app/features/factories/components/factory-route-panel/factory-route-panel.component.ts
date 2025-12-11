import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FactoryRoute } from '../../interfaces/factory-route.interface';
import { Factory } from '../../interfaces/factory.interface';
import { Area } from '../../../areas/interfaces/area.interface';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'factory-route-panel-component',
  templateUrl: './factory-route-panel.component.html',
  styleUrls: ['./factory-route-panel.component.scss'],
  standalone: false
})
export class FactoryRoutePanelComponent implements OnInit {

  // Inputs que usabas antes
  @Input() hasPermission!: (code: string) => boolean;
  @Input() route!: FactoryRoute | null | undefined;
  @Input() factory!: Factory| null | undefined;
  @Input() loading!: boolean | undefined;
  @Input() timestamp!: number | null;

  @Output() suspendFactoryRouteEvent = new EventEmitter<any>();

  // Variables usadas en la vista
  createAreaBtnLegend: number | undefined | null = null;

  equipmentClassPicturePath = environment.publicURL + 'equipments/equipmentClassPics';
  equipmentPicturePath = environment.publicURL + 'equipments/equipmentPics';

  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  // trackBy usados en la vista
  trackByRoute(index: number, route: FactoryRoute) {
    return route.id;
  }

  trackByArea(index: number, area: Area) {
    return area.id;
  }

    factoryRouteSuspension(factoryRoute: FactoryRoute | null, suspend: boolean) {
      if (factoryRoute && factoryRoute.id) {
        this.suspendFactoryRouteEvent.emit({ id: factoryRoute.id, name:factoryRoute.name, suspend });
      }
    }
  
}
