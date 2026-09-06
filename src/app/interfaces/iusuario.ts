import { IEmpresa } from "./iempresa";
import { IEpica } from "./iepica";
import { IGruposTrabajo } from "./igrupos-trabajo";
import { IRol } from "./irol";
import { ITarea } from "./itarea";

export interface IUsuario {
    id: string
    email: string
    nombre: string
    activo: boolean
    empresa: IEmpresa | null
    rol: IRol | null
    grupo_trabajo: IGruposTrabajo | null
    epicaActiva: IEpica
    tareaActiva: ITarea
}
