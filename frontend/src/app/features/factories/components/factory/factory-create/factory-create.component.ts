import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Factory } from '../../../interfaces/factory.interface';
import { FormGroup } from '@angular/forms';
import { FormMessage } from '../../../../../shared/interfaces/form-message.interface';

@Component({
  selector: 'factory-create-component',
  templateUrl: './factory-create.component.html',
  styleUrls: ['./factory-create.component.scss'],
  standalone: false
})
export class FactoryCreateComponent {
  isHover = false;

  @Input() hasPermission!: (code:string) => boolean;
  @Input() savingFactory?: boolean;
  @Input() loadingFactoryCreateForm?: boolean;
  @Input() factoriesList!: Factory[] | null;
  @Input() factoryCreateForm!: FormGroup;
  @Input() factoryCreateFormMessage?: FormMessage | null;
  @Input() factoryPicturePath?: string | null;
  @Input() imagePreview?: string | null; // <-- Input
  @Input() factoryPictureStatus?: string | null;

  @Output() setFactoryPictureEvent = new EventEmitter<File>();
  @Output() saveFactoryEvent = new EventEmitter<void>();

  @ViewChild('btnClose') btnClose!: ElementRef;

  // Esto asegura que cuando el padre actualiza imagePreview, el hijo también lo recibe
  ngOnChanges(changes: SimpleChanges) {
    if (changes['imagePreview']) {
      this.imagePreview = changes['imagePreview'].currentValue;
    }
  }

  get form() {
    return this.factoryCreateForm?.controls;
  }

  get id() { return this.factoryCreateForm?.get('id'); }
  get name() { return this.factoryCreateForm?.get('name'); }
  get location() { return this.factoryCreateForm?.get('location'); }
  get contact() { return this.factoryCreateForm?.get('contact'); }
  get active() { return this.factoryCreateForm?.get('active'); }
  get routes() { return this.factoryCreateForm?.get('routes'); }

  setFactoryPicture(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
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
