import { AfterViewInit, Component, inject, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PeticionServicio } from '../../../servicios/peticion-servicio';
import { ModalCargandoServicio } from '../../../servicios/modal-cargando-servicio';
import { ModalMensajeServicio } from '../../../servicios/modal-mensaje-servicio';
import { AuthServiceTs } from '../../../servicios/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { faEyeSlash, faPenToSquare, faSquareCheck, faSquarePlus } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, NgClass, UpperCasePipe } from '@angular/common';
import { IProyecto } from '../../../interfaces/iproyecto';
import { CapitalizarPipe } from '../../../pipes/capitalizar-pipe';


@Component({
  selector: 'app-listar-proyectos',
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatBottomSheetModule, 
    MatButtonModule, FontAwesomeModule, MatMenuModule, MatIconModule, NgClass, UpperCasePipe, CommonModule ],
  templateUrl: './listar-proyectos.html',
  styleUrl: './listar-proyectos.css',
})
export class ListarProyectos  implements AfterViewInit {
  private peticionServicio = inject(PeticionServicio)
  private modalCargandoServicio = inject(ModalCargandoServicio)
  private modalMensajeServicio = inject(ModalMensajeServicio)
  private authService = inject(AuthServiceTs);
  private toastrServicio = inject(ToastrService)
  private router = inject(Router)

  faSquarePlus = faSquarePlus;
  faPenToSquare = faPenToSquare;
  faSquareCheck = faSquareCheck;
  faEyeSlash = faEyeSlash;

  proyectos: IProyecto[] = []
  
  displayedColumns: string[] = ['id', 'proyecto', 'creadoPor', 'Opciones'];
  dataSource!: MatTableDataSource<IProyecto>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // Create 100 users
    //const users = Array.from({length: 100}, (_, k) => this.createNewUser(k + 1));

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.proyectos);
  }

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: IProyecto, filter: string): boolean => {
      const texto = `
        ${data.id}
        ${data.proyecto}
        ${data.activo}
        ${data.usuario?.email ?? ''}
      `.toLowerCase();
      return texto.includes(filter);
    };

    this.modalCargandoServicio.abrirModal(true)

    this.peticionServicio.peticion('/proyectos/consultar', null, 'GET')
    .subscribe({
      next: (resp) => {
        console.log(resp)
  
        if (resp.error) {
          this.modalMensajeServicio.abrirModal({
            "tipo": "error",
            "titulo": "Error:",
            "mensaje": resp.mensaje
          })
        } else {
          this.proyectos = resp.datos
          this.dataSource.data = this.proyectos;

          this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' })
        }
      },
      complete: ()=>{
        this.modalCargandoServicio.abrirModal(false)
      }
    }) 
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  estado(proyecto: IProyecto){
    this.modalCargandoServicio.abrirModal(true)
    console.log(proyecto)
    this.peticionServicio.peticion('/proyectos/estado', proyecto, 'POST')
    .subscribe({
      next: (resp) => {  
        if (resp.error) {
          this.modalMensajeServicio.abrirModal({
            "tipo": "error",
            "titulo": "Error:",
            "mensaje": resp.mensaje
          })
        } else {
          proyecto.activo = !proyecto.activo;
          this.dataSource.data = [...this.dataSource.data];
          this.toastrServicio.success(resp.mensaje, "Aviso:", { toastClass: 'ngx-toastr toast-ancho' })
        }
      },
      complete: ()=>{
        this.modalCargandoServicio.abrirModal(false)
      }
    }) 
  }

  crear(){
    this.router.navigateByUrl('/crear-proyecto')
  }

  editar(proyecto: IProyecto){
    this.modalCargandoServicio.abrirModal(true)
    this.router.navigate(['/crear-proyecto'], {
      state: { datos: proyecto }
    }) 
  }
 
}
