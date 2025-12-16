import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { Factory } from '../../../interfaces/factory.interface';
import { FormGroup } from '@angular/forms';
import { FormMessage } from '../../../../../shared/interfaces/form-message.interface';


@Component({
  selector: 'factory-create-component',
  templateUrl: './factory-create.component.html',
  styleUrls: ['./factory-create.component.scss'],
  standalone:false
})



export class FactoryCreateComponent  {

  isHover = false;


  @Input() hasPermission!: (code:string) => boolean;
  @Input() savingFactory:boolean | undefined;
  @Input() loadingFactoryCreateForm:boolean | undefined;
  @Input() factoriesList!: Factory[] | null;
  @Input() factoryCreateForm!:FormGroup;
  @Input() factoryCreateFormMessage:FormMessage | null | undefined;
  @Input() factoryPicturePath!: string | null;
@Input() imagePreview!: string | null | undefined;
@Input() factoryPictureStatus!: string | null | undefined;

@Output() setFactoryPictureEvent = new EventEmitter<File>();


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


  get contact() {
    return this.factoryCreateForm?.get('contact');
  }

  get active() {
     return this.factoryCreateForm?.get('active');
  }

  get routes() {
    return this.factoryCreateForm?.get('routes');
  }

  setFactoryPicture(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  if (
    file.type === 'image/jpeg' ||
    file.type === 'image/jpg' ||
    file.type === 'image/png'
  ) {
    this.setFactoryPictureEvent.emit(file);
  } else {
    this.factoryPictureStatus = 'El archivo proporcionado no tiene el formato correcto';
    this.imagePreview = '';
    this.factoryCreateForm.get('hasPicture')?.setValue(false);
  }
}


  closeModal() {
    this.btnClose.nativeElement.click();
  }

  saveFactory() {
    this.saveFactoryEvent.emit();
  }

 





}