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

@Component({
  selector: 'app-modal-formulario-tarea',
  imports: [FontAwesomeModule,  FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatSelectModule],
  templateUrl: './modal-formulario-tarea.html',
  styleUrl: './modal-formulario-tarea.css',
})
export class ModalFormularioTarea implements OnInit {
  faRotateLeft = faRotateLeft;
  faCheck = faCheck
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
  edicion = toSignal(this.modalFormularioTareaServicio.edicion$);
  data = toSignal(this.modalFormularioTareaServicio.modalState$);

  tituloFormulario: string = ""

  formularioTareas = this.fb.group({
    id: [0],
    f_pentrega: ['', [Validators.required]],
    detalle: ['', [Validators.required]],
    id_complejidad: [null, [Validators.required]],
    id_prioridad: [null, [Validators.required]],
    id_estado: this.fb.control('1', { nonNullable: true }),
    id_epica: [null, [Validators.required]],
    id_usu_creo : this.fb.control(this.datosTempServicio.id(), { nonNullable: true }),
    id_reasig : this.fb.control(this.datosTempServicio.id(), { nonNullable: true }),
    cronometro: [0]
  });

  constructor() {
    effect(() => {
      const edicionVal = this.edicion();
      const dataVal = this.data();
      if (dataVal != null && edicionVal === true) {
        const fechaFormateada = dataVal.f_pentrega ? dataVal.f_pentrega.split('T')[0] : null;

        this.formularioTareas.patchValue({
          id: dataVal.id,
          detalle: dataVal.detalle,
          f_pentrega: fechaFormateada,
          id_prioridad: dataVal.id_prioridad,
          id_complejidad: dataVal.id_complejidad
        });
      } else {
        this.formularioTareas.patchValue({
          id: 0,
          detalle: '',
          f_pentrega: '',
          id_prioridad: null,
          id_complejidad: null
        });
      }
    });
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

  cerrar() {
    this.modalFormularioTareaServicio.cerrarModal();
  }

  peticion(formulario: string){
    this.modalCargandoServicio.abrirModal(true);
    let datos = (this as any)[formulario].value;
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
          
          if (formulario === 'formularioTareas' && this.edicion() == false) {
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
              cronometro: 0,
              tiempo: 0,

              // Nombres de catálogos
              nom_complejidad: complejidadSel ? complejidadSel.nombre : '',
              nom_prioridad: prioridadSel ? prioridadSel.nombre : '',

              // Objetos anidados (Respetando el JSON original)
              estado: { id: 1, estado: 'Pendiente' },
              epica: epicaSel || null, // Objeto completo de la épica
              
              // Si tienes un método que retorna el objeto del usuario logueado en lugar de solo su ID:
              //usuario_creo: this.datosTempServicio.user(), 
              //usuario_asignado: this.datosTempServicio.user() 
            };

            // 3. Agregar al Signal de la Tareas
            this.datosTareas.agregarDatosForm(nuevaTareaCompleta);
            this.formularioTareas.reset()
            this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' });
            this.cerrar()
          } else {
        
            this.actualizar(datos.id_epica)
            this.formularioTareas.reset()
            this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' });
            this.cerrar()
          }
          
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

  actualizar(id_epica: number){
    let id = this.datosTempServicio.id()
    this.datosFormServicio.clear()
    this.datosFormServicio.datos()
    this.modalCargandoServicio.abrirModal(true);
    this.router.navigate(['/crear-programa-epica'], {
      state: { datos: this.datosFormServicio.datos() }
    });
  
  }
}
