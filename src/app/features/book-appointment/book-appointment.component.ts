import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { IconComponent } from '../../shared/icons/icon.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

export interface DoctorDirectoryItem {
  id: string;
  name: string;
  specialty: string;
  degrees: string;
  experienceYears: number;
  hospitalLocation: string;
  city: string;
  gender: 'Male' | 'Female';
  languages: string[];
  avatar: string;
  rating?: number;
}

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-screen w-full bg-[#f5f5f5] text-slate-900 flex flex-col overflow-hidden selection:bg-teal-500 selection:text-white relative">
      
      <!-- ============================================================= -->
      <!-- TOP NAVIGATION BAR -->
      <!-- ============================================================= -->
      <header class="h-16 w-full shrink-0 border-b border-slate-200 bg-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs z-40">
        
        <!-- Left: Brand Logo & Tag -->
        <a routerLink="/patient-portal" class="flex items-center gap-2.5 group cursor-pointer shrink-0">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <app-icon name="heart-cross" wrapperClass="w-5 h-5 text-white" />
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-bold tracking-tight text-slate-900 leading-none group-hover:text-teal-700 transition-colors">
              HMS
            </span>
            <span class="text-xs uppercase font-semibold tracking-wider text-teal-600 leading-tight">
              Patient Portal
            </span>
          </div>
        </a>

        <!-- Right Side: Dashboard Link & Patient Profile & Logout -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <!-- Back to Dashboard -->
          <a 
            routerLink="/patient-portal" 
            class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-800 text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <app-icon name="layout-dashboard" wrapperClass="w-4 h-4 text-teal-600" />
            <span class="hidden sm:inline">My Dashboard</span>
          </a>

          <!-- Patient Profile Chip -->
          <div class="flex items-center gap-2 bg-slate-100/90 border border-slate-200 rounded-full py-1 pl-1.5 pr-3">
            <app-avatar [name]="patient()?.name || 'Patient'" sizeClass="w-7 h-7 rounded-full" />
            <div class="flex flex-col text-left hidden sm:flex">
              <span class="text-xs font-bold text-slate-800 leading-tight">{{ patient()?.name || 'Patient' }}</span>
              <span class="text-xs text-teal-700 font-medium leading-none">{{ patient()?.id || 'PT-94821' }}</span>
            </div>
          </div>

          <!-- Logout Button -->
          <button 
            type="button" 
            (click)="onLogout()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-700 text-xs font-semibold transition cursor-pointer group shadow-2xs"
            aria-label="Logout"
          >
            <app-icon name="log-out" wrapperClass="w-4 h-4 text-slate-600 group-hover:text-rose-600 transition" />
            <span class="hidden sm:inline">Logout</span>
          </button>
        </div>

      </header>

      <!-- ============================================================= -->
      <!-- DUAL SECTION LAYOUT: LEFT FILTER & RIGHT DOCTORS -->
      <!-- ============================================================= -->
      <div class="flex flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden">
        
        <!-- =========================================================== -->
        <!-- SECTION 1 (LEFT): FILTER BY SIDEBAR (Fixed Left Section) -->
        <!-- =========================================================== -->
        <aside class="w-72 sm:w-80 h-full bg-white border-r border-slate-200 shadow-xs flex flex-col shrink-0 overflow-y-auto select-none z-20">
          
          <!-- Filter Header -->
          <div class="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
            <div class="flex items-center gap-2 text-slate-900 font-bold text-base sm:text-lg">
              <app-icon name="filter" wrapperClass="w-5 h-5 text-teal-600" />
              <span>Filter By</span>
            </div>

            @if (hasActiveFilters()) {
              <button 
                type="button" 
                (click)="clearAllFilters()"
                class="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer transition"
              >
                Clear All
              </button>
            }
          </div>

          <div class="divide-y divide-slate-100 text-slate-800 text-sm flex-1">
            
            <!-- 1. Specialities Accordion -->
            <div class="p-4 sm:p-5">
              <button 
                type="button" 
                (click)="isSpecialtiesOpen.set(!isSpecialtiesOpen())"
                class="w-full flex items-center justify-between font-bold text-slate-900 cursor-pointer"
              >
                <span class="text-sm font-bold">Specialities</span>
                <app-icon 
                  name="chevron-down" 
                  wrapperClass="w-4 h-4 text-slate-500 transition-transform duration-200" 
                  [class.rotate-180]="isSpecialtiesOpen()" 
                />
              </button>

              @if (isSpecialtiesOpen()) {
                <div class="mt-3.5 space-y-3 animate-fade-in">
                  
                  <!-- Search Speciality Input -->
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <app-icon name="search" wrapperClass="w-3.5 h-3.5" />
                    </div>
                    <input 
                      type="text" 
                      [(ngModel)]="specialtySearchQuery"
                      placeholder="Search Speciality"
                      class="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                    />
                  </div>

                  <!-- Speciality Checkbox List -->
                  <div class="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    @for (spec of filteredSpecialtiesList(); track spec) {
                      <label class="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          [checked]="selectedSpecialties().includes(spec)"
                          (change)="toggleSpecialty(spec)"
                          class="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        />
                        <span class="truncate">{{ spec }}</span>
                      </label>
                    }
                  </div>

                </div>
              }
            </div>

            <!-- 2. Gender Accordion -->
            <div class="p-4 sm:p-5">
              <button 
                type="button" 
                (click)="isGenderOpen.set(!isGenderOpen())"
                class="w-full flex items-center justify-between font-bold text-slate-900 cursor-pointer"
              >
                <span class="text-sm font-bold">Gender</span>
                <app-icon 
                  name="chevron-down" 
                  wrapperClass="w-4 h-4 text-slate-500 transition-transform duration-200" 
                  [class.rotate-180]="isGenderOpen()" 
                />
              </button>

              @if (isGenderOpen()) {
                <div class="mt-3.5 space-y-2 animate-fade-in">
                  <label class="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      [checked]="selectedGenders().includes('Male')"
                      (change)="toggleGender('Male')"
                      class="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <span>Male</span>
                  </label>
                  <label class="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      [checked]="selectedGenders().includes('Female')"
                      (change)="toggleGender('Female')"
                      class="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                    <span>Female</span>
                  </label>
                </div>
              }
            </div>

            <!-- 3. Language Accordion -->
            <div class="p-4 sm:p-5">
              <button 
                type="button" 
                (click)="isLanguageOpen.set(!isLanguageOpen())"
                class="w-full flex items-center justify-between font-bold text-slate-900 cursor-pointer"
              >
                <span class="text-sm font-bold">Language</span>
                <app-icon 
                  name="chevron-down" 
                  wrapperClass="w-4 h-4 text-slate-500 transition-transform duration-200" 
                  [class.rotate-180]="isLanguageOpen()" 
                />
              </button>

              @if (isLanguageOpen()) {
                <div class="mt-3.5 space-y-2 animate-fade-in max-h-40 overflow-y-auto pr-1">
                  @for (lang of availableLanguages; track lang) {
                    <label class="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        [checked]="selectedLanguages().includes(lang)"
                        (change)="toggleLanguage(lang)"
                        class="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                      <span>{{ lang }}</span>
                    </label>
                  }
                </div>
              }
            </div>

          </div>

        </aside>

        <!-- =========================================================== -->
        <!-- SECTION 2 (RIGHT): DOCTORS DISPLAY (Scrolls independently) -->
        <!-- =========================================================== -->
        <div class="flex-1 h-full min-w-0 flex flex-col overflow-y-auto bg-slate-50">
          <main class="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 w-full">
            
            <!-- Top Search & Results Header Bar -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
              
              <!-- Left Title: Meet Our Experts (count) -->
              <div class="flex items-center gap-2">
                <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Meet Our <span class="text-teal-700 italic">Experts</span>
                  <span class="text-slate-500 font-semibold text-base sm:text-lg ml-1">({{ filteredDoctors().length }})</span>
                </h2>
              </div>

              <!-- Right: Search for Doctors Bar -->
              <div class="relative w-full sm:w-80">
                <input 
                  type="text" 
                  [(ngModel)]="doctorSearchQuery"
                  placeholder="Search for Doctors"
                  class="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-2xs"
                />
                <button 
                  type="button" 
                  class="absolute inset-y-1 right-1 w-9 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center cursor-pointer transition shadow-2xs active:scale-95"
                  aria-label="Search"
                >
                  <app-icon name="search" wrapperClass="w-4 h-4" />
                </button>
              </div>

            </div>

            <!-- Doctor Cards Grid (2 columns on medium/large screens) -->
            @if (filteredDoctors().length > 0) {
              <div class="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
                @for (doc of filteredDoctors(); track doc.id) {
                  <div class="bg-white border border-slate-200 rounded-3xl shadow-xs hover:border-teal-400 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group">
                    
                    <!-- Doctor Info Body -->
                    <div class="p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-4">
                      
                      <!-- Doctor Photo Avatar with Gradient Background & Enlarged Middle Circle -->
                      <div class="w-28 h-32 sm:w-32 sm:h-36 rounded-2xl bg-gradient-to-br from-teal-500/15 via-teal-100/50 to-emerald-100/70 border border-teal-200/90 overflow-hidden shrink-0 flex items-center justify-center shadow-xs relative group-hover:scale-105 transition-all">
                        <!-- Soft Ambient Glow Ring -->
                        <div class="absolute w-24 h-24 rounded-full bg-white/60 blur-xs"></div>
                        
                        <!-- Middle Circle Avatar (Enlarged & Prominent) -->
                        <div class="relative z-10">
                          <app-avatar 
                            [src]="doc.avatar" 
                            [name]="doc.name" 
                            sizeClass="w-16 h-16 sm:w-18 sm:h-18 rounded-full shadow-md ring-4 ring-white/90 border border-teal-300/80" 
                            textSizeClass="text-xl sm:text-2xl font-bold tracking-tight"
                          />
                        </div>
                      </div>

                      <!-- Details Column -->
                      <div class="flex-1 min-w-0 space-y-1.5">
                        
                        <!-- Name -->
                        <h3 class="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                          {{ doc.name }}
                        </h3>

                        <!-- Specialty -->
                        <p class="text-xs sm:text-sm font-semibold text-teal-800 leading-snug">
                          {{ doc.specialty }}
                        </p>

                        <!-- Experience & Qualifications -->
                        <p class="text-xs text-slate-600 font-medium leading-relaxed">
                          <strong class="text-slate-800">{{ doc.experienceYears }}+ Years</strong> , {{ doc.degrees }}
                        </p>

                        <!-- Subtle Divider -->
                        <div class="w-12 h-0.5 bg-teal-500/60 my-2 rounded-full"></div>

                        <!-- Hospital Clinic Location -->
                        <p class="text-xs text-slate-700 flex items-center gap-1.5 font-medium pt-0.5">
                          <span class="w-2 h-2 rounded-full border-2 border-teal-600 shrink-0"></span>
                          <span class="truncate">{{ doc.hospitalLocation }}</span>
                        </p>

                      </div>

                    </div>

                    <!-- Bottom Action Button: Book Appointment (NO Call Now button as requested) -->
                    <div class="border-t border-slate-100 bg-slate-50/50 p-3 sm:p-4">
                      <button 
                        type="button" 
                        (click)="bookDoctor(doc)"
                        class="w-full py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-xs hover:shadow-md active:scale-98 group/btn"
                      >
                        <span>Book Appointment</span>
                        <app-icon name="arrow-up-right" wrapperClass="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </button>
                    </div>

                  </div>
                }
              </div>
            } @else {
              <!-- Empty State if no doctors match filters -->
              <div class="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
                <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <app-icon name="search" wrapperClass="w-8 h-8" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-slate-900">No Doctors Found</h3>
                  <p class="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                    No medical specialists matched your current filter criteria. Try searching with different keywords or clearing filters.
                  </p>
                </div>
                <button 
                  type="button" 
                  (click)="clearAllFilters()"
                  class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  <app-icon name="filter" wrapperClass="w-4 h-4" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            }

          </main>

      </div>

      <!-- ============================================================= -->
      <!-- APPOINTMENT TIME SLOT & PAYMENT POPUP MODAL -->
      <!-- ============================================================= -->
      @if (selectedDoctorForSlot(); as doc) {
        <div 
          class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in" 
          (click)="closeBookingModal()"
        >
          <div 
            class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] animate-scale-up" 
            (click)="$event.stopPropagation()"
          >
            
            <!-- Modal Header & Handle Bar -->
            <div class="pt-3.5 px-6 pb-3 border-b border-slate-100 flex flex-col items-center">
              <div class="w-12 h-1 bg-slate-200 rounded-full mb-3"></div>
              
              <div class="w-full flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <app-avatar [src]="doc.avatar" [name]="doc.name" sizeClass="w-10 h-10 rounded-xl" />
                  <div class="text-left">
                    <h4 class="font-bold text-slate-900 text-sm leading-tight">{{ doc.name }}</h4>
                    <p class="text-xs text-teal-700 font-semibold mt-0.5">{{ doc.specialty }} • <span class="text-slate-500 font-normal">{{ doc.hospitalLocation }}</span></p>
                  </div>
                </div>

                <button 
                  type="button" 
                  (click)="closeBookingModal()"
                  class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  aria-label="Close modal"
                >
                  <app-icon name="x" wrapperClass="w-4 h-4" />
                </button>
              </div>

              <!-- Main Modal Title -->
              <h3 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight text-center mt-3 select-none">
                Select Time Slot
              </h3>
            </div>

            <!-- Modal Body (Scrollable) -->
            <div class="p-5 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar">
              
              <!-- 1. Dates Horizontal Selector (Matching Image) -->
              <div class="flex items-center gap-2 overflow-x-auto py-1.5 px-0.5 custom-scrollbar">
                @for (d of availableDates; track d.dayNum; let idx = $index) {
                  <button 
                    type="button" 
                    (click)="selectedDateIndex.set(idx)"
                    class="flex flex-col items-center justify-center min-w-[3.5rem] sm:min-w-[3.75rem] py-2 px-1.5 rounded-xl transition-all cursor-pointer select-none shrink-0"
                    [class]="selectedDateIndex() === idx 
                      ? 'bg-teal-50 border-2 border-teal-600 text-teal-900 shadow-2xs font-bold' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-300 hover:bg-slate-50 font-medium'"
                  >
                    <span class="text-xs font-semibold tracking-wider leading-none" [class.text-teal-700]="selectedDateIndex() === idx">{{ d.dayName }}</span>
                    <span class="text-base font-bold mt-1 leading-none" [class.text-teal-950]="selectedDateIndex() === idx">{{ d.dayNum }}</span>
                  </button>
                }
              </div>

              <!-- 2. Available Slots Header -->
              <div class="flex items-center justify-between text-xs sm:text-sm font-bold pt-1">
                <span class="text-slate-900">Available Slots</span>
                <span class="text-teal-700 font-semibold">{{ availableDates[selectedDateIndex()].fullDate }}</span>
              </div>

              <!-- 3. Time Slots Grid (2 Columns, matching referral image) -->
              <div class="grid grid-cols-2 gap-2.5 sm:gap-3">
                @for (slot of availableTimeSlots; track slot) {
                  <button 
                    type="button" 
                    (click)="selectedTimeSlot.set(slot)"
                    class="py-3 px-2.5 rounded-2xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center select-none"
                    [class]="selectedTimeSlot() === slot 
                      ? 'bg-teal-600 border-teal-700 text-white shadow-sm scale-[1.02]' 
                      : 'bg-white border-slate-200/90 text-slate-800 hover:border-teal-300 hover:bg-teal-50/40 shadow-2xs'"
                  >
                    <span>{{ slot }}</span>
                  </button>
                }
              </div>

            </div>

            <!-- Modal Footer Actions (Cancel & Book Appointment buttons) -->
            <div class="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
              <button 
                type="button" 
                (click)="closeBookingModal()"
                class="flex-1 py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm transition cursor-pointer text-center"
              >
                Cancel
              </button>

              <button 
                type="button" 
                (click)="proceedToPayment()"
                [disabled]="isProcessingPayment()"
                class="flex-1 py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                @if (isProcessingPayment()) {
                  <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Booking...</span>
                } @else {
                  <span>Book Appointment</span>
                  <app-icon name="arrow-up-right" wrapperClass="w-4 h-4" />
                }
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class BookAppointmentComponent {
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  patient = this.authService.currentPatient;

  // Filter Accordion Toggles
  isSpecialtiesOpen = signal(true);
  isGenderOpen = signal(true);
  isLanguageOpen = signal(true);

  // Search & Filter State
  specialtySearchQuery = signal('');
  doctorSearchQuery = signal('');

  selectedSpecialties = signal<string[]>([]);
  selectedGenders = signal<string[]>([]);
  selectedLanguages = signal<string[]>([]);

  // Filter Options Catalog
  readonly availableSpecialties: string[] = [
    'Anaesthesiology',
    'Bariatrics',
    'Cardiac Sciences',
    'Cosmetology & Plastic Surgery',
    'Critical Care',
    'Dentistry',
    'Dermatology',
    'Dietician and Nutrition',
    'ENT',
    'Gastroenterology',
    'General Medicine',
    'Neurology',
    'Obstetrics & Gynecology',
    'Oncology',
    'Ophthalmology',
    'Orthopedics',
    'Pediatrics',
    'Pulmonology',
    'Urology'
  ];

  readonly availableLanguages: string[] = [
    'English',
    'Telugu',
    'Hindi'
  ];

  // Rich Doctors Catalog
  readonly doctorsList: DoctorDirectoryItem[] = [
    {
      id: 'doc-1',
      name: 'Dr P L Dhingra',
      specialty: 'ENT',
      degrees: 'MBBS, DLO, MS (ENT)',
      experienceYears: 61,
      hospitalLocation: 'HMS Hospitals, Delhi',
      city: 'Delhi',
      gender: 'Male',
      languages: ['English', 'Hindi'],
      avatar: 'assets/images/doctors/dr-sarah-jenkins.png',
      rating: 4.98
    },
    {
      id: 'doc-2',
      name: 'Dr Alaka Goswami',
      specialty: 'Obstetrics & Gynecology',
      degrees: 'MS, FICOG',
      experienceYears: 57,
      hospitalLocation: 'HMS Hospitals, Guwahati',
      city: 'Guwahati',
      gender: 'Female',
      languages: ['English', 'Telugu', 'Hindi'],
      avatar: 'assets/images/doctors/dr-elena-rostova.png',
      rating: 4.95
    },
    {
      id: 'doc-3',
      name: 'Dr. Sarah Jenkins, MD',
      specialty: 'Cardiac Sciences',
      degrees: 'MD, FACC, DM (Cardiology)',
      experienceYears: 16,
      hospitalLocation: 'HMS Multi-Specialty, Hyderabad',
      city: 'Hyderabad',
      gender: 'Female',
      languages: ['English', 'Telugu', 'Hindi'],
      avatar: 'assets/images/doctors/dr-sarah-jenkins.png',
      rating: 4.96
    },
    {
      id: 'doc-4',
      name: 'Dr. Michael Chen, MD',
      specialty: 'Neurology',
      degrees: 'MD, DM, PhD (Neuro)',
      experienceYears: 18,
      hospitalLocation: 'HMS Neurosciences, Bengaluru',
      city: 'Bengaluru',
      gender: 'Male',
      languages: ['English', 'Telugu', 'Kannada'],
      avatar: 'assets/images/doctors/dr-michael-chen.png',
      rating: 4.94
    },
    {
      id: 'doc-5',
      name: 'Dr Kalyanpury Jawaharlal Choudhury',
      specialty: 'Anaesthesiology',
      degrees: 'MBBS, MD (Anaesth), FICA',
      experienceYears: 42,
      hospitalLocation: 'HMS Hospitals, Delhi',
      city: 'Delhi',
      gender: 'Male',
      languages: ['English', 'Telugu', 'Hindi'],
      avatar: 'assets/images/doctors/dr-michael-chen.png',
      rating: 4.91
    },
    {
      id: 'doc-6',
      name: 'Dr Sheroo Zamindar',
      specialty: 'Obstetrics & Gynecology',
      degrees: 'MBBS, MD (Med), FRCOG',
      experienceYears: 52,
      hospitalLocation: 'HMS Women & Child Care, Mumbai',
      city: 'Mumbai',
      gender: 'Female',
      languages: ['English', 'Marathi', 'Hindi'],
      avatar: 'assets/images/doctors/dr-elena-rostova.png',
      rating: 4.97
    },
    {
      id: 'doc-7',
      name: 'Dr. Elena Rostova, MD',
      specialty: 'Oncology',
      degrees: 'MD, DM (Oncology), PhD',
      experienceYears: 15,
      hospitalLocation: 'HMS Cancer Institute, Chennai',
      city: 'Chennai',
      gender: 'Female',
      languages: ['English', 'Tamil', 'Hindi'],
      avatar: 'assets/images/doctors/dr-elena-rostova.png',
      rating: 4.93
    },
    {
      id: 'doc-8',
      name: 'Dr. Marcus Brody, MD',
      specialty: 'Orthopedics',
      degrees: 'MS (Ortho), MCh, FAAOS',
      experienceYears: 20,
      hospitalLocation: 'HMS Joint & Spine, Hyderabad',
      city: 'Hyderabad',
      gender: 'Male',
      languages: ['English', 'Telugu'],
      avatar: 'assets/images/doctors/dr-michael-chen.png',
      rating: 4.89
    },
    {
      id: 'doc-9',
      name: 'Dr. Aisha Patel, MD',
      specialty: 'Pediatrics',
      degrees: 'MD (Pediatrics), DNB, FAAP',
      experienceYears: 12,
      hospitalLocation: 'HMS Childrens Center, Mumbai',
      city: 'Mumbai',
      gender: 'Female',
      languages: ['English', 'Hindi', 'Gujarati'],
      avatar: 'assets/images/doctors/dr-sarah-jenkins.png',
      rating: 4.97
    },
    {
      id: 'doc-10',
      name: 'Dr. David Kim, MD',
      specialty: 'Dermatology',
      degrees: 'MD (Derm), DNB, FAAD',
      experienceYears: 11,
      hospitalLocation: 'HMS Skin & Aesthetic Center, Bengaluru',
      city: 'Bengaluru',
      gender: 'Male',
      languages: ['English', 'Kannada', 'Hindi'],
      avatar: 'assets/images/doctors/dr-michael-chen.png',
      rating: 4.88
    },
    {
      id: 'doc-11',
      name: 'Dr. Ananya Iyer, MD',
      specialty: 'Pulmonology',
      degrees: 'MD, DNB, FCCP (Pulm)',
      experienceYears: 14,
      hospitalLocation: 'HMS Respiratory Center, Kolkata',
      city: 'Kolkata',
      gender: 'Female',
      languages: ['English', 'Bengali', 'Hindi'],
      avatar: 'assets/images/doctors/dr-sarah-jenkins.png',
      rating: 4.92
    },
    {
      id: 'doc-12',
      name: 'Dr. Robert Hayes, MD',
      specialty: 'Gastroenterology',
      degrees: 'MD, DM (Gastro), FACG',
      experienceYears: 22,
      hospitalLocation: 'HMS Digestive Care, Pune',
      city: 'Pune',
      gender: 'Male',
      languages: ['English', 'Hindi', 'Marathi'],
      avatar: 'assets/images/doctors/dr-michael-chen.png',
      rating: 4.9
    }
  ];

  // Filtered Specialties inside the filter search box
  filteredSpecialtiesList = computed(() => {
    const q = this.specialtySearchQuery().toLowerCase().trim();
    if (!q) return this.availableSpecialties;
    return this.availableSpecialties.filter(s => s.toLowerCase().includes(q));
  });

  // Filtered Doctors list
  filteredDoctors = computed(() => {
    const dQuery = this.doctorSearchQuery().toLowerCase().trim();
    const specs = this.selectedSpecialties();
    const genders = this.selectedGenders();
    const langs = this.selectedLanguages();

    return this.doctorsList.filter(doc => {
      // Search Query filter
      if (dQuery) {
        const matchesName = doc.name.toLowerCase().includes(dQuery);
        const matchesSpec = doc.specialty.toLowerCase().includes(dQuery);
        const matchesLoc = doc.hospitalLocation.toLowerCase().includes(dQuery);
        if (!matchesName && !matchesSpec && !matchesLoc) return false;
      }

      // Specialty filter
      if (specs.length > 0) {
        if (!specs.some(s => doc.specialty.toLowerCase().includes(s.toLowerCase()))) {
          return false;
        }
      }

      // Gender filter
      if (genders.length > 0) {
        if (!genders.includes(doc.gender)) {
          return false;
        }
      }

      // Language filter
      if (langs.length > 0) {
        if (!langs.some(l => doc.languages.includes(l))) {
          return false;
        }
      }

      return true;
    });
  });

  hasActiveFilters = computed(() => {
    return (
      this.selectedSpecialties().length > 0 ||
      this.selectedGenders().length > 0 ||
      this.selectedLanguages().length > 0 ||
      !!this.doctorSearchQuery() ||
      !!this.specialtySearchQuery()
    );
  });

  // Toggle Methods
  toggleSpecialty(spec: string): void {
    this.selectedSpecialties.update(list =>
      list.includes(spec) ? list.filter(item => item !== spec) : [...list, spec]
    );
  }

  toggleGender(gender: string): void {
    this.selectedGenders.update(list =>
      list.includes(gender) ? list.filter(item => item !== gender) : [...list, gender]
    );
  }

  toggleLanguage(lang: string): void {
    this.selectedLanguages.update(list =>
      list.includes(lang) ? list.filter(item => item !== lang) : [...list, lang]
    );
  }

  clearAllFilters(): void {
    this.selectedSpecialties.set([]);
    this.selectedGenders.set([]);
    this.selectedLanguages.set([]);
    this.doctorSearchQuery.set('');
    this.specialtySearchQuery.set('');
  }

  // Booking Time Slot Popup Modal State
  selectedDoctorForSlot = signal<DoctorDirectoryItem | null>(null);
  selectedDateIndex = signal<number>(0);
  selectedTimeSlot = signal<string>('09:00 AM - 10:00 AM');
  isProcessingPayment = signal<boolean>(false);

  readonly availableDates: { dayName: string; dayNum: string; fullDate: string }[] = [
    { dayName: 'FRI', dayNum: '21', fullDate: 'Friday Aug 21, 2026' },
    { dayName: 'SAT', dayNum: '22', fullDate: 'Saturday Aug 22, 2026' },
    { dayName: 'SUN', dayNum: '23', fullDate: 'Sunday Aug 23, 2026' },
    { dayName: 'MON', dayNum: '24', fullDate: 'Monday Aug 24, 2026' },
    { dayName: 'TUE', dayNum: '25', fullDate: 'Tuesday Aug 25, 2026' },
    { dayName: 'WED', dayNum: '26', fullDate: 'Wednesday Aug 26, 2026' },
    { dayName: 'THU', dayNum: '27', fullDate: 'Thursday Aug 27, 2026' }
  ];

  readonly availableTimeSlots: string[] = [
    '06:00 AM - 07:00 AM',
    '07:00 AM - 08:00 AM',
    '08:00 AM - 09:00 AM',
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '01:00 PM - 02:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM'
  ];

  bookDoctor(doc: DoctorDirectoryItem): void {
    this.selectedDoctorForSlot.set(doc);
    this.selectedDateIndex.set(0);
    this.selectedTimeSlot.set('09:00 AM - 10:00 AM');
  }

  closeBookingModal(): void {
    this.selectedDoctorForSlot.set(null);
  }

  proceedToPayment(): void {
    const doc = this.selectedDoctorForSlot();
    if (!doc) return;

    const date = this.availableDates[this.selectedDateIndex()];
    const slot = this.selectedTimeSlot();

    this.modalService.confirm({
      title: 'Confirm Appointment Booking',
      message: `Are you sure you want to book this consultation with ${doc.name} (${doc.specialty}) on ${date.dayName} ${date.dayNum} at ${slot}?`,
      confirmText: 'Confirm & Book',
      cancelText: 'Review Time Slot',
      type: 'primary',
      icon: 'calendar',
      onConfirm: () => {
        this.isProcessingPayment.set(true);

        setTimeout(() => {
          this.isProcessingPayment.set(false);
          this.closeBookingModal();
          this.modalService.showToast(
            'Appointment Confirmed',
            `Consultation successfully booked with ${doc.name} for ${date.dayName} ${date.dayNum} at ${slot}.`,
            'success'
          );
        }, 800);
      }
    });
  }

  onLogout(): void {
    this.modalService.confirm({
      title: 'Confirm Logout',
      message: 'Are you sure you want to end your patient session and log out?',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'log-out',
      onConfirm: () => {
        this.authService.logout();
        this.router.navigate(['/']);
      }
    });
  }
}
