import { Routes } from '@angular/router';
import { App } from './app';
import { Income } from './components/income/income';
import { Home } from './components/home/home';
import { authGuard } from './guards/auth-guard';
import { Contenedor } from './components/shared/contenedor/contenedor';
import { ListUsers } from './components/users/list-users/list-users';
import { CreateUser } from './components/users/create-user/create-user';
import { CambiarContrasena } from './components/users/cambiar-contrasena/cambiar-contrasena';
import { DatosPersonales } from './components/users/datos-personales/datos-personales';
import { ListarProyectos } from './components/proyectos/listar-proyectos/listar-proyectos';
import { CrearProyectos } from './components/proyectos/crear-proyectos/crear-proyectos';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'ingresar',
        component: Income
    },
    {
        path: 'contenedor',
        component: Contenedor,
        canActivate: [authGuard]
    },
    {
        path: 'usuarios',
        component: ListUsers,
        canActivate: [authGuard]
    },
    {
        path:'crear-usuario',
        component: CreateUser,
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
    }
];
