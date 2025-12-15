import {  Component, OnInit, Input, ViewChild} from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { Factory } from '../../interfaces/factory.interface';
import { FactoryRoute } from '../../interfaces/factory-route.interface';
import { FactoryService } from '../../services/factory.service';
import { BehaviorSubject, combineLatest, firstValueFrom, map, Observable, of, pipe, Subscription } from 'rxjs';
import { TimeService } from '../../../../shared/services/time.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormMessage, MessageType } from '../../../../shared/interfaces/form-message.interface';
import { FactoryCreateComponent } from '../../components/factory/factory-create/factory-create.component';
import { MessageService } from '../../../../shared/services/message.service';
import { delay } from '../../../../shared/helpers/delay.helper';
import { FactoryRouteCreateComponent } from '../../components/factory-route/factory-route-create/factory-route-create.component';
import { FactoryRouteSuspensionComponent } from '../../components/factory-route/factory-route-suspension/factory-route-suspension.component';
import { FactorySuspensionComponent } from '../../components/factory/factory-suspension/factory-suspension.component';


@Component({
  selector: 'factories-panel-page',
  templateUrl: './factories-panel.page.html',
  styleUrls: ['./factories-panel.page.scss'],
  standalone:false
})


export class FactoriesPanelPage implements OnInit {

    public selectedFactory:Factory | null | undefined = null;
    public selectedFactoryRouteId: number | null = null;

    public loading:boolean = true;
    public loadingFactoryCreateForm:boolean = true;
    public loadingFactoryRouteCreateForm:boolean = true;

    public savingFactory:boolean = false;
    public savingFactoryRoute:boolean = false;
    public savingSuspensionFactory:boolean = false;
    public savingSuspensionFactoryRoute:boolean = false;

    public timestamp$: Observable<number>;




    public factoriesList$: Observable<Factory[] | null>;
    public selectedFactory$: Observable<Factory | null>;
    public filteredFactory$!: Observable<Factory | null>;

    public selectedFactoryRouteId$ = new BehaviorSubject<number | null>(null);
    public selectedFactoryRouteAuditTrail:FactoryRoute | undefined;

    public factoryCreateForm!:FormGroup;
    public factoryRouteCreateForm!:FormGroup;

    public factoryCreateFormMessage:FormMessage | null | undefined;
    public factoryRouteCreateFormMessage:FormMessage | null | undefined;
    public factorySuspensionFormMessage:FormMessage | null | undefined;
    public factoryRouteSuspensionFormMessage:FormMessage | null | undefined;

    private createFactorySubscription?:Subscription;
    private createFactoryRouteSubscription?:Subscription;
    private suspendFactorySubscription?:Subscription;
    private suspendFactoryRouteSubscription?:Subscription;

    public hasInactiveFactoryRoutes$!: Observable<boolean>;
    public hasActiveFactoryRoutes$!: Observable<boolean>;

    public availableFactoryRoutesForSelect$!: Observable<FactoryRoute[] | undefined>;
    public showActiveFactoryRoutes$ = new BehaviorSubject<boolean>(false);

    public hasInactiveFactories$!: Observable<boolean>;
    public hasActiveFactories$!: Observable<boolean>;
    public availableFactoriesForSelect$!: Observable<Factory[] | null >;
    public showActiveFactories$ = new BehaviorSubject<boolean>(false);

    @ViewChild(FactoryCreateComponent) factoryCreateComponent!: FactoryCreateComponent;
    @ViewChild(FactoryRouteCreateComponent) factoryRouteCreateComponent!: FactoryRouteCreateComponent;
    @ViewChild(FactorySuspensionComponent) factorySuspensionComponent!: FactorySuspensionComponent;
    @ViewChild(FactoryRouteSuspensionComponent) factoryRouteSuspensionComponent!: FactoryRouteSuspensionComponent;

    public factoryRouteToSuspend:Partial<FactoryRoute> | null | undefined;
    public factoryRouteSuspend:boolean | undefined;

    public factoryToSuspend:Partial<Factory> | null | undefined;
    public factorySuspend:boolean | undefined;

    

  
  

  constructor(private authService:AuthService, private messageService:MessageService,  private factoryService:FactoryService, private timeService:TimeService, private formBuilder:FormBuilder) {

    this.factoriesList$ = this.factoryService.factoryList$;
    this.selectedFactory$ = this.factoryService.selectedFactory$;

     this.timestamp$ = this.timeService.timestamp$;
   
  }

  
  async ngOnInit(): Promise<void> {


    await this.initFactories();
    this.createEmptyFactoryForm();
    this.createEmptyFactoryRouteForm();

  
    this.loadingFactoryCreateForm = false;
    this.loadingFactoryRouteCreateForm = false;
    this.loading = false;
  
  
  
  }

  
get factoryForm() {
  return this.factoryCreateForm?.controls;
}

get factoryRouteForm() {
  return this.factoryRouteCreateForm?.controls;
}


async initFactories() {
 
   await this.factoryService.getAllFactories();
   this.getFilteredFactories();


   this.getAvailableFactoriesForSelect();
   
    

    this.getHasActiveFactories();
    this.getHasInactiveFactories();


 

      const hasInactiveFactories = await firstValueFrom(this.hasInactiveFactories$);
      const hasActiveFactories = await firstValueFrom(this.hasActiveFactories$);

 

      if (!hasActiveFactories) {
        this.toggleFactories(false);
      }

      if (!hasInactiveFactories) {
         this.toggleFactories(true);
      }

      if (hasActiveFactories) {
   
         this.toggleFactories(true);
      }
 

 
  

}

async initFactoryRoutes() {
 

   this.getAvailableFactoryRoutesForSelect();
    


    this.getHasActiveFactoryRoutes();
    this.getHasInactiveFactoryRoutes();


      const hasInactiveFactoryRoutes = await firstValueFrom(this.hasInactiveFactoryRoutes$);
      const hasActiveFactoryRoutes = await firstValueFrom(this.hasActiveFactoryRoutes$);
      

      
      if (!hasActiveFactoryRoutes) {
        this.toggleFactoryRoutes(false);
      }

      if (!hasInactiveFactoryRoutes) {
         this.toggleFactoryRoutes(true);
      }

      if (hasActiveFactoryRoutes) {
   
         this.toggleFactoryRoutes(true);
      }


  

}


  getFilteredFactories() {
    this.filteredFactory$ = combineLatest([
  this.selectedFactory$,
  this.selectedFactoryRouteId$,
  this.showActiveFactoryRoutes$
]).pipe(
  map(([factory, routeId, showActive]) => {
    if (!factory) return null;

    // Filtrar por estado (activo/inactivo)
    let filteredRoutes = factory.routes.filter(r => r.active === showActive);

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

    getHasActiveFactoryRoutes() {
    this.hasActiveFactoryRoutes$ = this.selectedFactory$.pipe(
  map(factory => {
    if (!factory || !factory.routes) return false;
    return factory.routes.some(r => r.active === true);
  })
);}

  getHasInactiveFactoryRoutes() {
    this.hasInactiveFactoryRoutes$ = this.selectedFactory$.pipe(
  map(factory => {
    if (!factory || !factory.routes) return false;
    return factory.routes.some(r => r.active === false);
  })
);}

  getHasActiveFactories() {
    this.hasActiveFactories$ = this.factoriesList$.pipe(
  map(factories => {
    if (!factories || factories.length === 0) return false;
    return factories.some(f => f.active === true);
  })
);


  }


  getHasInactiveFactories() {
    this.hasInactiveFactories$ = this.factoriesList$.pipe(
  map(factories => {
    if (!factories || factories.length === 0) return false;
    return factories.some(f => f.active === false);
  })
);


  }


  


  getAvailableFactoryRoutesForSelect() {
    this.availableFactoryRoutesForSelect$ = combineLatest([
  this.selectedFactory$,
  this.showActiveFactoryRoutes$
]).pipe(
  map(([factory, showActive]) => {
    if (!factory || !factory.routes) return [];

    if (showActive === null) return factory.routes;                 // todas
    if (showActive === false) return factory.routes.filter(r => !r.active);  // activas
    if (showActive === true) return factory.routes.filter(r => r.active);  // inactivas

    // 🔥 fallback para satisfacer TS
    return factory.routes;
  })
);

  }

getAvailableFactoriesForSelect() {
  this.availableFactoriesForSelect$ = combineLatest([
    this.factoriesList$,
    this.showActiveFactories$
  ]).pipe(
    map(([factories, showActive]) => {
      if (!factories) return [];

      if (showActive === null) return factories;                // todas
      if (showActive === false) return factories.filter(f => !f.active); // activas
      if (showActive === true) return factories.filter(f => f.active); // inactivas

      return factories; // fallback TS
    })
  );
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

  this.factoryCreateFormMessage = null;
  this.savingFactory = false;
}



resetFactoryRouteForm() {
  this.factoryRouteCreateForm.reset({
    id: null,
    name: '',
    description: ''
  });

  this.factoryRouteCreateFormMessage = null;
  this.savingFactoryRoute = false;
}



  
  async initFactoryForm(selectedFactory?: Factory | null) {
    this.resetFactoryForm();
  
    if (selectedFactory) {
      this.factoryForm['id'].setValue(selectedFactory.id);
      this.factoryForm['name'].setValue(selectedFactory.name);
      this.factoryForm['location'].setValue(selectedFactory.location);
      this.factoryForm['owner'].setValue(selectedFactory.owner);
      this.factoryForm['contact'].setValue(selectedFactory.contact);
      this.factoryForm['active'].setValue(selectedFactory.active);
      this.factoryForm['routes'].setValue(selectedFactory.routes);
  

    }
  }

    async initFactoryRouteForm(selectedFactoryRoute?: FactoryRoute | null) {
    this.resetFactoryRouteForm();
  
    if (selectedFactoryRoute) {
      this.factoryRouteForm['id'].setValue(selectedFactoryRoute.id);
      this.factoryRouteForm['name'].setValue(selectedFactoryRoute.name);
      this.factoryRouteForm['description'].setValue(selectedFactoryRoute.description);
  
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
      this.factoryCreateFormMessage = this.messageService.createFormMessage(MessageType.ERROR, 'Por favor, completa todos los campos correctamente.');
      return;
    }

    this.savingFactory = true;

    if (!this.factoryCreateForm.value.id) {
      this.createFactorySubscription = this.factoryService.createFactory(this.factoryCreateForm.value).subscribe({
        next: async(res)=> {

          this.factoryCreateFormMessage = this.messageService.createFormMessage(MessageType.SUCCESS, 'Fábricada creada con éxito');
          this.savingFactory = false;
          await delay(1000);
          await this.factoryService.getAllFactories();
          this.factoryCreateComponent.closeModal();
        }, 
        error:((err)=> {
          this.factoryCreateFormMessage = this.messageService.createFormMessage(MessageType.ERROR, err.error.error);
          this.savingFactory = false
        })
      })
    }
  }



async saveFactoryRoute() {

  if (this.factoryRouteCreateForm.invalid) {
    this.factoryRouteCreateFormMessage = this.messageService.createFormMessage(
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

          this.factoryRouteCreateFormMessage = this.messageService.createFormMessage(
            MessageType.SUCCESS,
            'Ruta creada con éxito'
          );

          this.savingFactoryRoute = false;
          await delay(1000);

          
          // 🔄 Recargar todas las fábricas
        //  await this.factoryService.getAllFactories();

          // 🆕 Tomar la lista ya actualizada
          const factories = await firstValueFrom(this.factoryService.factoryList$);

          // 🔍 Encontrar la versión más nueva de la fábrica seleccionada
          const updatedFactory = factories?.find(f => f.id === selectedFactory.id) || null;

          // 🔄 Re-asignar la referencia correcta
         // this.selectedFactory = updatedFactory;

          // 🔄 Avisar al servicio cual es la fábrica actual
          if (updatedFactory) {
            await this.factoryService.selectFactory(updatedFactory.id!);
          }

        //  this.initFactories();
          this.initFactoryRoutes();

           await this.factoryService.selectFactory(updatedFactory!.id!);

          // 👌 Cerrar modal
          this.factoryRouteCreateComponent.closeModal();
        },

        error: (err) => {
          this.factoryRouteCreateFormMessage = this.messageService.createFormMessage(
            MessageType.ERROR,
            err.error.error
          );
          this.savingFactoryRoute = false;
        }
      });
  }
}
marckFactoryRouteToSuspend(event:any) {



  this.factoryRouteToSuspend = event;
  this.factoryRouteSuspend = event.suspend;
 

}

marckFactoryToSuspend(factoryToSuspend:Factory, suspend:boolean) {



  this.factoryToSuspend = factoryToSuspend;
  this.factorySuspend = suspend;
 

}

async suspensionFactoryRoute() {

  this.savingSuspensionFactoryRoute = true;

  this.suspendFactoryRouteSubscription = this.factoryService.suspensionFactoryRoute(
    this.factoryRouteToSuspend?.id!
  ).subscribe({
    next:async(res) => {
      if (res) {
        this.factoryRouteSuspensionFormMessage = this.messageService.createFormMessage(MessageType.SUCCESS, 'Ruta activada con éxito!')
      }else {
        this.factoryRouteSuspensionFormMessage = this.messageService.createFormMessage(MessageType.ERROR, 'Ruta desactivada con éxito!')
      }

      await delay(1000);
      
      await this.selectFactory(this.selectedFactory);
      
      this.initFactoryRoutes();

       
  
      this.factoryRouteSuspensionComponent.closeModal();
      this.factoryRouteSuspensionFormMessage = null;
        this.savingSuspensionFactoryRoute = false;

      
    }, 
    error:(err)=> {
        this.factoryRouteSuspensionFormMessage = this.messageService.createFormMessage(MessageType.ERROR, err.error.errror);
          this.savingSuspensionFactoryRoute = false;
    }
  })
  
}

async suspensionFactory() {

  this.savingSuspensionFactory = true;

  this.suspendFactorySubscription = this.factoryService.suspensionFactory(
    this.factoryToSuspend?.id!
  ).subscribe({
    next:async(res) => {
      if (res) {
        this.factorySuspensionFormMessage = this.messageService.createFormMessage(MessageType.SUCCESS, 'Fábrica activada con éxito!')
      }else {
        this.factorySuspensionFormMessage = this.messageService.createFormMessage(MessageType.ERROR, 'Fábrica desactivada con éxito!')
      }

    this.initFactories();
     
  
      this.factorySuspensionComponent.closeModal();
      this.factorySuspensionFormMessage = null;
        this.savingSuspensionFactory = false;

      
    }, 
    error:(err)=> {
        this.factorySuspensionFormMessage = this.messageService.createFormMessage(MessageType.ERROR, err.error.errror);
          this.savingSuspensionFactory = false;
    }
  })
  
}

  
  async selectFactory(event:any) {

   await  this.initFactoryRoutes();


      this.selectedFactory = event;
      await this.factoryService.selectFactory(event.id);
       this.getFilteredFactories();

       const selectedFactory = await firstValueFrom(this.selectedFactory$)



       if (!selectedFactory?.active) {
  
 
        this.toggleFactoryRoutes(false)
       }else {
         this.toggleFactoryRoutes(true)
       }


       






    
   }

   async selectFactoryRouteAuditTrail(event:any) {
    console.log(event)
    this.selectedFactoryRouteAuditTrail = event;
   }

     async selectRoute(event:any) {


          this.selectedFactoryRouteId$.next(event);




    
   }






  trackByRoute(index: number, route: FactoryRoute) {
    return route.id;
  }
 
  toggleFactories(active:boolean) {
   this.showActiveFactories$.next(active);
   this.selectedFactory = null;
   this.filteredFactory$ = of(null);



}
  toggleFactoryRoutes(active:boolean) {
   this.showActiveFactoryRoutes$.next(active);
}

  ngOnDestroy() {

    this.factoryService.clearSelectedFactory();
    this.factoryService.clearFactoryList();
    
    this.createFactorySubscription?.unsubscribe();
    this.createFactoryRouteSubscription?.unsubscribe();
    this.suspendFactoryRouteSubscription?.unsubscribe();
      this.suspendFactorySubscription?.unsubscribe(); 
  }

 
  
}