import { Timestamp } from "rxjs";
import { IEmpresa } from "./iempresa";
import { IProyecto } from "./iproyecto";
import { IUsuario } from "./iusuario";
import { IEstado } from "./iestado";

export interface ITarea {
  id: number;
  detalle: string;
  f_pentrega: string;
  f_rentrega: string;
  fec_ini: string;
  fec_fin: string;
  id_complejidad: number;
  id_estado: number;
  id_usu_creo: number;
  id_reasig: number;
  tiempo: number;
  estado: IEstado;
  usuario_creo: IUsuario;
  usuario_asignado: IUsuario;
  created_at: Date;
  activo: boolean;
  cronometro: 0;
  id_prioridad: number;
  nom_prioridad: string;
  nom_complejidad: string;
}