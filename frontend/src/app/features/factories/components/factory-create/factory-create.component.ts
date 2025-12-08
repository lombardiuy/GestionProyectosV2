import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { Factory } from '../../interfaces/factory.interface';
import { FormGroup } from '@angular/forms';
import { FormMessage } from '../../../../shared/interfaces/form-message.interface';


@Component({
  selector: 'factory-create-component',
  templateUrl: './factory-create.component.html',
  styleUrls: ['./factory-create.component.scss'],
  standalone:false
})



export class FactoryCreateComponent  {

  @Input() hasPermission!: (code:string) => boolean;
  @Input() savingFactory:boolean | undefined;
  @Input() loadingFactoryCreateForm:boolean | undefined;
  @Input() factoriesList!: Factory[] | null;
  @Input() factoryCreateForm!:FormGroup;
  @Input() factoryFormMessage:FormMessage | null | undefined;

  @Output() saveFactoryEvent = new EventEmitter<void>();

  @ViewChild('btnClose') btnClose!: ElementRef;






  

  constructor() {

    


  }

  get form() {
    return this.factoryCreateForm?.controls;
  }

  get id() {
    return this.factoryCreateForm?.get('id');
  }

  get name() {
    return this.factoryCreateForm?.get('name');
  }

  get location() {
    return this.factoryCreateForm?.get('location');
  }

  get owner() {
    return this.factoryCreateForm?.get('owner');
  }

  get contact() {
    return this.factoryCreateForm?.get('contact');
  }

  get active() {
     return this.factoryCreateForm?.get('active');
  }

  get routes() {
    return this.factoryCreateForm?.get('routes');
  }

  closeModal() {
    this.btnClose.nativeElement.click();
  }

  saveFactory() {
    this.saveFactoryEvent.emit();
  }

 





}