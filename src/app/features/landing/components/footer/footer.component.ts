import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../shared/icons/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800 relative overflow-hidden">
      
      <!-- Top Decorative Glow -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Main 4-Column Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
          
          <!-- Column 1: HMS Brand & About (4 cols) -->
          <div class="lg:col-span-4 space-y-4">
            <a href="#hero" (click)="scrollToSection($event, 'hero')" class="inline-flex items-center gap-2.5 cursor-pointer">
              <!-- Heart + Icon -->
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-teal-600/30">
                <app-icon name="heart-cross" wrapperClass="w-6 h-6 block text-white" />
              </div>
              <div class="flex flex-col">
                <span class="text-2xl font-bold tracking-tight text-white leading-none">HMS</span>
                <span class="text-xs uppercase font-semibold tracking-wider text-teal-400">Healthcare Excellence</span>
              </div>
            </a>

            <p class="text-sm text-slate-300 leading-relaxed max-w-sm">
              HMS is a premier multi-specialty healthcare institution dedicated to delivering compassionate, patient-centric clinical medicine, state-of-the-art robotic surgery, and round-the-clock emergency care.
            </p>

            <div class="flex items-center gap-3 pt-2">
              <!-- Social Media Icons -->
              <a href="#" aria-label="Facebook" class="w-9 h-9 rounded-full bg-slate-900 hover:bg-teal-600 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center transition cursor-pointer">
                <app-icon name="facebook" wrapperClass="w-4 h-4 block" />
              </a>
              <a href="#" aria-label="Twitter" class="w-9 h-9 rounded-full bg-slate-900 hover:bg-teal-600 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center transition cursor-pointer">
                <app-icon name="twitter" wrapperClass="w-4 h-4 block" />
              </a>
              <a href="#" aria-label="LinkedIn" class="w-9 h-9 rounded-full bg-slate-900 hover:bg-teal-600 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center transition cursor-pointer">
                <app-icon name="linkedin" wrapperClass="w-4 h-4 block" />
              </a>
              <a href="#" aria-label="Instagram" class="w-9 h-9 rounded-full bg-slate-900 hover:bg-teal-600 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center transition cursor-pointer">
                <app-icon name="instagram" wrapperClass="w-4 h-4 block" />
              </a>
              <a href="#" aria-label="YouTube" class="w-9 h-9 rounded-full bg-slate-900 hover:bg-teal-600 text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center transition cursor-pointer">
                <app-icon name="youtube" wrapperClass="w-4 h-4 block" />
              </a>
            </div>
          </div>

          <!-- Column 2: Quick Links (3 cols) -->
          <div class="lg:col-span-3 space-y-4">
            <h4 class="text-sm font-bold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul class="space-y-2.5 text-sm">
              <li>
                <a href="#hero" (click)="scrollToSection($event, 'hero')" class="hover:text-teal-400 transition cursor-pointer flex items-center gap-1.5">
                  <app-icon name="chevron-right" wrapperClass="w-3.5 h-3.5 text-teal-500" />
                  Home
                </a>
              </li>
              <li>
                <a href="#doctors" (click)="scrollToSection($event, 'doctors')" class="hover:text-teal-400 transition cursor-pointer flex items-center gap-1.5">
                  <app-icon name="chevron-right" wrapperClass="w-3.5 h-3.5 text-teal-500" />
                  Doctors
                </a>
              </li>
              <li>
                <a href="#reviews" (click)="scrollToSection($event, 'reviews')" class="hover:text-teal-400 transition cursor-pointer flex items-center gap-1.5">
                  <app-icon name="chevron-right" wrapperClass="w-3.5 h-3.5 text-teal-500" />
                  Patient Speaks
                </a>
              </li>
              <li>
                <a href="#faqs" (click)="scrollToSection($event, 'faqs')" class="hover:text-teal-400 transition cursor-pointer flex items-center gap-1.5">
                  <app-icon name="chevron-right" wrapperClass="w-3.5 h-3.5 text-teal-500" />
                  FAQ
                </a>
              </li>
              <li>
                <a href="#callback" (click)="scrollToSection($event, 'callback')" class="hover:text-teal-400 transition cursor-pointer flex items-center gap-1.5">
                  <app-icon name="chevron-right" wrapperClass="w-3.5 h-3.5 text-teal-500" />
                  Contact / Call Back
                </a>
              </li>
            </ul>
          </div>

          <!-- Column 3: Medical Services (2 cols) -->
          <div class="lg:col-span-2 space-y-4">
            <h4 class="text-sm font-bold text-white uppercase tracking-wider">
              Specialties
            </h4>
            <ul class="space-y-2 text-sm text-slate-300">
              <li class="hover:text-teal-300 transition">Cardiology</li>
              <li class="hover:text-teal-300 transition">Neurology</li>
              <li class="hover:text-teal-300 transition">Orthopedics</li>
              <li class="hover:text-teal-300 transition">Pediatrics</li>
              <li class="hover:text-teal-300 transition">Oncology</li>
              <li class="hover:text-teal-300 transition">Emergency 24/7</li>
            </ul>
          </div>

          <!-- Column 4: Contact Information (3 cols) -->
          <div class="lg:col-span-3 space-y-4">
            <h4 class="text-sm font-bold text-white uppercase tracking-wider">
              Contact Information
            </h4>
            <div class="space-y-3 text-sm text-slate-300">
              
              <div class="flex items-start gap-3">
                <app-icon name="map-pin" wrapperClass="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span class="leading-relaxed">
                  108 Healthcare Blvd, Medical District, Sector 4, Metro City
                </span>
              </div>

              <div class="flex items-center gap-3">
                <app-icon name="phone" wrapperClass="w-5 h-5 text-teal-400 shrink-0" />
                <span class="font-mono text-white font-semibold">
                  1800 467 2273
                </span>
              </div>

              <div class="flex items-center gap-3">
                <app-icon name="mail" wrapperClass="w-5 h-5 text-teal-400 shrink-0" />
                <span class="text-teal-300 hover:underline cursor-pointer">
                  care&#64;hms-hospital.org
                </span>
              </div>

              <div class="pt-2">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Emergency Department Open 24/7
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- Bottom Section: Copyright & Disclaimer -->
        <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 HMS. All rights reserved.
          </div>
          <div class="flex items-center gap-6">
            <a href="#" class="hover:text-teal-400 transition">Privacy Policy</a>
            <a href="#" class="hover:text-teal-400 transition">Terms of Service</a>
            <a href="#" class="hover:text-teal-400 transition">Patient Rights</a>
            <a href="#" class="hover:text-teal-400 transition">HIPAA Notice</a>
          </div>
        </div>

      </div>
    </footer>
  `
})
export class FooterComponent {
  scrollToSection(event: Event, sectionId: string): void {
    event.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }
}
