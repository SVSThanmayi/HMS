import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hospital-stats',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      width: 100%;
      position: relative;
    }
  `],
  template: `
    <section class="relative bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-950 text-white py-12 sm:py-16 overflow-hidden border-y border-teal-800/50 shadow-2xl">
      
      <!-- Subtle Decorative Medical Pattern & Glowing Emerald / Teal Lights -->
      <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
      <div class="absolute -top-24 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Faint Medical Cross Silhouette in Background -->
      <div class="absolute -right-10 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none select-none">
        <svg class="w-64 h-64 text-emerald-300" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
        </svg>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/15">
          
          <!-- Stat 1: Doctors -->
          <div class="flex flex-col items-center justify-center text-center p-4 sm:p-2 group">
            <span class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-teal-300 tracking-tight transition-transform duration-300 group-hover:scale-105 drop-shadow-sm">
              10+
            </span>
            <span class="text-base sm:text-lg lg:text-xl font-bold text-white tracking-wide mt-2">
              Doctors
            </span>
            <span class="text-xs text-teal-200/70 mt-1 font-medium hidden sm:block">Specialist Physicians</span>
          </div>

          <!-- Stat 2: Bedded -->
          <div class="flex flex-col items-center justify-center text-center p-4 sm:p-2 pt-6 sm:pt-2 group">
            <span class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-teal-300 tracking-tight transition-transform duration-300 group-hover:scale-105 drop-shadow-sm">
              50
            </span>
            <span class="text-base sm:text-lg lg:text-xl font-bold text-white tracking-wide mt-2">
              Bedded
            </span>
            <span class="text-xs text-teal-200/70 mt-1 font-medium hidden sm:block">Modern In-Patient Beds</span>
          </div>

          <!-- Stat 3: Patients -->
          <div class="flex flex-col items-center justify-center text-center p-4 sm:p-2 pt-6 sm:pt-2 group">
            <span class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-teal-300 tracking-tight transition-transform duration-300 group-hover:scale-105 drop-shadow-sm">
              18000+
            </span>
            <span class="text-base sm:text-lg lg:text-xl font-bold text-white tracking-wide mt-2">
              Patients
            </span>
            <span class="text-xs text-teal-200/70 mt-1 font-medium hidden sm:block">Trusted Consultations</span>
          </div>

          <!-- Stat 4: Surgeries -->
          <div class="flex flex-col items-center justify-center text-center p-4 sm:p-2 pt-6 sm:pt-2 group">
            <span class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-teal-300 tracking-tight transition-transform duration-300 group-hover:scale-105 drop-shadow-sm">
              600+
            </span>
            <span class="text-base sm:text-lg lg:text-xl font-bold text-white tracking-wide mt-2">
              Surgeries
            </span>
            <span class="text-xs text-teal-200/70 mt-1 font-medium hidden sm:block">Successful Operations</span>
          </div>

        </div>
      </div>

    </section>
  `
})
export class HospitalStatsComponent {}
