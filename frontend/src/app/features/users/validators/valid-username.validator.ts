import { FormGroup } from '@angular/forms';


  export function validUsername(controlName:string) {

    let words:Array<string> = [""];
    let length:number = 1;

  
    return (formGroup:FormGroup) => {


      words = formGroup.controls[controlName].value.split(' ');
      const control = formGroup.controls[controlName];
      length = words.filter(element=> element!= "").length
      


      if (length!= 2) {

        
      
        
          control.setErrors({ ...control.errors, validName: true });
      }else {
          const errors = control.errors ?? {};
          const { validName, ...otherErrors } = errors;
          control.setErrors(Object.keys(otherErrors).length ? otherErrors : null);

      }
    }


  }