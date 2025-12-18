import {  Component, OnInit, ViewChild} from '@angular/core';
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
import { FileService } from '../../../../core/services/file.service';
import { environment } from '../../../../../environments/environment';
import { noLeadingSpaceValidator } from '../../../users/validators/no-leading-space.validator';


@Component({
  selector: 'factories-manager-page',
  templateUrl: './factories-manager.page.html',
  styleUrls: ['./factories-manager.page.scss'],
  standalone:false
})


export class FactoriesManagerPage implements OnInit {
    
    public loading:boolean = true;

    public loadingFactoryCreateForm:boolean = true;

    public savingFactory:boolean = false;
    public selectedFactory:Factory | null | undefined = null;
    public timestamp$: Observable<number>;


    public factoriesList$: Observable<Factory[] | null>;
    public filteredFactory$!: Observable<Factory | null>;
    public selectedFactory$ = new BehaviorSubject<Factory | null>(null);

    public factoryCreateForm!:FormGroup;

    public factoryCreateFormMessage:FormMessage | null | undefined;


    private createFactorySubscription?:Subscription;



    public hasInactiveFactories$!: Observable<boolean>;
    public hasActiveFactories$!: Observable<boolean>;
    public availableFactoriesForSelect$!: Observable<Factory[] | null >;
    public showActiveFactories$ = new BehaviorSubject<boolean>(false);


    public factoryPicturePath = environment.publicURL + 'factories/';
    public imagePreview: string | null | undefined;
    public factoryPicture!: File | null;
    public factoryPictureStatus: string | null | undefined;

    @ViewChild(FactoryCreateComponent) factoryCreateComponent!: FactoryCreateComponent;




  
  
  

  constructor(private authService:AuthService, private messageService:MessageService,  private fileService: FileService, private factoryService:FactoryService, private timeService:TimeService, private formBuilder:FormBuilder) {

    this.factoriesList$ = this.factoryService.factoryList$;

     this.timestamp$ = this.timeService.timestamp$;
   
  }

  
  async ngOnInit(): Promise<void> {


    await this.initFactories();
    this.createEmptyFactoryForm();
     this.timeService.refreshTimestamp();


  
    this.loadingFactoryCreateForm = false;

    this.loading = false;
  
  
  
  }

  
get factoryForm() {
  return this.factoryCreateForm?.controls;
}



async initFactories() {
 
   await this.factoryService.getAllFactories();


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



onFactorySelected(factory: Factory | null) {
 this.selectedFactory$.next(factory);
}





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


  



getAvailableFactoriesForSelect() {
  this.availableFactoriesForSelect$ = combineLatest([
    this.factoriesList$,
    this.showActiveFactories$,
    this.selectedFactory$
  ]).pipe(
    map(([factories, showActive, selectedFactory]) => {
      if (!factories) return [];

      let filtered = factories;

      // Activas / Inactivas
      if (showActive === true) {
        filtered = filtered.filter(f => f.active);
      }

      if (showActive === false) {
        filtered = filtered.filter(f => !f.active);
      }

      // Filtro por selección
      if (selectedFactory) {
        filtered = filtered.filter(f => f.id === selectedFactory.id);
      }

      return filtered;
    })
  );
}




  toggleFactories(active:boolean) {
   this.showActiveFactories$.next(active);
   this.selectedFactory = null;




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




  
resetFactoryForm() {
  this.factoryCreateForm.reset({
    id: null,
    name: '',
    location: '',
    contact: '',
    active: null
  });




  this.factoryCreateFormMessage = null;
  this.savingFactory = false;
    this.imagePreview = "";
}







  
async initFactoryForm(selectedFactory?: Factory | null) {
  this.resetFactoryForm();

  if (selectedFactory) {
    this.factoryForm['id'].setValue(selectedFactory.id);
    this.factoryForm['name'].setValue(selectedFactory.name);
    this.factoryForm['location'].setValue(selectedFactory.location);
    this.factoryForm['contact'].setValue(selectedFactory.contact);
    this.factoryForm['active'].setValue(selectedFactory.active);
    this.factoryForm['routes'].setValue(selectedFactory.routes);
    this.factoryForm['hasProfilePicture'].setValue(selectedFactory.hasProfilePicture);

    if (selectedFactory.hasProfilePicture) {
      const timestamp = await firstValueFrom(this.timestamp$);
      this.imagePreview = this.factoryPicturePath + 'Factory_' + selectedFactory.id + '.jpeg?t=' + timestamp;
    }
  } else {
    this.factoryForm['hasProfilePicture'].setValue(false);
  }
}


 setFactoryPicture(file: File) {
  this.factoryPictureStatus = '';
  this.factoryCreateForm.get('hasProfilePicture')?.setValue(true);
  this.factoryPicture = file;
  this.imagePreview = URL.createObjectURL(file);
  this.factoryCreateForm.markAsDirty();
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





  saveFactory() {



    if (this.factoryCreateForm.invalid) {
      this.factoryCreateFormMessage = this.messageService.createFormMessage(MessageType.ERROR, 'Por favor, completa todos los campos correctamente.');
      return;
    }

    this.savingFactory = true;

  if (!this.factoryCreateForm.value.id) {
  this.createFactorySubscription = this.factoryService
    .createFactory(this.factoryCreateForm.value)
    .subscribe({
      next: async (res) => {

        if (this.factoryPicture) {
          await this.fileService.save(
            this.factoryPicture,'factory_'+res.factory.id+'/FactoryProfilePic_'+ res.factory.id,'factoryProfilePic'
          );
        }

        this.factoryCreateFormMessage =
          this.messageService.createFormMessage(
            MessageType.SUCCESS,
            'Fábrica creada con éxito'
          );

        this.savingFactory = false;
        await delay(1000);
        await this.factoryService.getAllFactories();
        this.timeService.refreshTimestamp();

        this.factoryCreateComponent.closeModal();
      },
      error: (err) => {
        this.factoryCreateFormMessage =
          this.messageService.createFormMessage(MessageType.ERROR, err.error.error);
        this.savingFactory = false;
      }
    });
}

  }









  










 


  ngOnDestroy() {

    this.factoryService.clearSelectedFactory();
    this.factoryService.clearFactoryList();
    
    this.createFactorySubscription?.unsubscribe();

  }

 
  
}