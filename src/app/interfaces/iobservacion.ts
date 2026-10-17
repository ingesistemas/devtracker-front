import { IUsuario } from "./iusuario";

export interface Iobservacion {
    id: number;
    id_tarea: number;
    observacion: string;
    creador: IUsuario
}
