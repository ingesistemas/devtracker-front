import { Timestamp } from "rxjs";
import { IEmpresa } from "./iempresa";
import { IProyecto } from "./iproyecto";
import { IUsuario } from "./iusuario";
import { IEstado } from "./iestado";
import { ITarea } from "./itarea";

export interface IEpica {
  id: number;
  nombre: string;
  detalle: string;
  f_pentrega: string;
  fec_ini: string;
  fec_fin: string;
  f_rentrega: string;
  id_proyecto: number;
  id_estado: number;
  id_usu_creo: number;
  id_usu_asig: number;
  proyecto: IProyecto;
  estado: IEstado;
  usuario_creo: IUsuario;
  usuario_asignado: IUsuario;
  tareas: ITarea;
  created_at: Date;
  activo: boolean;
  id_prioridad: number;
  nom_prioridad: string;
  ruta_pdf?: string | null;   // Valor tal cual viene de la columna en BD (ej: "epicas_pdfs/abc123.pdf")
  url_pdf?: string | null;
  archivo_video: string | null;
}