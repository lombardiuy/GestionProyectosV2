import { Component, OnInit, Input } from '@angular/core';
import { FormMessage } from '../../interfaces/form-message.interface';

@Component({
  selector: 'form-message',
  templateUrl: './form-message.component.html',
  styleUrls: ['./form-message.component.scss'],
  standalone:false
})




export class FormMessageComponent implements OnInit {

   @Input() formMessage: FormMessage | null | undefined;

  

  constructor() { }

  async ngOnInit(){




  }



}
