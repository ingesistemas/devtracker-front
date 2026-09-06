import { AfterViewInit, Component, inject, OnInit, ViewChild, effect } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PeticionServicio } from '../../../servicios/peticion-servicio';
import { ModalCargandoServicio } from '../../../servicios/modal-cargando-servicio';
import { ModalMensajeServicio } from '../../../servicios/modal-mensaje-servicio';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { faCircleQuestion, faEyeSlash, faPenToSquare, faSquareCheck, faSquarePlus, faBroom } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay';
import { IUsuario } from '../../../interfaces/iusuario';
import { Popover } from "../../compartidos/popover/popover";
import { IEpica } from '../../../interfaces/iepica';
import { DatosServicio } from '../../../servicios/datos-servicio';
import { DatosFormServicio } from '../../../servicios/datos-form-servicio';
import { ITarea } from '../../../interfaces/itarea';
import { DatosTareasServicio } from '../../../servicios/datos-tareas-servicio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TareaCronometroServicio } from '../../../servicios/tarea-cronometro-servicio';
import { $locationShim } from '@angular/common/upgrade';


@Component({
  selector: 'app-listar-tareas',
  imports: [MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    FormsModule, 
    MatTableModule, 
    MatSortModule, 
    MatPaginatorModule, 
    MatBottomSheetModule, 
    MatButtonModule, 
    FontAwesomeModule, 
    MatMenuModule, 
    MatIconModule, 
    CommonModule, 
    OverlayModule,
    MatSlideToggleModule,
    Popover],
  templateUrl: './listar-tareas.html',
  styleUrl: './listar-tareas.css',
})
export class ListarTareas {
  private peticionServicio = inject(PeticionServicio);
  private modalCargandoServicio = inject(ModalCargandoServicio);
  private modalMensajeServicio = inject(ModalMensajeServicio);
  private toastrServicio = inject(ToastrService);
  private router = inject(Router);
  private datosTempServicio = inject(DatosServicio)
  private datosFormServicio = inject(DatosFormServicio)
  private datosTempTareas = inject(DatosTareasServicio)
  private tareaCronometroServicio = inject(TareaCronometroServicio)
  id_usuario = this.datosTempServicio.id()
  minutosAcumulados: number = 0;  // Desde la BD
  fechaHoraInicio: Date | null = null;  // Desde la BD
  horas: number = 0;
  minutos: number = 0;

  faSquarePlus = faSquarePlus;
  faPenToSquare = faPenToSquare;
  faSquareCheck = faSquareCheck;
  faEyeSlash = faEyeSlash;
  faCircleQuestion = faCircleQuestion;
  faBroom = faBroom;

  tareas: any[] = [];

  listaEstados: any[] = [];
  listaUsuarios: IUsuario[] = [];
  listaPrioridades: any[] = [];
  listaComplejidades: any[] = [];
  /* listaPrioridades = [
    { id: 1, nombre: 'Crítica' },
    { id: 2, nombre: 'Alta' },
    { id: 3, nombre: 'Media' },
    { id: 4, nombre: 'Baja' }
  ];  */

  // Modelos de filtros vinculados
  filtroTexto: string = '';
  filtroProyecto: (number | string)[] = [];
  filtroPrioridad: (number | string)[] = [];
  filtroComplejidad: (number | string)[] = [];
  filtroEstado: (number | string)[] = [];
  filtroUsuario: (number | string)[] = [];
  private intervalo: any;

  displayedColumns: string[] = [
    'accion', 'Opciones', 'detalle', 'estado', 'complejidad', 'prioridad',  'asignado'
  ];
  
  dataSource: MatTableDataSource<ITarea> = new MatTableDataSource<ITarea>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  getPrioridadColor(idPrioridad: number): string {
    switch (idPrioridad) {
      case 4: return '#ffd8dc';
      case 3: return '#ffecce';
      case 2: return '#c8e6c9';
      case 1: return '#f0f0f0';
      default: return 'transparent';
    }
  }
  constructor() {
    // 🚀 EFECTO REACTIVO: Se ejecuta automáticamente CADA VEZ que cambia la Signal en el servicio
    effect(() => {
      const listaServicio = this.datosTempTareas.datos();

      if (listaServicio && listaServicio.length > 0) {
        this.tareas = listaServicio;
        // Asignamos una nueva referencia para que MatTableDataSource detecte el cambio de inmediato
        this.dataSource.data = [...this.tareas];
        this.extraerCatalogosFiltros(this.tareas);
        this.aplicarFiltrosCombinados();
      }
    });
  }

  ngOnInit(): void {
    this.intervalo = setInterval(() => this.actualizarTiempo(), 60000);
    // Configuraciones de ordenamiento y filtrado de MatTable
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'asignado':
          const asignado = typeof item.usuario_asignado === 'object' 
            ? item.usuario_asignado?.nombre 
            : item.usuario_asignado;
          return asignado ? asignado.toLowerCase() : '';

        case 'estado':
          const estado = typeof item.estado === 'object' ? item.estado?.estado : item.estado;
          return estado ? estado.toLowerCase() : '';

        case 'detalle':
          return item.detalle ? item.detalle.toLowerCase() : '';

        case 'complejidad':
          return item.nom_complejidad ? item.nom_complejidad.toLowerCase() : '';

        case 'prioridad':
          return item.nom_prioridad ? item.nom_prioridad.toLowerCase() : '';

        default:
          return item[property];
      } 
    };

    this.dataSource.filterPredicate = this.crearPredicadoFiltro();

    // Solo realiza la petición HTTP si el servicio está completamente vacío (null)
    if (!this.datosTempTareas.tieneDatos()) {
      this.consultarTareas();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Predicado personalizado para filtrado multidimensional
  private crearPredicadoFiltro() {
    return (data: ITarea, filterStr: string): boolean => {
      if (!filterStr) return true;

      let filtros: any = {};
      try {
        filtros = JSON.parse(filterStr);
      } catch {
        return true;
      }

      // 1. Filtro por texto general
      const term = (filtros.texto || '').toLowerCase().trim();
      let coincideTexto = true;

      if (term) {
        //const nomProyecto = typeof data.proyecto === 'object' ? data.proyecto?.proyecto : data.proyecto;
        const nomEstado = typeof data.estado === 'object' ? data.estado?.estado : data.estado;
        const nomCreo = typeof data.usuario_creo === 'object' ? data.usuario_creo?.nombre : data.usuario_creo;
        const asignado = data.usuario_asignado?.nombre ?? data.usuario_asignado;

        const campos = [
          data.detalle,
          data.nom_complejidad,
          nomEstado,
          data.nom_prioridad,
          nomCreo,
          asignado,
        ];

        coincideTexto = campos.some(val => val != null && String(val).toLowerCase().includes(term));
      }

      // Obtención segura de IDs (compatibilidad objeto vs id directo)
      //const idProyReg = data.id_proyecto ?? (typeof data.proyecto === 'object' ? (data.proyecto as any)?.id : null);
      const idPrioReg = data.id_prioridad;
      const idComReg = data.id_complejidad;
      const idEstReg = data.id_estado ?? (typeof data.estado === 'object' ? (data.estado as any)?.id : null);
      const idUsuReg = data.id_reasig ?? (typeof data.usuario_asignado === 'object' ? (data.usuario_asignado as any)?.id : null);

      // 2. Coincidencia de listas de selección (si la lista está vacía representa "Todos")
     
       const coincideComplejidad = !filtros.complejidades?.length || 
        filtros.complejidades.some((id: any) => String(id) === String(idComReg));

      const coincidePrioridad = !filtros.prioridades?.length || 
        filtros.prioridades.some((id: any) => String(id) === String(idPrioReg));

      const coincideEstado = !filtros.estados?.length || 
        filtros.estados.some((id: any) => String(id) === String(idEstReg));

      const coincideUsuario = !filtros.usuarios?.length || 
        filtros.usuarios.some((id: any) => String(id) === String(idUsuReg));

      return coincideTexto && coincideComplejidad && coincidePrioridad && coincideEstado && coincideUsuario;
    };
  }

  consultarTareas() {

    this.modalCargandoServicio.abrirModal(true);
    let id = this.datosTempServicio.id()
    let datos = this.datosFormServicio.datos()
    let id_epica = datos.id
    this.peticionServicio.peticion(`/tareas/consultar/${id}/${id_epica}`, null, 'GET')
    .subscribe({
      next: (resp) => {
        console.log(resp)
        if (resp.error) {
          this.modalMensajeServicio.abrirModal({
            "tipo": "error",
            "titulo": "Error:",
            "mensaje": resp.mensaje
          });
        } else {
          this.tareas = resp.datos || [];
          this.dataSource.data = [...this.tareas];
          this.datosTempTareas.setDatosForm(this.tareas)
          this.extraerCatalogosFiltros(this.tareas);
          this.aplicarFiltrosCombinados();

          // 1. Buscamos directamente el objeto tarea que tenga cronometro en 1
          const id_usuario = this.datosTempServicio.id()
          const tareaActiva = this.tareas.find((tarea: any) => 
            tarea.cronometro == 1 && tarea.usuario_asignado?.id === id_usuario
          );

          this.tareas.forEach(tarea => {
            if(tarea.cronometro == 1 && tarea.id_reasig == id_usuario){
              this.minutosAcumulados = tarea.tiempo; 
              this.fechaHoraInicio = new Date(tarea.fec_ini); 
            }
          });
          
          this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' });
        }
      },
      complete: () => {
        this.modalCargandoServicio.abrirModal(false);
      }
    });
  }

  extraerCatalogosFiltros(data: ITarea[]) {
    const estadosMap = new Map();
    const usuariosMap = new Map();
    const prioridadesMap = new Map();
    const complejidadesMap = new Map();
    //const proyectosMap = new Map();

    data.forEach(item => {
      const idEstado = item.id_estado ?? (typeof item.estado === 'object' ? (item.estado as any)?.id : null);
      if (idEstado != null && !estadosMap.has(idEstado)) {
        const nom = typeof item.estado === 'object' ? (item.estado as any)?.estado : item.estado;
        estadosMap.set(idEstado, { id: idEstado, estado: nom || `Estado ${idEstado}` });
      }

      const idUsuario = item.id_reasig?? (typeof item.usuario_asignado === 'object' ? (item.usuario_asignado as any)?.id : null);
      if (idUsuario != null && !usuariosMap.has(idUsuario)) {
        const nom = typeof item.usuario_asignado === 'object' ? (item.usuario_asignado as any)?.nombre : item.usuario_asignado;
        usuariosMap.set(idUsuario, { id: idUsuario, nombre: nom || `Usuario ${idUsuario}` });
      }

      // Extracción de Prioridades (Solo pertenecientes a los registros de la consulta)
      const idPrioridad = item.id_prioridad;
      if (idPrioridad != null && !prioridadesMap.has(idPrioridad)) {
        // Usa el nombre que viene en la data (nom_prioridad) o un fallback
        const nom = item.nom_prioridad || (typeof item.nom_prioridad === 'object' ? (item.nom_prioridad as any)?.prioridad : null);
        prioridadesMap.set(idPrioridad, { 
          id: idPrioridad, 
          nombre: nom || `Prioridad ${idPrioridad}` 
        });
      }

      // Extracción de Complejidades (Solo pertenecientes a los registros de la consulta)
      const idComplejidad = item.id_complejidad;
      if (idComplejidad != null && !complejidadesMap.has(idComplejidad)) {
        // Usa el nombre que viene en la data (nom_complejidad) o un fallback
        const nom = item.nom_complejidad || (typeof item.nom_complejidad === 'object' ? (item.nom_complejidad as any)?.prioridad : null);
        complejidadesMap.set(idComplejidad, { 
          id: idComplejidad, 
          nombre: nom || `Complejidad ${idComplejidad}` 
        });
      }

      /* const idProyecto = item.id_proyecto ?? (typeof item.proyecto === 'object' ? (item.proyecto as any)?.id : null);
      if (idProyecto != null && !proyectosMap.has(idProyecto)) {
        const nom = typeof item.proyecto === 'object' ? (item.proyecto as any)?.proyecto : item.proyecto;
        proyectosMap.set(idProyecto, { id: idProyecto, proyecto: nom || `Proyecto ${idProyecto}` });
      } */
    });

    this.listaEstados = Array.from(estadosMap.values());
    this.listaUsuarios = Array.from(usuariosMap.values());
    this.listaPrioridades = Array.from(prioridadesMap.values());
    this.listaComplejidades = Array.from(complejidadesMap.values());
    //this.listaProyectos = Array.from(proyectosMap.values());
  }

  

  applyFilter(event: Event) {
    this.filtroTexto = (event.target as HTMLInputElement).value;
    this.aplicarFiltrosCombinados();
  }

  limpiarFiltros() {
    this.filtroTexto = '';
    this.filtroComplejidad = [];
    this.filtroPrioridad = [];
    this.filtroEstado = [];
    this.filtroUsuario = [];
    this.aplicarFiltrosCombinados();
  }

  // Popover Overlay
  isOpen = false;
  activeTrigger!: CdkOverlayOrigin;
  selectedUser: IUsuario | null = null;  

  openOverlay(trigger: CdkOverlayOrigin, user: any) {
    if (this.isOpen && this.selectedUser === user) {
      this.closeOverlay();
      return;
    }
    this.activeTrigger = trigger;
    this.selectedUser = user;
    this.isOpen = true;
  }

  closeOverlay() {
    this.isOpen = false;
    this.selectedUser = null;
  }

  estado(tarea: ITarea){
    this.modalCargandoServicio.abrirModal(true);
    this.peticionServicio.peticion('/epicas/estado', tarea, 'POST')
    .subscribe({
      next: (resp) => {  
        if (resp.error) {
          this.modalMensajeServicio.abrirModal({
            "tipo": "error",
            "titulo": "Error:",
            "mensaje": resp.mensaje
          });
        } else {
          tarea.activo = !tarea.activo;
          this.dataSource.data = [...this.dataSource.data];
          this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' });
        }
      },
      complete: () => {
        this.modalCargandoServicio.abrirModal(false);
      }
    });
  }
  toggleTodasComplejidades(event: any, select: any): void {
    if (event.isUserInput) {
      if (event.source.selected) {
        select.options.forEach((item: any) => item.select());
      } else {
        select.options.forEach((item: any) => item.deselect());
      }
      this.aplicarFiltrosCombinados();
    }
  }

  toggleTodosPrioridades(event: any, select: any): void {
    if (event.isUserInput) {
      if (event.source.selected) {
        select.options.forEach((item: any) => item.select());
      } else {
        select.options.forEach((item: any) => item.deselect());
      }
      this.aplicarFiltrosCombinados();
    }
  }

  toggleTodosEstados(event: any, select: any): void {
    if (event.isUserInput) {
      if (event.source.selected) {
        select.options.forEach((item: any) => item.select());
      } else {
        select.options.forEach((item: any) => item.deselect());
      }
      this.aplicarFiltrosCombinados();
    }
  }

  toggleTodosUsuarios(event: any, select: any): void {
    if (event.isUserInput) {
      if (event.source.selected) {
        select.options.forEach((item: any) => item.select());
      } else {
        select.options.forEach((item: any) => item.deselect());
      }
      this.aplicarFiltrosCombinados();
    }
  }

  // Filtro ajustado para ignorar la opción con valor 0
  aplicarFiltrosCombinados(): void {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const proyComp = (this.filtroComplejidad || []).filter(v => v !== 0);
      const prioSel = (this.filtroPrioridad || []).filter(v => v !== 0);
      const estSel = (this.filtroEstado || []).filter(v => v !== 0);
      const usuSel = (this.filtroUsuario || []).filter(v => v !== 0);

      const cumpleComplejidad = proyComp.length === 0 || proyComp.includes(data.id_complejidad);
      const cumplePrioridad = prioSel.length === 0 || prioSel.includes(data.id_prioridad);
      const cumpleEstado = estSel.length === 0 || estSel.includes(data.id_estado);
      const cumpleUsuario = usuSel.length === 0 || usuSel.includes(data.usuario_asignado.id);

      const busqueda = (this.filtroTexto || '').toLowerCase().trim();
      const cumpleTexto = !busqueda || 
      (data.usuario_asignado?.nombre && data.usuario_asignado.nombre.toLowerCase().includes(busqueda)) ||
      //(data.proyecto?.proyecto && data.proyecto.proyecto.toLowerCase().includes(busqueda)) ||
      (data.nom_prioridad && data.nom_prioridad.toLowerCase().includes(busqueda)) ||
      (data.nom_complejidad && data.nom_complejidad.toLowerCase().includes(busqueda)) ||
      (data.estado?.estado && data.estado.estado.toLowerCase().includes(busqueda));

      return cumpleComplejidad && cumplePrioridad && cumpleEstado && cumpleUsuario && cumpleTexto;
    };

    this.dataSource.filter = Math.random().toString();
  }

  cambiarEstadoTarea(row: any, checked: boolean): void {
    row.cronometro = (checked ? 1 : 0)
    this.modalCargandoServicio.abrirModal(true);
    this.peticionServicio.peticion('/tareas/cronometro', row, 'POST')
    .subscribe({
      next: (resp) => {  
        if (resp.error) {
          this.modalMensajeServicio.abrirModal({
            "tipo": "error",
            "titulo": "Error:",
            "mensaje": resp.mensaje
          });
          row.cronometro = (checked ? 0 : 1)
        } else {
          this.tareas.forEach(tarea => {
            if(row.id != tarea.id){
              tarea.cronometro = 0;
            }
          });
          //this.dataSource.data = [...this.tareas];
          //this.dataSource.data = [...this.dataSource.data];
          let actividad = (row.epica.nombre).toUpperCase() + '-' + row.detalle
          if(row.cronometro == 1){
            this.tareaCronometroServicio.setTarea(actividad)
          }else{
            this.tareaCronometroServicio.setTarea('')
          }
          this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' });
        }
      },
      complete: () => {
        this.modalCargandoServicio.abrirModal(false);
      }
    });
  }

  actualizarTiempo() {
    let tareaActiva = this.tareaCronometroServicio.tarea()
    if (tareaActiva == 'No tienes ninguna tarea activa') return;

      const ahora = new Date();
      const transcurridoMs = ahora.getTime() - this.fechaHoraInicio!.getTime();
      const transcurridoMin = Math.floor(transcurridoMs / 60000); // miliseg → minutos

      const totalMinutos = this.minutosAcumulados + transcurridoMin;
      this.horas = Math.floor(totalMinutos / 60);
      this.minutos = totalMinutos % 60;
      this.tareaCronometroServicio.setTiempo(this.horas, this.minutos)
    }

  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }
}
