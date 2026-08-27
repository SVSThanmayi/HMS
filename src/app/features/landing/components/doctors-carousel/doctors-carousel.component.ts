import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DOCTORS_DATA, Doctor } from '../../../../core/models/doctor.model';
import { ModalService } from '../../../../core/services/modal.service';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-doctors-carousel',
  standalone: true,
  imports: [CommonModule, IconComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      width: 100%;
      position: relative;
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `],
  template: `
    <section id="doctors" class="py-20 sm:py-28 bg-slate-50 relative overflow-hidden border-b border-slate-200/60">
      
      <!-- Background subtle decorative healthcare accents -->
      <div class="absolute inset-0 opacity-25 bg-[radial-gradient(#0d9488_0.75px,transparent_0.75px)] [background-size:24px_24px] pointer-events-none"></div>
      <div class="absolute -top-32 -left-32 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <!-- Section Header -->
        <div class="mb-12 max-w-3xl">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-700 text-xs font-bold tracking-wider uppercase mb-3 shadow-xs">
            <span class="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
            Distinguished Medical Faculty
          </div>
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Meet Our Specialist Doctors
          </h2>
          <p class="text-base sm:text-lg text-slate-600 leading-relaxed mt-2.5">
            Consult with our board-certified physicians, senior surgeons, and clinical specialists dedicated to providing evidence-based, compassionate care.
          </p>
        </div>

        <!-- Carousel Row: Left Arrow -> Track -> Right Arrow (Arrows sit completely OUTSIDE the cards) -->
        <div class="flex items-center gap-2 sm:gap-4 lg:gap-5 w-full py-2">
          
          <!-- Left Arrow Button (Placed on outside left of the cards) -->
          <button 
            type="button" 
            (click)="slideLeft()"
            [disabled]="isAtStart()"
            class="shrink-0 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200/90 hover:border-teal-400 shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer disabled:opacity-20 disabled:pointer-events-none group"
            aria-label="Previous doctors"
          >
            <app-icon name="chevron-left" wrapperClass="w-5 h-5 sm:w-6 sm:h-6 block group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <!-- Carousel Track Container in between the arrows -->
          <div class="overflow-hidden flex-1 min-w-0 py-2">
            <div 
              #carouselTrack
              (scroll)="onScroll()"
              class="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-4 px-1"
            >
              @for (doc of doctors; track doc.id) {
                <!-- Professional Doctor Card -->
                <div 
                  class="snap-start shrink-0 w-[280px] sm:w-[310px] md:w-[330px] bg-white rounded-3xl overflow-hidden flex flex-col group border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  
                  <!-- 1. Doctor Banner Header -->
                  <div class="relative h-56 sm:h-60 w-full bg-gradient-to-br from-slate-900 via-teal-950 to-teal-900 overflow-hidden flex items-center justify-center border-b border-slate-100">
                    <!-- Subtle pattern overlay -->
                    <div class="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none"></div>

                    <!-- Floating Experience Badge -->
                    <span class="absolute top-4 right-4 z-10 text-[11px] font-bold text-teal-200 bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20">
                      {{ doc.experienceYears }}+ Yrs Exp
                    </span>

                    <!-- Doctor Avatar Center with Glow -->
                    <div class="relative z-10 flex flex-col items-center">
                      <div class="relative">
                        <app-avatar 
                          [name]="doc.name" 
                          sizeClass="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-4 border-white/90 shadow-2xl" 
                          textSizeClass="text-xl sm:text-2xl font-bold"
                        />
                        <span class="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-400/40" title="Active Specialist"></span>
                      </div>

                      <!-- Department Tag Badge -->
                      <span class="mt-3 text-xs font-bold uppercase tracking-wider text-teal-950 bg-white/95 px-3.5 py-1 rounded-full shadow-md border border-white/90">
                        {{ doc.department }}
                      </span>
                    </div>
                  </div>

                  <!-- 2. Doctor Information Details -->
                  <div class="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 bg-white">
                    
                    <div class="space-y-1.5">
                      <h3 class="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors tracking-tight">
                        {{ doc.name }}
                      </h3>

                      <p class="text-xs sm:text-sm font-bold text-teal-700">
                        {{ doc.position }}
                      </p>

                      <p class="text-xs text-slate-500 leading-relaxed pt-1 line-clamp-2">
                        {{ doc.specialization }}
                      </p>
                    </div>

                    <!-- Ratings and Timings Row -->
                    <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                      <div class="flex items-center gap-1 text-amber-500">
                        <span>★</span>
                        <span class="text-slate-800 font-bold">{{ doc.rating }}</span>
                        <span class="text-slate-400 font-normal">({{ doc.reviewsCount }})</span>
                      </div>

                      <div class="flex items-center gap-1.5 text-slate-600">
                        <app-icon name="clock" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                        <span>{{ doc.availableDays }}</span>
                      </div>
                    </div>

                    <!-- Book Consultation Direct Action Button -->
                    <div class="pt-1">
                      <button 
                        type="button" 
                        (click)="bookDoctor(doc)"
                        class="w-full py-2.5 px-4 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-2 group/btn"
                      >
                        <app-icon name="calendar" wrapperClass="w-4 h-4 block" />
                        <span>Book Consultation</span>
                      </button>
                    </div>

                  </div>

                </div>
              }
            </div>
          </div>

          <!-- Right Arrow Button (Placed on outside right of the cards) -->
          <button 
            type="button" 
            (click)="slideRight()"
            [disabled]="isAtEnd()"
            class="shrink-0 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200/90 hover:border-teal-400 shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center cursor-pointer disabled:opacity-20 disabled:pointer-events-none group"
            aria-label="Next doctors"
          >
            <app-icon name="chevron-right" wrapperClass="w-5 h-5 sm:w-6 sm:h-6 block group-hover:translate-x-0.5 transition-transform" />
          </button>

        </div>

      </div>
    </section>
  `
})
export class DoctorsCarouselComponent {
  private readonly modalService = inject(ModalService);

  readonly doctors = DOCTORS_DATA;

  @ViewChild('carouselTrack') carouselTrack?: ElementRef<HTMLDivElement>;

  readonly isAtStart = signal<boolean>(true);
  readonly isAtEnd = signal<boolean>(false);

  slideLeft(): void {
    if (!this.carouselTrack) return;
    const track = this.carouselTrack.nativeElement;
    const cardWidth = track.firstElementChild?.clientWidth || 320;
    track.scrollBy({ left: -(cardWidth + 24), behavior: 'smooth' });
  }

  slideRight(): void {
    if (!this.carouselTrack) return;
    const track = this.carouselTrack.nativeElement;
    const cardWidth = track.firstElementChild?.clientWidth || 320;
    track.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
  }

  onScroll(): void {
    if (!this.carouselTrack) return;
    const track = this.carouselTrack.nativeElement;
    const atStart = track.scrollLeft <= 10;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
    this.isAtStart.set(atStart);
    this.isAtEnd.set(atEnd);
  }

  bookDoctor(doc: Doctor): void {
    this.modalService.openAppointmentModal(doc);
  }
}
