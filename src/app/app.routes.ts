import { Routes } from '@angular/router';
import { App } from './app';
import { authGuard } from './guards/auth-guard';
import { Contenedor } from './components/compartidos/contenedor/contenedor';
import { CambiarContrasena } from './components/usuarios/cambiar-contrasena/cambiar-contrasena';
import { DatosPersonales } from './components/usuarios/datos-personales/datos-personales';
import { ListarProyectos } from './components/proyectos/listar-proyectos/listar-proyectos';
import { CrearProyectos } from './components/proyectos/crear-proyectos/crear-proyectos';
import { CrearEpica } from './components/epicas/crear-epica/crear-epica';
import { CrearGrupoTrabajo } from './components/grupos-trabajo/crear-grupo-trabajo/crear-grupo-trabajo';
import { ListarGruposTrabajo } from './components/grupos-trabajo/listar-grupos-trabajo/listar-grupos-trabajo';
import { ProgramarEpica } from './components/epicas/programar-epica/programar-epica';
import { ContieneCrearProgramaEpica } from './components/epicas/contiene-crear-programa-epica/contiene-crear-programa-epica';
import { Ingreso } from './components/ingreso/ingreso';
import { ListarUsuarios } from './components/usuarios/listar-usuarios/listar-usuarios';
import { CrearUsuario } from './components/usuarios/crear-usuario/crear-usuario';
import { ListarEpicas } from './components/epicas/listar-epicas/listar-epicas';
import { Inicio } from './components/inicio/inicio';

export const routes: Routes = [
    {
        path: '',
        component: Inicio
    },
    {
        path: 'ingresar',
        component: Ingreso
    },
    {
        path: 'contenedor',
        component: Contenedor,
        canActivate: [authGuard]
    },
    {
        path: 'usuarios',
        component: ListarUsuarios,
        canActivate: [authGuard]
    },
    {
        path:'crear-usuario',
        component: CrearUsuario,
        canActivate: [authGuard]
    },
    {
        path:'editar-credenciales',
        component: CambiarContrasena,
        canActivate: [authGuard]
    },
    {
        path:'datos-personales',
        component: DatosPersonales,
        canActivate: [authGuard]
    },
    {
        path:'proyectos',
        component: ListarProyectos,
        canActivate: [authGuard]
    },
    {
        path:'crear-proyecto',
        component: CrearProyectos,
        canActivate: [authGuard]
    },
    {
        path:'grupos',
        component: ListarGruposTrabajo,
        canActivate: [authGuard]
    },
    {
        path:'crear-grupo',
        component: CrearGrupoTrabajo,
        canActivate: [authGuard]
    },
    {
        path:'epicas',
        component: ListarEpicas,
        canActivate: [authGuard]
    },
    {
        path:'crear-epica',
        component: CrearEpica,
        canActivate: [authGuard]
    },
    {
        path:'programar',
        component: ProgramarEpica,
        canActivate: [authGuard]
    },
    {
        path:'crear-programa-epica',
        component: ContieneCrearProgramaEpica,
        canActivate: [authGuard]
    },
    
];
