import { AfterViewInit, Component, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

interface EstadoFlujo {
  nombre: string;
  colorDot: string;
  descripcion: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements AfterViewInit, OnDestroy {
  // Control del Carrusel
  public currentSlide = 0;
  private intervalId: any;
  private observer!: IntersectionObserver;

  public slides = [
    {
      badge: 'Sprint Activo',
      titulo: 'Módulo de Autenticación Centralizada',
      texto: 'Actualización del esquema de tokens e integración de logs de trazabilidad detallados para auditorías de seguridad avanzadas.',
      imagen: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=900&auto=format&fit=crop',
      alt: 'Desarrollo limpio'
    },
    {
      badge: 'Optimización',
      titulo: 'Estructura del Proyecto Prisma',
      texto: 'Refactorización de la capa visual para garantizar una navegación fluida y tiempos de carga mínimos en la plataforma corporativa.',
      imagen: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=900&auto=format&fit=crop',
      alt: 'Análisis de datos'
    }
  ];

  // Control del Flujo de los 11 Estados (100% Angular)
  public estados: EstadoFlujo[] = [
    { nombre: 'Pendiente por iniciar', colorDot: 'bg-secondary', descripcion: 'Tarea creada y asignada a un responsable, lista para iniciar ejecución según prioridad.' },
    { nombre: 'En desarrollo', colorDot: 'bg-primary', descripcion: 'El responsable está ejecutando activamente la tarea y contabilizando tiempo real.' },
    { nombre: 'Pruebas', colorDot: 'bg-info', descripcion: 'Validación técnica inicial y pruebas unitarias o de escritorio antes de pasar a QA.' },
    { nombre: 'En calidad', colorDot: 'bg-warning', descripcion: 'Punto de control obligatorio: el equipo de aseguramiento audita el entregable.' },
    { nombre: 'Rechazada x calidad', colorDot: 'bg-danger', descripcion: 'El entregable no cumple criterios. Requiere justificación obligatoria en historial.' },
    { nombre: 'Aprobada x calidad', colorDot: 'bg-success', descripcion: 'Certificada por QA. Suma bonificación de progreso y queda lista para liberación.' },
    { nombre: 'En despliegue', colorDot: 'bg-primary', descripcion: 'Proceso de publicación, puesta en marcha o entrega final al cliente interno/externo.' },
    { nombre: 'Rechazada x despliegue', colorDot: 'bg-danger', descripcion: 'Incidencia detectada durante la liberación. Se documenta motivo y retorna a ajuste.' },
    { nombre: 'Aprobada x despliegue', colorDot: 'bg-success', descripcion: 'Entregable 100% completado, verificado en producción y listo para cierre financiero.' },
    { nombre: 'Pausada', colorDot: 'bg-warning', descripcion: 'Tarea detenida temporalmente por dependencia externa o cambio de prioridad gerencial.' },
    { nombre: 'Archivada', colorDot: 'bg-dark', descripcion: 'Registro histórico cerrado para consulta y auditoría posterior sin alterar métricas activas.' }
  ];

  public estadoSeleccionado: EstadoFlujo = this.estados[0];

  constructor(private elRef: ElementRef) {}

  ngAfterViewInit(): void {
    // 1. Iniciar rotación automática del carrusel
    this.iniciarAutoSlide();

    // 2. Activar animaciones de aparición al hacer scroll (reemplazo seguro de AOS)
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const elementosAnimados = this.elRef.nativeElement.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    elementosAnimados.forEach((el: HTMLElement) => this.observer.observe(el));
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.observer) this.observer.disconnect();
  }

  // Métodos del Carrusel
  private iniciarAutoSlide(): void {
    this.intervalId = setInterval(() => {
      this.nextSlide(false);
    }, 6000);
  }

  nextSlide(manual = true): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    if (manual) this.reiniciarTimer();
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.reiniciarTimer();
  }

  private reiniciarTimer(): void {
    clearInterval(this.intervalId);
    this.iniciarAutoSlide();
  }

  // Método para cambiar el estado activo y su descripción
  seleccionarEstado(estado: EstadoFlujo): void {
    this.estadoSeleccionado = estado;
  }
}