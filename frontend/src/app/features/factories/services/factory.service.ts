import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';

import { Factory } from '../interfaces/factory.interface';
import { FactoryRoute } from '../interfaces/factory-route.interface';

@Injectable({
  providedIn: 'root',
})
export class FactoryService {

  private apiUrl = environment.apiURL + 'factories';

  private factoryListSubject = new BehaviorSubject<Factory[] | null>(null);
  private selectedFactorySubject = new BehaviorSubject<Factory | null>(null);
  private selectedFactoryRouteSubject = new BehaviorSubject<FactoryRoute | null>(null);

  public factoryList$ = this.factoryListSubject.asObservable();
  public selectedFactory$ = this.selectedFactorySubject.asObservable();
  public selectedFactoryRoute$ = this.selectedFactoryRouteSubject.asObservable();

  constructor(private http: HttpClient) {}

  /***************************************
   * CREATE
  ****************************************/


  /***************************************
   * READ
  ****************************************/


  async getAllFactories(): Promise<Factory[] | null> {
    try {
      const factoryList = await firstValueFrom(
        this.http.get<Factory[]>(`${this.apiUrl}`)
      );

      console.log(factoryList)
      this.factoryListSubject.next(factoryList);
      return factoryList;
    } catch (err) {
      console.error(err);
      this.factoryListSubject.next(null);
      return [];
    }
  }
  async selectFactory(id: number): Promise<Factory> {
    const selectedFactory = await firstValueFrom(
      this.http.get<Factory>(`${this.apiUrl}/select/${id}`)
    );
   
    this.selectedFactorySubject.next({...selectedFactory});
    return selectedFactory;
  }
  
  
  async selectFactoryByName(factoryName: string): Promise<Factory> {
const encodedName = encodeURIComponent(factoryName.trim()); 

    const selectedFactory = await firstValueFrom(
      this.http.get<Factory>(`${this.apiUrl}/selectByName/${encodedName}`)
    );

    console.log(selectedFactory)
   
    this.selectedFactorySubject.next({...selectedFactory});
    return selectedFactory;
  }

  clearFactoryList() {
    this.factoryListSubject.next(null);
  }

  clearSelectedFactory() {
    this.selectedFactorySubject.next(null);
  }

    clearSelectedFactoryRoute() {
    this.selectedFactoryRouteSubject.next(null);
  }

  
  createFactory(factory: Factory) {
      // Convertir el objeto Factory al DTO que espera el backend
      const dto = {
        name: factory.name,
        location: factory.location,
        contact: factory.contact, // SOLO el ID
        hasProfilePicture:factory.hasProfilePicture
      };


  
      return this.http.post<any>(`${this.apiUrl}/create`, dto);
    }

    updateFactory(factory: Factory) {

  const dto: any = {};

  if (factory.name !== undefined) dto.name = factory.name;
  if (factory.location !== undefined) dto.location = factory.location;
  if (factory.contact !== undefined) dto.contact = factory.contact;
  if (factory.hasProfilePicture !== undefined) {
    dto.hasProfilePicture = factory.hasProfilePicture;
  }

  return this.http.put<any>(
    `${this.apiUrl}/update/${factory.id}`,
    dto
  );
}

updateFactoryRoute(factoryRoute: FactoryRoute) {
  const dto: any = {};

  if (factoryRoute.name !== undefined) dto.name = factoryRoute.name;
  if (factoryRoute.description !== undefined) dto.description = factoryRoute.description;
  if (factoryRoute.active !== undefined) dto.active= factoryRoute.active; // ejemplo de booleano


  return this.http.put<any>(
    `${this.apiUrl}/route/update/${factoryRoute.id}`,
    dto
  );
}


  createFactoryRoute(factoryRoute: FactoryRoute, selectedFactory:Factory) {
      // Convertir el objeto Factory al DTO que espera el backend
      const dto = {
        name: factoryRoute.name,
        description: factoryRoute.description,
        factory: selectedFactory.id , // SOLO el ID
       
      };

      console.log(dto)
  
      return this.http.post<any>(`${this.apiUrl}/route/create`, dto);
    }
  

  suspensionFactory(factoryID: number) {
        return this.http.post<any>(`${this.apiUrl}/suspension`, {
          id: factoryID
        });
      }
    
        suspensionFactoryRoute(factoryRouteID: number) {
        return this.http.post<any>(`${this.apiUrl}/route/suspension`, {
          id: factoryRouteID
        });
      }
}
