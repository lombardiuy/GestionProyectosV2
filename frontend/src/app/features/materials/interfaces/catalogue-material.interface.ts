import {Material} from './material.interface'
import {MaterialParameter} from './material-parameter.interface'

export interface CatalogueMaterial {
  id?: number;
  code: string;
  name: string;
  provider: string;

  materialId: number;
  material: Material; // opcional

  parameters: MaterialParameter[];
}
