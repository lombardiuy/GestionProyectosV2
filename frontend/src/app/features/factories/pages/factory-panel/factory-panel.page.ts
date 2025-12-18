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
import { ActivatedRoute, Router } from '@angular/router';
import { noLeadingSpaceValidator } from '../../../users/validators/no-leading-space.validator';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'factory-panel-page',
  templateUrl: './factory-panel.page.html',
  styleUrls: ['./factory-panel.page.scss'],
  standalone:false
})


export class FactoryPanelPage implements OnInit {

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

    public imagePreview: string | null | undefined;
    public factoryPicturePath = environment.publicURL + 'factories/';

    public factoriesList$: Observable<Factory[] | null>;
    public selectedFactory$: Observable<Factory | null>;
    public filteredFactory$!: Observable<Factory | null>;

    public selectedFactoryRouteId$ = new BehaviorSubject<number | null>(null);
    public selectedFactoryRouteAuditTrail:FactoryRoute | undefined;
    public filteredFactoryRoutes$!: Observable<FactoryRoute[]>;


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

    

  
  

  constructor(private authService:AuthService,   private router:Router,  private route: ActivatedRoute,  private messageService:MessageService,  private factoryService:FactoryService, private timeService:TimeService, private formBuilder:FormBuilder) {

    this.factoriesList$ = this.factoryService.factoryList$;
    this.selectedFactory$ = this.factoryService.selectedFactory$;

     this.timestamp$ = this.timeService.timestamp$;
   
  }

  
async ngOnInit(): Promise<void> {

  const factoryName = this.route.snapshot.paramMap.get('factoryName');

  await this.initFactory(factoryName!);
  await this.initFactoryRoutes();

  this.initFilteredFactoryRoutes(); 

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



async initFactory(factoryName:string) {
  this.selectedFactory = null;
 
   await this.factoryService.selectFactoryByName(factoryName).catch(err=> {
    
        this.router.navigate(['/factories'])

   })

     const factory = await firstValueFrom(this.factoryService.selectedFactory$);

  // ⚡ Forzar nueva referencia para que ngOnChanges se dispare
  this.selectedFactory = factory ? { ...factory } : null;

   

  

 
  

}


private initFilteredFactoryRoutes() {
  this.filteredFactoryRoutes$ = combineLatest([
    this.selectedFactory$,
    this.showActiveFactoryRoutes$,
    this.selectedFactoryRouteId$
  ]).pipe(
    map(([factory, showActive, selectedRouteId]) => {
      if (!factory || !factory.routes) return [];

      let routes = factory.routes.filter(route =>
        showActive ? route.active : !route.active
      );

      // 👉 solo filtra si hay ruta seleccionada
      if (selectedRouteId !== null) {
        routes = routes.filter(route => route.id === selectedRouteId);
      }

      return routes;
    })
  );
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

 

  


getAvailableFactoryRoutesForSelect() {
  this.availableFactoryRoutesForSelect$ = combineLatest([
    this.selectedFactory$,
    this.showActiveFactoryRoutes$
  ]).pipe(
    map(([factory, showActive]) => {
      if (!factory || !factory.routes) return [];

      return factory.routes.filter(route =>
        showActive ? route.active : !route.active
      );
    })
  );
}







createEmptyFactoryForm() {
  this.factoryCreateForm = this.formBuilder.group({
    id: [null],
    name: ['', [Validators.required, noLeadingSpaceValidator]],
    location: ['', [Validators.required, Validators.maxLength(100)]],
    contact: ['', [Validators.required, Validators.maxLength(100)]],
    active: [null],
    hasProfilePicture: [false],
    routes: this.formBuilder.array([])
  });
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
    this.imagePreview = null;
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
    this.factoryForm['contact'].setValue(selectedFactory.contact);
    this.factoryForm['active'].setValue(selectedFactory.active);
    this.factoryForm['hasProfilePicture'].setValue(selectedFactory.hasProfilePicture);

        if (selectedFactory.hasProfilePicture) {
          
     
      const timestamp = await firstValueFrom(this.timestamp$);
      this.imagePreview = this.factoryPicturePath + '/factory_' + selectedFactory.id +  '/FactoryProfilePic_' + selectedFactory.id +'.jpeg?t=' + timestamp;
    }
   else {
   this.imagePreview  = null;
  }

  console.log(this.imagePreview)



    // Manejo del FormArray
    const routesFA = this.factoryForm['routes'] as FormArray;
    routesFA.clear(); // limpia los controles existentes
    if (selectedFactory.routes && selectedFactory.routes.length > 0) {
      selectedFactory.routes.forEach(route => {
        routesFA.push(this.formBuilder.group({
          id: [route.id],
          name: [route.name],
          description: [route.description],
          active: [route.active]
        }));
      });
    }
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

 async editFactory() {

  if (!this.selectedFactory) return;

  this.loadingFactoryCreateForm = true;

  // Limpia mensajes previos
  this.factoryCreateFormMessage = null;

  // Inicializa form con datos
  await this.initFactoryForm(this.selectedFactory);





  this.loadingFactoryCreateForm = false;
}


   
  async createFactoryRoute() { 

    this.loadingFactoryCreateForm = true;
    
    await this.factoryService.clearSelectedFactoryRoute()

    this.initFactoryRouteForm();
      this.loadingFactoryCreateForm = false;

  
  } 

    async editFactoryRoute(event:any) { 
     const selectedFactoryRoute = event;
    this.loadingFactoryCreateForm = true;
    
    await this.factoryService.clearSelectedFactoryRoute()

    this.initFactoryRouteForm(selectedFactoryRoute);
      this.loadingFactoryCreateForm = false;

  
  } 






saveFactory() {

  if (this.factoryCreateForm.invalid) {
    this.factoryCreateFormMessage =
      this.messageService.createFormMessage(
        MessageType.ERROR,
        'Por favor, completa todos los campos correctamente.'
      );
    return;
  }

  this.savingFactory = true;

  // 🟢 CREATE
  if (!this.factoryCreateForm.value.id) {

    this.createFactorySubscription =
      this.factoryService.createFactory(this.factoryCreateForm.value)
        .subscribe({
          next: async () => {
            this.factoryCreateFormMessage =
              this.messageService.createFormMessage(
                MessageType.SUCCESS,
                'Fábrica creada con éxito'
              );

            await delay(1000);
              this.timeService.refreshTimestamp();
            this.factoryCreateComponent.closeModal();
            this.savingFactory = false;
          },
          error: (err) => {
            this.factoryCreateFormMessage =
              this.messageService.createFormMessage(
                MessageType.ERROR,
                err.error.error
              );
            this.savingFactory = false;
          }
        });

  } 
  // 🔵 UPDATE
  else {

    this.createFactorySubscription =
      this.factoryService.updateFactory(this.factoryCreateForm.value)
        .subscribe({
          next: async () => {
            this.factoryCreateFormMessage =
              this.messageService.createFormMessage(
                MessageType.SUCCESS,
                'Fábrica actualizada con éxito'
              );

            await delay(1000);

             // refrescar fábrica
            await this.initFactory(this.factoryCreateForm.value.name);
            await this.initFactoryRoutes();
              this.timeService.refreshTimestamp();
             this.factoryCreateComponent.closeModal();
                this.savingFactory = false;
                 
            this.router.navigate(['/factories/'+this.factoryCreateForm.value.name])
          

           
      
         


           
            
           
          },
          error: (err) => {
            this.factoryCreateFormMessage =
              this.messageService.createFormMessage(
                MessageType.ERROR,
                err.error.error
              );
            this.savingFactory = false;
          }
        });

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

  const formValue = this.factoryRouteCreateForm.value;

  // 🟢 CREATE
  if (!formValue.id && this.selectedFactory) {

    this.createFactoryRouteSubscription = this.factoryService
      .createFactoryRoute(formValue, this.selectedFactory)
      .subscribe({
        next: async () => {

          this.factoryRouteCreateFormMessage = this.messageService.createFormMessage(
            MessageType.SUCCESS,
            'Ruta creada con éxito'
          );

          await delay(1000);
          await this.initFactory(this.selectedFactory!.name);
          await this.initFactoryRoutes();

          this.factoryRouteCreateComponent.closeModal();
          this.savingFactoryRoute = false;
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
  // 🔵 UPDATE
  else if (formValue.id) {

    this.createFactoryRouteSubscription = this.factoryService
      .updateFactoryRoute(formValue)
      .subscribe({
        next: async () => {

          this.factoryRouteCreateFormMessage = this.messageService.createFormMessage(
            MessageType.SUCCESS,
            'Ruta actualizada con éxito'
          );

          await delay(1000);
          await this.initFactory(this.selectedFactory!.name);
          await this.initFactoryRoutes();

          this.factoryRouteCreateComponent.closeModal();
          this.savingFactoryRoute = false;
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
      
         await this.initFactory(this.selectedFactory?.name!);
          await this.initFactoryRoutes();

       
  
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

      //dalta algo aca
     
  
      this.factorySuspensionComponent.closeModal();
      this.factorySuspensionFormMessage = null;
        this.savingSuspensionFactory = false;
          this.router.navigate(['/factories'])

      
    }, 
    error:(err)=> {
        this.factorySuspensionFormMessage = this.messageService.createFormMessage(MessageType.ERROR, err.error.errror);
          this.savingSuspensionFactory = false;
    }
  })
  
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