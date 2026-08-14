import { IEmpresa } from "./iempresa";
import { IRol } from "./irol";
import { IUsuario } from "./iusuario";

export interface IProyecto {
    id: number;
    proyecto: string;
    activo: boolean;
    usuario: IUsuario | null
}
