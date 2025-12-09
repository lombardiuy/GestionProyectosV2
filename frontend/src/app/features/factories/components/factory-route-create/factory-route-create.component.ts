import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { Factory } from '../../interfaces/factory.interface';
import { FormGroup } from '@angular/forms';
import { FormMessage } from '../../../../shared/interfaces/form-message.interface';


@Component({
  selector: 'factory-route-create-component',
  templateUrl: './factory-route-create.component.html',
  styleUrls: ['./factory-route-create.component.scss'],
  standalone:false
})



export class FactoryRouteCreateComponent  {

  @Input() hasPermission!: (code:string) => boolean;
  @Input() savingFactoryRoute:boolean | undefined;
  @Input() loadingFactoryRouteCreateForm:boolean | undefined;
  @Input() factoryRouteCreateForm!:FormGroup;
  @Input() factoryRouteCreateFormMessage:FormMessage | null | undefined;

  @Output() saveFactoryRouteEvent = new EventEmitter<void>();

  @ViewChild('btnClose') btnClose!: ElementRef;






  

  constructor() {

    


  }

  get form() {
    return this.factoryRouteCreateForm?.controls;
  }

  get id() {
    return this.factoryRouteCreateForm?.get('id');
  }

  get active() {
   return this.factoryRouteCreateForm?.get('active');
  }

  get name() {
    return this.factoryRouteCreateForm?.get('name');
  }

  get description() {
    return this.factoryRouteCreateForm?.get('description');
  }


  closeModal() {
    this.btnClose.nativeElement.click();
  }

  saveFactoryRoute() {
    this.saveFactoryRouteEvent.emit();
  }

 





}