import { Component, OnInit, Input } from '@angular/core';

import { Factory} from '../../../../factories/interfaces/factory.interface';
import { Tooltip } from 'bootstrap';

@Component({
  selector: 'factory-summary-component',
  templateUrl: './factory-summary.component.html',
  styleUrls: ['./factory-summary.component.scss'],
  standalone:false
})



export class FactorySummaryComponent implements OnInit {


  @Input() factoryPicturePath: string | undefined | null;
  @Input() factory!: Factory;
  @Input() timestamp!: Number | null;
  @Input() hasPermission!: (code: string) => boolean;

factories = [
  { id: 1, name: 'Fábrica A' },
  { id: 2, name: 'Fábrica B' }
];

selectedFactoryId!: number;

  constructor() {

    


  }

  ngOnInit(): void {
  

  
  }






    ngOnDestroy(): void {
 
  }





}