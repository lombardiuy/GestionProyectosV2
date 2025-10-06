import { Injectable } from '@angular/core';
import { FormMessage, MessageType } from '../interfaces/form-message.interface';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  





  constructor() {

  }

  createFormMessage(type:MessageType, message:string) {

    let res:FormMessage = {
      type:type,
      message:message
    }

    return  res;
  }






}