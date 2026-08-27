import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IconComponent } from '../../../../shared/icons/icon.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      width: 100%;
      position: relative;
    }
    video {
      pointer-events: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
    }
  `],
  template: `
    <section id="hero" class="relative h-screen min-h-screen w-full flex flex-col justify-end overflow-hidden pb-12 sm:pb-16 pt-20 bg-slate-950">
      
      <!-- Video Background Container (Doctor Treating Patients Video, Full Screen, Muted, Loop, Zero Controls) -->
      <div class="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none select-none">
        
        <!-- Native HTML5 Video Element: Real Clinical Video of Doctors Treating & Examining Patients -->
        <video 
          #bgVideo
          class="w-full h-full object-cover object-center pointer-events-none select-none opacity-85"
          autoplay 
          loop 
          muted 
          [muted]="true"
          playsinline 
          webkit-playsinline
          disablepictureinpicture
          disableremoteplayback
          preload="auto"
          (timeupdate)="onTimeUpdate($event)"
        >
          <source src="assets/videos/doctors-treating-patients.webm" type="video/webm">
        </video>

        <!-- Subtle Dark & Green/Teal Transparent Gradient Overlay matching reference image -->
        <div class="absolute inset-0 bg-gradient-to-t from-[#022c33] via-slate-950/45 to-slate-900/30 z-10 pointer-events-none"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-transparent to-[#022c33]/90 z-10 pointer-events-none"></div>
      </div>

      <!-- Hero Lower Content Area matching user reference -->
      <div id="booking" class="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 w-full flex flex-col items-center text-center space-y-6">
        
        <!-- 1. "24/7 World-Class Healthcare & Emergency" Pill Bar (sentence width, no end icon) -->
        <div class="inline-flex items-center gap-3 bg-slate-950/75 hover:bg-slate-950/85 backdrop-blur-md border border-white/25 rounded-full px-6 py-3 shadow-2xl transition-all">
          <span class="relative flex h-3 w-3 shrink-0">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
          </span>
          <span class="text-sm sm:text-base font-semibold text-slate-100 tracking-wide whitespace-nowrap">
            24/7 World-Class Healthcare & Emergency
          </span>
        </div>

        <!-- 2. Clean, Prominent "Book Appointment" Button routing to /login -->
        <div class="w-full flex justify-center pt-1">
          <a 
            routerLink="/login"
            class="group inline-flex items-center justify-center gap-2.5 px-6 py-2.5 sm:py-2.5 rounded-full bg-white hover:bg-[#FDEBB2] text-[#063342] font-medium text-sm sm:text-base shadow-lg hover:shadow-[0_8px_25px_rgba(0,125,140,0.25)] hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer border border-white/60"
          >
            <span class="tracking-normal font-medium text-[#063342]">Book Appointment</span>
            <div class="w-6.5 h-6.5 rounded-full bg-transparent border border-slate-400/80 text-slate-700 flex items-center justify-center group-hover:bg-[#007D8C] group-hover:border-[#007D8C] group-hover:text-white transition-all duration-300 shrink-0">
              <app-icon name="arrow-right" wrapperClass="w-3.5 h-3.5 block group-hover:text-white transition-colors" />
            </div>
          </a>
        </div>

      </div>
    </section>
  `
})
export class HeroComponent implements AfterViewInit {
  private readonly router = inject(Router);

  @ViewChild('bgVideo') bgVideoRef?: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    if (this.bgVideoRef?.nativeElement) {
      const video = this.bgVideoRef.nativeElement;
      video.muted = true;
      video.volume = 0;
      try {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      } catch {}
    }
  }

  // Loop every 28 seconds seamlessly without ever rendering player controls
  onTimeUpdate(event: Event): void {
    const video = event.target as HTMLVideoElement;
    if (video) {
      video.muted = true;
      if (video.currentTime >= 28) {
        video.currentTime = 0;
        try {
          const playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
          }
        } catch {}
      }
    }
  }
}
