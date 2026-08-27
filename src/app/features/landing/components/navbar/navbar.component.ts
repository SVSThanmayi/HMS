import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ModalService } from '../../../../core/services/modal.service';
import { AuthService } from '../../../../core/services/auth.service';
import { IconComponent } from '../../../../shared/icons/icon.component';
import { AvatarComponent } from '../../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header 
      class="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      [class]="isScrolled() 
        ? 'glass-nav border-b border-slate-200/80 shadow-xs py-2' 
        : 'bg-white/95 md:bg-white/90 md:backdrop-blur-md border-b border-slate-100 py-2.5'"
    >
      <div class="w-full pl-2 sm:pl-3 pr-3 sm:pr-4">
        <div class="flex items-center justify-between gap-3">
          
          <!-- Left side: Healthcare Heart+ Logo & HMS Name (pinned to leftmost) -->
          <a 
            routerLink="/" 
            (click)="scrollToSection($event, 'hero')"
            class="flex items-center gap-2.5 shrink-0 group cursor-pointer"
            aria-label="HMS Home"
          >
            <!-- Heart + Icon -->
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center shadow-xs shadow-teal-600/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <app-icon name="heart-cross" wrapperClass="w-5 h-5 text-white" />
            </div>

            <!-- Brand Name & Tag -->
            <div class="flex flex-col">
              <span class="text-2xl font-bold tracking-tight text-slate-900 leading-none group-hover:text-teal-700 transition-colors">
                HMS
              </span>
              <span class="text-xs uppercase font-semibold tracking-wider text-teal-600 leading-tight">
                Healthcare
              </span>
            </div>
          </a>

          <!-- Middle side: Navigation Menus (sliding to sections) -->
          <nav class="hidden md:flex items-center gap-1.5 lg:gap-3">
            <a 
              href="#booking" 
              (click)="scrollToSection($event, 'booking')" 
              class="px-3.5 py-2 text-sm lg:text-base font-semibold text-slate-700 hover:text-teal-600 rounded-lg hover:bg-teal-50/80 transition cursor-pointer"
            >
              Booking
            </a>
            <a 
              href="#departments" 
              (click)="scrollToSection($event, 'departments')" 
              class="px-3.5 py-2 text-sm lg:text-base font-semibold text-slate-700 hover:text-teal-600 rounded-lg hover:bg-teal-50/80 transition cursor-pointer"
            >
              Departments
            </a>
            <a 
              href="#doctors" 
              (click)="scrollToSection($event, 'doctors')" 
              class="px-3.5 py-2 text-sm lg:text-base font-semibold text-slate-700 hover:text-teal-600 rounded-lg hover:bg-teal-50/80 transition cursor-pointer"
            >
              Doctors
            </a>
            <a 
              href="#reviews" 
              (click)="scrollToSection($event, 'reviews')" 
              class="px-3.5 py-2 text-sm lg:text-base font-semibold text-slate-700 hover:text-teal-600 rounded-lg hover:bg-teal-50/80 transition cursor-pointer"
            >
              Review
            </a>
            <a 
              href="#faqs" 
              (click)="scrollToSection($event, 'faqs')" 
              class="px-3.5 py-2 text-sm lg:text-base font-semibold text-slate-700 hover:text-teal-600 rounded-lg hover:bg-teal-50/80 transition cursor-pointer"
            >
              FAQs
            </a>
            <a 
              href="#callback" 
              (click)="scrollToSection($event, 'callback')" 
              class="px-3.5 py-2 text-sm lg:text-base font-semibold text-slate-700 hover:text-teal-600 rounded-lg hover:bg-teal-50/80 transition cursor-pointer"
            >
              Call back
            </a>
          </nav>

          <!-- Right side: Login Button / Portal Link Button -->
          <div class="hidden md:flex items-center gap-2 shrink-0">
            @if (authService.isLoggedIn()) {
              @if (authService.isDoctor()) {
                <a 
                  routerLink="/patient-portal" 
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-800 font-bold text-sm lg:text-base shadow-2xs transition cursor-pointer group"
                >
                  <app-avatar [name]="authService.currentDoctor()?.name || 'Dr. Sarah Johnson'" sizeClass="w-6 h-6 rounded-full" />
                  <span>Doctor Station</span>
                  <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                </a>
              } @else if (authService.isReceptionist()) {
                <a 
                  routerLink="/receptionist" 
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-200 bg-teal-50/80 hover:bg-teal-100 text-teal-800 font-bold text-sm lg:text-base shadow-2xs transition cursor-pointer group"
                >
                  <app-avatar [name]="authService.currentReceptionist()?.name || 'Receptionist'" sizeClass="w-6 h-6 rounded-full" />
                  <span>Reception Desk</span>
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </a>
              } @else if (authService.isNurse()) {
                <a 
                  routerLink="/nurse" 
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-200 bg-teal-50/80 hover:bg-teal-100 text-teal-800 font-bold text-sm lg:text-base shadow-2xs transition cursor-pointer group"
                >
                  <app-avatar [name]="authService.currentNurse()?.name || 'Nurse'" sizeClass="w-6 h-6 rounded-full" />
                  <span>Nurse Station</span>
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </a>
              } @else {
                <a 
                  routerLink="/patient-portal" 
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-200 bg-teal-50/80 hover:bg-teal-100 text-teal-800 font-bold text-sm lg:text-base shadow-2xs transition cursor-pointer group"
                >
                  <app-avatar [name]="authService.currentPatient()?.name || 'Patient'" sizeClass="w-6 h-6 rounded-full" />
                  <span>Patient Portal</span>
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </a>
              }
            } @else {
              <a 
                routerLink="/login" 
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-teal-50/50 text-slate-800 font-bold text-sm lg:text-base shadow-2xs hover:border-teal-400 hover:text-teal-700 transition cursor-pointer group"
              >
                <app-icon name="user" wrapperClass="w-4.5 h-4.5 text-slate-600 group-hover:text-teal-600 transition" />
                <span>Login</span>
              </a>
            }
          </div>

          <!-- Mobile Actions (Login + Hamburger Drawer) -->
          <div class="flex items-center gap-2 md:hidden shrink-0">
            @if (authService.isLoggedIn()) {
              <a 
                [routerLink]="authService.isReceptionist() ? '/receptionist' : (authService.isNurse() ? '/nurse' : '/patient-portal')" 
                (click)="isMobileMenuOpen.set(false)"
                class="p-1.5 text-teal-700 hover:text-teal-800 rounded-lg bg-teal-50 cursor-pointer flex items-center justify-center"
                [attr.aria-label]="authService.isDoctor() ? 'Doctor Station' : (authService.isReceptionist() ? 'Reception Desk' : (authService.isNurse() ? 'Nurse Station' : 'Patient Portal'))"
              >
                <app-avatar [name]="authService.isDoctor() ? (authService.currentDoctor()?.name || 'Dr. Sarah Johnson') : (authService.isReceptionist() ? (authService.currentReceptionist()?.name || 'Receptionist') : (authService.isNurse() ? (authService.currentNurse()?.name || 'Nurse') : (authService.currentPatient()?.name || 'Patient')))" sizeClass="w-6 h-6 rounded-full" />
              </a>
            } @else {
              <a 
                routerLink="/login" 
                (click)="isMobileMenuOpen.set(false)"
                class="p-2 text-slate-700 hover:text-teal-600 rounded-lg bg-slate-100/80 cursor-pointer"
                aria-label="Login"
              >
                <app-icon name="user" wrapperClass="w-4.5 h-4.5" />
              </a>
            }

            <button 
              type="button" 
              (click)="isMobileMenuOpen.set(!isMobileMenuOpen())"
              class="p-2 text-slate-700 hover:text-teal-600 rounded-lg bg-slate-100/80 cursor-pointer"
              aria-label="Toggle menu"
            >
              @if (isMobileMenuOpen()) {
                <app-icon name="x" wrapperClass="w-5 h-5" />
              } @else {
                <app-icon name="menu" wrapperClass="w-5 h-5" />
              }
            </button>
          </div>

        </div>
      </div>

      <!-- Mobile Dropdown Navigation -->
      @if (isMobileMenuOpen()) {
        <div class="md:hidden bg-white/98 backdrop-blur-xl border-b border-slate-200 px-4 pt-3 pb-5 space-y-2 shadow-xl animate-slide-down">
          <a 
            href="#booking" 
            (click)="scrollToSection($event, 'booking')" 
            class="block px-4 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-teal-50 hover:text-teal-700"
          >
            Booking
          </a>
          <a 
            href="#departments" 
            (click)="scrollToSection($event, 'departments')" 
            class="block px-4 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-teal-50 hover:text-teal-700"
          >
            Departments
          </a>
          <a 
            href="#doctors" 
            (click)="scrollToSection($event, 'doctors')" 
            class="block px-4 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-teal-50 hover:text-teal-700"
          >
            Doctors
          </a>
          <a 
            href="#reviews" 
            (click)="scrollToSection($event, 'reviews')" 
            class="block px-4 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-teal-50 hover:text-teal-700"
          >
            Review
          </a>
          <a 
            href="#faqs" 
            (click)="scrollToSection($event, 'faqs')" 
            class="block px-4 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-teal-50 hover:text-teal-700"
          >
            FAQs
          </a>
          <a 
            href="#callback" 
            (click)="scrollToSection($event, 'callback')" 
            class="block px-4 py-2.5 rounded-lg text-base font-semibold text-slate-800 hover:bg-teal-50 hover:text-teal-700"
          >
            Call back
          </a>

          <div class="pt-2.5 border-t border-slate-100">
            @if (authService.isLoggedIn()) {
              <a 
                [routerLink]="authService.isReceptionist() ? '/receptionist' : (authService.isNurse() ? '/nurse' : '/patient-portal')" 
                (click)="isMobileMenuOpen.set(false)"
                class="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-teal-600 text-white text-base font-bold shadow-md cursor-pointer"
              >
                <app-avatar [name]="authService.isReceptionist() ? (authService.currentReceptionist()?.name || 'Receptionist') : (authService.isNurse() ? (authService.currentNurse()?.name || 'Nurse') : (authService.currentPatient()?.name || 'Patient'))" sizeClass="w-6 h-6 rounded-full" />
                <span>Open {{ authService.isReceptionist() ? 'Reception Desk' : (authService.isNurse() ? 'Nurse Station' : 'Patient Portal') }}</span>
              </a>
            } @else {
              <a 
                routerLink="/login" 
                (click)="isMobileMenuOpen.set(false)"
                class="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-teal-600 text-white text-base font-bold shadow-md cursor-pointer"
              >
                <app-icon name="user" wrapperClass="w-4.5 h-4.5 text-white" />
                <span>Login</span>
              </a>
            }
          </div>
        </div>
      }
    </header>
  `
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);
  private readonly router = inject(Router);

  readonly isScrolled = signal<boolean>(false);
  readonly isMobileMenuOpen = signal<boolean>(false);

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }

  scrollToSection(event: Event, sectionId: string): void {
    const isLandingPage = window.location.pathname === '/' || window.location.pathname === '';
    if (!isLandingPage) {
      this.isMobileMenuOpen.set(false);
      this.router.navigate(['/'], { fragment: sectionId });
      return;
    }

    event.preventDefault();
    this.isMobileMenuOpen.set(false);

    const element = document.getElementById(sectionId);
    if (element) {
      const navOffset = 60;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}
