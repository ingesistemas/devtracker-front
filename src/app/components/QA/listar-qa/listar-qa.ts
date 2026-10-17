import { AfterViewInit, Component, effect, inject, OnInit, ViewChild } from '@angular/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { FormBuilder, FormsModule } from '@angular/forms'
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'
import { MatSort, MatSortModule } from '@angular/material/sort'
import { MatTableDataSource, MatTableModule } from '@angular/material/table'
import { PeticionServicio } from '../../../servicios/peticion-servicio'
import { ModalCargandoServicio } from '../../../servicios/modal-cargando-servicio'
import { ModalMensajeServicio } from '../../../servicios/modal-mensaje-servicio'
import { ToastrService } from 'ngx-toastr'
import { Router } from '@angular/router'
import { MatBottomSheetModule } from '@angular/material/bottom-sheet'
import { MatButtonModule } from '@angular/material/button'
import { faCircleQuestion, faEyeSlash, faPenToSquare, faSquareCheck, faSquarePlus, faBroom, faTrashCan, faCircleCheck, faCircleXmark, faThumbsUp, faThumbsDown, faBinoculars, faBook } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { CommonModule } from '@angular/common'
import { CdkOverlayOrigin, OverlayModule } from '@angular/cdk/overlay'
import { IUsuario } from '../../../interfaces/iusuario'
import { Popover } from "../../compartidos/popover/popover"
import { IEpica } from '../../../interfaces/iepica'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { MatDialog } from '@angular/material/dialog';
import { ModalConfirma } from '../../compartidos/modal-confirma/modal-confirma';
import { ITarea } from '../../../interfaces/itarea';
import { DatosTareasServicio } from '../../../servicios/datos-tareas-servicio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ModalHistorialServicio } from '../../../servicios/modal-historial-servicio';
import { DatosServicio } from '../../../servicios/datos-servicio';

@Component({
  selector: 'app-list-epics',
  standalone: true,
  imports: [
    MatFormFieldModule, 
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
    Popover,
    DragDropModule,
    MatTooltipModule,
    
  ],
  templateUrl: './listar-qa.html',
  styleUrl: './listar-qa.css',
})
export class ListarQa implements OnInit, AfterViewInit {
  private peticionServicio = inject(PeticionServicio)
  private modalCargandoServicio = inject(ModalCargandoServicio)
  private modalMensajeServicio = inject(ModalMensajeServicio)
  private toastrServicio = inject(ToastrService)
  private router = inject(Router)
  private dialogConfirm = inject(MatDialog);
  private fb = inject(FormBuilder)
  private tareaServicio = inject(DatosTareasServicio)
  titulo: string = this.tareaServicio.nombreEstadoConsulta()
  private modalHistorialServicio = inject(ModalHistorialServicio)
    private datosTempServicio = inject(DatosServicio);


  elementoExpandido: any | null = null

  toggleFila(row: any) {
    this.elementoExpandido = this.elementoExpandido === row ? null : row
  }

  faSquarePlus = faSquarePlus
  faPenToSquare = faPenToSquare
  faSquareCheck = faSquareCheck
  faEyeSlash = faEyeSlash
  faCircleQuestion = faCircleQuestion
  faBroom = faBroom
  faTrashCan = faTrashCan
  faCircleCheck = faCircleCheck
  faCircleXmark = faCircleXmark
  faThumbsUp = faThumbsUp
  faThumbsDown = faThumbsDown
  faBinoculars = faBinoculars
  faBook = faBook

  epicas: IEpica[] = []
  tarea!: ITarea

  listaEstados: any[] = []
  listaUsuarios: IUsuario[] = []
  listaProyectos: any[] = []
  listaPrioridades: any[] = []
  /* listaPrioridades = [
    { id: 1, nombre: 'Crítica' },
    { id: 2, nombre: 'Alta' },
    { id: 3, nombre: 'Media' },
    { id: 4, nombre: 'Baja' }
  ]; */

  // Modelos de filtros vinculados
  filtroTexto: string = '';
  filtroProyecto: (number | string)[] = [];
  filtroPrioridad: (number | string)[] = [];
  filtroEstado: (number | string)[] = [];
  filtroUsuario: (number | string)[] = [];

  displayedColumns: string[] = [
    'expand', 'fecha', 'nombre', 'proyecto', 'nom_prioridad', 
    'fpentrega', 'frentrega', 'estado', 'creadoPor', 'asignado', 'Opciones'
  ];

  formularioTareas = this.fb.group({
    id: [0],
    id_estado: this.fb.control(0, { nonNullable: true }),
    tarea: [''],
    id_usuario: [this.datosTempServicio.id()],
  });
  
  dataSource: MatTableDataSource<IEpica> = new MatTableDataSource<IEpica>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // El effect se ejecuta automáticamente al iniciar y cada vez que el Signal cambie
    effect(() => {
      const idEstado = this.tareaServicio.idEstadoConsulta() 
      this.titulo = this.tareaServicio.nombreEstadoConsulta()
      this.dataSource.data = []
      this.consultarEpicas();
    });
  }

  getPrioridadColor(idPrioridad: number): string {
    switch (idPrioridad) {
      case 4: return '#ffd8dc';
      case 3: return '#ffecce';
      case 2: return '#c8e6c9';
      case 1: return '#f0f0f0';
      default: return 'transparent';
    }
  }

  getPrioridadColorBage(idPrioridad: number): string {
    switch (idPrioridad) {
      case 4: return '#f2d3d5';
      case 3: return '#f0f19a';
      case 2: return '#b6ffb9';
      case 1: return '#dcdcdc';
      default: return 'transparent';
    }
  }

  getPrioridadTextColor(idPrioridad: number): string {
    switch (idPrioridad) {
      case 4: return '#730202'; // Texto para fondo Crítica (#ffd8dc)
      case 3: return '#040404'; // Texto para fondo Alta (#ffecce)
      case 2: return '#005706'; // Texto para fondo Media (#c8e6c9)
      case 1: return '#002356'; // Texto para fondo Baja (#f0f0f0)
      default: return '#002356';
    }
  }

  ngOnInit(): void {
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'asignado':
          // Extrae el nombre si usuario_asignado es objeto, o usa el valor directo
          const asignado = typeof item.usuario_asignado === 'object' 
            ? item.usuario_asignado?.nombre 
            : item.usuario_asignado;
          return asignado ? asignado.toLowerCase() : '';
        
        case 'creadoPor':
          // Extrae el nombre si usuario_creo es objeto, o usa el valor directo
          const creadoPor = typeof item.usuario_creo === 'object' 
            ? item.usuario_creo?.nombre 
            : item.usuario_creo;
          return creadoPor ? creadoPor.toLowerCase() : '';

        case 'estado':
          const estado = typeof item.estado === 'object' ? item.estado?.estado : item.estado;
          return estado ? estado.toLowerCase() : '';

        case 'proyecto':
          const proyecto = typeof item.proyecto === 'object' ? item.proyecto?.proyecto : item.proyecto;
          return proyecto ? proyecto.toLowerCase() : '';
        
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
    this.consultarEpicas();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Predicado personalizado para filtrado multidimensional
  private crearPredicadoFiltro() {
    return (data: IEpica, filterStr: string): boolean => {
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
        const nomProyecto = typeof data.proyecto === 'object' ? data.proyecto?.proyecto : data.proyecto;
        const nomEstado = typeof data.estado === 'object' ? data.estado?.estado : data.estado;
        const nomCreo = typeof data.usuario_creo === 'object' ? data.usuario_creo?.nombre : data.usuario_creo;
        const nomAsig = typeof data.usuario_asignado === 'object' ? data.usuario_asignado?.nombre : data.usuario_asignado;

        const campos = [
          data.nombre,
          nomProyecto,
          nomEstado,
          data.nom_prioridad,
          nomCreo,
          nomAsig
        ];

        coincideTexto = campos.some(val => val != null && String(val).toLowerCase().includes(term));
      }

      // Obtención segura de IDs (compatibilidad objeto vs id directo)
      const idProyReg = data.id_proyecto ?? (typeof data.proyecto === 'object' ? (data.proyecto as any)?.id : null);
      const idPrioReg = data.id_prioridad;
      const idEstReg = data.id_estado ?? (typeof data.estado === 'object' ? (data.estado as any)?.id : null);
      const idUsuReg = data.id_usu_asig ?? (typeof data.usuario_asignado === 'object' ? (data.usuario_asignado as any)?.id : null);

      // 2. Coincidencia de listas de selección (si la lista está vacía representa "Todos")
      const coincideProyecto = !filtros.proyectos?.length || 
        filtros.proyectos.some((id: any) => String(id) === String(idProyReg));

      const coincidePrioridad = !filtros.prioridades?.length || 
        filtros.prioridades.some((id: any) => String(id) === String(idPrioReg));

      const coincideEstado = !filtros.estados?.length || 
        filtros.estados.some((id: any) => String(id) === String(idEstReg));

      const coincideUsuario = !filtros.usuarios?.length || 
        filtros.usuarios.some((id: any) => String(id) === String(idUsuReg));

      return coincideTexto && coincideProyecto && coincidePrioridad && coincideEstado && coincideUsuario;
    };
  }

  consultarEpicas() {
    this.modalCargandoServicio.abrirModal(true);
    let id_estado =  this.tareaServicio.idEstadoConsulta()
    this.formularioTareas.controls['id_estado'].setValue(id_estado)
    let datos = this.formularioTareas.value
    this.peticionServicio.peticion('/epicas/consultar-qa', datos, 'POST')
    .subscribe({
      next: (resp) => {
        if (resp.error) {
          this.modalMensajeServicio.abrirModal({
            "tipo": "error",
            "titulo": "Error:",
            "mensaje": resp.mensaje
          });
        } else {
          this.epicas = resp.datos || [];
          this.dataSource.data = [...this.epicas];
          this.extraerCatalogosFiltros(this.epicas);
          this.aplicarFiltrosCombinados();

          this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' });
        }
      },
      complete: () => {
        this.modalCargandoServicio.abrirModal(false);
      }
    });
  }

  extraerCatalogosFiltros(data: IEpica[]) {
    const estadosMap = new Map();
    const usuariosMap = new Map();
    const proyectosMap = new Map();
    const prioridadesMap = new Map();

    data.forEach(item => {
      const idEstado = item.id_estado ?? (typeof item.estado === 'object' ? (item.estado as any)?.id : null);
      if (idEstado != null && !estadosMap.has(idEstado)) {
        const nom = typeof item.estado === 'object' ? (item.estado as any)?.estado : item.estado;
        estadosMap.set(idEstado, { id: idEstado, estado: nom || `Estado ${idEstado}` });
      }

      const idUsuario = item.id_usu_asig ?? (typeof item.usuario_asignado === 'object' ? (item.usuario_asignado as any)?.id : null);
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

      const idProyecto = item.id_proyecto ?? (typeof item.proyecto === 'object' ? (item.proyecto as any)?.id : null);
      if (idProyecto != null && !proyectosMap.has(idProyecto)) {
        const nom = typeof item.proyecto === 'object' ? (item.proyecto as any)?.proyecto : item.proyecto;
        proyectosMap.set(idProyecto, { id: idProyecto, proyecto: nom || `Proyecto ${idProyecto}` });
      }
    });

    this.listaEstados = Array.from(estadosMap.values());
    this.listaUsuarios = Array.from(usuariosMap.values());
    this.listaProyectos = Array.from(proyectosMap.values());
    this.listaPrioridades = Array.from(prioridadesMap.values());
  }

  

  applyFilter(event: Event) {
    this.filtroTexto = (event.target as HTMLInputElement).value;
    this.aplicarFiltrosCombinados();
  }

  limpiarFiltros() {
    this.filtroTexto = '';
    this.filtroProyecto = [];
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


  actualizarEstado(tarea: ITarea | any, valor: any){

    if(valor == 9 || valor == 11){
      let mensaje = 'Esta acción no se puede deshacer. Una vez aprobada, la tarea quedará bloqueada para cualquier cambio o rechazo en el sistema. Si apruebas este registro por error, tendrás que ponerte en contacto directamente con el responsable o administrador de la tarea para solicitar un cambio de estado.'
       
      this.dialogConfirm.open(ModalConfirma, {
        width: '400px',
          data: {
            title: '¿Deseas APROBAR la tarea?.',
            message: mensaje,
            confirmText: 'Sí',
            cancelText: 'No'
          }
      }).afterClosed().subscribe(resultado => {
        if (resultado) {
          tarea.estado.id = valor
          this.modalCargandoServicio.abrirModal(true)
          this.formularioTareas.controls['id_estado'].setValue(valor)
          this.formularioTareas.controls['id'].setValue(tarea.id)
          this.formularioTareas.controls['tarea'].setValue(tarea.nombre)
          let url = '/tareas/estado-tarea'
          this.peticion(url)
        }
        
      })
    }

    if(valor == 8 || valor == 10){
      this.modalCargandoServicio.abrirModal(true)
      this.formularioTareas.controls['id_estado'].setValue(valor)
      this.formularioTareas.controls['id'].setValue(tarea.id)
      this.formularioTareas.controls['tarea'].setValue(tarea.nombre)
      let datos = this.formularioTareas.value
      this.modalCargandoServicio.abrirModal(true);
      this.router.navigate(['/crear-rechazo'], {
        state: { datos: datos }
      });
    }    
  }

  toggleTodosProyectos(event: any, select: any): void {
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
      const proySel = (this.filtroProyecto || []).filter(v => v !== 0);
      const prioSel = (this.filtroPrioridad || []).filter(v => v !== 0);
      const estSel = (this.filtroEstado || []).filter(v => v !== 0);
      const usuSel = (this.filtroUsuario || []).filter(v => v !== 0);

      const cumpleProyecto = proySel.length === 0 || proySel.includes(data.id_proyecto);
      const cumplePrioridad = prioSel.length === 0 || prioSel.includes(data.id_prioridad);
      const cumpleEstado = estSel.length === 0 || estSel.includes(data.id_estado);
      const cumpleUsuario = usuSel.length === 0 || usuSel.includes(data.usuario_asignado.id);

      const busqueda = (this.filtroTexto || '').toLowerCase().trim();
      const cumpleTexto = !busqueda || 
        (data.usuario_asignado?.nombre && data.usuario_asignado.nombre.toLowerCase().includes(busqueda)) ||
        (data.proyecto?.proyecto && data.proyecto.proyecto.toLowerCase().includes(busqueda)) ||
        (data.nom_prioridad && data.nom_prioridad.toLowerCase().includes(busqueda)) ||
        (data.nombre && data.nombre.toLowerCase().includes(busqueda));

      return cumpleProyecto && cumplePrioridad && cumpleEstado && cumpleUsuario && cumpleTexto;
    };

    this.dataSource.filter = Math.random().toString();
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
          
          this.dataSource.data = [...this.dataSource.data];
          this.modalMensajeServicio.abrirModal({
            "tipo": "error",
            "titulo": "Error:",
            "mensaje": mensajes
          })
        } else {       
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

  editar(epica: IEpica){
    this.modalCargandoServicio.abrirModal(true);
    this.router.navigate(['/crear-epica'], {
      state: { datos: epica }
    });
  }

  modalHistorial(tarea: ITarea, nombreEpica: string){
    const tareaConEpica = {
      ...tarea,
      nombre: nombreEpica,
      tarea: tarea.nombre,
      ruta_origen: "/listar-qa",
    };
    this.modalHistorialServicio.abrirModal(tareaConEpica)
  }
}