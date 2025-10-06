import { Component, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';


@Component({
  selector: 'user-unsuspend-component',
  templateUrl: './user-unsuspend.component.html',
  styleUrls: ['./user-unsuspend.component.scss'],
  standalone:false
})



export class UserUnSuspendComponent {

   @Input() username: string | null | undefined;
   @Output() unSuspendUserEvent = new EventEmitter<void>();
   @ViewChild('btnClose') btnClose!: ElementRef;  

  constructor() { }

    unSuspendUser() {

     this.unSuspendUserEvent.emit();
  
  }

    closeModal() {
    this.btnClose.nativeElement.click();
  }
  


}