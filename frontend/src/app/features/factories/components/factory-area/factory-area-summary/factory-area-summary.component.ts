import { Component, OnInit, Input } from '@angular/core';

import { Area} from '../../../../areas/interfaces/area.interface';
import { Tooltip } from 'bootstrap';

@Component({
  selector: 'factory-area-summary-component',
  templateUrl: './factory-area-summary.component.html',
  styleUrls: ['./factory-area-summary.component.scss'],
  standalone:false
})



export class FactoryAreaSummaryComponent implements OnInit {

  createAreaBtnLegend:number| null = null;


  
  @Input() area!: Area;
  @Input() equipmentClassPicturePath: string | undefined | null;
  @Input() equipmentPicturePath: string | undefined | null;
  @Input() timestamp!: Number | null;


  constructor() {

    


  }

  ngOnInit(): void {
  

  
  }

   ngAfterViewInit(): void {
    const tooltipTriggerList = Array.from(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    
    tooltipTriggerList.forEach(tooltipTriggerEl => {
      new Tooltip(tooltipTriggerEl);
    });
  }





    ngOnDestroy(): void {
 
  }





}