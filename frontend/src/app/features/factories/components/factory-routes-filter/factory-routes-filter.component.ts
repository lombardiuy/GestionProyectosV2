import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { Factory } from '../../interfaces/factory.interface';


@Component({
  selector: 'factory-routes-filter-component',
  templateUrl: './factory-routes-filter.component.html',
  styleUrls: ['./factory-routes-filter.component.scss'],
  standalone:false
})



export class FactoryRoutesFilterComponent implements OnInit {

@Input() selectedFactory!:Factory | null;
@Output() routeFilterChange = new EventEmitter<number | null>();

  public selectedRouteId: number | null = null;

  constructor() {

    


  }

  ngOnInit(): void {

  
  }

onRouteFilterChange(value: any) {

  if (value === "" || value === null) {
    this.selectedRouteId = null;
  } else {
    const id = Number(value);
    this.selectedRouteId = isNaN(id) ? null : id;
  }

  this.routeFilterChange.emit(this.selectedRouteId);
}



    ngOnDestroy(): void {
 
  }



}