import { Component} from '@angular/core';
import { NavbarstateService } from './shared/services/navbarstate.service';
import { AuthService } from './core/services/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor(public navbarstateService:NavbarstateService, public authService:AuthService) {

  }

ngOnInit() {

}



}
