import {MaterialClass} from './material-class.interface'

export interface Material {
  id?: number;
  name: string;

  classes: MaterialClass[];
}
