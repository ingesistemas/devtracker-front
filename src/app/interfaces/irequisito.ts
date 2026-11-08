import { IEmpresa } from "./iempresa";
import { IRol } from "./irol";
import { IUsuario } from "./iusuario";

export interface IRequisito {
    id: number;
    requisito: string;
    id_apica: number;
    calidad: boolean;
    desarrollo: boolean;
    requisito_tareas:string[]
}
