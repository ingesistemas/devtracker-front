import { AfterViewInit, Component, OnDestroy } from '@angular/core';


@Component({
  selector: 'app-inicio',
  imports: [],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements AfterViewInit, OnDestroy  {
   private slides!: NodeListOf<HTMLElement>;
  private current = 0;
  private intervalId: any;

  ngAfterViewInit(): void {

    this.slides = document.querySelectorAll('.carousel-slide');

    this.showSlide(this.current);

    // Rotación automática
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  showSlide(index: number): void {

    this.slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });

  }

  nextSlide(): void {

    this.current = (this.current + 1) % this.slides.length;
    this.showSlide(this.current);

  }

  prevSlide(): void {

    this.current = (this.current - 1 + this.slides.length) % this.slides.length;
    this.showSlide(this.current);

  }

  ngOnDestroy(): void {

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

  }
}
