import {  Component, OnInit, Input, ViewChild} from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { Factory } from '../../interfaces/factory.interface';
import { FactoryRoute } from '../../interfaces/factory-route.interface';
import { FactoryService } from '../../services/factory.service';
import { BehaviorSubject, combineLatest, firstValueFrom, map, Observable, pipe, Subscription } from 'rxjs';
import { TimeService } from '../../../../shared/services/time.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormMessage, MessageType } from '../../../../shared/interfaces/form-message.interface';
import { FactoryCreateComponent } from '../../components/factory-create/factory-create.component';
import { MessageService } from '../../../../shared/services/message.service';
import { delay } from '../../../../shared/helpers/delay.helper';
import { FactoryRouteCreateComponent } from '../../components/factory-route-create/factory-route-create.component';




@Component({
  selector: 'factories-panel-page',
  templateUrl: './factories-panel.page.html',
  styleUrls: ['./factories-panel.page.scss'],
  standalone:false
})


export class FactoriesPanelPage implements OnInit {

    public selectedFactory:Factory | null | undefined = null;
    public selectedRouteId: number | null = null;

    public loading:boolean = true;
    public loadingFactoryCreateForm:boolean = true;
    public loadingFactoryRouteCreateForm:boolean = true;

    public savingFactory:boolean = false;
    public savingFactoryRoute:boolean = false;

    public timestamp$: Observable<number>;




    public factoriesList$: Observable<Factory[] | null>;
    public selectedFactory$: Observable<Factory | null>;
    public filteredFactory$: Observable<Factory | null>;

    public selectedRouteId$ = new BehaviorSubject<number | null>(null);

    public factoryCreateForm!:FormGroup;
    public factoryRouteCreateForm!:FormGroup;

    public factoryFormMessage:FormMessage | null | undefined;
    public factoryRouteFormMessage:FormMessage | null | undefined;

    private createFactorySubscription?:Subscription;
    private createFactoryRouteSubscription?:Subscription;

    public showInactiveRoutes$ = new BehaviorSubject<boolean>(false);

    @ViewChild(FactoryCreateComponent) factoryCreateComponent!: FactoryCreateComponent;
    @ViewChild(FactoryRouteCreateComponent) factoryRouteCreateComponent!: FactoryRouteCreateComponent;





    

  
  

  constructor(private authService:AuthService, private messageService:MessageService,  private factoryService:FactoryService, private timeService:TimeService, private formBuilder:FormBuilder) {

    this.factoriesList$ = this.factoryService.factoryList$;
    this.selectedFactory$ = this.factoryService.selectedFactory$;

     this.timestamp$ = this.timeService.timestamp$;

this.filteredFactory$ = combineLatest([
  this.selectedFactory$,
  this.selectedRouteId$,
  this.showInactiveRoutes$
]).pipe(
  map(([factory, routeId, showInactive]) => {
    if (!factory) return null;

    // Filtrar por estado (activo/inactivo)
    let filteredRoutes = factory.routes.filter(r => r.active === !showInactive);

    // Si hay filtro por ID de ruta
    if (routeId) {
      filteredRoutes = filteredRoutes.filter(r => r.id === routeId);
    }

    return {
      ...factory,
      routes: filteredRoutes
    };
  })
);



  }

  

  
get factoryForm() {
  return this.factoryCreateForm?.controls;
}

get factoryRouteForm() {
  return this.factoryRouteCreateForm?.controls;
}



  async ngOnInit(): Promise<void> {


    await this.factoryService.getAllFactories();
    this.createEmptyFactoryForm();
    this.createEmptyFactoryRouteForm();
  
    this.loadingFactoryCreateForm = false;
    this.loadingFactoryRouteCreateForm = false;
    this.loading = false;
  
  
  
  }

  createEmptyFactoryForm() {
    this.factoryCreateForm = this.formBuilder.group({
      id:[null],
      name:['', Validators.required],
      location:['', Validators.required],
      owner:['', Validators.required],
      contact:['', Validators.required],
      active:[null],
      routes: this.formBuilder.array([])

    })
  }

    createEmptyFactoryRouteForm() {
    this.factoryRouteCreateForm = this.formBuilder.group({
      id:[null],
      name:['', Validators.required],
      description:['', Validators.required]

    })


  }



  
resetFactoryForm() {
  this.factoryCreateForm.reset({
    id: null,
    name: '',
    location: '',
    owner: '',
    contact: '',
    active: null
  });


  const routesFA = this.factoryCreateForm.get('routes') as FormArray;
  routesFA.clear();

  this.factoryRouteCreateForm.reset({
    name: '',
    description: '',

  });

  this.factoryFormMessage = null;
  this.savingFactory = false;
}



resetFactoryRouteForm() {
  this.factoryRouteCreateForm.reset({
    id: null,
    name: '',
    description: ''
  });

  this.factoryRouteFormMessage = null;
  this.savingFactoryRoute = false;
}



  
  async initFactoryForm(selectedFactory?: Factory | null) {
    this.resetFactoryForm();
  
    if (selectedFactory) {
      this.factoryForm['id'].setValue(selectedFactory.id);
      this.factoryForm['name'].setValue(selectedFactory.name);
      this.factoryForm['location'].setValue(selectedFactory.location);
      this.factoryForm['owner'].setValue(selectedFactory.owner);
      this.factoryForm['conctact'].setValue(selectedFactory.contact);
      this.factoryForm['active'].setValue(selectedFactory.active);
      this.factoryForm['routes'].setValue(selectedFactory.routes);
  

    }
  }

    async initFactoryRouteForm(selectedFactoryRoute?: FactoryRoute | null) {
    this.resetFactoryRouteForm();
  
    if (selectedFactoryRoute) {
      this.factoryRouteForm['id'].setValue(selectedFactoryRoute.id);
      this.factoryRouteForm['name'].setValue(selectedFactoryRoute.name);
      this.factoryRouteForm['location'].setValue(selectedFactoryRoute.description);
  
    }
  }
  
  
  hasPermission(code: string): boolean {
    return this.authService.hasPermission(code);
  }

  
  async createFactory() { 

    this.loadingFactoryCreateForm = true;
    
   // await this.factoryService.clearSelectedFactory()

    this.initFactoryForm();
    this.loadingFactoryCreateForm = false;

  
  } 

   
  async createFactoryRoute() { 

    this.loadingFactoryCreateForm = true;
    
    await this.factoryService.clearSelectedFactoryRoute()

    this.initFactoryRouteForm();
      this.loadingFactoryCreateForm = false;

  
  } 



  saveFactory() {

    if (this.factoryCreateForm.invalid) {
      this.factoryFormMessage = this.messageService.createFormMessage(MessageType.ERROR, 'Por favor, completa todos los campos correctamente.');
      return;
    }

    this.savingFactory = true;

    if (!this.factoryCreateForm.value.id) {
      this.createFactorySubscription = this.factoryService.createFactory(this.factoryCreateForm.value).subscribe({
        next: async(res)=> {

          this.factoryFormMessage = this.messageService.createFormMessage(MessageType.SUCCESS, 'Fábricada creada con éxito');
          this.savingFactory = false;
          await delay(1000);
          await this.factoryService.getAllFactories();
          this.factoryCreateComponent.closeModal();
        }, 
        error:((err)=> {
          this.factoryFormMessage = this.messageService.createFormMessage(MessageType.ERROR, err.error.error);
          this.savingFactory = false
        })
      })
    }
  }



async saveFactoryRoute() {

  if (this.factoryRouteCreateForm.invalid) {
    this.factoryRouteFormMessage = this.messageService.createFormMessage(
      MessageType.ERROR,
      'Por favor, completa todos los campos correctamente.'
    );
    return;
  }

  this.savingFactoryRoute = true;

  const selectedFactory = await firstValueFrom(this.factoryService.selectedFactory$);

  if (!this.factoryRouteCreateForm.value.id && selectedFactory) {

    this.createFactoryRouteSubscription = this.factoryService
      .createFactoryRoute(this.factoryRouteCreateForm.value, selectedFactory)
      .subscribe({
        next: async (res) => {

          this.factoryRouteFormMessage = this.messageService.createFormMessage(
            MessageType.SUCCESS,
            'Ruta creada con éxito'
          );

          this.savingFactoryRoute = false;
          await delay(1000);

          // 🔄 Recargar todas las fábricas
          await this.factoryService.getAllFactories();

          // 🆕 Tomar la lista ya actualizada
          const factories = await firstValueFrom(this.factoryService.factoryList$);

          // 🔍 Encontrar la versión más nueva de la fábrica seleccionada
          const updatedFactory = factories?.find(f => f.id === selectedFactory.id) || null;

          // 🔄 Re-asignar la referencia correcta
          this.selectedFactory = updatedFactory;

          // 🔄 Avisar al servicio cual es la fábrica actual
          if (updatedFactory) {
            await this.factoryService.selectFactory(updatedFactory.id!);
          }

          // 👌 Cerrar modal
          this.factoryRouteCreateComponent.closeModal();
        },

        error: (err) => {
          this.factoryRouteFormMessage = this.messageService.createFormMessage(
            MessageType.ERROR,
            err.error.error
          );
          this.savingFactoryRoute = false;
        }
      });
  }
}


  
  async selectFactory(event:any) {


      this.selectedFactory = event;
      await this.factoryService.selectFactory(event.id)






    
   }

     async selectRoute(event:any) {


      console.log(event)

          this.selectedRouteId$.next(event);




    
   }




  trackByRoute(index: number, route: FactoryRoute) {
    return route.id;
  }
 

  toggleRoutes() {
  const current = this.showInactiveRoutes$.value;
  this.showInactiveRoutes$.next(!current);
}

  ngOnDestroy() {

    this.factoryService.clearSelectedFactory();
    this.factoryService.clearFactoryList();
    
    this.createFactorySubscription?.unsubscribe();
    this.createFactoryRouteSubscription?.unsubscribe();
  }

 
  
}