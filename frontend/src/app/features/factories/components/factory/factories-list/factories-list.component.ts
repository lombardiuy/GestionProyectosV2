import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';

import { FormBuilder, FormGroup } from '@angular/forms';
import { Factory } from '../../../interfaces/factory.interface';



@Component({
  selector: 'factories-list-component',
  templateUrl: './factories-list.component.html',
  styleUrls: ['./factories-list.component.scss'],
  standalone:false
})



export class FactoriesListComponent implements OnInit {


   @Input() selectedFactory:Factory | null | undefined;

   @Input() factoriesList!: Factory[] | null;

   @Output() selectFactoryEvent = new EventEmitter<Factory>();

  

  constructor() {

    


  }

  ngOnInit(): void {

  
  }





    ngOnDestroy(): void {
 
  }


  selectFactory(event:any){

    this.selectFactoryEvent.emit(event)


  }

}