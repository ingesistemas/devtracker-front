import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Observable, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class PeticionServicio {

  private apiUrl = 'http://127.0.0.1:8000/api'

  constructor(private http: HttpClient) { }

  // 🔹 MÉTODO ÚNICO
  peticion(
    url: string,
    datos: any,
    tipoPeticion: 'POST' | 'PUT' | 'GET' | 'DELETE'
  ): Observable<any> {

    switch (tipoPeticion) {
      case 'POST':
        return this.peticionPOST(url, datos);

      case 'PUT':
        return this.peticionPUT(url, datos);

      case 'GET':
        return this.peticionGET(url);

      case 'DELETE':
        return this.peticionDELETE(url, datos);

      default:
        return throwError(() => new Error('Tipo de petición no válido'));
    }
  }

  /* CON TOKEN */
  private peticionPOST(url: string, datos: any): Observable<any> {
    const token = localStorage.getItem('token') || ''
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.post<any>(this.apiUrl + url, datos, { headers }).pipe(
      map(res => res),
      catchError(err => throwError(() => err.error)) // <-- Cambio
    );
  }

  private peticionPUT(url: string, datos: any): Observable<any> {
    const token = localStorage.getItem('token') || ''
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });
    return this.http.put<any>(this.apiUrl + url, datos, { headers }).pipe(
      map(res => res),
      catchError(err => throwError(() => err.error)) // <-- Cambio
    );
  }

  private peticionDELETE(url: string, datos: any): Observable<any> {
    const token = localStorage.getItem('token') || ''
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.delete<any>(this.apiUrl + url, {
      headers,
      body: datos
    }).pipe(
      map(res => res),
      catchError(err => throwError(() => err.error)) // <-- Cambio
    );
  }

  private peticionGET(url: string): Observable<any> {
    const token = localStorage.getItem('token') || ''
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token
    });

    return this.http.get<any>(this.apiUrl + url, {
      headers
    }).pipe(
      map(res => res),
      catchError(err => throwError(() => err.error)) // <-- Cambio
    );
  }
}