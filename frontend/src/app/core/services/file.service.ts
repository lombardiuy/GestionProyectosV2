import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({ providedIn: 'root' })

export class FileService {

      private apiUrl = environment.apiURL + 'file'

    constructor(private http: HttpClient) {}


    save(file: File, fileName: string, type: string) {

        const formData = new FormData();
        formData.append('file', file);
         formData.append('fileName', fileName);
         formData.append('type', type); 

         return this.http.post<{ path: string }>(`${this.apiUrl}/save`, formData).subscribe({
    next: (response) => {
     
    },
    error: (error) => {
      console.error('❌ Error en la llamada:', error);
    }
  });
    }

    delete(fileName: string, type: string) {



      
      
        return this.http.delete(`${this.apiUrl}/delete/${type}/${fileName}`).subscribe({
    next: (response) => {
     
    },
    error: (error) => {
      console.error('❌ Error en la llamada:', error);
    }
  });
    }

   



  
}
