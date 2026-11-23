import { Component, effect, inject, Input, OnInit } from '@angular/core';
import { ModalMensajeServicio } from '../../../servicios/modal-mensaje-servicio';
import { NgClass } from '@angular/common';
import { faCheck, faRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalFormularioTareaServicio } from '../../../servicios/modal-formulario-tarea';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { ObtenerErrorServicio } from '../../../servicios/obtener-error-servicio';
import { DatosServicio } from '../../../servicios/datos-servicio';
import { DatosFormServicio } from '../../../servicios/datos-form-servicio';
import { DatosTareasServicio } from '../../../servicios/datos-tareas-servicio';
import { ModalCargandoServicio } from '../../../servicios/modal-cargando-servicio';
import { PeticionServicio } from '../../../servicios/peticion-servicio';
import { ToastrService } from 'ngx-toastr';
import { toSignal } from '@angular/core/rxjs-interop';
import { IUsuario } from '../../../interfaces/iusuario';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { IRequisito } from '../../../interfaces/irequisito';
import { faRectangleList } from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-crear-tarea',
  imports: [FontAwesomeModule,  FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatListModule],
  templateUrl: './crear-tarea.html',
  styleUrl: './crear-tarea.css',
})
export class CrearTarea {
  faRotateLeft = faRotateLeft;
  faCheck = faCheck
  faRectangleList = faRectangleList
  @Input() isVisible: boolean = false;
  @Input() mensaje: string = '';
  url: string = ''
  private modalFormularioTareaServicio = inject(ModalFormularioTareaServicio)
  private obtenerErrorServicio = inject(ObtenerErrorServicio)
  private fb = inject(FormBuilder)
  private datosTempServicio = inject(DatosServicio)
  private datosFormServicio = inject(DatosFormServicio)
  private datosTareas = inject(DatosTareasServicio)
  private modalCargandoServicio = inject(ModalCargandoServicio)
  private modalMensajeServicio = inject(ModalMensajeServicio)
  private peticionServicio = inject(PeticionServicio)
  private toastrServicio = inject(ToastrService)
  private router = inject(Router);
  edicion: boolean = false
  observa: boolean = false
  id_estado: number = 0
  editarObs: boolean = false
  mostrarFormTarea: boolean = true
  tituloRequisitos: string = "Mostrar requisitos"
 /*  edicion = toSignal(this.modalFormularioTareaServicio.edicion$);
  data = toSignal(this.modalFormularioTareaServicio.modalState$); */
  datos: any = []
  grupos: any = []
  usuarios: any = []
  usuariosGrupo: any = []
  usuario: IUsuario[] = []
  usuarioActual: string = ""
  requisitos: any[] = [];
  idTareaCreada: number = 0
  gurdado: boolean = false

  tituloFormulario: string = ""

  formularioRequisito = this.fb.group({
    id: [0],
    id_tarea: [0],
    id_requisito: [0],
  })

  formularioTareas = this.fb.group({
    id: [0],
    f_pentrega: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    detalle: ['', [Validators.required]],
    id_observacion: [0],
    observacion: ['', [Validators.required]],
    id_complejidad: [null, [Validators.required]],
    id_prioridad: [null, [Validators.required]],
    id_estado: this.fb.control('1', { nonNullable: true }),
    id_epica: [null, [Validators.required]],
    id_usu_creo : this.fb.control(this.datosTempServicio.id(), { nonNullable: true }),
    id_reasig : this.fb.control(this.datosTempServicio.id(), { nonNullable: true }),
    cronometro: [0],
    nom_reasig:  [''],
    id_grupo:  [0],
    calidad: ['', [Validators.required]],
    hrs_estimadas: [0, [Validators.min(1)]]
  });

  constructor() {
    
  }

  onUsuarioChange(id: any): void {
    const usuario = this.usuarios.find((u: any) => u.id == id);
    this.formularioTareas.patchValue({
      nom_reasig: usuario ? usuario.nombre : ''
    });
    this.usuario = usuario
  }

  listaPrioridades = [
    { id: 4, nombre: 'Crítica' },
    { id: 3, nombre: 'Alta' },
    { id: 2, nombre: 'Media' },
    { id: 1, nombre: 'Baja' }
  ];

  listaComplejidades = [
    { id: 4, nombre: 'Compleja' },
    { id: 3, nombre: 'Alta' },
    { id: 2, nombre: 'Media' },
    { id: 1, nombre: 'Baja' }
  ];

  ngOnInit() {
    this.consultarGrupos()  
    let epica = this.datosFormServicio.datos()
    let datos = {"id_epica": epica.id}
    this.peticionServicio.peticion('/requisitos/consultar', datos, 'POST').subscribe(
      {
        next: (req)=>{
          this.requisitos = req.datos
        }
      }
    )
  }

  poblarCampos(){
    const state = globalThis?.history?.state;  
    this.observa = state?.observa;
    this.datos = state?.datos;
    if(this.datos != null){
      this.edicion = true
      const fechaFormateada = this.datos.f_pentrega ? this.datos.f_pentrega.split('T')[0] : null;
      this.formularioTareas.patchValue({
        id_grupo: this.datos.usuario_asignado.grupo_trabajo.id,
        id:  this.datos.id,
        nombre:  this.datos.nombre,
        detalle:  this.datos.detalle,
        f_pentrega: fechaFormateada,
        id_prioridad:  this.datos.id_prioridad,
        id_complejidad:  this.datos.id_complejidad,
        id_reasig: this.datos.usuario_asignado.id,
        cronometro: this.datos.cronometro,
        calidad: this.datos.calidad,
        hrs_estimadas: this.datos.hrs_estimadas
      });
      this.id_estado = this.datos.id_estado
      if(this.datos.id_estado != 1){
        this.formularioTareas.disable();
      }
      this.idTareaCreada = this.datos.id
      this.usuarioActual = this.datos.usuario_asignado.nombre
      if(this.observa){
        this.formularioTareas.disable();
        let nombreEpica = this.datosFormServicio.datos()
        this.tituloFormulario = "Crear observación Tarea: " 
        this.formularioTareas.controls['observacion'].enable()
        
        if(state?.datosObservacion){
          this.editarObs = true
          this.tituloFormulario = "Editar observación Tarea: " 
          let obs = state?.datosObservacion.observacion
          let id_obs = state?.datosObservacion.id
          this.formularioTareas.controls['observacion'].setValue(obs)
          this.formularioTareas.controls['id_observacion'].setValue(id_obs)
        }   
        
      } else {
        let nombreEpica = this.datosFormServicio.datos()
        this.tituloFormulario = "Editar tarea Épica: " + nombreEpica.nombre 
        this.formularioTareas.controls['observacion'].disable()
      }
    } else {
      this.formularioTareas.patchValue({
        id: 0,
        nombre: '',
        detalle: '',
        f_pentrega: '',
        id_prioridad: null,
        id_complejidad: null,
        cronometro: 0
      });
      let nombreEpica = this.datosFormServicio.datos()
      this.tituloFormulario = "Crear tarea Épica: " + nombreEpica.nombre 
      this.formularioTareas.controls['observacion'].disable()
    }
   
    this.filtrarUsuarios()
    this.modalCargandoServicio.abrirModal(false)
  }

  consultarGrupos(){ 
    this.modalCargandoServicio.abrirModal(true)
    this.peticionServicio.peticion('/grupos/consultar', null, 'GET')
    .subscribe({
      next: (resp) => {
        if (resp.error) {
          this.modalMensajeServicio.abrirModal({
            "tipo": "error",
            "titulo": "Error:",
            "mensaje": resp.mensaje
          })
        } else {
          this.grupos = resp.datos
        }
      },
      complete: ()=>{
         this.consultarUsuarios()
      }
    }) 
  }

  consultarUsuarios(){
    this.modalCargandoServicio.abrirModal(true)

    this.peticionServicio.peticion('/usuarios/consultar', null, 'GET')
    .subscribe({
      next: (resp) => {  
        if (resp.error) {
          this.modalMensajeServicio.abrirModal({
            "tipo": "error",
            "titulo": "Error:",
            "mensaje": resp.mensaje
          })
        } else {
          this.usuarios = resp.datos
          
        }
      },
      complete: ()=>{
        this.poblarCampos()
      }
    }) 
  }

  filtrarUsuarios(){
    let id_grupo = this.formularioTareas.controls['id_grupo'].value
    const controlReasig = this.formularioTareas.get('id_reasig');
    if (id_grupo && Number(id_grupo) > 0) {
      // Filtramos partiendo SIEMPRE de la lista completa intacta
      this.usuariosGrupo = this.usuarios.filter(
        (usuario: any) => usuario.grupo_trabajo?.id == id_grupo
      );  
      controlReasig?.reset();
      controlReasig?.enable();   
    } else {
      this.usuariosGrupo = [];
      controlReasig?.reset();
      controlReasig?.disable();
    }
  }

  validar(campo: string, formulario: string) {
    let form = (this as any)[formulario];
    const control = form.get(campo);
    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      return null;
    }
    return this.obtenerErrorServicio.getErrores(form, campo);
  }

  aceptar(){
    let datos = this.datosFormServicio.datos()
    this.formularioTareas.patchValue({
      id_epica: datos.id
    });
    this.url = '/tareas/crear'
    this.peticion('formularioTareas')
  }

  editar(){
    let datos = this.datosFormServicio.datos()
    this.formularioTareas.patchValue({
      id_epica: datos.id
    });
    this.url = '/tareas/editar'
    this.peticion('formularioTareas')
  }

  crearObs(){
    this.url = '/tareas/observacion'
    this.peticion('formularioTareas')
  }

  editarObservacion(){
    this.url = '/tareas/editar-observacion'
    this.peticion('formularioTareas')
  }

  cerrar() {
    //this.modalFormularioTareaServicio.cerrarModal();
    this.router.navigateByUrl('/crear-programa-epica')
  }

  peticion(formulario: string){
   
    this.modalCargandoServicio.abrirModal(true);
    let datos = (this as any)[formulario].getRawValue();
    let form = (this as any)[formulario];
    if (form.invalid) {
      form.markAllAsTouched();
      this.modalCargandoServicio.abrirModal(false);
      return;
    }
    this.peticionServicio.peticion(this.url, datos, 'POST')
    .subscribe({
      next: (resp) => {
        let mensajes = "";
        if (resp.error) {
          if (resp.errores) {
            mensajes = Object.values(resp.errores)
              .flat()
              .join('\n');
          } else {
            mensajes = resp.mensaje;
          }
          
          this.modalMensajeServicio.abrirModal({
            tipo: "error",
            titulo: "Error:",
            mensaje: mensajes
          });
        } else {
          const formVal = this.formularioTareas.value;

          // 1. Búsqueda de descripciones en catálogos
          const complejidadSel = this.listaComplejidades.find(
            (item) => item.id === Number(formVal.id_complejidad)
          );
          const prioridadSel = this.listaPrioridades.find(
            (item) => item.id === Number(formVal.id_prioridad)
          );
          
          // Asumiendo que 'datos' es el objeto de la épica seleccionada
          const epicaSel = this.datosFormServicio.datos(); 
          let datosTareas = this.datosTareas.setDatosForm
          // 2. Armar el objeto completo respetando la estructura del backend
          const nuevaTareaCompleta = {
            ...formVal,
            ...datosTareas, // ⚠️ AQUÍ va la respuesta del HTTP POST (id, created_at, etc.), NO listaTareas
            id: resp.data.id,
            activo: 0,
            f_rentrega: null,
            fec_ini: null,
            fec_fin: null,
            url_pdf: null,
            url_video: null,
            tiempo: 0, 
            usuario_asignado: this.usuario,

            // Nombres de catálogos
            nom_complejidad: complejidadSel ? complejidadSel.nombre : '',
            nom_prioridad: prioridadSel ? prioridadSel.nombre : '',

            // Objetos anidados (Respetando el JSON original)
            estado: { id: 1, estado: 'Pendiente' }, 
            epica: epicaSel || null
          }
          
          if (formulario === 'formularioTareas' && this.edicion == false) {
            
            // 3. Agregar al Signal de la Tareas
            this.datosTareas.agregarDatosForm(nuevaTareaCompleta);
            
          } else {
              this.datosTareas.actualizarDatosForm(nuevaTareaCompleta);
          }
          this.idTareaCreada =  resp.data.id
          this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' });
          this.mostrarFormTarea = false
          this.tituloRequisitos = "Ocultar requisitos"
          this.gurdado = true
        }
      },
      error: (error) => {
        this.modalMensajeServicio.abrirModal({
          tipo: "error",
          titulo: "Error:",
          mensaje: error.error?.message ?? error.error?.mensaje ?? error.message ?? 'Se presentó un error en el servidor.'
        });
      },
      complete: () => {
        this.modalCargandoServicio.abrirModal(false);
      }
    }); 
  }

  cambiaMostrarFormTarea(){
    this.mostrarFormTarea = !this.mostrarFormTarea
    if(this.mostrarFormTarea){
      this.tituloRequisitos = "Mostrar requisitos"
    }else{
      this.tituloRequisitos = "Ocultar requisitos"
    }
    
  }

  requisito(event: any, requisito: IRequisito){
    const estaMarcado = event.target.checked;
    let url = "";

    if (estaMarcado) {
        url = "/requisitos/agregar-tarea";
    } else {
        url = "/requisitos/eliminar-tarea";
    }
   
    // Buscamos y actualizamos directamente el requisito
    const itemEncontrado = this.requisitos.find(el => el.id === requisito.id);
    if (itemEncontrado) {
        itemEncontrado.checked_id = estaMarcado; // Usa 'checked' (o 'checked_id' si prefieres, pero manténlo igual en el HTML)
    }
    let mId_complejidad = this.formularioTareas.controls['id_complejidad'].value
    alert(mId_complejidad)
    let datosRequisitos = {
      id_requisito: requisito.id,
      id_tarea: this.idTareaCreada,
      id_complejidad: mId_complejidad
    }
    this.peticionServicio.peticion(url, datosRequisitos, "POST")
    .subscribe({
      next: (res)=>{
        console.log(res)
        if(res.error){
          this.modalMensajeServicio.abrirModal({
            tipo: "error",
            titulo: "Error:",
            mensaje: res.mensaje
          });         
        }else{
           this.toastrServicio.success(res.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' });
        }
        
      },
      error: (error)=>{
        this.modalMensajeServicio.abrirModal({
          tipo: "error",
          titulo: "Error:",
          mensaje: error.error?.message ?? error.error?.mensaje ?? error.message ?? 'Se presentó un error en el servidor....'
        });
      }
    })
  }

  isRequisitoChecked(itemId: number): boolean {

    return this.datos?.requisito_tareas?.some((rt: any) => rt.id_requisito === itemId) ?? false;  
  }
}
