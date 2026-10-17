import { AfterViewInit, Component, inject, OnInit, effect, viewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { faCircleQuestion, faEyeSlash, faPenToSquare, faSquareCheck, faSquarePlus, faBroom, faTrashCan, faUpload, faBoxArchive, faBinoculars } from '@fortawesome/free-solid-svg-icons';
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
import { CronometroServicio } from '../../../servicios/cronometro-servicio';
import { ThisReceiver } from '@angular/compiler';
import { Pipe } from '@angular/core';
import { TiempoFormatoPipe } from "../../../pipes/tiempo-formato-pipe";
import { min } from 'rxjs';
import { ModalConfirma } from '../../compartidos/modal-confirma/modal-confirma';
import { MatDialog } from '@angular/material/dialog';
import { ModalFormularioTareaServicio } from '../../../servicios/modal-formulario-tarea';
import { IEstado } from '../../../interfaces/iestado';
import { IconRevisionHistory } from 'ckeditor5';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { Iobservacion } from '../../../interfaces/iobservacion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModalHistorialServicio } from '../../../servicios/modal-historial-servicio';

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
    Popover, TiempoFormatoPipe,
  ReactiveFormsModule, DragDropModule, MatTooltipModule],
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
  private cronometroServicio = inject(CronometroServicio)
  private dialogConfirm = inject(MatDialog);
  private modalFormularioTareaServicio = inject(ModalFormularioTareaServicio)
  private fb = inject(FormBuilder)
  private modalHistorialServicio = inject(ModalHistorialServicio)
  
  id_usuario = this.datosTempServicio.id()
  minutosAcumulados: number = 0;  // Desde la BD
  idTareaActiva: number = 0;  // Desde la BD
  fechaHoraInicio: Date | null = null;  // Desde la BD
  horas: number = 0;
  minutos: number = 0;
  estados: IEstado[] = []
  url: string = ''
  filtrado: boolean = false
  //estadoActivoServicio = this.cronometroServicio.estadoActivo()

  faSquarePlus = faSquarePlus
  faPenToSquare = faPenToSquare
  faSquareCheck = faSquareCheck
  faEyeSlash = faEyeSlash
  faCircleQuestion = faCircleQuestion
  faBroom = faBroom
  faTrashCan = faTrashCan
  faUpload = faUpload
  faBoxArchive = faBoxArchive
  faCommentDots = faCommentDots
  faBinoculars = faBinoculars
  
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

  formularioTareas = this.fb.group({
    id: [0],
    id_estado: this.fb.control('1', { nonNullable: true }),
    tarea: [''],
    id_usuario : this.fb.control(this.datosTempServicio.id(), { nonNullable: true }),
  });


  displayedColumns: string[] = [
    'mover', 'expand', 'accion', 'Opciones', 'historial', 'nombre', 'f_pentrega', 'estado', 'complejidad', 'prioridad',  'asignado'
  ];
  
  dataSource: MatTableDataSource<ITarea> = new MatTableDataSource<ITarea>([]);

  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);

  getPrioridadColor(idPrioridad: number): string {
    switch (idPrioridad) {
      case 4: return '#ffd8dc';
      case 3: return '#ffecce';
      case 2: return '#c8e6c9';
      case 1: return '#f0f0f0';
      default: return 'transparent';
    }
  }

  getColorEstadoSelect(id_estado: number): string {
    switch (id_estado) {
      case 6:
      case 8:
      case 9:
      case 10:
      case 11:
        return '#ffd8dc';
      default:
        return 'transparent';
    }
  }

  // 2. Control del elemento expandido
  elementoExpandido: any | null = null;

  toggleFila(row: any) {
    this.elementoExpandido = this.elementoExpandido === row ? null : row;
  }
  constructor() {
      effect(() => {
      const listaServicio = this.datosTempTareas.datos();

      if (listaServicio && listaServicio.length > 0) {
        this.tareas = listaServicio;
        this.dataSource.data = [...this.tareas];
        
        // Volver a vincular el paginador si ya está disponible en el DOM
        const pag = typeof this.paginator === 'function' ? (this.paginator as Function)() : this.paginator;
        if (pag) {
          this.dataSource.paginator = pag;
        }

        this.extraerCatalogosFiltros(this.tareas);
        this.aplicarFiltrosCombinados(false);
      }
    });
  }

  ngOnInit(): void {
   
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
     this.consultarTareas(); 
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator();
    this.dataSource.sort = this.sort();
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

  consultarEstados() {

    let id = this.datosTempServicio.id()
    let datos = this.datosFormServicio.datos()
    let id_epica = datos.id
    this.peticionServicio.peticion(`/estados/consultar`, null, 'GET')
    .subscribe({
      next: (resp) => {
        if (resp.error) {
          this.modalMensajeServicio.abrirModal({
            "tipo": "error",
            "titulo": "Error:",
            "mensaje": resp.mensaje
          });
        } else {
          this.estados = resp.datos || [];
        }
      },
      complete: () => {
        this.modalCargandoServicio.abrirModal(false);
      }
    });
  }

  consultarTareas() {
    this.modalCargandoServicio.abrirModal(true);
    let id = this.datosTempServicio.id()
    let datos = this.datosFormServicio.datos()
    let id_epica = datos.id
    this.peticionServicio.peticion(`/tareas/consultar/${id}/${id_epica}`, null, 'GET')
    .subscribe({
      next: (resp) => {
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
          this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' });
        }
      },
      complete: () => {
        this.consultarEstados()
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
    this.aplicarFiltrosCombinados(false);
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

  estado( tarea: ITarea){
    this.modalCargandoServicio.abrirModal(true);
    this.peticionServicio.peticion('/tareas/estado', tarea, 'POST')
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
  aplicarFiltrosCombinados(filtrado: boolean = true): void {
    this.filtrado = filtrado
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

  editar(tarea: ITarea){
    //this.modalFormularioTareaServicio.abrirModal(tarea, true)
    this.router.navigate(['/crear-tarea'], {
      state: { datos: tarea, observa: false, datosObservacion: null }
    })
  }

  observaciones(tarea: ITarea){
    //this.modalFormularioTareaServicio.abrirModal(tarea, true)
    this.router.navigate(['/crear-tarea'], {
      state: { datos: tarea, observa: true, datosObservacion: null }
    })
  }

  editarObservaciones(tarea: ITarea, observacion: Iobservacion){
    //this.modalFormularioTareaServicio.abrirModal(tarea, true)
    this.router.navigate(['/crear-tarea'], {
      state: { datos: tarea, observa: true, datosObservacion: observacion }
    })
  }

  cambiarEstadoTarea(row: any, checked: boolean): void {
    this.cronometroServicio.restaurar()
    const tareaActiva = this.tareas.find((tarea: any) => 
      tarea.cronometro == 1 && tarea.usuario_asignado?.id === this.id_usuario
    ) ?? null;

     const tareaInactiva = this.tareas.find((tarea: any) => 
      tarea.cronometro == 0 && tarea.usuario_asignado?.id === this.id_usuario
    ) ?? null;

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
           
        } else {          
          row.cronometro = (checked ? 1 : 0)
          this.tareas.forEach(tarea => {
            if(row.id != tarea.id){
              tarea.cronometro = 0;
            }
            let horas = (this.cronometroServicio.horaActual() * 60)
            let minutos = (this.cronometroServicio.minutoActual())
                     
            if(tareaActiva != null){
              if(tarea.id == tareaActiva.id) {
                tarea.tiempo = (horas + minutos)
              }
            } 
          });         
          
          let horas = 0
          let minutos = 0
          let tiempo = 0
          let fecha = new Date()
          if (row.cronometro == 0){
            this.tareaCronometroServicio.setTarea('')
            this.datosTempServicio.setTareaActiva(0, fecha, 0)
            this.cronometroServicio.setActualizarDatos(0, 0, fecha)
          } else {
            let horas = (this.cronometroServicio.horaActual() * 60)
            let minutos = (this.cronometroServicio.minutoActual())
            let tiempo = (row.tiempo + horas + minutos)
            this.datosTempServicio.setTareaActiva(row.id, row.fec_ini, tiempo)
            this.tareaCronometroServicio.setTarea(row.detalle)
            this.cronometroServicio.setActualizarDatos(row.id, row.tiempo, fecha)
          }
          this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' });

        }
      },
      complete: () => {
        this.modalCargandoServicio.abrirModal(false);
      }
    });
  }

  abrirConfirmacion(tarea: ITarea): void {
    let mensaje = ""
    if(!tarea.activo){
      mensaje = '¿Deseas archivar la tarea.? Recuerda que al archivar no se elimina del sistema, solamente se marca como pendiente para desarrollar más adelante, sin hacerle seguimiento diario.'
    } else {
      mensaje = '¿Deseas Desarchivar la tarea.? Recuerda que al desarchivarla se marcará como activa y se podrá continuar tanto con su desarrollo como con su seguimiento diario.'
    }
    this.dialogConfirm.open(ModalConfirma, {
      width: '400px',
      data: {
        title: 'Confirmación',
        message: mensaje,
        confirmText: 'Sí',
        cancelText: 'No'
      }
    }).afterClosed().subscribe(resultado => {
      if (resultado) {
        this.estado(tarea)
      }
    });
  }
  eliminarObs(tarea: ITarea, observacion: Iobservacion){
    let mensaje = '¿Deseas eliminar la observación? Esta acción no se puede deshacer y el registro se eliminará del sistema.'
       
    this.dialogConfirm.open(ModalConfirma, {
      width: '400px',
      data: {
        title: 'Confirmación',
        message: mensaje,
        confirmText: 'Sí',
        cancelText: 'No'
      }
    }).afterClosed().subscribe(resultado => {
      if (resultado) {
        this.modalCargandoServicio.abrirModal(true);
        this.peticionServicio.peticion('/tareas/eliminar-observacion', observacion, 'POST')
        .subscribe({
          next: (resp) => {  
            if (resp.error) {
              this.modalMensajeServicio.abrirModal({
                "tipo": "error",
                "titulo": "Error:",
                "mensaje": resp.mensaje
              });
            } else {
             
              tarea.observaciones = tarea.observaciones.filter((obs: Iobservacion) => obs.id !== observacion.id);

              // Refrescamos la tabla para que Angular detecte el cambio en la vista:
              this.dataSource.data = [...this.dataSource.data];
              this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' });
            }
          },
          complete: () => {
            this.modalCargandoServicio.abrirModal(false);
          }
        });
      }
    });
  }
  eliminar(tarea: ITarea): void {
    let mensaje = '¿Deseas eliminar la tarea? Esta acción no se puede deshacer y el registro se eliminará del sistema. El proceso solo se completará si la tarea no tiene registros relacionados.'
       
    this.dialogConfirm.open(ModalConfirma, {
      width: '400px',
      data: {
        title: 'Confirmación',
        message: mensaje,
        confirmText: 'Sí',
        cancelText: 'No'
      }
    }).afterClosed().subscribe(resultado => {
      if (resultado) {
        this.modalCargandoServicio.abrirModal(true);
        this.peticionServicio.peticion('/tareas/eliminar', tarea, 'POST')
        .subscribe({
          next: (resp) => {  
            if (resp.error) {
              this.modalMensajeServicio.abrirModal({
                "tipo": "error",
                "titulo": "Error:",
                "mensaje": resp.mensaje
              });
            } else {
              this.dataSource.data = this.dataSource.data.filter((item: any) => item.id !== tarea.id);
             /*  this.dataSource.data = [...this.dataSource.data]; */
              this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' });
            }
          },
          complete: () => {
            this.modalCargandoServicio.abrirModal(false);
          }
        });
      }
    });
  }
  
  ngOnDestroy() {
    if (this.intervalo) clearInterval(this.intervalo);
  }

  actualizarEstado(tarea: any, event: Event){
  
    const selectElement = event.target as HTMLSelectElement;
    const valor = selectElement.value;
    if(valor == "6" || valor == "8" || valor == "9" || valor == "10" || valor == "11"){
      selectElement.value = tarea.id_estado;
      this.modalMensajeServicio.abrirModal(
        {
          "tipo": "error",
          "titulo": "Error:",
          "mensaje": "Esta acción no está disponible en la fase actual. La operación solo puede ser ejecutada por el Departamento correspondiente. "
        }
      )
      return
    }

    if(valor == "5" && tarea.calidad == "SI" && tarea.id_estado == "8"){
      selectElement.value = tarea.id_estado;
      this.modalMensajeServicio.abrirModal(
        {
          "tipo": "error",
          "titulo": "Error:",
          "mensaje": "Esta tarea necesita estar aprobada por CALIDAD antes de enviar al DESPLIEGUE. "
        }
      )
      return
    }

    if(valor != '4'){
      this.modalCargandoServicio.abrirModal(true)
      this.formularioTareas.controls['id_estado'].setValue(valor)
      this.formularioTareas.controls['id'].setValue(tarea.id)
      let url = '/tareas/estado-tarea'
      this.peticion(url)
    }

    if(valor == '4'){
      this.modalCargandoServicio.abrirModal(true)
      this.formularioTareas.controls['id_estado'].setValue(valor)
      this.formularioTareas.controls['id'].setValue(tarea.id)
      this.formularioTareas.controls['tarea'].setValue(tarea.nombre)
      let datos = this.formularioTareas.value
      this.modalCargandoServicio.abrirModal(true);

      const tareaConEpica = {
        ...datos,
        ruta_origen: "/crear-programa-epica",
      }

      this.router.navigate(['/crear-rechazo'], {
        state: { datos: tareaConEpica }
      });
    }    
  }

  peticion(url: string){
    let datos = this.formularioTareas.value
    this.peticionServicio.peticion(url, datos, 'POST')
    .subscribe({
      next: (resp) => {

        let mensajes = ""
        if (resp.error) {
          if (resp.errores) {
            mensajes = Object.values(resp.errores)
              .flat()
              .join('\n');
          } else {
            mensajes = resp.mensaje
          }
          
          this.modalMensajeServicio.abrirModal({
            "tipo": "error",
            "titulo": "Error:",
            "mensaje": mensajes
          })
        } else {       
          // 1. Identificamos cuál es el ID que estamos actualizando
          const idTarea = this.formularioTareas.value.id; // o como lo tengas identificado
          // 2. Buscamos la tarea original actual en tu lista local
          const tareaOriginal = this.dataSource.data.find((item: any) => item.id === idTarea);
          // 3. Fusionamos: mantenemos la tarea original y le actualizamos solo el id_estado del formulario
          const tareaActualizada = {
            ...tareaOriginal,
            ...this.formularioTareas.value // aquí viene el nuevo id_estado
          };

          // 4. Actualizamos el arreglo localmente para refrescar la tabla sin recargar
          const nuevaLista = this.dataSource.data.map((item: any) => {
            if (item.id === idTarea) {
              return tareaActualizada;
            }
            return item;
          });

          this.dataSource.data = nuevaLista;
          this.tareas = nuevaLista;

          this.modalCargandoServicio.abrirModal(false)
          this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' })
        }
      },
      error: (error)=>{
        this.modalMensajeServicio.abrirModal({
          "tipo": "error",
          "titulo": "Error:",
          "mensaje": error.error?.message ?? error.error?.mensaje ?? error.message ?? 'Se presentó un error en el servidor.'
        })
        this.modalCargandoServicio.abrirModal(false)
      },
      complete: ()=>{
          this.modalCargandoServicio.abrirModal(false)
      }
    }) 
  }

  drop(event: CdkDragDrop<any[]>): void {
   
    if (event.previousIndex === event.currentIndex) {
      return;
    }
     this.modalCargandoServicio.abrirModal(true)
    const pag = typeof this.paginator === 'function' 
      ? (this.paginator as Function)() 
      : this.paginator;

    const pageIndex = pag?.pageIndex ?? 0;
    const pageSize = pag?.pageSize ?? 5;

    const globalPreviousIndex = event.previousIndex + (pageIndex * pageSize);
    const globalCurrentIndex = event.currentIndex + (pageIndex * pageSize);

    const nuevaLista = [...this.dataSource.data];
    moveItemInArray(nuevaLista, globalPreviousIndex, globalCurrentIndex);

    this.dataSource.data = nuevaLista;
    if (pag) {
      this.dataSource.paginator = pag;
    }

    // Preparamos la lista con id y su nuevo orden
    const tareasOrdenadas = nuevaLista.map((tarea, index) => ({
      id: tarea.id,
      orden: index + 1
    }));

    // Enviamos como objeto { tareas: [...] }
    this.peticionServicio.peticion('/tareas/reordenar-tareas', { tareas: tareasOrdenadas }, 'POST').subscribe({
      next: (resp)=>{
         this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' })
      },
      error: (error)=>{
        this.modalMensajeServicio.abrirModal({
          "tipo": "error",
          "titulo": "Error:",
          "mensaje": error.error?.message ?? error.error?.mensaje ?? error.message ?? 'Se presentó un error al cambiar el orden.'
        })
        this.modalCargandoServicio.abrirModal(false)
      },
      complete: ()=>{
        this.modalCargandoServicio.abrirModal(false)
      }
    });
  }

  modalHistorial(tarea: ITarea){    
    const tareaConEpica = {
    ...tarea,
    ruta_origen: "/crear-programa-epica",
    tarea: tarea.nombre
  };

  this.modalHistorialServicio.abrirModal(tareaConEpica)
  }
 
}
