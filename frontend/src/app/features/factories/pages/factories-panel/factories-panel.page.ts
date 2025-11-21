import {  Component, OnInit} from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { Factory } from '../../interfaces/factory.interface';


@Component({
  selector: 'factories-panel-page',
  templateUrl: './factories-panel.page.html',
  styleUrls: ['./factories-panel.page.scss'],
  standalone:false
})



export class FactoriesPanelPage implements OnInit {

    public selectedFactory:Factory | null | undefined = null;
    public loading:boolean = true;
    public formMode = "select";

    

  
  

  constructor(private authService:AuthService) {}

  

  



  async ngOnInit(): Promise<void> {

  
    this.loading = false;

  
   
  
  
  }

  
  hasPermission(code: string): boolean {
    return this.authService.hasPermission(code);
  }

  createFactory() {}

  
cancelSelection() {

  //this.selectedUserRole = null;
  //this.createEmptyForm();
  this.formMode = 'select';
 
}

 
  
}