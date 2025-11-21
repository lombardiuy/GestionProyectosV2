import { Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseParameterAbstract } from "../shared/base-parameter.abstract";
import { AreaClassParameter } from "./area-class-parameter.entity";
import { Area } from "./area.entity";

@Entity({ name: "area_parameter" })
export class AreaParameter extends BaseParameterAbstract {
  // referencia al parámetro de clase que define su tipo
  @ManyToOne(() => AreaClassParameter, (cp) => cp.parameters, { onDelete: "SET NULL" })
  @JoinColumn({ name: "class_parameter_id" })
  classParameter!: AreaClassParameter;

  // referencia al área que tiene este parámetro
  @ManyToOne(() => Area, (a) => a.parameters, { onDelete: "CASCADE" })
  @JoinColumn({ name: "area_id" })
  area!: Area;
}
