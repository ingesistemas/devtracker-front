import { IEmpresa } from "./iempresa";
import { IJefe } from "./ijefe";
import { IRol } from "./irol";
import { IUsuario } from "./iusuario";

export interface IGruposTrabajo {
    id: number;
    grupo: string,
    detalle: string,
    jefe: IJefe,
    activo: boolean;
    usuario: IUsuario | null
}
