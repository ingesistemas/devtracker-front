import { IEmpresa } from "./iempresa";
import { IRol } from "./irol";

export interface IUsuario {
    id: string;
    email: string;
    activo: boolean;
    empresa: IEmpresa | null;
    rol: IRol | null;
}
