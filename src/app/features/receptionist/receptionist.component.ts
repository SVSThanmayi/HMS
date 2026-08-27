import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { IconComponent } from '../../shared/icons/icon.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

export interface PatientVitals {
  bp: string;
  pulse: string;
  temp: string;
  spo2: string;
  weight: string;
  bmi: string;
  bloodSugar: string;
  recordedAt: string;
}

export interface PatientAllergy {
  allergen: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  reaction: string;
  diagnosedDate?: string;
  duration?: string;
  status?: string;
  diagnosedBy?: string;
}

export interface PatientChronicCondition {
  condition: string;
  diagnosedDate: string;
  severity?: string;
  doctor?: string;
  duration?: string;
  status: string;
  notes?: string;
}

export interface PatientMedication {
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  doctor: string;
  startDate: string;
  refillsRemaining: number;
  pharmacy: string;
}

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PrescriptionDetails {
  rxNumber: string;
  date: string;
  doctorReg: string;
  diagnosis: string;
  clinicalNotes: string;
  medicines: PrescriptionMedicine[];
  advice: string[];
  nextFollowUp: string;
}

export interface ReceiptItem {
  description: string;
  code: string;
  quantity: number;
  price: number;
}

export interface ReceiptDetails {
  receiptNumber: string;
  invoiceDate: string;
  paymentStatus: 'PAID' | 'COMPLETED';
  paymentMethod: string;
  transactionId: string;
  items: ReceiptItem[];
  subtotal: number;
  insuranceCoveragePercent: number;
  insuranceCoveredAmount: number;
  copayAmount: number;
  tax: number;
  totalPaid: number;
}

export interface PatientPreviousVisit {
  id: string;
  date: string;
  timeSlot?: string;
  doctorName: string;
  specialty: string;
  room: string;
  reason: string;
  diagnosis: string;
  type: string;
  status: string;
  prescription?: PrescriptionDetails;
  receipt?: ReceiptDetails;
}

export interface PatientLabParameter {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'High' | 'Low';
}

export interface PatientHealthRecord {
  id: string;
  testName: string;
  category: string;
  doctor: string;
  date: string;
  locationType: 'Hospital' | 'Out';
  locationName: string;
  status: 'Normal' | 'Completed' | 'Pending Review';
  summary: string;
  parameters?: PatientLabParameter[];
  receipt?: ReceiptDetails;
}

export interface RegisteredPatient {
  id: string;
  name: string;
  dob: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  occupation: string;
  maritalStatus: string;
  nationalId: string;
  emergencyContact: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  primaryPhysician: string;
  tokenNumber?: string;
  vitals: PatientVitals;
  previousVitals?: PatientVitals[];
  allergies: PatientAllergy[];
  chronicConditions: string[];
  chronicConditionsList?: PatientChronicCondition[];
  currentMedications: PatientMedication[];
  previousVisits: PatientPreviousVisit[];
  healthRecords: PatientHealthRecord[];
}

export interface OnlineAppointment {
  id: string;
  patientName: string;
  patientId: string;
  phone: string;
  doctorName: string;
  department: string;
  room: string;
  date: string;
  timeSlot: string;
  symptoms: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Rescheduled';
  cancelReason?: string;
}

export interface CallbackItem {
  id: string;
  name: string;
  phone: string;
  preferredTime: string;
  note?: string;
  date?: string;
  time?: string;
  patientType?: 'Old Patient' | 'New Patient';
  status?: 'Pending' | 'Resolved';
}

export interface TokenItem {
  tokenNumber: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  department: string;
  room: string;
  time: string;
  type: 'Online Appointment' | 'Physical Walk-In' | 'Phone Callback' | 'Emergency';
  status: 'Waiting' | 'In Consultation';
}

export interface DoctorStatus {
  id: string;
  name: string;
  specialty: string;
  room: string;
  status: 'Available' | 'In Consultation';
  queueLength: number;
  currentPatientToken: string;
}

export interface BookingDateOption {
  dayOfWeek: string;
  dayNumber: string;
  fullDate: string;
  isAvailable?: boolean;
}

type TabKey = 'queue' | 'online' | 'callbacks';
type PatientDetailsTab = 'personal' | 'clinical' | 'medications' | 'visits' | 'records';

@Component({
  selector: 'app-receptionist',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, IconComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-screen w-full bg-[#f5f5f5] text-slate-900 flex flex-col overflow-hidden selection:bg-teal-500 selection:text-white relative">
      
      <!-- ============================================================= -->
      <!-- TOP NAVIGATION BAR (FULL WIDTH AT TOP, FIXED) -->
      <!-- ============================================================= -->
      <header class="h-16 w-full shrink-0 border-b border-slate-200 bg-white px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs z-40">
        
        <!-- Left: Brand Logo & Tag -->
        <a routerLink="/" class="flex items-center gap-2.5 group cursor-pointer shrink-0">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <app-icon name="heart-cross" wrapperClass="w-5 h-5 text-white" />
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-bold tracking-tight text-slate-900 leading-none group-hover:text-teal-700 transition-colors">
              HMS
            </span>
            <span class="text-xs uppercase font-semibold tracking-wider text-teal-600 leading-tight">
              Healthcare Portal
            </span>
          </div>
        </a>

        <!-- Right Side: Receptionist Profile Badge & Logout -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <div class="flex items-center gap-2 bg-slate-100/90 border border-slate-200 rounded-full py-1 pl-1.5 pr-3">
            <app-avatar [name]="receptionist()?.name || 'Receptionist'" sizeClass="w-7 h-7 rounded-full" />
            <div class="flex flex-col text-left hidden sm:flex">
              <span class="text-xs font-bold text-slate-800 leading-tight">
                {{ receptionist()?.name || 'Sarah Jenkins' }}
              </span>
              <span class="text-xs text-teal-700 font-medium leading-none">
                Receptionist ({{ receptionist()?.id || 'REC-4029' }})
              </span>
            </div>
          </div>

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
      <!-- 2 SIDE-BY-SIDE SECTIONS UNDER NAVBAR: SIDE MENU & DISPLAY SECTION -->
      <!-- ============================================================= -->
      <div class="flex flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden">
        
        <!-- ============================================================= -->
        <!-- SECTION 1 (LEFT): SIDE MENU BAR (FIXED, SLIDE ON HOVER) -->
        <!-- ============================================================= -->
        <aside 
          class="group/sidebar h-full w-16 hover:w-64 bg-white border-r border-slate-200 shadow-xs flex flex-col justify-between z-30 transition-[width] duration-300 ease-in-out shrink-0 select-none overflow-hidden px-2.5 pt-4 pb-4"
        >
          <!-- Navigation Menu List: Patients Queue, Online Appointments, Call Back Requests -->
          <nav class="space-y-2">
            
            <!-- 1. Patients Queue -->
            <button 
              type="button" 
              (click)="activeTab.set('queue')"
              class="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer group/btn"
              [class]="activeTab() === 'queue' 
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'"
            >
              <div class="w-5 h-5 flex items-center justify-center shrink-0">
                <app-icon 
                  name="stethoscope" 
                  [wrapperClass]="activeTab() === 'queue' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-500 group-hover/btn:text-teal-600 transition-colors'" 
                />
              </div>
              <span class="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden flex items-center justify-between flex-1">
                <span>Patients Queue</span>
                @if (activeQueueCount() > 0) {
                  <span 
                    class="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                    [class]="activeTab() === 'queue' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'"
                  >
                    {{ activeQueueCount() }}
                  </span>
                }
              </span>
            </button>

            <!-- 2. Online Appointments -->
            <button 
              type="button" 
              (click)="activeTab.set('online')"
              class="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer group/btn"
              [class]="activeTab() === 'online' 
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'"
            >
              <div class="w-5 h-5 flex items-center justify-center shrink-0">
                <app-icon 
                  name="calendar" 
                  [wrapperClass]="activeTab() === 'online' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-500 group-hover/btn:text-teal-600 transition-colors'" 
                />
              </div>
              <span class="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden flex items-center justify-between flex-1">
                <span>Online Appointments</span>
                @if (pendingOnlineCount() > 0) {
                  <span 
                    class="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                    [class]="activeTab() === 'online' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'"
                  >
                    {{ pendingOnlineCount() }}
                  </span>
                }
              </span>
            </button>

            <!-- 3. Call Back Requests -->
            <button 
              type="button" 
              (click)="activeTab.set('callbacks')"
              class="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer group/btn"
              [class]="activeTab() === 'callbacks' 
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'"
            >
              <div class="w-5 h-5 flex items-center justify-center shrink-0">
                <app-icon 
                  name="phone" 
                  [wrapperClass]="activeTab() === 'callbacks' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-500 group-hover/btn:text-teal-600 transition-colors'" 
                />
              </div>
              <span class="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden flex items-center justify-between flex-1">
                <span>Call Back Requests</span>
                @if (pendingCallbackCount() > 0) {
                  <span 
                    class="ml-auto text-xs px-2 py-0.5 rounded-full font-bold"
                    [class]="activeTab() === 'callbacks' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'"
                  >
                    {{ pendingCallbackCount() }}
                  </span>
                }
              </span>
            </button>

          </nav>

          <!-- Sidebar Footer: Front Desk Badge -->
          <div class="border-t border-slate-200/80 pt-3 flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
              <app-icon name="user" wrapperClass="w-5 h-5 text-teal-600" />
            </div>
            <div class="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 flex flex-col min-w-0">
              <span class="text-xs font-bold text-slate-900 truncate">Front Desk</span>
              <span class="text-xs text-slate-500 truncate">OPD Reception</span>
            </div>
          </div>

        </aside>

        <!-- ============================================================= -->
        <!-- SECTION 2 (RIGHT): MAIN TAB CONTENT DISPLAY SECTION (SCROLLABLE) -->
        <!-- ============================================================= -->
        <div class="flex-1 flex flex-col h-full overflow-hidden">
          
          <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4">
            
            <!-- 1. UNIVERSAL PATIENT SEARCH & RECEPTIONIST ACTIONS BAR -->
            <div class="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs relative z-30">
              <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                
                <!-- Receptionist Title -->
                <div class="flex items-center gap-2.5 shrink-0">
                  <div class="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-700 flex items-center justify-center">
                    <app-icon name="user" wrapperClass="w-4 h-4" />
                  </div>
                  <div>
                    <h1 class="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                      Receptionist Desk
                    </h1>
                    <span class="text-xs font-medium text-slate-500 leading-none">Front Office & Live OPD</span>
                  </div>
                </div>

                <!-- Search Input with Floating Autocomplete Dropdown -->
                <div class="flex-1 relative">
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <app-icon name="search" wrapperClass="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      [ngModel]="searchQuery()" 
                      (ngModelChange)="onSearchInputChange($event)"
                      placeholder="Search patient by Name, Phone (+91...), or Patient ID (PT-...)"
                      class="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-2xs"
                    />
                    @if (searchQuery().trim().length > 0) {
                      <button 
                        type="button" 
                        (click)="clearSearch()"
                        class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                        aria-label="Clear search"
                      >
                        <app-icon name="x" wrapperClass="w-4 h-4" />
                      </button>
                    }
                  </div>

                  <!-- Floating Autocomplete Dropdown Menu -->
                  @if (searchQuery().trim().length > 0) {
                    <div class="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden max-h-72 overflow-y-auto py-1 divide-y divide-slate-100 animate-fade-in">
                      @if (searchResults().length > 0) {
                        @for (p of searchResults(); track p.id) {
                          <button 
                            type="button" 
                            (click)="selectSearchResultPatient(p)"
                            class="w-full px-4 py-2.5 flex items-center text-left hover:bg-teal-50/70 transition cursor-pointer group"
                          >
                            <div class="flex items-center gap-2.5 flex-wrap">
                              <span class="font-bold text-slate-800 text-sm group-hover:text-teal-800">
                                {{ p.name }}
                              </span>
                              <span class="text-xs text-slate-500 font-medium">
                                • {{ p.phone }}
                              </span>
                              <span class="text-xs font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60 ml-2">
                                {{ p.id }}
                              </span>
                            </div>
                          </button>
                        }
                      } @else {
                        <div class="px-4 py-3 text-sm text-slate-600 font-medium select-none">
                          No results found
                        </div>
                      }
                    </div>
                  }
                </div>

              </div>
            </div>

            <!-- ============================================================= -->
            <!-- 2. DYNAMIC DISPLAY AREA (ALL PANELS UNCHANGED) -->
            <!-- ============================================================= -->
        
        <!-- TAB 1: PATIENTS QUEUE (LIVE OPD) -->
        @if (activeTab() === 'queue') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
            
            <!-- Live Patient Queue Table (2 cols) -->
            <div class="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-base font-bold text-slate-900 tracking-tight">Today's Active Patient Queue</h2>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {{ tokens().length }} in Queue
                  </span>

                  <button 
                    type="button" 
                    (click)="openAddPatientSearchModal()"
                    class="py-1 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                  >
                    <app-icon name="plus" wrapperClass="w-3.5 h-3.5" />
                    <span>Add Patient</span>
                  </button>
                </div>
              </div>

              <!-- Table -->
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs sm:text-sm select-none">
                  <thead>
                    <tr class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/70">
                      <th class="py-2.5 px-3 rounded-l-xl w-10 text-center">#</th>
                      <th class="py-2.5 px-3">Token</th>
                      <th class="py-2.5 px-3">Patient</th>
                      <th class="py-2.5 px-3">Doctor & Room</th>
                      <th class="py-2.5 px-3">Source Type</th>
                      <th class="py-2.5 px-3">Status</th>
                      <th class="py-2.5 px-3 rounded-r-xl text-center">Actions</th>
                    </tr>
                    <!-- Column Filters (Matching referral image) -->
                    <tr class="border-b border-slate-200 bg-slate-50/50 text-xs">
                      <th class="py-2 px-2 text-center text-slate-400">
                        <app-icon name="funnel" wrapperClass="w-3.5 h-3.5 mx-auto text-slate-400" />
                      </th>
                      <th class="py-2 px-2">
                        <div class="relative flex items-center">
                          <input 
                            type="text" 
                            [ngModel]="filterToken()" 
                            (ngModelChange)="filterToken.set($event); queuePage.set(1)"
                            placeholder="Filter token" 
                            class="w-full pl-2.5 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition font-normal"
                          />
                          <app-icon name="funnel" wrapperClass="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
                        </div>
                      </th>
                      <th class="py-2 px-2">
                        <div class="relative flex items-center">
                          <input 
                            type="text" 
                            [ngModel]="filterPatient()" 
                            (ngModelChange)="filterPatient.set($event); queuePage.set(1)"
                            placeholder="Search by patient" 
                            class="w-full pl-2.5 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none transition font-normal"
                          />
                          <app-icon name="funnel" wrapperClass="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
                        </div>
                      </th>
                      <th class="py-2 px-2">
                        <select 
                          [ngModel]="filterDoctor()" 
                          (ngModelChange)="filterDoctor.set($event); queuePage.set(1)"
                          class="w-full py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-normal text-slate-700 outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                        >
                          <option value="ALL">Any</option>
                          @for (d of doctors(); track d.id) {
                            <option [value]="d.name">{{ d.name }}</option>
                          }
                        </select>
                      </th>
                      <th class="py-2 px-2">
                        <select 
                          [ngModel]="filterSourceType()" 
                          (ngModelChange)="filterSourceType.set($event); queuePage.set(1)"
                          class="w-full py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-normal text-slate-700 outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                        >
                          <option value="ALL">Any</option>
                          <option value="Physical Walk-In">Walk-In</option>
                          <option value="Online Appointment">Online</option>
                          <option value="Phone Callback">Callback</option>
                          <option value="Emergency">Emergency</option>
                        </select>
                      </th>
                      <th class="py-2 px-2">
                        <select 
                          [ngModel]="filterStatus()" 
                          (ngModelChange)="filterStatus.set($event); queuePage.set(1)"
                          class="w-full py-1.5 px-2 bg-white border border-slate-200 rounded-lg text-xs font-normal text-slate-700 outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                        >
                          <option value="ALL">Select One</option>
                          <option value="Waiting">Waiting</option>
                          <option value="In Consultation">Consulting</option>
                        </select>
                      </th>
                      <th class="py-2 px-2 text-center">
                        @if (hasActiveQueueFilters()) {
                          <button 
                            type="button" 
                            (click)="clearQueueFilters()"
                            class="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold transition cursor-pointer"
                            title="Clear all filters"
                          >
                            Clear
                          </button>
                        }
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (t of paginatedTokens(); track t.tokenNumber; let idx = $index) {
                      <tr 
                        draggable="true"
                        (dragstart)="onQueueDragStart((queuePage() - 1) * queuePageSize() + idx, $event)"
                        (dragover)="onQueueDragOver((queuePage() - 1) * queuePageSize() + idx, $event)"
                        (drop)="onQueueDrop((queuePage() - 1) * queuePageSize() + idx, $event)"
                        (dragend)="onQueueDragEnd()"
                        class="transition-all duration-150 cursor-grab active:cursor-grabbing group"
                        [class.opacity-40]="draggedQueueIndex() === ((queuePage() - 1) * queuePageSize() + idx)"
                        [class.bg-teal-50]="dragOverQueueIndex() === ((queuePage() - 1) * queuePageSize() + idx) && draggedQueueIndex() !== ((queuePage() - 1) * queuePageSize() + idx)"
                        [class.border-t-2]="dragOverQueueIndex() === ((queuePage() - 1) * queuePageSize() + idx) && draggedQueueIndex() !== ((queuePage() - 1) * queuePageSize() + idx)"
                        [class.border-t-teal-600]="dragOverQueueIndex() === ((queuePage() - 1) * queuePageSize() + idx) && draggedQueueIndex() !== ((queuePage() - 1) * queuePageSize() + idx)"
                        [class.hover:bg-teal-50/40]="draggedQueueIndex() !== ((queuePage() - 1) * queuePageSize() + idx)"
                      >
                        <td class="py-2.5 px-3 text-center text-slate-400 group-hover:text-slate-700">
                          <div class="flex items-center justify-center gap-1">
                            <app-icon name="grip-vertical" wrapperClass="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                            <span class="text-xs font-bold text-slate-500">{{ (queuePage() - 1) * queuePageSize() + idx + 1 }}</span>
                          </div>
                        </td>
                        <td class="py-2.5 px-3 font-mono font-bold text-teal-700">
                          {{ t.tokenNumber }}
                        </td>
                        <td class="py-2.5 px-3">
                          <button 
                            type="button" 
                            (click)="openPatientDetailsById(t.patientId, t.patientName)"
                            class="text-left group/pt cursor-pointer hover:underline block"
                            title="View Patient 360° Profile"
                          >
                            <div class="font-bold text-slate-900 group-hover/pt:text-teal-700 transition-colors">{{ t.patientName }}</div>
                            <div class="text-xs text-slate-500">{{ t.patientId }} • {{ t.time }}</div>
                          </button>
                        </td>
                        <td class="py-2.5 px-3">
                          <div class="font-semibold text-slate-800">{{ t.doctorName }}</div>
                          <div class="text-xs text-slate-500">{{ t.room }} • {{ t.department }}</div>
                        </td>
                        <td class="py-2.5 px-3 whitespace-nowrap">
                          <span 
                            class="px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider"
                            [class]="t.type === 'Online Appointment' ? 'bg-blue-100 text-blue-800' : (t.type === 'Phone Callback' ? 'bg-purple-100 text-purple-800' : (t.type === 'Emergency' ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'))"
                          >
                            {{ t.type === 'Physical Walk-In' ? 'Walk-In' : (t.type === 'Online Appointment' ? 'Online' : (t.type === 'Phone Callback' ? 'Callback' : t.type)) }}
                          </span>
                        </td>
                        <td class="py-2.5 px-3 whitespace-nowrap">
                          <span 
                            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            [class]="t.status === 'In Consultation' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'"
                          >
                            <span 
                              class="w-1.5 h-1.5 rounded-full"
                              [class]="t.status === 'In Consultation' ? 'bg-blue-600 animate-pulse' : 'bg-amber-600'"
                            ></span>
                            {{ t.status === 'In Consultation' ? 'Consulting' : t.status }}
                          </span>
                        </td>
                        <td class="py-2.5 px-3 text-center whitespace-nowrap">
                          <button 
                            type="button" 
                            (click)="openReassignTokenModal(t)"
                            class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200/80 transition cursor-pointer"
                          >
                            Reassign
                          </button>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="7" class="py-8 text-center text-slate-500">
                          <div class="flex flex-col items-center justify-center gap-1.5">
                            <app-icon name="check-circle" wrapperClass="w-6 h-6 text-teal-600" />
                            <span class="font-bold text-slate-700 text-xs sm:text-sm">No Patients Match Current Filters</span>
                            @if (hasActiveQueueFilters()) {
                              <button 
                                type="button"
                                (click)="clearQueueFilters()"
                                class="mt-1 text-xs text-teal-600 hover:text-teal-800 font-semibold underline cursor-pointer"
                              >
                                Clear all filters
                              </button>
                            } @else {
                              <span class="text-xs text-slate-500">Confirm online requests, process callbacks, or register patients to issue tokens.</span>
                            }
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Table Paginator (Referral Design: <<, <, page pills, >, >>, Rows per page dropdown) -->
              <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
                
                <!-- Left: Record Counter Summary -->
                <div class="text-xs text-slate-500">
                  @if (filteredTokens().length > 0) {
                    Showing <strong class="text-slate-800 font-semibold">{{ (queuePage() - 1) * queuePageSize() + 1 }}</strong> to <strong class="text-slate-800 font-semibold">{{ Math.min(queuePage() * queuePageSize(), filteredTokens().length) }}</strong> of <strong class="text-slate-800 font-semibold">{{ filteredTokens().length }}</strong> patients
                  } @else {
                    <span>0 patients</span>
                  }
                </div>

                <!-- Center/Right: Navigation Controls & Page Size -->
                <div class="flex items-center gap-2">
                  
                  <!-- Paginator Button Group -->
                  <div class="flex items-center gap-1">
                    
                    <!-- First Page (<<) -->
                    <button 
                      type="button" 
                      (click)="firstQueuePage()"
                      [disabled]="queuePage() === 1"
                      class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                      title="First Page"
                    >
                      &laquo;
                    </button>

                    <!-- Previous Page (<) -->
                    <button 
                      type="button" 
                      (click)="prevQueuePage()"
                      [disabled]="queuePage() === 1"
                      class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                      title="Previous Page"
                    >
                      &lsaquo;
                    </button>

                    <!-- Page Number Buttons (Pills with circular active highlight like referral image) -->
                    @for (p of getQueuePagesArray(); track p) {
                      <button 
                        type="button" 
                        (click)="setQueuePage(p)"
                        class="w-7 h-7 rounded-full text-xs transition cursor-pointer flex items-center justify-center font-bold"
                        [class]="queuePage() === p 
                          ? 'bg-teal-50 text-teal-700 border border-teal-300 shadow-2xs font-extrabold ring-2 ring-teal-500/10' 
                          : 'text-slate-600 hover:bg-slate-100'"
                      >
                        {{ p }}
                      </button>
                    }

                    <!-- Next Page (>) -->
                    <button 
                      type="button" 
                      (click)="nextQueuePage()"
                      [disabled]="queuePage() === totalQueuePages()"
                      class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                      title="Next Page"
                    >
                      &rsaquo;
                    </button>

                    <!-- Last Page (>>) -->
                    <button 
                      type="button" 
                      (click)="lastQueuePage()"
                      [disabled]="queuePage() === totalQueuePages()"
                      class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                      title="Last Page"
                    >
                      &raquo;
                    </button>

                  </div>

                  <!-- Rows per page selector (10 default) -->
                  <div class="relative flex items-center pl-1 border-l border-slate-200">
                    <select 
                      [ngModel]="queuePageSize()" 
                      (ngModelChange)="onQueuePageSizeChange($event)"
                      class="py-1 pl-2.5 pr-7 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer appearance-none"
                    >
                      <option [value]="5">5</option>
                      <option [value]="10">10</option>
                      <option [value]="20">20</option>
                      <option [value]="50">50</option>
                    </select>
                    <div class="absolute right-2 pointer-events-none text-slate-400">
                      <app-icon name="chevron-down" wrapperClass="w-3 h-3" />
                    </div>
                  </div>

                </div>

              </div>
            </div>

            <!-- Doctor OPD Room Monitor (1 col) -->
            <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
              <div>
                <h2 class="text-base font-bold text-slate-900 tracking-tight">Doctor OPD Rooms</h2>
                <p class="text-xs text-slate-500 font-medium">Physician consult status & live queue load</p>
              </div>

              <div class="space-y-2.5">
                @for (doc of doctors(); track doc.id) {
                  <div class="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="font-bold text-slate-900 text-xs sm:text-sm">{{ doc.name }}</div>
                        <div class="text-xs text-teal-700 font-medium">{{ doc.specialty }} • {{ doc.room }}</div>
                      </div>
                      <span 
                        class="px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider"
                        [class]="doc.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'"
                      >
                        {{ doc.status === 'In Consultation' ? 'Consulting' : doc.status }}
                      </span>
                    </div>
                    
                    <div class="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs text-slate-600">
                      <span>Queue: <strong class="text-slate-900">{{ doc.queueLength }}</strong> patients</span>
                      <span>Active: <strong class="text-teal-700">{{ doc.currentPatientToken }}</strong></span>
                    </div>
                  </div>
                }
              </div>
            </div>

          </div>
        }

        <!-- TAB 2: ONLINE APPOINTMENTS -->
        @if (activeTab() === 'online') {
          <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3 animate-fade-in">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-base font-bold text-slate-900 tracking-tight">Online Appointment Requests</h2>
              </div>
            </div>

            <!-- Online Appointments Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs sm:text-sm select-none">
                <thead>
                  <tr class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/70">
                    <th class="py-2.5 px-3 rounded-l-xl">Patient</th>
                    <th class="py-2.5 px-3">Doctor</th>
                    <th class="py-2.5 px-3 whitespace-nowrap">Slot</th>
                    <th class="py-2.5 px-3">Status</th>
                    <th class="py-2.5 px-3 text-left rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (req of paginatedOnlineAppointments(); track req.id) {
                    <tr class="hover:bg-slate-50/60 transition-colors">
                      <td class="py-2.5 px-3">
                        <button 
                          type="button" 
                          (click)="openPatientDetailsById(req.patientId, req.patientName)"
                          class="text-left group/pt cursor-pointer hover:underline block"
                          title="View Patient 360° Profile"
                        >
                          <div class="font-bold text-slate-900 group-hover/pt:text-teal-700 transition-colors">{{ req.patientName }}</div>
                          <div class="text-xs text-slate-500 font-medium">{{ req.patientId }}</div>
                          <div class="text-xs text-slate-500">{{ req.phone }}</div>
                        </button>
                      </td>
                      <td class="py-2.5 px-3">
                        <div class="font-semibold text-slate-800">{{ req.doctorName }}</div>
                        <div class="text-xs text-teal-700 font-medium">{{ req.department }}</div>
                        <div class="text-xs text-slate-500">{{ req.room }}</div>
                      </td>
                      <td class="py-2.5 px-3 whitespace-nowrap">
                        <div class="font-semibold text-slate-800">{{ getSlotDate(req) }}</div>
                        <div class="text-xs text-slate-500 font-medium">{{ getSlotTime(req) }}</div>
                      </td>
                      <td class="py-2.5 px-3">
                        <span 
                          class="px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider"
                          [class]="req.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : (req.status === 'Pending' ? 'bg-amber-100 text-amber-800' : (req.status === 'Rescheduled' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'))"
                        >
                          {{ req.status }}
                        </span>
                      </td>
                      <td class="py-2.5 px-3 text-left">
                        @if (req.status === 'Pending' || req.status === 'Rescheduled') {
                          <div class="flex items-center justify-start gap-1.5">
                            <button 
                              type="button" 
                              (click)="confirmOnlineAppointment(req)"
                              class="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                            >
                              <app-icon name="check" wrapperClass="w-3.5 h-3.5" />
                              <span>Confirm</span>
                            </button>
                            
                            <button 
                              type="button" 
                              (click)="openRescheduleModal(req)"
                              class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1"
                            >
                              <app-icon name="clock" wrapperClass="w-3.5 h-3.5 text-slate-600" />
                              <span>Move</span>
                            </button>

                            <button 
                              type="button" 
                              (click)="openCancelModal(req)"
                              class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition cursor-pointer border border-rose-200 inline-flex items-center gap-1"
                            >
                              <app-icon name="x" wrapperClass="w-3.5 h-3.5 text-rose-600" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        } @else if (req.status === 'Confirmed') {
                          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            ✓ Confirmed
                          </span>
                        } @else {
                          <span class="text-xs text-rose-600 font-medium">
                            Cancelled: {{ req.cancelReason || 'Patient request' }}
                          </span>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="py-8 text-center text-slate-500 text-xs sm:text-sm">
                        No online appointment requests at this moment.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Table Paginator: Online Appointments (10 Rows Default) -->
            <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
              
              <!-- Left: Record Counter Summary -->
              <div class="text-xs text-slate-500">
                @if (onlineAppointments().length > 0) {
                  Showing <strong class="text-slate-800 font-semibold">{{ (onlinePage() - 1) * onlinePageSize() + 1 }}</strong> to <strong class="text-slate-800 font-semibold">{{ Math.min(onlinePage() * onlinePageSize(), onlineAppointments().length) }}</strong> of <strong class="text-slate-800 font-semibold">{{ onlineAppointments().length }}</strong> requests
                } @else {
                  <span>0 requests</span>
                }
              </div>

              <!-- Center/Right: Navigation Controls & Page Size -->
              <div class="flex items-center gap-2">
                
                <div class="flex items-center gap-1">
                  
                  <!-- First Page (<<) -->
                  <button 
                    type="button" 
                    (click)="firstOnlinePage()"
                    [disabled]="onlinePage() === 1"
                    class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                    title="First Page"
                  >
                    &laquo;
                  </button>

                  <!-- Previous Page (<) -->
                  <button 
                    type="button" 
                    (click)="prevOnlinePage()"
                    [disabled]="onlinePage() === 1"
                    class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                    title="Previous Page"
                  >
                    &lsaquo;
                  </button>

                  <!-- Page Number Buttons -->
                  @for (p of getOnlinePagesArray(); track p) {
                    <button 
                      type="button" 
                      (click)="setOnlinePage(p)"
                      class="w-7 h-7 rounded-full text-xs transition cursor-pointer flex items-center justify-center font-bold"
                      [class]="onlinePage() === p 
                        ? 'bg-teal-50 text-teal-700 border border-teal-300 shadow-2xs font-extrabold ring-2 ring-teal-500/10' 
                        : 'text-slate-600 hover:bg-slate-100'"
                    >
                      {{ p }}
                    </button>
                  }

                  <!-- Next Page (>) -->
                  <button 
                    type="button" 
                    (click)="nextOnlinePage()"
                    [disabled]="onlinePage() === totalOnlinePages()"
                    class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                    title="Next Page"
                  >
                    &rsaquo;
                  </button>

                  <!-- Last Page (>>) -->
                  <button 
                    type="button" 
                    (click)="lastOnlinePage()"
                    [disabled]="onlinePage() === totalOnlinePages()"
                    class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                    title="Last Page"
                  >
                    &raquo;
                  </button>

                </div>

                <!-- Rows per page selector -->
                <div class="relative flex items-center pl-1 border-l border-slate-200">
                  <select 
                    [ngModel]="onlinePageSize()" 
                    (ngModelChange)="onOnlinePageSizeChange($event)"
                    class="py-1 pl-2.5 pr-7 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer appearance-none"
                  >
                    <option [value]="5">5</option>
                    <option [value]="10">10</option>
                    <option [value]="20">20</option>
                    <option [value]="50">50</option>
                  </select>
                  <div class="absolute right-2 pointer-events-none text-slate-400">
                    <app-icon name="chevron-down" wrapperClass="w-3 h-3" />
                  </div>
                </div>

              </div>

            </div>
          </div>
        }

        <!-- TAB 3: CALL BACK REQUESTS -->
        @if (activeTab() === 'callbacks') {
          <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3 animate-fade-in">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-base font-bold text-slate-900 tracking-tight">Call Back Inquiries Queue</h2>
              </div>
            </div>

            <!-- Callbacks List -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs sm:text-sm select-none">
                <thead>
                  <tr class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50/70">
                    <th class="py-2.5 px-3 rounded-l-xl">Caller</th>
                    <th class="py-2.5 px-3">Phone</th>
                    <th class="py-2.5 px-3">Time</th>
                    <th class="py-2.5 px-3">Patient</th>
                    <th class="py-2.5 px-3 text-left rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (cb of paginatedCallbackRequests(); track cb.id) {
                    <tr class="hover:bg-slate-50/60 transition-colors">
                      <td class="py-2.5 px-3">
                        <button 
                          type="button" 
                          (click)="openPatientDetailsById('', cb.name)"
                          class="text-left group/pt cursor-pointer hover:underline block"
                          title="View Patient 360° Profile"
                        >
                          <div class="font-bold text-slate-900 group-hover/pt:text-teal-700 transition-colors">{{ cb.name }}</div>
                          <div class="text-xs text-slate-500 font-medium">{{ getCallbackDay(cb) }}</div>
                          <div class="text-xs text-slate-500">{{ getCallbackTime(cb) }}</div>
                        </button>
                      </td>
                      <td class="py-2.5 px-3 font-semibold text-slate-800">
                        {{ cb.phone }}
                      </td>
                      <td class="py-2.5 px-3 text-slate-700">
                        {{ cb.preferredTime }}
                      </td>
                      <td class="py-2.5 px-3">
                        @if (getCallbackPatientType(cb) === 'Old Patient') {
                          <span class="px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            Old
                          </span>
                        } @else {
                          <span class="px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-800">
                            New
                          </span>
                        }
                      </td>
                      <td class="py-2.5 px-3 text-left">
                        @if (cb.status === 'Resolved') {
                          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold select-none">
                            <app-icon name="check-circle" wrapperClass="w-3.5 h-3.5 text-emerald-600" />
                            <span>Resolved</span>
                          </span>
                        } @else if (getCallbackPatientType(cb) === 'Old Patient') {
                          <div class="flex items-center justify-between gap-2 max-w-[200px]">
                            <button 
                              type="button" 
                              (click)="openCallbackBookingModal(cb)"
                              class="flex-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                            >
                              <app-icon name="calendar" wrapperClass="w-3.5 h-3.5" />
                              <span>Book</span>
                            </button>
                            <button 
                              type="button" 
                              (click)="markCallbackResolved(cb)"
                              class="flex-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                            >
                              <app-icon name="check" wrapperClass="w-3.5 h-3.5 text-slate-600" />
                              <span>Resolve</span>
                            </button>
                          </div>
                        } @else {
                          <div class="flex items-center justify-between gap-2 max-w-[200px]">
                            <button 
                              type="button" 
                              (click)="openRegisterModalFromCallback(cb)"
                              class="flex-1 px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                            >
                              <app-icon name="user" wrapperClass="w-3.5 h-3.5" />
                              <span>Register</span>
                            </button>
                            <button 
                              type="button" 
                              (click)="markCallbackResolved(cb)"
                              class="flex-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                            >
                              <app-icon name="check" wrapperClass="w-3.5 h-3.5 text-slate-600" />
                              <span>Resolve</span>
                            </button>
                          </div>
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="py-8 text-center text-slate-500 text-xs sm:text-sm">
                        No pending callback requests.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Table Paginator: Call Back Requests (10 Rows Default) -->
            <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
              
              <!-- Left: Record Counter Summary -->
              <div class="text-xs text-slate-500">
                @if (callbackRequests().length > 0) {
                  Showing <strong class="text-slate-800 font-semibold">{{ (callbackPage() - 1) * callbackPageSize() + 1 }}</strong> to <strong class="text-slate-800 font-semibold">{{ Math.min(callbackPage() * callbackPageSize(), callbackRequests().length) }}</strong> of <strong class="text-slate-800 font-semibold">{{ callbackRequests().length }}</strong> requests
                } @else {
                  <span>0 requests</span>
                }
              </div>

              <!-- Center/Right: Navigation Controls & Page Size -->
              <div class="flex items-center gap-2">
                
                <div class="flex items-center gap-1">
                  
                  <!-- First Page (<<) -->
                  <button 
                    type="button" 
                    (click)="firstCallbackPage()"
                    [disabled]="callbackPage() === 1"
                    class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                    title="First Page"
                  >
                    &laquo;
                  </button>

                  <!-- Previous Page (<) -->
                  <button 
                    type="button" 
                    (click)="prevCallbackPage()"
                    [disabled]="callbackPage() === 1"
                    class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                    title="Previous Page"
                  >
                    &lsaquo;
                  </button>

                  <!-- Page Number Buttons -->
                  @for (p of getCallbackPagesArray(); track p) {
                    <button 
                      type="button" 
                      (click)="setCallbackPage(p)"
                      class="w-7 h-7 rounded-full text-xs transition cursor-pointer flex items-center justify-center font-bold"
                      [class]="callbackPage() === p 
                        ? 'bg-teal-50 text-teal-700 border border-teal-300 shadow-2xs font-extrabold ring-2 ring-teal-500/10' 
                        : 'text-slate-600 hover:bg-slate-100'"
                    >
                      {{ p }}
                    </button>
                  }

                  <!-- Next Page (>) -->
                  <button 
                    type="button" 
                    (click)="nextCallbackPage()"
                    [disabled]="callbackPage() === totalCallbackPages()"
                    class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                    title="Next Page"
                  >
                    &rsaquo;
                  </button>

                  <!-- Last Page (>>) -->
                  <button 
                    type="button" 
                    (click)="lastCallbackPage()"
                    [disabled]="callbackPage() === totalCallbackPages()"
                    class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                    title="Last Page"
                  >
                    &raquo;
                  </button>

                </div>

                <!-- Rows per page selector -->
                <div class="relative flex items-center pl-1 border-l border-slate-200">
                  <select 
                    [ngModel]="callbackPageSize()" 
                    (ngModelChange)="onCallbackPageSizeChange($event)"
                    class="py-1 pl-2.5 pr-7 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer appearance-none"
                  >
                    <option [value]="5">5</option>
                    <option [value]="10">10</option>
                    <option [value]="20">20</option>
                    <option [value]="50">50</option>
                  </select>
                  <div class="absolute right-2 pointer-events-none text-slate-400">
                    <app-icon name="chevron-down" wrapperClass="w-3 h-3" />
                  </div>
                </div>

              </div>

            </div>
          </div>
        }

      </main>
        </div>

      </div>

      <!-- ============================================================= -->
      <!-- MODAL: ADD PATIENT (SEARCH BAR WITH FLOATING DROPDOWN) -->
      <!-- ============================================================= -->
      @if (isAddPatientSearchModalOpen()) {
        <div 
          class="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-32 p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          (click)="isAddPatientSearchModalOpen.set(false)"
        >
          <div 
            class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 max-w-xl w-full shadow-2xl border border-slate-100 relative animate-scale-in space-y-3"
            (click)="$event.stopPropagation()"
          >
            <!-- Modal Header -->
            <div class="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 class="text-base sm:text-lg font-bold text-slate-900">Add Patient</h3>
              <button 
                type="button" 
                (click)="isAddPatientSearchModalOpen.set(false)"
                class="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition text-slate-500 hover:text-slate-700"
                aria-label="Close"
              >
                <app-icon name="x" wrapperClass="w-3.5 h-3.5" />
              </button>
            </div>

            <!-- Search Bar with Floating Autocomplete Dropdown -->
            <div class="relative w-full">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <app-icon name="search" wrapperClass="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  [value]="addPatientSearchQuery()" 
                  (input)="onAddPatientSearchInput($event)"
                  placeholder="Search patient by Name, Phone (+91...), or Patient ID (PT-..)" 
                  class="w-full pl-10 pr-9 py-2.5 bg-slate-50 border-2 border-teal-500 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-600 transition shadow-2xs"
                  autofocus
                />
                @if (addPatientSearchQuery()) {
                  <button 
                    type="button" 
                    (click)="clearAddPatientSearch()"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <app-icon name="x" wrapperClass="w-4 h-4" />
                  </button>
                }
              </div>

              <!-- Floating Dropdown Menu attached directly beneath search bar -->
              @if (addPatientSearchQuery().trim().length > 0) {
                <div class="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100 animate-fade-in">
                  @if (addPatientSearchResults().length > 0) {
                    @for (p of addPatientSearchResults(); track p.id) {
                      <div class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-teal-50/70 transition gap-3 group">
                        <button 
                          type="button"
                          (click)="openPatientDetailsModal(p)"
                          class="flex items-center gap-2 min-w-0 text-left cursor-pointer hover:underline"
                          title="View 360° Profile"
                        >
                          <span class="font-bold text-slate-800 text-sm group-hover:text-teal-800 truncate">
                            {{ p.name }}
                          </span>
                          <span class="text-xs text-slate-500 font-medium whitespace-nowrap">
                            • {{ p.phone }}
                          </span>
                        </button>
                        <div class="flex items-center gap-2 shrink-0">
                          <span class="text-xs font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                            {{ p.id }}
                          </span>
                          <button 
                            type="button" 
                            (click)="openPatientDetailsModal(p)"
                            class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1"
                            title="View 360° Profile"
                          >
                            <app-icon name="user" wrapperClass="w-3.5 h-3.5 text-slate-600" />
                            <span>Details</span>
                          </button>
                          <button 
                            type="button" 
                            (click)="openSlotBookingForPatient(p)"
                            class="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer shadow-2xs flex items-center gap-1"
                          >
                            <app-icon name="calendar" wrapperClass="w-3.5 h-3.5 text-white" />
                            <span>Book Slot</span>
                          </button>
                        </div>
                      </div>
                    }
                  } @else {
                    <div class="p-3.5 bg-amber-50/95 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div class="flex items-center gap-2">
                        <span class="text-xs sm:text-sm font-medium text-amber-900">
                          No result found for "<strong>{{ addPatientSearchQuery().trim() }}</strong>"
                        </span>
                      </div>
                      <button 
                        type="button" 
                        (click)="openRegisterFromSearch()"
                        class="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition cursor-pointer shadow-xs shrink-0 flex items-center justify-center gap-1"
                      >
                        <app-icon name="user-plus" wrapperClass="w-3.5 h-3.5" />
                        <span>Register</span>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>

          </div>
        </div>
      }

      <!-- ============================================================= -->
      <!-- MODAL: CREATE ACCOUNT (STANDALONE SINGLE-STEP PROFILE CREATION) -->
      <!-- ============================================================= -->
      @if (isCreateAccountModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            
            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 class="text-lg font-bold text-slate-900">Create Account</h3>
                <p class="text-xs text-slate-500 font-medium">Enter patient details to register a new permanent account</p>
              </div>
              <button 
                type="button" 
                (click)="isCreateAccountModalOpen.set(false)"
                class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition text-slate-600"
                aria-label="Close"
              >
                <app-icon name="x" wrapperClass="w-4 h-4" />
              </button>
            </div>

            <!-- Form -->
            <form [formGroup]="patientForm" (ngSubmit)="submitCreateAccount()" class="space-y-3 pt-1">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Full Name <span class="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  formControlName="name"
                  placeholder="e.g. Johnathan Miller"
                  class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Phone Number <span class="text-rose-500">*</span></label>
                  <input 
                    type="tel" 
                    formControlName="phone"
                    placeholder="e.g. +91 98765 43210"
                    class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    formControlName="email"
                    placeholder="e.g. john@example.com"
                    class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Address <span class="text-slate-400 font-normal lowercase">(optional)</span></label>
                  <input 
                    type="text" 
                    formControlName="address"
                    placeholder="e.g. Flat 402, Bengaluru"
                    class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Emergency Contact <span class="text-slate-400 font-normal lowercase">(optional)</span></label>
                  <input 
                    type="tel" 
                    formControlName="emergencyContact"
                    placeholder="e.g. +91 98450 12345"
                    class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Age</label>
                  <input 
                    type="number" 
                    formControlName="age"
                    placeholder="35"
                    class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Gender</label>
                  <select 
                    formControlName="gender"
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Blood Group</label>
                  <select 
                    formControlName="bloodGroup"
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="O+ Positive">O+</option>
                    <option value="A+ Positive">A+</option>
                    <option value="B+ Positive">B+</option>
                    <option value="AB+ Positive">AB+</option>
                    <option value="O- Negative">O-</option>
                  </select>
                </div>
              </div>

              <div class="pt-3 flex items-center gap-3">
                <button 
                  type="button" 
                  (click)="isCreateAccountModalOpen.set(false)"
                  class="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 cursor-pointer transition text-center"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  [disabled]="patientForm.invalid"
                  class="w-1/2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm shadow-md cursor-pointer transition text-center"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- ============================================================= -->
      <!-- MODAL 1: MULTI-STEP PATIENT REGISTRATION & BOOKING (3 STEPS) -->
      <!-- ============================================================= -->
      @if (isCreatePatientModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg sm:max-w-xl w-full shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            
            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 class="text-lg font-bold text-slate-900">
                  @if (registrationStep() === 1) {
                    Register New Patient Profile
                  } @else if (registrationStep() === 2) {
                    Book Appointment Slot
                  } @else {
                    Registration & Booking Confirmed!
                  }
                </h3>
                <p class="text-xs text-slate-500 font-medium">
                  @if (registrationStep() === 1) {
                    Step 1 of 2: Enter patient medical and demographic information
                  } @else if (registrationStep() === 2) {
                    Step 2 of 2: Select doctor, appointment date, and available slot
                  } @else {
                    Token successfully issued and added to active Patients Queue
                  }
                </p>
              </div>
              <button 
                type="button" 
                (click)="isCreatePatientModalOpen.set(false)"
                class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition text-slate-600"
                aria-label="Close"
              >
                <app-icon name="x" wrapperClass="w-4 h-4" />
              </button>
            </div>

            <!-- ========================================================= -->
            <!-- STEPPER: 3 CIRCLES LINKED BY CONNECTING LINES -->
            <!-- ========================================================= -->
            <div class="px-3 pt-1 pb-2">
              <div class="flex items-center justify-between relative">
                
                <!-- Step 1 Circle (Registering) -->
                <div class="flex flex-col items-center relative z-10">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-xs"
                    [class]="registrationStep() >= 1 
                      ? (registrationStep() > 1 ? 'bg-teal-600 text-white' : 'bg-teal-600 text-white ring-4 ring-teal-100') 
                      : 'bg-slate-100 text-slate-400 border border-slate-200'"
                  >
                    @if (registrationStep() > 1) {
                      <app-icon name="check" wrapperClass="w-5 h-5 text-white" />
                    } @else {
                      <app-icon name="user" wrapperClass="w-4.5 h-4.5" />
                    }
                  </div>
                  <span class="text-[11px] font-bold mt-1.5" 
                    [class]="registrationStep() >= 1 ? 'text-teal-900' : 'text-slate-400'">
                    1. Register
                  </span>
                </div>

                <!-- Connecting Line 1 -> 2 -->
                <div class="flex-1 h-0.5 mx-2 -mt-5 transition-colors" 
                  [class]="registrationStep() >= 2 ? 'bg-teal-600' : 'bg-slate-200'">
                </div>

                <!-- Step 2 Circle (Booking Appointment) -->
                <div class="flex flex-col items-center relative z-10">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-xs"
                    [class]="registrationStep() >= 2 
                      ? (registrationStep() > 2 ? 'bg-teal-600 text-white' : 'bg-teal-600 text-white ring-4 ring-teal-100') 
                      : 'bg-slate-100 text-slate-400 border border-slate-200'"
                  >
                    @if (registrationStep() > 2) {
                      <app-icon name="check" wrapperClass="w-5 h-5 text-white" />
                    } @else {
                      <app-icon name="calendar" wrapperClass="w-4.5 h-4.5" />
                    }
                  </div>
                  <span class="text-[11px] font-bold mt-1.5" 
                    [class]="registrationStep() >= 2 ? 'text-teal-900' : 'text-slate-400'">
                    2. Book Slot
                  </span>
                </div>

                <!-- Connecting Line 2 -> 3 -->
                <div class="flex-1 h-0.5 mx-2 -mt-5 transition-colors" 
                  [class]="registrationStep() >= 3 ? 'bg-teal-600' : 'bg-slate-200'">
                </div>

                <!-- Step 3 Circle (Tick Mark Completion) -->
                <div class="flex flex-col items-center relative z-10">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-xs"
                    [class]="registrationStep() === 3 
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' 
                      : 'bg-slate-100 text-slate-400 border border-slate-200'"
                  >
                    <app-icon name="check" wrapperClass="w-5 h-5" />
                  </div>
                  <span class="text-[11px] font-bold mt-1.5" 
                    [class]="registrationStep() === 3 ? 'text-emerald-700' : 'text-slate-400'">
                    3. Complete
                  </span>
                </div>

              </div>
            </div>

            <!-- ========================================================= -->
            <!-- STEP 1 CONTENT: PATIENT DETAILS FORM -->
            <!-- ========================================================= -->
            @if (registrationStep() === 1) {
              <form [formGroup]="patientForm" (ngSubmit)="proceedToBookingStep()" class="space-y-3 pt-1">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Full Name <span class="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    formControlName="name"
                    placeholder="e.g. Johnathan Miller"
                    class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Phone Number <span class="text-rose-500">*</span></label>
                    <input 
                      type="tel" 
                      formControlName="phone"
                      placeholder="e.g. +91 98765 43210"
                      class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Email</label>
                    <input 
                      type="email" 
                      formControlName="email"
                      placeholder="e.g. john@example.com"
                      class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Address <span class="text-slate-400 font-normal lowercase">(optional)</span></label>
                    <input 
                      type="text" 
                      formControlName="address"
                      placeholder="e.g. Flat 402, Bengaluru"
                      class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Emergency Contact <span class="text-slate-400 font-normal lowercase">(optional)</span></label>
                    <input 
                      type="tel" 
                      formControlName="emergencyContact"
                      placeholder="e.g. +91 98450 12345"
                      class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Age</label>
                    <input 
                      type="number" 
                      formControlName="age"
                      placeholder="35"
                      class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Gender</label>
                    <select 
                      formControlName="gender"
                      class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Blood Group</label>
                    <select 
                      formControlName="bloodGroup"
                      class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                      <option value="O+ Positive">O+</option>
                      <option value="A+ Positive">A+</option>
                      <option value="B+ Positive">B+</option>
                      <option value="AB+ Positive">AB+</option>
                      <option value="O- Negative">O-</option>
                    </select>
                  </div>
                </div>

                <div class="pt-3 flex items-center gap-3">
                  <button 
                    type="button" 
                    (click)="isCreatePatientModalOpen.set(false)"
                    class="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 cursor-pointer transition text-center"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    [disabled]="patientForm.invalid"
                    class="w-1/2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm shadow-md cursor-pointer transition text-center"
                  >
                    Next: Book Slot →
                  </button>
                </div>
              </form>
            }

            <!-- ========================================================= -->
            <!-- STEP 2 CONTENT: SELECT DOCTOR, DATE & TIME SLOT -->
            <!-- ========================================================= -->
            @if (registrationStep() === 2) {
              <div class="space-y-4 pt-1">
                
                <!-- 1. Select Doctor Dropdown -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-700">SELECT DOCTOR</label>
                  <div class="relative">
                    <select 
                      [value]="registrationDoctorId()"
                      (change)="onRegistrationDoctorChange($any($event.target).value)"
                      class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer pr-10"
                    >
                      @for (d of doctors(); track d.id) {
                        <option [value]="d.id">{{ d.name }} — {{ d.specialty }} ({{ d.room }})</option>
                      }
                    </select>
                    <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <app-icon name="chevron-down" wrapperClass="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <!-- 2. Date Selector (7 Days, unshaded) -->
                <div class="space-y-2">
                  <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
                    @for (d of bookingDateOptions; track d.fullDate) {
                      <button 
                        type="button"
                        (click)="selectRegistrationDate(d.fullDate)"
                        class="py-2.5 px-1 rounded-2xl text-center transition flex flex-col items-center justify-center select-none cursor-pointer"
                        [class]="registrationDate() === d.fullDate 
                          ? 'border-2 border-teal-600 bg-teal-50/50 text-teal-900 shadow-2xs font-bold' 
                          : 'border border-slate-200 bg-white hover:border-teal-300 text-slate-700 font-medium'"
                      >
                        <span class="text-[10px] sm:text-xs uppercase tracking-wider leading-none font-semibold" 
                          [class]="registrationDate() === d.fullDate ? 'text-teal-700' : 'text-slate-500'">
                          {{ d.dayOfWeek }}
                        </span>
                        <span class="text-sm sm:text-base font-extrabold leading-tight mt-1" 
                          [class]="registrationDate() === d.fullDate ? 'text-teal-950' : 'text-slate-800'">
                          {{ d.dayNumber }}
                        </span>
                      </button>
                    }
                  </div>
                  <div class="h-1 w-full bg-slate-200 rounded-full"></div>
                </div>

                <!-- 3. Available Slots Header & Selected Date -->
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-slate-900">Available Slots</span>
                  <span class="text-xs font-semibold text-teal-700">{{ registrationDate() }}</span>
                </div>

                <!-- 4. 2-Column Time Slot Grid (12 Slots) -->
                <div class="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  @for (slot of availableTimeSlots; track slot) {
                    @if (isTimeSlotAvailable(slot, registrationDate(), registrationDoctorId(), false)) {
                      <button 
                        type="button" 
                        (click)="registrationSlot.set(slot)"
                        class="py-2.5 px-3 rounded-2xl text-center text-xs font-bold transition cursor-pointer flex items-center justify-center"
                        [class]="registrationSlot() === slot 
                          ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs border-2 border-teal-600' 
                          : 'bg-white hover:bg-teal-50/50 text-slate-800 border border-slate-200 hover:border-teal-300'"
                      >
                        {{ slot }}
                      </button>
                    } @else {
                      <button 
                        type="button" 
                        disabled
                        class="py-2.5 px-3 rounded-2xl text-center text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed select-none flex items-center justify-center"
                      >
                        {{ slot }}
                      </button>
                    }
                  }
                </div>

                <!-- Footer Buttons -->
                <div class="pt-2 flex items-center gap-3">
                  <button 
                    type="button" 
                    (click)="registrationStep.set(1)"
                    class="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 cursor-pointer transition text-center"
                  >
                    ← Back
                  </button>
                  <button 
                    type="button" 
                    (click)="confirmRegistrationAndBooking()"
                    class="w-1/2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md cursor-pointer transition text-center"
                  >
                    Confirm & Book Slot
                  </button>
                </div>
              </div>
            }

            <!-- ========================================================= -->
            <!-- STEP 3 CONTENT: TICK MARK COMPLETION & TOKEN SUMMARY -->
            <!-- ========================================================= -->
            @if (registrationStep() === 3) {
              <div class="space-y-4 py-2 text-center animate-fade-in">
                <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                  <app-icon name="check" wrapperClass="w-9 h-9 text-emerald-600" />
                </div>

                <div class="space-y-1">
                  <h4 class="text-lg font-extrabold text-slate-900">Registration & Slot Booked!</h4>
                  <p class="text-xs text-slate-500">Patient profile saved and added to the Live Queue</p>
                </div>

                <!-- Summary Card -->
                @if (bookedTokenResult(); as res) {
                  <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span class="font-bold text-slate-500 uppercase">TOKEN ISSUED</span>
                      <span class="text-sm font-extrabold text-teal-700 bg-teal-100/70 px-2.5 py-0.5 rounded-md">{{ res.tokenNumber }}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span class="block text-slate-400 text-[10px] uppercase font-bold">Patient Name</span>
                        <span class="font-bold text-slate-900 text-sm">{{ res.patientName }}</span>
                      </div>
                      <div>
                        <span class="block text-slate-400 text-[10px] uppercase font-bold">Patient ID</span>
                        <span class="font-mono font-semibold text-slate-800">{{ res.patientId }}</span>
                      </div>
                      <div>
                        <span class="block text-slate-400 text-[10px] uppercase font-bold">Doctor</span>
                        <span class="font-semibold text-slate-900">{{ res.doctorName }}</span>
                      </div>
                      <div>
                        <span class="block text-slate-400 text-[10px] uppercase font-bold">Time & Date</span>
                        <span class="font-semibold text-slate-900">{{ registrationDate() }}, {{ res.time }}</span>
                      </div>
                    </div>
                  </div>
                }

                <div class="pt-2">
                  <button 
                    type="button" 
                    (click)="finishRegistrationFlow()"
                    class="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md cursor-pointer transition text-center"
                  >
                    Done & View Queue
                  </button>
                </div>
              </div>
            }

          </div>
        </div>
      }

      <!-- ============================================================= -->
      <!-- MODAL: ADD PATIENT & SELECT TIME SLOT (IMAGE SPEC) -->
      <!-- ============================================================= -->
      <!-- ============================================================= -->
      <!-- MODAL: BOOK SLOT (2 STEPS: BOOK SLOT -> COMPLETE) -->
      <!-- ============================================================= -->
      @if (isSlotBookingModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-lg sm:max-w-xl w-full shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            
            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 class="text-lg font-bold text-slate-900">
                  @if (slotBookingStep() === 1) {
                    Book Appointment Slot
                  } @else {
                    Slot Booked & Token Issued!
                  }
                </h3>
                <p class="text-xs text-slate-500 font-medium">
                  @if (slotBookingStep() === 1) {
                    Patient: <strong class="text-teal-700 font-bold">{{ activeBookingPatient()?.name || 'Patient' }}</strong>
                    @if (activeBookingPatient()?.id) {
                      <span class="text-slate-400"> ({{ activeBookingPatient()?.id }})</span>
                    }
                  } @else {
                    Token successfully issued and added to active Patients Queue
                  }
                </p>
              </div>
              <button 
                type="button" 
                (click)="isSlotBookingModalOpen.set(false)"
                class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition text-slate-600"
                aria-label="Close"
              >
                <app-icon name="x" wrapperClass="w-4 h-4" />
              </button>
            </div>

            <!-- ========================================================= -->
            <!-- STEPPER: 2 CIRCLES LINKED BY CONNECTING LINE (NO REGISTER) -->
            <!-- ========================================================= -->
            <div class="px-6 pt-1 pb-2">
              <div class="flex items-center justify-between relative max-w-xs mx-auto">
                
                <!-- Step 1 Circle (Book Slot) -->
                <div class="flex flex-col items-center relative z-10">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-xs"
                    [class]="slotBookingStep() >= 1 
                      ? (slotBookingStep() > 1 ? 'bg-teal-600 text-white' : 'bg-teal-600 text-white ring-4 ring-teal-100') 
                      : 'bg-slate-100 text-slate-400 border border-slate-200'"
                  >
                    @if (slotBookingStep() > 1) {
                      <app-icon name="check" wrapperClass="w-5 h-5 text-white" />
                    } @else {
                      <app-icon name="calendar" wrapperClass="w-4.5 h-4.5" />
                    }
                  </div>
                  <span class="text-[11px] font-bold mt-1.5" 
                    [class]="slotBookingStep() >= 1 ? 'text-teal-900' : 'text-slate-400'">
                    1. Book Slot
                  </span>
                </div>

                <!-- Connecting Line 1 -> 2 -->
                <div class="flex-1 h-0.5 mx-3 -mt-5 transition-colors" 
                  [class]="slotBookingStep() >= 2 ? 'bg-teal-600' : 'bg-slate-200'">
                </div>

                <!-- Step 2 Circle (Complete) -->
                <div class="flex flex-col items-center relative z-10">
                  <div 
                    class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-xs"
                    [class]="slotBookingStep() === 2 
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' 
                      : 'bg-slate-100 text-slate-400 border border-slate-200'"
                  >
                    <app-icon name="check" wrapperClass="w-5 h-5" />
                  </div>
                  <span class="text-[11px] font-bold mt-1.5" 
                    [class]="slotBookingStep() === 2 ? 'text-emerald-700' : 'text-slate-400'">
                    2. Complete
                  </span>
                </div>

              </div>
            </div>

            <!-- ========================================================= -->
            <!-- STEP 1 CONTENT: SELECT DOCTOR, DATE & TIME SLOT -->
            <!-- ========================================================= -->
            @if (slotBookingStep() === 1) {
              <div class="space-y-4 pt-1">
                
                <!-- 1. Select Doctor Dropdown -->
                <div class="space-y-1.5">
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-700">SELECT DOCTOR</label>
                  <div class="relative">
                    <select 
                      [value]="selectedBookingDoctorId()"
                      (change)="onBookingDoctorChange($any($event.target).value)"
                      class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer pr-10"
                    >
                      @for (d of doctors(); track d.id) {
                        <option [value]="d.id">{{ d.name }} — {{ d.specialty }} ({{ d.room }})</option>
                      }
                    </select>
                    <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <app-icon name="chevron-down" wrapperClass="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <!-- 2. Date Selector (7 Days, unshaded) -->
                <div class="space-y-2">
                  <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
                    @for (d of bookingDateOptions; track d.fullDate) {
                      <button 
                        type="button"
                        (click)="selectBookingDate(d.fullDate)"
                        class="py-2.5 px-1 rounded-2xl text-center transition flex flex-col items-center justify-center select-none cursor-pointer"
                        [class]="selectedBookingDate() === d.fullDate 
                          ? 'border-2 border-teal-600 bg-teal-50/50 text-teal-900 shadow-2xs font-bold' 
                          : 'border border-slate-200 bg-white hover:border-teal-300 text-slate-700 font-medium'"
                      >
                        <span class="text-[10px] sm:text-xs uppercase tracking-wider leading-none font-semibold" 
                          [class]="selectedBookingDate() === d.fullDate ? 'text-teal-700' : 'text-slate-500'">
                          {{ d.dayOfWeek }}
                        </span>
                        <span class="text-sm sm:text-base font-extrabold leading-tight mt-1" 
                          [class]="selectedBookingDate() === d.fullDate ? 'text-teal-950' : 'text-slate-800'">
                          {{ d.dayNumber }}
                        </span>
                      </button>
                    }
                  </div>
                  <div class="h-1 w-full bg-slate-200 rounded-full"></div>
                </div>

                <!-- 3. Available Slots Header & Selected Date -->
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-slate-900">Available Slots</span>
                  <span class="text-xs font-semibold text-teal-700">{{ selectedBookingDate() }}</span>
                </div>

                <!-- 4. 2-Column Time Slot Grid (12 Slots) -->
                <div class="grid grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  @for (slot of availableTimeSlots; track slot) {
                    @if (isTimeSlotAvailable(slot, selectedBookingDate(), selectedBookingDoctorId(), false)) {
                      <button 
                        type="button" 
                        (click)="selectedBookingTimeSlot.set(slot)"
                        class="py-2.5 px-3 rounded-2xl text-center text-xs font-bold transition cursor-pointer flex items-center justify-center"
                        [class]="selectedBookingTimeSlot() === slot 
                          ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs border-2 border-teal-600' 
                          : 'bg-white hover:bg-teal-50/50 text-slate-800 border border-slate-200 hover:border-teal-300'"
                      >
                        {{ slot }}
                      </button>
                    } @else {
                      <button 
                        type="button" 
                        disabled
                        class="py-2.5 px-3 rounded-2xl text-center text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed select-none flex items-center justify-center"
                      >
                        {{ slot }}
                      </button>
                    }
                  }
                </div>

                <!-- Footer Buttons -->
                <div class="pt-2 flex items-center gap-3">
                  <button 
                    type="button" 
                    (click)="isSlotBookingModalOpen.set(false); isAddPatientSearchModalOpen.set(true)"
                    class="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 cursor-pointer transition text-center"
                  >
                    ← Back
                  </button>
                  <button 
                    type="button" 
                    (click)="confirmSlotBooking()"
                    class="w-1/2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md cursor-pointer transition text-center"
                  >
                    Confirm & Book Slot
                  </button>
                </div>
              </div>
            }

            <!-- ========================================================= -->
            <!-- STEP 2 CONTENT: COMPLETION & TOKEN SUMMARY -->
            <!-- ========================================================= -->
            @if (slotBookingStep() === 2) {
              <div class="space-y-4 py-2 text-center animate-fade-in">
                <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                  <app-icon name="check" wrapperClass="w-9 h-9 text-emerald-600" />
                </div>

                <div class="space-y-1">
                  <h4 class="text-lg font-extrabold text-slate-900">Slot Booked & Token Issued!</h4>
                  <p class="text-xs text-slate-500">Patient has been added to Today's Active Patient Queue</p>
                </div>

                <!-- Summary Card -->
                @if (bookedTokenResult(); as res) {
                  <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span class="font-bold text-slate-500 uppercase">TOKEN ISSUED</span>
                      <span class="text-sm font-extrabold text-teal-700 bg-teal-100/70 px-2.5 py-0.5 rounded-md">{{ res.tokenNumber }}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <span class="block text-slate-400 text-[10px] uppercase font-bold">Patient Name</span>
                        <span class="font-bold text-slate-900 text-sm">{{ res.patientName }}</span>
                      </div>
                      <div>
                        <span class="block text-slate-400 text-[10px] uppercase font-bold">Patient ID</span>
                        <span class="font-mono font-bold text-teal-700 text-xs">{{ res.patientId }}</span>
                      </div>
                      <div>
                        <span class="block text-slate-400 text-[10px] uppercase font-bold">Assigned Doctor</span>
                        <span class="font-semibold text-slate-900">{{ res.doctorName }}</span>
                      </div>
                      <div>
                        <span class="block text-slate-400 text-[10px] uppercase font-bold">OPD Room & Dept</span>
                        <span class="font-semibold text-slate-900">{{ res.room }} • {{ res.department }}</span>
                      </div>
                      <div>
                        <span class="block text-slate-400 text-[10px] uppercase font-bold">Slot Time</span>
                        <span class="font-semibold text-slate-900">{{ res.time }}</span>
                      </div>
                      <div>
                        <span class="block text-slate-400 text-[10px] uppercase font-bold">Queue Status</span>
                        <span class="inline-flex items-center gap-1 font-semibold text-amber-700">
                          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Waiting
                        </span>
                      </div>
                    </div>
                  </div>
                }

                <div class="pt-2">
                  <button 
                    type="button" 
                    (click)="isSlotBookingModalOpen.set(false); activeTab.set('queue')"
                    class="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md cursor-pointer transition text-center"
                  >
                    Go to Patient Queue →
                  </button>
                </div>
              </div>
            }

          </div>
        </div>
      }

      <!-- ============================================================= -->
      <!-- MODAL 2: BOOK APPOINTMENT & GENERATE TOKEN -->
      <!-- ============================================================= -->
      @if (isBookModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 class="text-lg font-bold text-slate-900">Book Appointment & Issue Token</h3>
                <p class="text-xs text-slate-500">Patient: <strong class="text-teal-700">{{ activeBookingPatient()?.name }}</strong></p>
              </div>
              <button 
                type="button" 
                (click)="isBookModalOpen.set(false)"
                class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <app-icon name="x" wrapperClass="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <form [formGroup]="bookForm" (ngSubmit)="onBookAppointmentSubmit()" class="space-y-3">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Select Doctor & Room</label>
                <select 
                  formControlName="doctorId"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                >
                  @for (d of doctors(); track d.id) {
                    <option [value]="d.id">{{ d.name }} ({{ d.specialty }} - {{ d.room }})</option>
                  }
                </select>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    formControlName="date"
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Time Slot</label>
                  <select 
                    formControlName="timeSlot"
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Appointment Type</label>
                <select 
                  formControlName="type"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Phone Callback">Phone Callback Booking</option>
                  <option value="Physical Walk-In">Physical Walk-In</option>
                  <option value="Online Appointment">Follow-Up Consultation</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div class="pt-3 flex items-center gap-3">
                <button 
                  type="button" 
                  (click)="isBookModalOpen.set(false)"
                  class="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="w-1/2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md cursor-pointer"
                >
                  Generate Token & Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- ============================================================= -->
      <!-- MODAL 3: CANCEL APPOINTMENT WITH REASON -->
      <!-- ============================================================= -->
      @if (isCancelModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 class="text-lg font-bold text-slate-900">Cancel Appointment</h3>
                <p class="text-xs text-slate-500">Patient: <strong class="text-slate-800">{{ activeCancelTarget()?.patientName }}</strong></p>
              </div>
              <button 
                type="button" 
                (click)="isCancelModalOpen.set(false)"
                class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition text-slate-600"
                aria-label="Close"
              >
                <app-icon name="x" wrapperClass="w-4 h-4" />
              </button>
            </div>

            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Reason for Cancellation
                </label>
                <select 
                  [(ngModel)]="cancelReasonSelection"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="Doctor emergency leave">Doctor on emergency leave</option>
                  <option value="Patient requested cancellation">Patient requested cancellation</option>
                  <option value="Slot unavailable / Overbooked">Slot unavailable / Overbooked</option>
                  <option value="Duplicate booking">Duplicate booking</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              @if (cancelReasonSelection === 'Other') {
                <div class="space-y-1 animate-fade-in">
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Specify Reason <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    [(ngModel)]="customCancelReason"
                    placeholder="Enter reason for cancellation..."
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              }

              <div class="pt-2 flex items-center gap-3">
                <button 
                  type="button" 
                  (click)="isCancelModalOpen.set(false)"
                  class="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 cursor-pointer transition shadow-2xs text-center"
                >
                  Keep Booking
                </button>
                <button 
                  type="button" 
                  (click)="confirmCancelAppointment()"
                  [disabled]="cancelReasonSelection === 'Other' && !customCancelReason.trim()"
                  class="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md cursor-pointer transition text-center"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ============================================================= -->
      <!-- MODAL 4: RESCHEDULE / MOVE APPOINTMENT SLOT (IMAGE SPEC) -->
      <!-- ============================================================= -->
      @if (isRescheduleModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div class="bg-white rounded-3xl p-6 sm:p-7 max-w-md sm:max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            
            <!-- Modal Header (Move Slot / Reassign Slot) -->
            <div class="relative flex flex-col items-center justify-center pb-2 border-b border-slate-100">
              <h2 class="text-xl font-bold text-slate-900 text-center">
                {{ activeReassignToken() ? 'Reassign Patient Slot' : 'Move Slot' }}
              </h2>
              <p class="text-xs text-slate-500 font-medium mt-0.5 text-center">
                @if (activeReassignToken(); as t) {
                  Patient: <strong class="text-teal-700">{{ t.patientName }}</strong> ({{ t.tokenNumber }}) • Current: {{ t.doctorName }}
                } @else if (activeRescheduleTarget(); as req) {
                  Patient: <strong class="text-teal-700">{{ req.patientName }}</strong> ({{ req.patientId }})
                }
              </p>
              <button 
                type="button" 
                (click)="isRescheduleModalOpen.set(false)"
                class="absolute right-0 top-0 w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition text-slate-600"
                aria-label="Close"
              >
                <app-icon name="x" wrapperClass="w-4 h-4" />
              </button>
            </div>

            <!-- 1. Top Doctor Dropdown (Exact layout from image) -->
            <div class="space-y-1.5 pt-1">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700">SELECT DOCTOR</label>
              <div class="relative">
                <select 
                  [ngModel]="rescheduleDoctorId"
                  (ngModelChange)="onRescheduleDoctorChange($event)"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer pr-10"
                >
                  @for (d of doctors(); track d.id) {
                    <option [value]="d.id">{{ d.name }} — {{ d.specialty }} ({{ d.room }})</option>
                  }
                </select>
                <div class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <app-icon name="chevron-down" wrapperClass="w-4 h-4" />
                </div>
              </div>
            </div>

            <!-- 2. Date Selector (7 Days) -->
            <div class="space-y-2 pt-1">
              <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
                @for (d of rescheduleDateOptions; track d.fullDate) {
                  <button 
                    type="button"
                    [disabled]="!d.isAvailable"
                    (click)="selectRescheduleDate(d.fullDate)"
                    class="py-2.5 px-1 rounded-2xl text-center transition flex flex-col items-center justify-center select-none"
                    [class]="!d.isAvailable 
                      ? 'bg-slate-100 border border-slate-200 cursor-not-allowed' 
                      : (rescheduleDate === d.fullDate 
                        ? 'border-2 border-teal-600 bg-teal-50/50 text-teal-900 shadow-2xs cursor-pointer font-bold' 
                        : 'border border-slate-200 bg-white hover:border-teal-300 text-slate-700 cursor-pointer font-medium')"
                  >
                    <span class="text-[10px] sm:text-xs uppercase tracking-wider leading-none font-semibold" 
                      [class]="!d.isAvailable ? 'text-slate-400' : (rescheduleDate === d.fullDate ? 'text-teal-700' : 'text-slate-500')">
                      {{ d.dayOfWeek }}
                    </span>
                    <span class="text-sm sm:text-base font-extrabold leading-tight mt-1" 
                      [class]="!d.isAvailable ? 'text-slate-500' : (rescheduleDate === d.fullDate ? 'text-teal-950' : 'text-slate-800')">
                      {{ d.dayNumber }}
                    </span>
                  </button>
                }
              </div>
              <div class="h-1 w-full bg-slate-200 rounded-full"></div>
            </div>

            <!-- 3. Available Slots Header & Selected Date -->
            <div class="flex items-center justify-between pt-1">
              <span class="text-sm font-bold text-slate-900">Available Slots</span>
              <span class="text-xs font-semibold text-teal-700">{{ rescheduleDate }}</span>
            </div>

            <!-- 4. 2-Column Time Slot Grid (12 Slots) -->
            <div class="grid grid-cols-2 gap-2.5">
              @for (slot of availableTimeSlots; track slot) {
                @if (isTimeSlotAvailable(slot, rescheduleDate, rescheduleDoctorId)) {
                  <button 
                    type="button" 
                    (click)="rescheduleSlot = slot"
                    class="py-3 px-3 rounded-2xl text-center text-xs sm:text-sm font-bold transition cursor-pointer flex items-center justify-center"
                    [class]="rescheduleSlot === slot 
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs border-2 border-teal-600' 
                      : 'bg-white hover:bg-teal-50/50 text-slate-800 border border-slate-200 hover:border-teal-300'"
                  >
                    {{ slot }}
                  </button>
                } @else {
                  <button 
                    type="button" 
                    disabled
                    class="py-3 px-3 rounded-2xl text-center text-xs sm:text-sm font-semibold bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed select-none flex items-center justify-center"
                  >
                    {{ slot }}
                  </button>
                }
              }
            </div>

            <!-- 5. Bottom Action Buttons -->
            <div class="pt-3 flex items-center gap-3">
              <button 
                type="button" 
                (click)="isRescheduleModalOpen.set(false)"
                class="w-1/2 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 cursor-pointer transition shadow-2xs text-center"
              >
                Cancel
              </button>
              <button 
                type="button" 
                (click)="confirmReschedule()"
                [disabled]="!isTimeSlotAvailable(rescheduleSlot, rescheduleDate, rescheduleDoctorId)"
                class="w-1/2 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer transition text-center"
              >
                {{ activeReassignToken() ? 'Reassign Slot' : 'Move Slot' }}
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ============================================================= -->
      <!-- MODAL 5: FULL PATIENT 360° DETAILS -->
      <!-- ============================================================= -->
      @if (isPatientDetailsModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-fade-in">
          <div class="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
            
            <!-- Top Patient Bar -->
            <div class="px-6 py-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div class="flex items-center gap-3">
                <app-avatar [name]="activePatientDetails()?.name || 'Patient'" sizeClass="w-11 h-11 rounded-2xl ring-2 ring-teal-400/40" />
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-base sm:text-lg font-bold text-white">{{ activePatientDetails()?.name }}</h3>
                    <span class="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      {{ activePatientDetails()?.id }}
                    </span>
                  </div>
                  <p class="text-xs text-teal-100/80">
                    {{ activePatientDetails()?.gender }}, {{ activePatientDetails()?.age }} yrs • DOB: {{ activePatientDetails()?.dob }} • Blood: <strong class="text-white">{{ activePatientDetails()?.bloodGroup }}</strong>
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                (click)="isPatientDetailsModalOpen.set(false)"
                class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
                aria-label="Close"
              >
                <app-icon name="x" wrapperClass="w-4 h-4 text-white" />
              </button>
            </div>

            <!-- Tab Switcher Navigation (Pill Tabs with Space-Around Theme) -->
            <div class="flex items-center justify-around gap-2 px-3 sm:px-6 py-3 bg-slate-100/90 border-b border-slate-200 shrink-0 w-full overflow-x-auto">
              <button 
                type="button" 
                (click)="patientDetailsTab.set('personal')"
                class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                [class]="patientDetailsTab() === 'personal' ? 'bg-white text-teal-800 shadow-xs border border-teal-300 ring-2 ring-teal-500/10' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'"
              >
                <app-icon name="user" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                <span>Personal Info</span>
              </button>

              <button 
                type="button" 
                (click)="patientDetailsTab.set('clinical')"
                class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                [class]="patientDetailsTab() === 'clinical' ? 'bg-white text-teal-800 shadow-xs border border-teal-300 ring-2 ring-teal-500/10' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'"
              >
                <app-icon name="activity" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                <span>Clinical & Vitals</span>
              </button>

              <button 
                type="button" 
                (click)="patientDetailsTab.set('medications')"
                class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                [class]="patientDetailsTab() === 'medications' ? 'bg-white text-teal-800 shadow-xs border border-teal-300 ring-2 ring-teal-500/10' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'"
              >
                <app-icon name="pill" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                <span>Current Medications</span>
              </button>

              <button 
                type="button" 
                (click)="patientDetailsTab.set('visits')"
                class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                [class]="patientDetailsTab() === 'visits' ? 'bg-white text-teal-800 shadow-xs border border-teal-300 ring-2 ring-teal-500/10' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'"
              >
                <app-icon name="calendar" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                <span>Previous Visits ({{ activePatientDetails()?.previousVisits?.length || 0 }})</span>
              </button>

              <button 
                type="button" 
                (click)="patientDetailsTab.set('records')"
                class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                [class]="patientDetailsTab() === 'records' ? 'bg-white text-teal-800 shadow-xs border border-teal-300 ring-2 ring-teal-500/10' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'"
              >
                <app-icon name="receipt" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                <span>Health Records ({{ activePatientDetails()?.healthRecords?.length || 0 }})</span>
              </button>
            </div>

            <!-- Modal Body Content -->
            <div class="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
              
              <!-- 1. PERSONAL DETAILS TAB -->
              @if (patientDetailsTab() === 'personal') {
                <div class="space-y-4 animate-fade-in text-xs sm:text-sm">
                  <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                    <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Contact & Location</span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div class="flex items-center gap-3 py-1.5 border-b border-slate-200/60">
                        <span class="text-slate-500 font-medium shrink-0">Phone:</span>
                        <strong class="text-slate-900">{{ activePatientDetails()?.phone }}</strong>
                      </div>
                      <div class="flex items-center gap-3 py-1.5 border-b border-slate-200/60">
                        <span class="text-slate-500 font-medium shrink-0">Email:</span>
                        <strong class="text-slate-900">{{ activePatientDetails()?.email }}</strong>
                      </div>
                      <div class="flex items-baseline gap-3 py-1.5 border-b border-slate-200/60 sm:col-span-2">
                        <span class="text-slate-500 font-medium shrink-0">Address:</span>
                        <strong class="text-slate-900">{{ activePatientDetails()?.address }}</strong>
                      </div>
                      <div class="flex items-center gap-3 py-1.5 sm:col-span-2">
                        <span class="text-slate-500 font-medium shrink-0">Emergency Contact:</span>
                        <strong class="text-slate-900">{{ activePatientDetails()?.emergencyContact }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- 2. CLINICAL & VITALS TAB -->
              @if (patientDetailsTab() === 'clinical') {
                <div class="space-y-4 animate-fade-in">
                  
                  <!-- Sub-Tab Header Bar (Pill Tabs Equally Occupying Space) -->
                  <div class="grid grid-cols-3 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 w-full shrink-0">
                    <button 
                      type="button" 
                      (click)="clinicalSubTab.set('vitals')"
                      class="py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 text-center w-full whitespace-nowrap"
                      [class]="clinicalSubTab() === 'vitals' ? 'bg-white text-teal-800 shadow-2xs border border-teal-300' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'"
                    >
                      <app-icon name="activity" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                      <span>Vitals History ({{ (activePatientDetails()?.previousVitals || []).length }})</span>
                    </button>

                    <button 
                      type="button" 
                      (click)="clinicalSubTab.set('allergies')"
                      class="py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 text-center w-full whitespace-nowrap"
                      [class]="clinicalSubTab() === 'allergies' ? 'bg-white text-teal-800 shadow-2xs border border-teal-300' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'"
                    >
                      <app-icon name="alert-triangle" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                      <span>Allergies & Reactions ({{ (activePatientDetails()?.allergies || []).length }})</span>
                    </button>

                    <button 
                      type="button" 
                      (click)="clinicalSubTab.set('chronic')"
                      class="py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 text-center w-full whitespace-nowrap"
                      [class]="clinicalSubTab() === 'chronic' ? 'bg-white text-teal-800 shadow-2xs border border-teal-300' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'"
                    >
                      <app-icon name="shield-check" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                      <span>Chronic Conditions ({{ (activePatientDetails()?.chronicConditionsList || []).length }})</span>
                    </button>
                  </div>

                  <!-- 2.1 SUB-TAB: PREVIOUS VITALS TABLE -->
                  @if (clinicalSubTab() === 'vitals') {
                    <div class="space-y-3 animate-fade-in">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Patient Vitals History & Measurements</span>
                        <span class="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/70">
                          {{ (activePatientDetails()?.previousVitals || []).length }} Recorded Entries
                        </span>
                      </div>

                      <div class="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xs">
                        <div class="overflow-x-auto">
                          <table class="w-full text-left border-collapse text-xs sm:text-sm">
                            <thead>
                              <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                                <th class="py-3 px-4">Date & Time</th>
                                <th class="py-3 px-4">Weight</th>
                                <th class="py-3 px-4">BP</th>
                                <th class="py-3 px-4">Pulse</th>
                                <th class="py-3 px-4">SpO2</th>
                                <th class="py-3 px-4 whitespace-nowrap">Blood Sugar</th>
                              </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 text-slate-800">
                              @for (v of paginatedPatientVitals(); track v.recordedAt) {
                                <tr class="hover:bg-teal-50/30 transition-colors">
                                  <td class="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                                    {{ v.recordedAt }}
                                  </td>
                                  <td class="py-3.5 px-4 text-slate-800 font-medium whitespace-nowrap">
                                    <div class="flex items-center gap-1.5">
                                      <span>{{ v.weight }}</span>
                                      @if (v.bmi) {
                                        <span class="text-[11px] text-slate-500 font-normal">(BMI: {{ v.bmi }})</span>
                                      }
                                    </div>
                                  </td>
                                  <td class="py-3.5 px-4 text-slate-800 font-medium whitespace-nowrap">
                                    {{ v.bp }}
                                  </td>
                                  <td class="py-3.5 px-4 text-slate-800 font-medium whitespace-nowrap">
                                    {{ v.pulse }}
                                  </td>
                                  <td class="py-3.5 px-4 text-slate-800 font-medium whitespace-nowrap">
                                    {{ v.spo2 }}
                                  </td>
                                  <td class="py-3.5 px-4 text-slate-800 font-medium whitespace-nowrap">
                                    {{ v.bloodSugar || '110 mg/dL' }}
                                  </td>
                                </tr>
                              } @empty {
                                <tr>
                                  <td colspan="6" class="py-8 text-center text-slate-500 text-xs">
                                    No vitals recorded for this patient.
                                  </td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>

                        <!-- Table Paginator: Vitals -->
                        <div class="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 select-none text-xs text-slate-600">
                          <div>
                            @if ((activePatientDetails()?.previousVitals || []).length > 0) {
                              Showing <strong class="text-slate-900 font-semibold">{{ (patientVitalsPage() - 1) * patientVitalsPageSize() + 1 }}</strong> to <strong class="text-slate-900 font-semibold">{{ Math.min(patientVitalsPage() * patientVitalsPageSize(), (activePatientDetails()?.previousVitals || []).length) }}</strong> of <strong class="text-slate-900 font-semibold">{{ (activePatientDetails()?.previousVitals || []).length }}</strong> vitals records
                            } @else {
                              <span>0 vitals records</span>
                            }
                          </div>

                          <div class="flex items-center gap-2">
                            <div class="flex items-center gap-1">
                              <button 
                                type="button" 
                                (click)="firstPatientVitalsPage()"
                                [disabled]="patientVitalsPage() === 1"
                                class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                                title="First Page"
                              >
                                &laquo;
                              </button>
                              <button 
                                type="button" 
                                (click)="prevPatientVitalsPage()"
                                [disabled]="patientVitalsPage() === 1"
                                class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                                title="Previous Page"
                              >
                                &lsaquo;
                              </button>

                              @for (p of getPatientVitalsPagesArray(); track p) {
                                <button 
                                  type="button" 
                                  (click)="setPatientVitalsPage(p)"
                                  class="w-7 h-7 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center"
                                  [class]="p === patientVitalsPage() ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
                                >
                                  {{ p }}
                                </button>
                              }

                              <button 
                                type="button" 
                                (click)="nextPatientVitalsPage()"
                                [disabled]="patientVitalsPage() === totalPatientVitalsPages()"
                                class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                                title="Next Page"
                              >
                                &rsaquo;
                              </button>
                              <button 
                                type="button" 
                                (click)="lastPatientVitalsPage()"
                                [disabled]="patientVitalsPage() === totalPatientVitalsPages()"
                                class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                                title="Last Page"
                              >
                                &raquo;
                              </button>
                            </div>

                            <div class="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                              <span class="text-slate-500 text-[11px]">Rows:</span>
                              <div class="relative inline-block">
                                <select 
                                  [ngModel]="patientVitalsPageSize()" 
                                  (ngModelChange)="onPatientVitalsPageSizeChange($event)"
                                  class="appearance-none bg-white border border-slate-200 rounded-lg pl-2.5 pr-6 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-2xs"
                                >
                                  <option [value]="5">5</option>
                                  <option [value]="10">10</option>
                                  <option [value]="20">20</option>
                                  <option [value]="50">50</option>
                                </select>
                                <div class="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                  <app-icon name="chevron-down" wrapperClass="w-3 h-3" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }

                  <!-- 2.2 SUB-TAB: ALLERGIES & REACTIONS TABLE -->
                  @if (clinicalSubTab() === 'allergies') {
                    <div class="space-y-3 animate-fade-in">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Documented Allergies & Previous Diagnoses</span>
                        <span class="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/70">
                          {{ (activePatientDetails()?.allergies || []).length }} Documented Allergies
                        </span>
                      </div>

                      <div class="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xs">
                        <div class="overflow-x-auto">
                          <table class="w-full text-left border-collapse text-xs sm:text-sm">
                            <thead>
                              <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                                <th class="py-3 px-4 whitespace-nowrap">Diagnosis Date & Time</th>
                                <th class="py-3 px-4">Allergen / Allergy</th>
                                <th class="py-3 px-4">Severity</th>
                                <th class="py-3 px-4">Reaction & Symptoms</th>
                                <th class="py-3 px-4 whitespace-nowrap">Duration</th>
                                <th class="py-3 px-4 whitespace-nowrap">Status / Resolution</th>
                                <th class="py-3 px-4 whitespace-nowrap">Diagnosed By</th>
                              </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 text-slate-800">
                              @for (al of paginatedPatientAllergies(); track al.allergen) {
                                <tr class="hover:bg-teal-50/30 transition-colors">
                                  <td class="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                                    {{ al.diagnosedDate || '14 Mar 2018, 10:30 AM' }}
                                  </td>
                                  <td class="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                    {{ al.allergen }}
                                  </td>
                                  <td class="py-3.5 px-4 whitespace-nowrap">
                                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      {{ al.severity }}
                                    </span>
                                  </td>
                                  <td class="py-3.5 px-4 text-slate-700 font-medium">
                                    {{ al.reaction }}
                                  </td>
                                  <td class="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                                    {{ al.duration || 'Ongoing' }}
                                  </td>
                                  <td class="py-3.5 px-4 whitespace-nowrap">
                                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      {{ al.status || 'Active - Under Management' }}
                                    </span>
                                  </td>
                                  <td class="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                                    {{ al.diagnosedBy || 'Dr. Clara Reynolds, MD' }}
                                  </td>
                                </tr>
                              } @empty {
                                <tr>
                                  <td colspan="7" class="py-8 text-center text-slate-500 text-xs">
                                    No known allergies documented for this patient.
                                  </td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>

                        <!-- Table Paginator: Allergies -->
                        <div class="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 select-none text-xs text-slate-600">
                          <div>
                            @if ((activePatientDetails()?.allergies || []).length > 0) {
                              Showing <strong class="text-slate-900 font-semibold">{{ (patientAllergiesPage() - 1) * patientAllergiesPageSize() + 1 }}</strong> to <strong class="text-slate-900 font-semibold">{{ Math.min(patientAllergiesPage() * patientAllergiesPageSize(), (activePatientDetails()?.allergies || []).length) }}</strong> of <strong class="text-slate-900 font-semibold">{{ (activePatientDetails()?.allergies || []).length }}</strong> allergies
                            } @else {
                              <span>0 allergies</span>
                            }
                          </div>

                          <div class="flex items-center gap-2">
                            <div class="flex items-center gap-1">
                              <button 
                                type="button" 
                                (click)="firstPatientAllergiesPage()"
                                [disabled]="patientAllergiesPage() === 1"
                                class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                                title="First Page"
                              >
                                &laquo;
                              </button>
                              <button 
                                type="button" 
                                (click)="prevPatientAllergiesPage()"
                                [disabled]="patientAllergiesPage() === 1"
                                class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                                title="Previous Page"
                              >
                                &lsaquo;
                              </button>

                              @for (p of getPatientAllergiesPagesArray(); track p) {
                                <button 
                                  type="button" 
                                  (click)="setPatientAllergiesPage(p)"
                                  class="w-7 h-7 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center"
                                  [class]="p === patientAllergiesPage() ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
                                >
                                  {{ p }}
                                </button>
                              }

                              <button 
                                type="button" 
                                (click)="nextPatientAllergiesPage()"
                                [disabled]="patientAllergiesPage() === totalPatientAllergiesPages()"
                                class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                                title="Next Page"
                              >
                                &rsaquo;
                              </button>
                              <button 
                                type="button" 
                                (click)="lastPatientAllergiesPage()"
                                [disabled]="patientAllergiesPage() === totalPatientAllergiesPages()"
                                class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                                title="Last Page"
                              >
                                &raquo;
                              </button>
                            </div>

                            <div class="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                              <span class="text-slate-500 text-[11px]">Rows:</span>
                              <div class="relative inline-block">
                                <select 
                                  [ngModel]="patientAllergiesPageSize()" 
                                  (ngModelChange)="onPatientAllergiesPageSizeChange($event)"
                                  class="appearance-none bg-white border border-slate-200 rounded-lg pl-2.5 pr-6 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-2xs"
                                >
                                  <option [value]="5">5</option>
                                  <option [value]="10">10</option>
                                  <option [value]="20">20</option>
                                  <option [value]="50">50</option>
                                </select>
                                <div class="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                  <app-icon name="chevron-down" wrapperClass="w-3 h-3" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }

                  <!-- 2.3 SUB-TAB: CHRONIC CONDITIONS TABLE -->
                  @if (clinicalSubTab() === 'chronic') {
                    <div class="space-y-3 animate-fade-in">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Chronic Conditions & Disease History</span>
                        <span class="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/70">
                          {{ (activePatientDetails()?.chronicConditionsList || []).length }} Recorded Conditions
                        </span>
                      </div>

                      <div class="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xs">
                        <div class="overflow-x-auto">
                          <table class="w-full text-left border-collapse text-xs sm:text-sm">
                            <thead>
                              <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                                <th class="py-3 px-4 whitespace-nowrap">Diagnosed Date</th>
                                <th class="py-3 px-4">Condition / Disease</th>
                                <th class="py-3 px-4">Severity / Stage</th>
                                <th class="py-3 px-4 whitespace-nowrap">Managing Doctor</th>
                                <th class="py-3 px-4 whitespace-nowrap">Duration</th>
                                <th class="py-3 px-4 whitespace-nowrap">Status / Outcome</th>
                                <th class="py-3 px-4">Clinical Notes</th>
                              </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 text-slate-800">
                              @for (cc of paginatedPatientChronic(); track cc.condition) {
                                <tr class="hover:bg-teal-50/30 transition-colors">
                                  <td class="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                                    {{ cc.diagnosedDate }}
                                  </td>
                                  <td class="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                    {{ cc.condition }}
                                  </td>
                                  <td class="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                                    {{ cc.severity || 'Moderate' }}
                                  </td>
                                  <td class="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                                    {{ cc.doctor || 'Dr. Clara Reynolds, MD' }}
                                  </td>
                                  <td class="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                                    {{ cc.duration || 'Ongoing' }}
                                  </td>
                                  <td class="py-3.5 px-4 whitespace-nowrap">
                                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      {{ cc.status }}
                                    </span>
                                  </td>
                                  <td class="py-3.5 px-4 text-xs text-slate-600">
                                    {{ cc.notes || 'Routine follow-up advised.' }}
                                  </td>
                                </tr>
                              } @empty {
                                <tr>
                                  <td colspan="7" class="py-8 text-center text-slate-500 text-xs">
                                    No chronic conditions documented for this patient.
                                  </td>
                                </tr>
                              }
                            </tbody>
                          </table>
                        </div>

                        <!-- Table Paginator: Chronic Conditions -->
                        <div class="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 select-none text-xs text-slate-600">
                          <div>
                            @if ((activePatientDetails()?.chronicConditionsList || []).length > 0) {
                              Showing <strong class="text-slate-900 font-semibold">{{ (patientChronicPage() - 1) * patientChronicPageSize() + 1 }}</strong> to <strong class="text-slate-900 font-semibold">{{ Math.min(patientChronicPage() * patientChronicPageSize(), (activePatientDetails()?.chronicConditionsList || []).length) }}</strong> of <strong class="text-slate-900 font-semibold">{{ (activePatientDetails()?.chronicConditionsList || []).length }}</strong> conditions
                            } @else {
                              <span>0 chronic conditions</span>
                            }
                          </div>

                          <div class="flex items-center gap-2">
                            <div class="flex items-center gap-1">
                              <button 
                                type="button" 
                                (click)="firstPatientChronicPage()"
                                [disabled]="patientChronicPage() === 1"
                                class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                                title="First Page"
                              >
                                &laquo;
                              </button>
                              <button 
                                type="button" 
                                (click)="prevPatientChronicPage()"
                                [disabled]="patientChronicPage() === 1"
                                class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                                title="Previous Page"
                              >
                                &lsaquo;
                              </button>

                              @for (p of getPatientChronicPagesArray(); track p) {
                                <button 
                                  type="button" 
                                  (click)="setPatientChronicPage(p)"
                                  class="w-7 h-7 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center"
                                  [class]="p === patientChronicPage() ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
                                >
                                  {{ p }}
                                </button>
                              }

                              <button 
                                type="button" 
                                (click)="nextPatientChronicPage()"
                                [disabled]="patientChronicPage() === totalPatientChronicPages()"
                                class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                                title="Next Page"
                              >
                                &rsaquo;
                              </button>
                              <button 
                                type="button" 
                                (click)="lastPatientChronicPage()"
                                [disabled]="patientChronicPage() === totalPatientChronicPages()"
                                class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                                title="Last Page"
                              >
                                &raquo;
                              </button>
                            </div>

                            <div class="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                              <span class="text-slate-500 text-[11px]">Rows:</span>
                              <div class="relative inline-block">
                                <select 
                                  [ngModel]="patientChronicPageSize()" 
                                  (ngModelChange)="onPatientChronicPageSizeChange($event)"
                                  class="appearance-none bg-white border border-slate-200 rounded-lg pl-2.5 pr-6 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer shadow-2xs"
                                >
                                  <option [value]="5">5</option>
                                  <option [value]="10">10</option>
                                  <option [value]="20">20</option>
                                  <option [value]="50">50</option>
                                </select>
                                <div class="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                  <app-icon name="chevron-down" wrapperClass="w-3 h-3" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }

                </div>
              }

              <!-- 3. CURRENT MEDICATIONS TAB -->
              @if (patientDetailsTab() === 'medications') {
                <div class="space-y-3 animate-fade-in">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Prescriptions & Current Medications</span>
                    <span class="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/70">
                      {{ (activePatientDetails()?.currentMedications || []).length }} Active Prescriptions
                    </span>
                  </div>

                  <div class="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xs">
                    <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                            <th class="py-3 px-4">Medication</th>
                            <th class="py-3 px-4">Daily Dosage</th>
                            <th class="py-3 px-4">Prescribed By</th>
                            <th class="py-3 px-4 whitespace-nowrap">Prescription Date</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-800">
                          @for (med of paginatedPatientMedications(); track med.name) {
                            <tr class="hover:bg-teal-50/30 transition-colors">
                              <td class="py-3.5 px-4 font-semibold text-slate-900">
                                <div class="flex items-center gap-2">
                                  <span>{{ med.name }}</span>
                                  <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 shrink-0">{{ med.dosage }}</span>
                                </div>
                              </td>
                              <td class="py-3.5 px-4">
                                <div class="font-medium text-slate-800">{{ med.frequency }}</div>
                                @if (med.timing) {
                                  <div class="text-xs text-slate-500">{{ med.timing }}</div>
                                }
                              </td>
                              <td class="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                                {{ med.doctor }}
                              </td>
                              <td class="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                                {{ med.startDate }}
                              </td>
                            </tr>
                          } @empty {
                            <tr>
                              <td colspan="4" class="py-8 text-center text-slate-500 text-xs">
                                No active medications recorded for this patient.
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>

                    <!-- Table Paginator: Current Medications (10 Rows Default) -->
                    <div class="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 select-none text-xs text-slate-600">
                      <div>
                        @if ((activePatientDetails()?.currentMedications || []).length > 0) {
                          Showing <strong class="text-slate-900 font-semibold">{{ (patientMedicationsPage() - 1) * patientMedicationsPageSize() + 1 }}</strong> to <strong class="text-slate-900 font-semibold">{{ Math.min(patientMedicationsPage() * patientMedicationsPageSize(), (activePatientDetails()?.currentMedications || []).length) }}</strong> of <strong class="text-slate-900 font-semibold">{{ (activePatientDetails()?.currentMedications || []).length }}</strong> medications
                        } @else {
                          <span>0 medications</span>
                        }
                      </div>

                      <div class="flex items-center gap-2">
                        <div class="flex items-center gap-1">
                          <button 
                            type="button" 
                            (click)="firstPatientMedicationsPage()"
                            [disabled]="patientMedicationsPage() === 1"
                            class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                            title="First Page"
                          >
                            &laquo;
                          </button>
                          <button 
                            type="button" 
                            (click)="prevPatientMedicationsPage()"
                            [disabled]="patientMedicationsPage() === 1"
                            class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                            title="Previous Page"
                          >
                            &lsaquo;
                          </button>
                          @for (p of getPatientMedicationsPagesArray(); track p) {
                            <button 
                              type="button" 
                              (click)="setPatientMedicationsPage(p)"
                              class="w-7 h-7 rounded-full text-xs transition cursor-pointer flex items-center justify-center font-bold"
                              [class]="patientMedicationsPage() === p 
                                ? 'bg-teal-50 text-teal-700 border border-teal-300 shadow-2xs font-extrabold ring-2 ring-teal-500/10' 
                                : 'text-slate-600 hover:bg-slate-100'"
                            >
                              {{ p }}
                            </button>
                          }
                          <button 
                            type="button" 
                            (click)="nextPatientMedicationsPage()"
                            [disabled]="patientMedicationsPage() === totalPatientMedicationsPages()"
                            class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                            title="Next Page"
                          >
                            &rsaquo;
                          </button>
                          <button 
                            type="button" 
                            (click)="lastPatientMedicationsPage()"
                            [disabled]="patientMedicationsPage() === totalPatientMedicationsPages()"
                            class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                            title="Last Page"
                          >
                            &raquo;
                          </button>
                        </div>

                        <div class="relative flex items-center pl-1 border-l border-slate-200">
                          <select 
                            [ngModel]="patientMedicationsPageSize()" 
                            (ngModelChange)="onPatientMedicationsPageSizeChange($event)"
                            class="py-1 pl-2.5 pr-7 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer appearance-none"
                          >
                            <option [value]="5">5</option>
                            <option [value]="10">10</option>
                            <option [value]="20">20</option>
                            <option [value]="50">50</option>
                          </select>
                          <div class="absolute right-2 pointer-events-none text-slate-400">
                            <app-icon name="chevron-down" wrapperClass="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- 4. PREVIOUS VISITS TAB (TABLE FORMAT WITH PRESCRIPTION & RECEIPT ACTIONS) -->
              @if (patientDetailsTab() === 'visits') {
                <div class="space-y-3 animate-fade-in">
                  <div>
                    <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Hospital Visit & Consultation History</span>
                  </div>

                  <div class="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xs">
                    <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                            <th class="py-3 px-4">Attending Doctor</th>
                            <th class="py-3 px-4 whitespace-nowrap">Visit Date</th>
                            <th class="py-3 px-4 whitespace-nowrap">Slot Time</th>
                            <th class="py-3 px-4">Status</th>
                            <th class="py-3 px-4 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-800">
                          @for (visit of paginatedPatientVisits(); track visit.id) {
                            <tr class="hover:bg-teal-50/30 transition-colors">
                              <td class="py-3.5 px-4 font-semibold text-slate-900">
                                <div>{{ visit.doctorName }}</div>
                                <div class="text-xs text-slate-500 font-normal">{{ visit.specialty }} • {{ visit.room }}</div>
                              </td>
                              <td class="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                                {{ visit.date }}
                              </td>
                              <td class="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                                {{ visit.timeSlot || '10:00 AM' }}
                              </td>
                              <td class="py-3.5 px-4 whitespace-nowrap">
                                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                                  {{ visit.status }}
                                </span>
                              </td>
                              <td class="py-3.5 px-4 text-left whitespace-nowrap">
                                <div class="inline-flex items-center gap-2">
                                  @if (visit.prescription) {
                                    <div class="relative group/tooltip inline-block">
                                      <button 
                                        type="button" 
                                        (click)="openVisitPrescription(visit, activePatientDetails()!)"
                                        class="w-8 h-8 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 hover:border-teal-600 transition cursor-pointer shadow-2xs hover:shadow-xs flex items-center justify-center"
                                        aria-label="Prescription"
                                      >
                                        <app-icon name="file-text" wrapperClass="w-4 h-4" />
                                      </button>
                                      <!-- Tooltip -->
                                      <div class="absolute bottom-full right-0 mb-1.5 hidden group-hover/tooltip:flex flex-col items-end pointer-events-none z-30 animate-fade-in">
                                        <div class="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg">
                                          Prescription
                                        </div>
                                        <div class="mr-3 w-2 h-1 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
                                      </div>
                                    </div>
                                  }

                                  @if (visit.receipt) {
                                    <div class="relative group/tooltip inline-block">
                                      <button 
                                        type="button" 
                                        (click)="downloadVisitReceiptPdf(visit, activePatientDetails()!)"
                                        class="w-8 h-8 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 hover:border-teal-600 transition cursor-pointer shadow-2xs hover:shadow-xs flex items-center justify-center"
                                        aria-label="Receipt"
                                      >
                                        <app-icon name="download" wrapperClass="w-4 h-4" />
                                      </button>
                                      <!-- Tooltip -->
                                      <div class="absolute bottom-full right-0 mb-1.5 hidden group-hover/tooltip:flex flex-col items-end pointer-events-none z-30 animate-fade-in">
                                        <div class="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg">
                                          Receipt
                                        </div>
                                        <div class="mr-3 w-2 h-1 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
                                      </div>
                                    </div>
                                  }
                                </div>
                              </td>
                            </tr>
                          } @empty {
                            <tr>
                              <td colspan="5" class="py-8 text-center text-slate-500 text-xs">
                                No prior hospital visits recorded for this patient.
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>

                    <!-- Table Paginator: Previous Visits (10 Rows Default) -->
                    <div class="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 select-none text-xs text-slate-600">
                      <div>
                        @if ((activePatientDetails()?.previousVisits || []).length > 0) {
                          Showing <strong class="text-slate-900 font-semibold">{{ (patientVisitsPage() - 1) * patientVisitsPageSize() + 1 }}</strong> to <strong class="text-slate-900 font-semibold">{{ Math.min(patientVisitsPage() * patientVisitsPageSize(), (activePatientDetails()?.previousVisits || []).length) }}</strong> of <strong class="text-slate-900 font-semibold">{{ (activePatientDetails()?.previousVisits || []).length }}</strong> visits
                        } @else {
                          <span>0 visits</span>
                        }
                      </div>

                      <div class="flex items-center gap-2">
                        <div class="flex items-center gap-1">
                          <button 
                            type="button" 
                            (click)="firstPatientVisitsPage()"
                            [disabled]="patientVisitsPage() === 1"
                            class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                            title="First Page"
                          >
                            &laquo;
                          </button>
                          <button 
                            type="button" 
                            (click)="prevPatientVisitsPage()"
                            [disabled]="patientVisitsPage() === 1"
                            class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                            title="Previous Page"
                          >
                            &lsaquo;
                          </button>
                          @for (p of getPatientVisitsPagesArray(); track p) {
                            <button 
                              type="button" 
                              (click)="setPatientVisitsPage(p)"
                              class="w-7 h-7 rounded-full text-xs transition cursor-pointer flex items-center justify-center font-bold"
                              [class]="patientVisitsPage() === p 
                                ? 'bg-teal-50 text-teal-700 border border-teal-300 shadow-2xs font-extrabold ring-2 ring-teal-500/10' 
                                : 'text-slate-600 hover:bg-slate-100'"
                            >
                              {{ p }}
                            </button>
                          }
                          <button 
                            type="button" 
                            (click)="nextPatientVisitsPage()"
                            [disabled]="patientVisitsPage() === totalPatientVisitsPages()"
                            class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                            title="Next Page"
                          >
                            &rsaquo;
                          </button>
                          <button 
                            type="button" 
                            (click)="lastPatientVisitsPage()"
                            [disabled]="patientVisitsPage() === totalPatientVisitsPages()"
                            class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                            title="Last Page"
                          >
                            &raquo;
                          </button>
                        </div>

                        <div class="relative flex items-center pl-1 border-l border-slate-200">
                          <select 
                            [ngModel]="patientVisitsPageSize()" 
                            (ngModelChange)="onPatientVisitsPageSizeChange($event)"
                            class="py-1 pl-2.5 pr-7 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer appearance-none"
                          >
                            <option [value]="5">5</option>
                            <option [value]="10">10</option>
                            <option [value]="20">20</option>
                            <option [value]="50">50</option>
                          </select>
                          <div class="absolute right-2 pointer-events-none text-slate-400">
                            <app-icon name="chevron-down" wrapperClass="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- 5. HEALTH RECORDS & LAB REPORTS TAB (TABLE FORMAT) -->
              @if (patientDetailsTab() === 'records') {
                <div class="space-y-3 animate-fade-in">
                  <div>
                    <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Diagnostic Lab & Medical Test Reports</span>
                  </div>

                  <div class="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xs">
                    <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                            <th class="py-3 px-4">Diagnostic Examination</th>
                            <th class="py-3 px-4 whitespace-nowrap">Facility Location</th>
                            <th class="py-3 px-4">Ordering Doctor</th>
                            <th class="py-3 px-4 whitespace-nowrap">Report Date</th>
                            <th class="py-3 px-4">Status</th>
                            <th class="py-3 px-4 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-800">
                          @for (rec of paginatedPatientRecords(); track rec.id) {
                            <tr class="hover:bg-teal-50/30 transition-colors">
                              <td class="py-3.5 px-4 font-semibold text-slate-900">
                                <div>{{ rec.testName }}</div>
                                <div class="text-xs text-slate-500 font-normal">{{ rec.category }}</div>
                              </td>
                              <td class="py-3.5 px-4 whitespace-nowrap">
                                <span 
                                  class="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide inline-flex items-center gap-1 border"
                                  [class]="rec.locationType === 'Hospital' 
                                    ? 'bg-teal-50 text-teal-800 border-teal-200' 
                                    : 'bg-indigo-50 text-indigo-800 border-indigo-200'"
                                >
                                  <span class="w-1.5 h-1.5 rounded-full" [class]="rec.locationType === 'Hospital' ? 'bg-teal-600' : 'bg-indigo-600'"></span>
                                  <span>{{ rec.locationType === 'Hospital' ? 'Hospital (In-House)' : 'External Lab (Out)' }}</span>
                                </span>
                              </td>
                              <td class="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                                {{ rec.doctor }}
                              </td>
                              <td class="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                                {{ rec.date }}
                              </td>
                              <td class="py-3.5 px-4 whitespace-nowrap">
                                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                                  {{ rec.status }}
                                </span>
                              </td>
                              <td class="py-3.5 px-4 text-left whitespace-nowrap">
                                <div class="inline-flex items-center gap-2">
                                  <!-- 1. Download Report Button -->
                                  <div class="relative group/tooltip inline-block">
                                    <button 
                                      type="button" 
                                      (click)="downloadLabReportPdf(rec, activePatientDetails()!)"
                                      class="w-8 h-8 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 hover:border-teal-600 transition cursor-pointer shadow-2xs hover:shadow-xs flex items-center justify-center"
                                      aria-label="Download Report"
                                    >
                                      <app-icon name="file-text" wrapperClass="w-4 h-4" />
                                    </button>
                                    <!-- Tooltip -->
                                    <div class="absolute bottom-full right-0 mb-1.5 hidden group-hover/tooltip:flex flex-col items-end pointer-events-none z-30 animate-fade-in">
                                      <div class="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg">
                                        Download Report
                                      </div>
                                      <div class="mr-3 w-2 h-1 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
                                    </div>
                                  </div>

                                  <!-- 2. Download Receipt Button -->
                                  @if (rec.receipt) {
                                    <div class="relative group/tooltip inline-block">
                                      <button 
                                        type="button" 
                                        (click)="downloadLabReceiptPdf(rec, activePatientDetails()!)"
                                        class="w-8 h-8 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 hover:border-teal-600 transition cursor-pointer shadow-2xs hover:shadow-xs flex items-center justify-center"
                                        aria-label="Download Receipt"
                                      >
                                        <app-icon name="receipt" wrapperClass="w-4 h-4" />
                                      </button>
                                      <!-- Tooltip -->
                                      <div class="absolute bottom-full right-0 mb-1.5 hidden group-hover/tooltip:flex flex-col items-end pointer-events-none z-30 animate-fade-in">
                                        <div class="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg">
                                          Download Receipt
                                        </div>
                                        <div class="mr-3 w-2 h-1 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
                                      </div>
                                    </div>
                                  }
                                </div>
                              </td>
                            </tr>
                          } @empty {
                            <tr>
                              <td colspan="6" class="py-8 text-center text-slate-500 text-xs">
                                No diagnostic lab records available for this patient.
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>

                    <!-- Table Paginator: Health Records (10 Rows Default) -->
                    <div class="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 select-none text-xs text-slate-600">
                      <div>
                        @if ((activePatientDetails()?.healthRecords || []).length > 0) {
                          Showing <strong class="text-slate-900 font-semibold">{{ (patientRecordsPage() - 1) * patientRecordsPageSize() + 1 }}</strong> to <strong class="text-slate-900 font-semibold">{{ Math.min(patientRecordsPage() * patientRecordsPageSize(), (activePatientDetails()?.healthRecords || []).length) }}</strong> of <strong class="text-slate-900 font-semibold">{{ (activePatientDetails()?.healthRecords || []).length }}</strong> records
                        } @else {
                          <span>0 records</span>
                        }
                      </div>

                      <div class="flex items-center gap-2">
                        <div class="flex items-center gap-1">
                          <button 
                            type="button" 
                            (click)="firstPatientRecordsPage()"
                            [disabled]="patientRecordsPage() === 1"
                            class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                            title="First Page"
                          >
                            &laquo;
                          </button>
                          <button 
                            type="button" 
                            (click)="prevPatientRecordsPage()"
                            [disabled]="patientRecordsPage() === 1"
                            class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                            title="Previous Page"
                          >
                            &lsaquo;
                          </button>
                          @for (p of getPatientRecordsPagesArray(); track p) {
                            <button 
                              type="button" 
                              (click)="setPatientRecordsPage(p)"
                              class="w-7 h-7 rounded-full text-xs transition cursor-pointer flex items-center justify-center font-bold"
                              [class]="patientRecordsPage() === p 
                                ? 'bg-teal-50 text-teal-700 border border-teal-300 shadow-2xs font-extrabold ring-2 ring-teal-500/10' 
                                : 'text-slate-600 hover:bg-slate-100'"
                            >
                              {{ p }}
                            </button>
                          }
                          <button 
                            type="button" 
                            (click)="nextPatientRecordsPage()"
                            [disabled]="patientRecordsPage() === totalPatientRecordsPages()"
                            class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                            title="Next Page"
                          >
                            &rsaquo;
                          </button>
                          <button 
                            type="button" 
                            (click)="lastPatientRecordsPage()"
                            [disabled]="patientRecordsPage() === totalPatientRecordsPages()"
                            class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                            title="Last Page"
                          >
                            &raquo;
                          </button>
                        </div>

                        <div class="relative flex items-center pl-1 border-l border-slate-200">
                          <select 
                            [ngModel]="patientRecordsPageSize()" 
                            (ngModelChange)="onPatientRecordsPageSizeChange($event)"
                            class="py-1 pl-2.5 pr-7 bg-slate-50 hover:bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer appearance-none"
                          >
                            <option [value]="5">5</option>
                            <option [value]="10">10</option>
                            <option [value]="20">20</option>
                            <option [value]="50">50</option>
                          </select>
                          <div class="absolute right-2 pointer-events-none text-slate-400">
                            <app-icon name="chevron-down" wrapperClass="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }

            </div>

            <!-- Bottom Action Bar -->
            <div class="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
              <button 
                type="button" 
                (click)="isPatientDetailsModalOpen.set(false)"
                class="px-5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ================================================================= -->
      <!-- MODAL 6: FULL PRESCRIPTION (Rx) DIALOG MODAL -->
      <!-- ================================================================= -->
      @if (selectedVisitPrescription(); as item) {
        <div class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-fade-in" (click)="closePrescriptionModal()">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up" (click)="$event.stopPropagation()">
            
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <app-icon name="file-text" wrapperClass="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-lg sm:text-xl font-bold tracking-tight text-white">Medical Prescription (Rx)</h3>
                  <p class="text-xs text-teal-100">HMS Healthcare Official Digital Prescription</p>
                </div>
              </div>

              <button 
                type="button" 
                (click)="closePrescriptionModal()"
                class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition"
                aria-label="Close"
              >
                <app-icon name="x" wrapperClass="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Body (Scrollable) -->
            <div class="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
              
              <!-- Meta Header Box: Patient & Doctor details -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span class="text-xs uppercase font-medium text-slate-500 block">Patient Name</span>
                  <span class="font-bold text-slate-900">{{ item.patientName }}</span>
                </div>
                <div>
                  <span class="text-xs uppercase font-medium text-slate-500 block">Patient ID</span>
                  <span class="font-bold text-teal-700 font-mono">{{ item.patientId }}</span>
                </div>
                <div>
                  <span class="text-xs uppercase font-medium text-slate-500 block">Rx Number</span>
                  <span class="font-bold text-slate-800 font-mono">{{ item.prescription.rxNumber }}</span>
                </div>
                <div>
                  <span class="text-xs uppercase font-medium text-slate-500 block">Date of Issue</span>
                  <span class="font-bold text-slate-800">{{ item.prescription.date }}</span>
                </div>
              </div>

              <!-- Doctor & Diagnosis Info -->
              <div class="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span class="text-xs uppercase font-semibold text-teal-800 block">Prescribing Specialist</span>
                  <span class="font-bold text-slate-900 text-sm sm:text-base">{{ item.doctorName }}</span>
                  <span class="text-xs text-slate-700 block">{{ item.specialty }} • Reg: {{ item.prescription.doctorReg }}</span>
                </div>

                <div class="sm:text-right">
                  <span class="text-xs uppercase font-semibold text-teal-800 block">Primary Diagnosis</span>
                  <span class="font-bold text-teal-900 text-xs sm:text-sm">{{ item.prescription.diagnosis }}</span>
                </div>
              </div>

              <!-- Prescribed Medicines Table -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-base font-serif font-bold text-teal-700">℞</span>
                  <h4 class="font-bold text-slate-900 text-sm">Prescribed Medications</h4>
                </div>

                <div class="overflow-x-auto rounded-xl border border-slate-200">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-slate-100 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-700">
                        <th class="p-3">Medicine & Strength</th>
                        <th class="p-3">Dosage</th>
                        <th class="p-3">Frequency</th>
                        <th class="p-3">Duration</th>
                        <th class="p-3">Instructions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-xs font-medium">
                      @for (med of item.prescription.medicines; track med.name) {
                        <tr class="hover:bg-slate-50">
                          <td class="p-3 font-bold text-slate-900">{{ med.name }}</td>
                          <td class="p-3">{{ med.dosage }}</td>
                          <td class="p-3 font-semibold text-teal-700">{{ med.frequency }}</td>
                          <td class="p-3">{{ med.duration }}</td>
                          <td class="p-3 text-slate-700">{{ med.instructions }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Doctor's Advice & Lifestyle Guidance -->
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider">Clinical Advice & Precautions</h4>
                <ul class="space-y-1.5 text-xs text-slate-700">
                  @for (adv of item.prescription.advice; track adv) {
                    <li class="flex items-start gap-2">
                      <span class="text-teal-600 font-bold">•</span>
                      <span>{{ adv }}</span>
                    </li>
                  }
                </ul>
              </div>

              <!-- Next Follow-up & Verified Medical Stamp -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
                <div>
                  <span class="text-xs uppercase font-medium text-slate-500 block">Next Follow-Up Consultation</span>
                  <span class="text-xs font-bold text-teal-800">{{ item.prescription.nextFollowUp }}</span>
                </div>

                <div class="flex items-center gap-3 sm:text-right">
                  <div class="w-9 h-9 rounded-full bg-teal-100 border border-teal-300 text-teal-800 flex items-center justify-center font-bold text-xs">
                    ✓ RX
                  </div>
                  <div>
                    <span class="text-xs font-bold text-slate-800 block">Digitally Signed & Validated</span>
                    <span class="text-xs text-slate-500">HMS Medical Record Registry</span>
                  </div>
                </div>
              </div>

            </div>

            <!-- Modal Footer Actions -->
            <div class="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between gap-3">
              <button 
                type="button" 
                (click)="printModal()"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                <app-icon name="printer" wrapperClass="w-4 h-4" />
                <span>Print Rx</span>
              </button>

              <div class="flex items-center gap-2">
                <button 
                  type="button" 
                  (click)="downloadPdf('Prescription')"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md cursor-pointer transition"
                >
                  <app-icon name="download" wrapperClass="w-4 h-4" />
                  <span>Download PDF</span>
                </button>

                <button 
                  type="button" 
                  (click)="closePrescriptionModal()"
                  class="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- ================================================================= -->
      <!-- MODAL 7: FULL PAYMENT RECEIPT / INVOICE DIALOG MODAL -->
      <!-- ================================================================= -->
      @if (selectedReceiptData(); as item) {
        <div class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-fade-in" (click)="closeReceiptModal()">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up" (click)="$event.stopPropagation()">
            
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
                  <app-icon name="receipt" wrapperClass="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 class="text-lg sm:text-xl font-bold tracking-tight text-white">Payment Receipt & Invoice</h3>
                  <p class="text-xs text-slate-300">HMS Healthcare Official Patient Billing Receipt</p>
                </div>
              </div>

              <button 
                type="button" 
                (click)="closeReceiptModal()"
                class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition"
                aria-label="Close"
              >
                <app-icon name="x" wrapperClass="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Body (Scrollable) -->
            <div class="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
              
              <!-- Invoice Status Banner -->
              <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <span class="text-xs font-bold text-emerald-900 block">Payment Completed Successfully</span>
                    <span class="text-xs text-emerald-700">Ref ID: {{ item.receipt.transactionId }}</span>
                  </div>
                </div>

                <span class="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold tracking-wider">
                  {{ item.receipt.paymentStatus }}
                </span>
              </div>

              <!-- Bill To & Hospital Meta Info -->
              <div class="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span class="text-xs uppercase font-medium text-slate-500 block mb-1">Billed Patient</span>
                  <span class="font-bold text-slate-900 block text-sm">{{ item.patientName }}</span>
                  <span class="text-xs text-slate-700 block">Patient ID: {{ item.patientId }}</span>
                </div>

                <div class="text-right">
                  <span class="text-xs uppercase font-medium text-slate-500 block mb-1">Invoice Details</span>
                  <span class="font-bold text-slate-900 block font-mono text-sm">{{ item.receipt.receiptNumber }}</span>
                  <span class="text-xs text-slate-700 block">{{ item.receipt.invoiceDate }}</span>
                  <span class="text-xs text-teal-700 font-bold block">{{ item.serviceContext }}</span>
                </div>
              </div>

              <!-- Itemized Services Table -->
              <div>
                <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Itemized Medical Charges</h4>
                
                <div class="overflow-x-auto rounded-xl border border-slate-200">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-slate-100 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-700">
                        <th class="p-3">Service Description</th>
                        <th class="p-3">Code</th>
                        <th class="p-3 text-center">Qty</th>
                        <th class="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-xs font-medium">
                      @for (s of item.receipt.items; track s.description) {
                        <tr class="hover:bg-slate-50">
                          <td class="p-3 font-bold text-slate-900">{{ s.description }}</td>
                          <td class="p-3 font-mono text-slate-600">{{ s.code }}</td>
                          <td class="p-3 text-center">{{ s.quantity }}</td>
                          <td class="p-3 text-right font-bold text-slate-900">₹{{ s.price.toFixed(2) }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Financial Totals Summary -->
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div class="flex justify-between text-xs text-slate-700">
                  <span>Subtotal Amount:</span>
                  <span class="font-semibold text-slate-900">₹{{ item.receipt.subtotal.toFixed(2) }}</span>
                </div>

                <div class="flex justify-between text-xs text-emerald-700 font-semibold">
                  <span>Insurance Coverage ({{ item.receipt.insuranceCoveragePercent }}% Covered):</span>
                  <span>-₹{{ item.receipt.insuranceCoveredAmount.toFixed(2) }}</span>
                </div>

                <div class="flex justify-between text-xs text-slate-700">
                  <span>Taxes & Hospital Surcharges (0%):</span>
                  <span>₹{{ item.receipt.tax.toFixed(2) }}</span>
                </div>

                <div class="border-t border-slate-200 pt-2 flex justify-between text-sm sm:text-base font-bold text-slate-900">
                  <span>Total Amount Paid by Patient:</span>
                  <span class="text-teal-700 font-mono font-bold">₹{{ item.receipt.totalPaid.toFixed(2) }}</span>
                </div>
              </div>

              <!-- Payment Method Info -->
              <div class="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                <span>Payment Method: <strong class="text-slate-800">{{ item.receipt.paymentMethod }}</strong></span>
                <span>Authorized Hospital Cashier Stamp Verified</span>
              </div>

            </div>

            <!-- Modal Footer Actions -->
            <div class="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between gap-3">
              <button 
                type="button" 
                (click)="printModal()"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                <app-icon name="printer" wrapperClass="w-4 h-4" />
                <span>Print Receipt</span>
              </button>

              <div class="flex items-center gap-2">
                <button 
                  type="button" 
                  (click)="downloadPdf('Receipt')"
                  class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md cursor-pointer transition"
                >
                  <app-icon name="download" wrapperClass="w-4 h-4" />
                  <span>Download Invoice</span>
                </button>

                <button 
                  type="button" 
                  (click)="closeReceiptModal()"
                  class="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class ReceptionistComponent {
  protected readonly Math = Math;

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);
  private readonly fb = inject(FormBuilder);

  readonly receptionist = this.authService.currentReceptionist;
  readonly activeTab = signal<TabKey>('queue');
  readonly patientDetailsTab = signal<PatientDetailsTab>('personal');

  // Table Filters (Queue Table)
  readonly filterToken = signal<string>('');
  readonly filterPatient = signal<string>('');
  readonly filterDoctor = signal<string>('ALL');
  readonly filterSourceType = signal<string>('ALL');
  readonly filterStatus = signal<string>('ALL');

  // Table Pagination (10 rows default per referral)
  readonly queuePage = signal<number>(1);
  readonly queuePageSize = signal<number>(10);
  readonly onlinePage = signal<number>(1);
  readonly onlinePageSize = signal<number>(10);
  readonly callbackPage = signal<number>(1);
  readonly callbackPageSize = signal<number>(10);

  // Patient 360 Modal Sub-Tabs & Pagination (10 rows default per referral)
  readonly clinicalSubTab = signal<'vitals' | 'allergies' | 'chronic'>('vitals');
  readonly patientVitalsPage = signal<number>(1);
  readonly patientVitalsPageSize = signal<number>(10);
  readonly patientAllergiesPage = signal<number>(1);
  readonly patientAllergiesPageSize = signal<number>(10);
  readonly patientChronicPage = signal<number>(1);
  readonly patientChronicPageSize = signal<number>(10);

  readonly patientMedicationsPage = signal<number>(1);
  readonly patientMedicationsPageSize = signal<number>(10);
  readonly patientVisitsPage = signal<number>(1);
  readonly patientVisitsPageSize = signal<number>(10);
  readonly patientRecordsPage = signal<number>(1);
  readonly patientRecordsPageSize = signal<number>(10);

  // Search state
  readonly searchQuery = signal<string>('');
  readonly searchResults = signal<RegisteredPatient[]>([]);

  // Registered Patients Registry with Complete 360° Data
  readonly patients = signal<RegisteredPatient[]>([
    {
      id: 'PT-94821',
      name: 'Eleanor Vance',
      tokenNumber: 'T-101',
      dob: '14 March 1992',
      age: 34,
      gender: 'Female',
      bloodGroup: 'O+ Positive',
      phone: '+91 98765 43210',
      email: 'eleanor.vance@example.com',
      address: 'Flat 402, Green Glen Heights, Bellandur, Bengaluru, Karnataka 560103',
      occupation: 'Biomedical Researcher',
      maritalStatus: 'Married',
      nationalId: 'AADHAAR-****-****-4921',
      emergencyContact: '+91 98450 12345 (Arthur Vance - Spouse)',
      insuranceProvider: 'Star Health Comprehensive',
      insurancePolicyNumber: 'STAR-882910-PX',
      primaryPhysician: 'Dr. Arthur Vance, MD',
      vitals: {
        bp: '120/80 mmHg',
        pulse: '72 bpm',
        temp: '98.6 °F',
        spo2: '99%',
        weight: '62 kg',
        bmi: '22.4',
        bloodSugar: '95 mg/dL',
        recordedAt: 'Today, 08:30 AM'
      },
      previousVitals: [
        { bp: '118/78 mmHg', pulse: '70 bpm', temp: '98.4 °F', spo2: '99%', weight: '62 kg', bmi: '22.4', bloodSugar: '92 mg/dL', recordedAt: '12 Aug 2026, 09:15 AM' },
        { bp: '122/80 mmHg', pulse: '74 bpm', temp: '98.7 °F', spo2: '98%', weight: '63 kg', bmi: '22.7', bloodSugar: '98 mg/dL', recordedAt: '15 May 2026, 11:00 AM' },
        { bp: '120/79 mmHg', pulse: '72 bpm', temp: '98.6 °F', spo2: '99%', weight: '62 kg', bmi: '22.4', bloodSugar: '94 mg/dL', recordedAt: '10 Feb 2026, 10:30 AM' },
        { bp: '119/78 mmHg', pulse: '71 bpm', temp: '98.5 °F', spo2: '99%', weight: '62 kg', bmi: '22.4', bloodSugar: '91 mg/dL', recordedAt: '18 Nov 2025, 02:00 PM' },
        { bp: '121/80 mmHg', pulse: '73 bpm', temp: '98.6 °F', spo2: '98%', weight: '63 kg', bmi: '22.7', bloodSugar: '96 mg/dL', recordedAt: '05 Aug 2025, 09:45 AM' },
        { bp: '118/77 mmHg', pulse: '69 bpm', temp: '98.4 °F', spo2: '99%', weight: '61 kg', bmi: '22.0', bloodSugar: '90 mg/dL', recordedAt: '22 Apr 2025, 11:15 AM' },
        { bp: '120/80 mmHg', pulse: '72 bpm', temp: '98.6 °F', spo2: '99%', weight: '62 kg', bmi: '22.4', bloodSugar: '93 mg/dL', recordedAt: '14 Jan 2025, 03:20 PM' },
        { bp: '122/81 mmHg', pulse: '75 bpm', temp: '98.7 °F', spo2: '98%', weight: '63 kg', bmi: '22.7', bloodSugar: '97 mg/dL', recordedAt: '09 Oct 2024, 10:00 AM' },
        { bp: '119/78 mmHg', pulse: '70 bpm', temp: '98.5 °F', spo2: '99%', weight: '62 kg', bmi: '22.4', bloodSugar: '92 mg/dL', recordedAt: '15 Jul 2024, 01:45 PM' },
        { bp: '120/79 mmHg', pulse: '71 bpm', temp: '98.6 °F', spo2: '99%', weight: '62 kg', bmi: '22.4', bloodSugar: '94 mg/dL', recordedAt: '28 Mar 2024, 09:30 AM' },
        { bp: '117/76 mmHg', pulse: '68 bpm', temp: '98.4 °F', spo2: '99%', weight: '61 kg', bmi: '22.0', bloodSugar: '89 mg/dL', recordedAt: '10 Dec 2023, 11:00 AM' },
        { bp: '121/80 mmHg', pulse: '72 bpm', temp: '98.6 °F', spo2: '98%', weight: '62 kg', bmi: '22.4', bloodSugar: '95 mg/dL', recordedAt: '15 Sep 2023, 02:30 PM' }
      ],
      allergies: [
        { allergen: 'Latex Gloves & Polymers', severity: 'Mild', reaction: 'Contact dermatitis, erythema & pruritus', diagnosedDate: '22 Jun 2021, 02:15 PM', duration: '5 Years (Ongoing)', status: 'Active - Non-Latex Protocol', diagnosedBy: 'Dr. Clara Reynolds, MD' },
        { allergen: 'Dust Mite & Tree Pollen', severity: 'Mild', reaction: 'Seasonal allergic rhinitis, sneezing', diagnosedDate: '05 Apr 2020, 09:45 AM', duration: '3.5 Years', status: 'Cured / Desensitized (18 Aug 2023)', diagnosedBy: 'Dr. Priya Nambiar, MS' },
        { allergen: 'Penicillin', severity: 'Severe', reaction: 'Anaphylaxis, hives, acute dyspnea', diagnosedDate: '14 Mar 2018, 10:30 AM', duration: '8 Years (Ongoing)', status: 'Active - Strict Avoidance', diagnosedBy: 'Dr. Arthur Vance, MD' },
        { allergen: 'Sulfa Antibiotics', severity: 'Moderate', reaction: 'Maculopapular rash, mild fever', diagnosedDate: '10 Nov 2015, 11:00 AM', duration: '6 Months', status: 'Cured / Resolved (15 May 2016)', diagnosedBy: 'Dr. Marcus Thorne, MD' }
      ],
      chronicConditions: ['Seasonal Allergic Asthma'],
      chronicConditionsList: [
        { condition: 'Cervical Spine Ergonomic Strain', diagnosedDate: '15 Jan 2024', severity: 'Mild Strain', doctor: 'Dr. Marcus Thorne, MD', duration: '8 Months', status: 'Cured / Resolved (10 Sep 2024)', notes: 'Resolved with workplace physiotherapy and ergonomic desk adjustments.' },
        { condition: 'Iron Deficiency Anemia', diagnosedDate: '10 Feb 2022', severity: 'Moderate (Hb 9.8)', doctor: 'Dr. Clara Reynolds, MD', duration: '1 Year', status: 'Cured / Resolved (15 Feb 2023)', notes: 'Ferritin and Hemoglobin fully restored to 14.2 g/dL after oral supplementation.' },
        { condition: 'Seasonal Allergic Asthma', diagnosedDate: '12 Sep 2020', severity: 'Mild Intermittent', doctor: 'Dr. Arthur Vance, MD', duration: '6 Years (Ongoing)', status: 'Active - Inhaler Maintenance', notes: 'Symptom-free during winter, managed with SOS Salbutamol.' }
      ],
      currentMedications: [
        {
          name: 'Amoxicillin Trihydrate',
          dosage: '500',
          frequency: '3 times daily',
          timing: 'After meals',
          doctor: 'Dr. Arthur Vance, MD',
          startDate: '10 Aug 2026',
          refillsRemaining: 2,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Cetirizine HCl',
          dosage: '10',
          frequency: 'Once daily',
          timing: 'At bedtime',
          doctor: 'Dr. Clara Reynolds, MD',
          startDate: '01 Jul 2026',
          refillsRemaining: 4,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Atorvastatin Calcium',
          dosage: '20',
          frequency: 'Once daily',
          timing: 'At bedtime after dinner',
          doctor: 'Dr. Arthur Vance, MD',
          startDate: '12 Aug 2026',
          refillsRemaining: 3,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Metformin HCl',
          dosage: '500',
          frequency: 'Twice daily',
          timing: 'With morning and evening meals',
          doctor: 'Dr. Arthur Vance, MD',
          startDate: '15 Jun 2026',
          refillsRemaining: 5,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Vitamin D3 Cholecalciferol',
          dosage: '60,000 IU',
          frequency: 'Once weekly',
          timing: 'Sunday morning with milk',
          doctor: 'Dr. Clara Reynolds, MD',
          startDate: '20 May 2026',
          refillsRemaining: 6,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Pantoprazole Sodium',
          dosage: '40',
          frequency: 'Once daily',
          timing: '30 minutes before breakfast',
          doctor: 'Dr. Arthur Vance, MD',
          startDate: '10 May 2026',
          refillsRemaining: 2,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Montelukast Sodium',
          dosage: '10',
          frequency: 'Once daily',
          timing: 'At bedtime',
          doctor: 'Dr. Clara Reynolds, MD',
          startDate: '05 Apr 2026',
          refillsRemaining: 3,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Probiotic Daily Complex',
          dosage: '50 Billion CFU',
          frequency: 'Once daily',
          timing: 'Mid-morning with water',
          doctor: 'Dr. Arthur Vance, MD',
          startDate: '15 Mar 2026',
          refillsRemaining: 1,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Omega-3 Triple Strength',
          dosage: '1000',
          frequency: 'Once daily',
          timing: 'With lunch',
          doctor: 'Dr. Arthur Vance, MD',
          startDate: '12 Feb 2026',
          refillsRemaining: 4,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'CoQ10 Softgels',
          dosage: '100',
          frequency: 'Once daily',
          timing: 'Morning with water',
          doctor: 'Dr. Arthur Vance, MD',
          startDate: '10 Jan 2026',
          refillsRemaining: 2,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Magnesium Bisglycinate',
          dosage: '200',
          frequency: 'Once daily',
          timing: 'At night before sleep',
          doctor: 'Dr. Clara Reynolds, MD',
          startDate: '05 Dec 2025',
          refillsRemaining: 3,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Zinc Picolinate',
          dosage: '15',
          frequency: 'Once daily',
          timing: 'After breakfast',
          doctor: 'Dr. Clara Reynolds, MD',
          startDate: '15 Nov 2025',
          refillsRemaining: 5,
          pharmacy: 'HMS Main Pharmacy'
        }
      ],
      previousVisits: [
        {
          id: 'VIS-301',
          date: '12 Aug 2026',
          timeSlot: '09:30 AM',
          doctorName: 'Dr. Arthur Vance, MD',
          specialty: 'Cardiology',
          room: 'OPD Room 101',
          reason: 'Routine Annual Cardiac Checkup',
          diagnosis: 'Healthy cardiac rhythm, normal sinus baseline.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-884210',
            date: '12 Aug 2026',
            doctorReg: 'MD-882910',
            diagnosis: 'Routine Cardiovascular Wellness & Sinus Rhythm',
            clinicalNotes: 'Blood pressure is optimal. ECG shows standard sinus rhythm.',
            medicines: [
              { name: 'Omega-3 Fish Oil', dosage: '1000', frequency: 'Once daily', duration: '90 Days', instructions: 'Take with lunch' },
              { name: 'CoQ10 Softgels', dosage: '100', frequency: 'Once daily', duration: '60 Days', instructions: 'Take with water in the morning' }
            ],
            advice: [
              'Continue 30 minutes of aerobic cardio exercise 4 times a week.',
              'Maintain low-sodium dietary habits.'
            ],
            nextFollowUp: '12 Aug 2027 (Annual Review)'
          },
          receipt: {
            receiptNumber: 'INV-2026-9041',
            invoiceDate: '12 Aug 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'Credit Card / Visa',
            transactionId: 'TXN-904182-EV',
            items: [
              { description: 'Cardiology Specialist Consultation', code: 'CPT-99214', quantity: 1, price: 180.00 },
              { description: '12-Lead Resting Electrocardiogram (ECG)', code: 'CPT-93000', quantity: 1, price: 65.00 }
            ],
            subtotal: 245.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 208.25,
            copayAmount: 36.75,
            tax: 0.00,
            totalPaid: 36.75
          }
        },
        {
          id: 'VIS-290',
          date: '15 May 2026',
          timeSlot: '11:15 AM',
          doctorName: 'Dr. Clara Reynolds, MD',
          specialty: 'Neurology',
          room: 'OPD Room 104',
          reason: 'Mild tension headache consultation',
          diagnosis: 'Mild postural muscle contraction headache, no focal deficits.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-883109',
            date: '15 May 2026',
            doctorReg: 'MD-771920',
            diagnosis: 'Episodic Tension Cephalea',
            clinicalNotes: 'Eye-strain ergonomics advised. Adequate hydration recommended.',
            medicines: [
              { name: 'Magnesium Glycinate', dosage: '400', frequency: 'Once daily', duration: '60 Days', instructions: 'Take with dinner' }
            ],
            advice: ['Take a 5-minute screen break every hour.'],
            nextFollowUp: 'As needed'
          },
          receipt: {
            receiptNumber: 'INV-2026-8812',
            invoiceDate: '15 May 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'Debit Card',
            transactionId: 'TXN-881203-EV',
            items: [
              { description: 'Neurology Specialist Consultation', code: 'CPT-99213', quantity: 1, price: 150.00 }
            ],
            subtotal: 150.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 127.50,
            copayAmount: 22.50,
            tax: 0.00,
            totalPaid: 22.50
          }
        },
        {
          id: 'VIS-280',
          date: '10 Feb 2026',
          timeSlot: '10:00 AM',
          doctorName: 'Dr. Arthur Vance, MD',
          specialty: 'Cardiology',
          room: 'OPD Room 101',
          reason: 'Semi-annual lipid and blood pressure review',
          diagnosis: 'Normotensive, lipid parameters well regulated.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-882001',
            date: '10 Feb 2026',
            doctorReg: 'MD-882910',
            diagnosis: 'Cardiovascular Maintenance',
            clinicalNotes: 'Maintain dietary fiber and aerobic workouts.',
            medicines: [
              { name: 'Omega-3 Fish Oil', dosage: '1000', frequency: 'Once daily', duration: '90 Days', instructions: 'Take with lunch' }
            ],
            advice: ['Regular exercise routine.'],
            nextFollowUp: '12 Aug 2026'
          },
          receipt: {
            receiptNumber: 'INV-2026-8710',
            invoiceDate: '10 Feb 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'UPI / NetBanking',
            transactionId: 'TXN-871029-EV',
            items: [
              { description: 'Cardiology Consultation', code: 'CPT-99213', quantity: 1, price: 150.00 }
            ],
            subtotal: 150.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 127.50,
            copayAmount: 22.50,
            tax: 0.00,
            totalPaid: 22.50
          }
        },
        {
          id: 'VIS-270',
          date: '18 Nov 2025',
          timeSlot: '02:00 PM',
          doctorName: 'Dr. Marcus Thorne, MD',
          specialty: 'Orthopedics',
          room: 'OPD Room 202',
          reason: 'Cervical neck strain review',
          diagnosis: 'Ergonomic neck strain fully resolved.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-881290',
            date: '18 Nov 2025',
            doctorReg: 'MD-881290',
            diagnosis: 'Resolved Cervical Strain',
            clinicalNotes: 'Maintain ergonomic chair settings.',
            medicines: [],
            advice: ['Continue neck mobility stretches daily.'],
            nextFollowUp: 'As needed'
          },
          receipt: {
            receiptNumber: 'INV-2025-7890',
            invoiceDate: '18 Nov 2025',
            paymentStatus: 'PAID',
            paymentMethod: 'Credit Card',
            transactionId: 'TXN-789012-EV',
            items: [
              { description: 'Orthopedic Follow-up Consultation', code: 'CPT-99212', quantity: 1, price: 120.00 }
            ],
            subtotal: 120.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 102.00,
            copayAmount: 18.00,
            tax: 0.00,
            totalPaid: 18.00
          }
        },
        {
          id: 'VIS-260',
          date: '05 Aug 2025',
          timeSlot: '09:45 AM',
          doctorName: 'Dr. Arthur Vance, MD',
          specialty: 'Cardiology',
          room: 'OPD Room 101',
          reason: 'Annual preventive wellness exam',
          diagnosis: 'Normal cardiovascular and metabolic indices.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-880912',
            date: '05 Aug 2025',
            doctorReg: 'MD-882910',
            diagnosis: 'Annual Wellness Clearance',
            clinicalNotes: 'Excellent health status.',
            medicines: [],
            advice: ['Hydration, 8 hours sleep.'],
            nextFollowUp: '10 Feb 2026'
          },
          receipt: {
            receiptNumber: 'INV-2025-6781',
            invoiceDate: '05 Aug 2025',
            paymentStatus: 'PAID',
            paymentMethod: 'UPI',
            transactionId: 'TXN-678192-EV',
            items: [
              { description: 'Comprehensive Annual Wellness Visit', code: 'CPT-99385', quantity: 1, price: 200.00 }
            ],
            subtotal: 200.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 170.00,
            copayAmount: 30.00,
            tax: 0.00,
            totalPaid: 30.00
          }
        },
        {
          id: 'VIS-250',
          date: '22 Apr 2025',
          timeSlot: '11:30 AM',
          doctorName: 'Dr. Clara Reynolds, MD',
          specialty: 'General Medicine',
          room: 'OPD Room 103',
          reason: 'Seasonal allergy follow-up',
          diagnosis: 'Mild seasonal rhinitis, symptomatically controlled.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-879801',
            date: '22 Apr 2025',
            doctorReg: 'MD-771920',
            diagnosis: 'Seasonal Allergic Rhinitis',
            clinicalNotes: 'Saline nasal spray and antihistamines.',
            medicines: [
              { name: 'Cetirizine HCl', dosage: '10', frequency: 'Once daily', duration: '30 Days', instructions: 'Take at bedtime' }
            ],
            advice: ['Avoid outdoor pollen during windy mornings.'],
            nextFollowUp: 'As needed'
          },
          receipt: {
            receiptNumber: 'INV-2025-5640',
            invoiceDate: '22 Apr 2025',
            paymentStatus: 'PAID',
            paymentMethod: 'Credit Card',
            transactionId: 'TXN-564019-EV',
            items: [
              { description: 'General Medicine Consultation', code: 'CPT-99213', quantity: 1, price: 130.00 }
            ],
            subtotal: 130.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 110.50,
            copayAmount: 19.50,
            tax: 0.00,
            totalPaid: 19.50
          }
        },
        {
          id: 'VIS-240',
          date: '14 Jan 2025',
          timeSlot: '03:15 PM',
          doctorName: 'Dr. Marcus Thorne, MD',
          specialty: 'Orthopedics',
          room: 'OPD Room 202',
          reason: 'Workstation ergonomic strain',
          diagnosis: 'Postural upper trapezius strain.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-878901',
            date: '14 Jan 2025',
            doctorReg: 'MD-881290',
            diagnosis: 'Trapezius Ergonomic Strain',
            clinicalNotes: 'Physiotherapy exercises prescribed.',
            medicines: [],
            advice: ['Adjust monitor height to eye level.'],
            nextFollowUp: '18 Nov 2025'
          },
          receipt: {
            receiptNumber: 'INV-2025-4512',
            invoiceDate: '14 Jan 2025',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct',
            transactionId: 'TXN-451290-EV',
            items: [
              { description: 'Orthopedic Initial Consultation', code: 'CPT-99203', quantity: 1, price: 160.00 }
            ],
            subtotal: 160.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 136.00,
            copayAmount: 24.00,
            tax: 0.00,
            totalPaid: 24.00
          }
        },
        {
          id: 'VIS-230',
          date: '09 Oct 2024',
          timeSlot: '10:00 AM',
          doctorName: 'Dr. Arthur Vance, MD',
          specialty: 'Cardiology',
          room: 'OPD Room 101',
          reason: 'Routine ECG and blood pressure check',
          diagnosis: 'Normal sinus rhythm, BP 122/81.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-877812',
            date: '09 Oct 2024',
            doctorReg: 'MD-882910',
            diagnosis: 'Cardiovascular Baseline Check',
            clinicalNotes: 'All readings stable.',
            medicines: [],
            advice: ['Maintain regular exercise.'],
            nextFollowUp: '05 Aug 2025'
          },
          receipt: {
            receiptNumber: 'INV-2024-3401',
            invoiceDate: '09 Oct 2024',
            paymentStatus: 'PAID',
            paymentMethod: 'Credit Card',
            transactionId: 'TXN-340192-EV',
            items: [
              { description: 'Cardiology Consultation & ECG', code: 'CPT-99214', quantity: 1, price: 210.00 }
            ],
            subtotal: 210.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 178.50,
            copayAmount: 31.50,
            tax: 0.00,
            totalPaid: 31.50
          }
        },
        {
          id: 'VIS-220',
          date: '15 Jul 2024',
          timeSlot: '01:45 PM',
          doctorName: 'Dr. Clara Reynolds, MD',
          specialty: 'General Medicine',
          room: 'OPD Room 103',
          reason: 'Mild fever & viral malaise',
          diagnosis: 'Self-limiting viral upper respiratory infection.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-876701',
            date: '15 Jul 2024',
            doctorReg: 'MD-771920',
            diagnosis: 'Viral URI',
            clinicalNotes: 'Rest and oral hydration.',
            medicines: [
              { name: 'Paracetamol', dosage: '500', frequency: 'As needed (SOS)', duration: '5 Days', instructions: 'Take with food for fever' }
            ],
            advice: ['Warm fluids and adequate rest.'],
            nextFollowUp: 'As needed'
          },
          receipt: {
            receiptNumber: 'INV-2024-2390',
            invoiceDate: '15 Jul 2024',
            paymentStatus: 'PAID',
            paymentMethod: 'UPI',
            transactionId: 'TXN-239012-EV',
            items: [
              { description: 'Acute Care General Consultation', code: 'CPT-99213', quantity: 1, price: 120.00 }
            ],
            subtotal: 120.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 102.00,
            copayAmount: 18.00,
            tax: 0.00,
            totalPaid: 18.00
          }
        },
        {
          id: 'VIS-210',
          date: '28 Mar 2024',
          timeSlot: '09:30 AM',
          doctorName: 'Dr. Arthur Vance, MD',
          specialty: 'Cardiology',
          room: 'OPD Room 101',
          reason: 'Semi-annual cardiovascular review',
          diagnosis: 'Stable baseline.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-875601',
            date: '28 Mar 2024',
            doctorReg: 'MD-882910',
            diagnosis: 'Cardiovascular Review',
            clinicalNotes: 'Optimal vitals.',
            medicines: [],
            advice: ['Continue low-sodium diet.'],
            nextFollowUp: '09 Oct 2024'
          },
          receipt: {
            receiptNumber: 'INV-2024-1289',
            invoiceDate: '28 Mar 2024',
            paymentStatus: 'PAID',
            paymentMethod: 'Credit Card',
            transactionId: 'TXN-128901-EV',
            items: [
              { description: 'Cardiology Review Consultation', code: 'CPT-99213', quantity: 1, price: 150.00 }
            ],
            subtotal: 150.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 127.50,
            copayAmount: 22.50,
            tax: 0.00,
            totalPaid: 22.50
          }
        },
        {
          id: 'VIS-200',
          date: '10 Dec 2023',
          timeSlot: '11:00 AM',
          doctorName: 'Dr. Clara Reynolds, MD',
          specialty: 'General Medicine',
          room: 'OPD Room 103',
          reason: 'Routine health screening and blood test review',
          diagnosis: 'All laboratory parameters normal.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-874501',
            date: '10 Dec 2023',
            doctorReg: 'MD-771920',
            diagnosis: 'Annual Routine Health Clearance',
            clinicalNotes: 'Normal metabolic panel.',
            medicines: [],
            advice: ['Balanced diet and exercise.'],
            nextFollowUp: '28 Mar 2024'
          },
          receipt: {
            receiptNumber: 'INV-2023-9912',
            invoiceDate: '10 Dec 2023',
            paymentStatus: 'PAID',
            paymentMethod: 'NetBanking',
            transactionId: 'TXN-991201-EV',
            items: [
              { description: 'Comprehensive General Consultation', code: 'CPT-99214', quantity: 1, price: 160.00 }
            ],
            subtotal: 160.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 136.00,
            copayAmount: 24.00,
            tax: 0.00,
            totalPaid: 24.00
          }
        },
        {
          id: 'VIS-190',
          date: '15 Sep 2023',
          timeSlot: '02:30 PM',
          doctorName: 'Dr. Arthur Vance, MD',
          specialty: 'Cardiology',
          room: 'OPD Room 101',
          reason: 'Baseline cardiac evaluation',
          diagnosis: 'Normal cardiac evaluation.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-873401',
            date: '15 Sep 2023',
            doctorReg: 'MD-882910',
            diagnosis: 'Cardiac Baseline Evaluation',
            clinicalNotes: 'Normal ECG and blood pressure.',
            medicines: [],
            advice: ['Healthy lifestyle maintenance.'],
            nextFollowUp: '10 Dec 2023'
          },
          receipt: {
            receiptNumber: 'INV-2023-8801',
            invoiceDate: '15 Sep 2023',
            paymentStatus: 'PAID',
            paymentMethod: 'Credit Card',
            transactionId: 'TXN-880192-EV',
            items: [
              { description: 'Initial Cardiology Evaluation', code: 'CPT-99203', quantity: 1, price: 180.00 }
            ],
            subtotal: 180.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 153.00,
            copayAmount: 27.00,
            tax: 0.00,
            totalPaid: 27.00
          }
        }
      ],
      healthRecords: [
        {
          id: 'LAB-9042',
          testName: 'Lipid Profile & Serum Cholesterol',
          category: 'Biochemistry',
          doctor: 'Dr. Arthur Vance, MD',
          date: '12 Aug 2026',
          locationType: 'Hospital',
          locationName: 'HMS Central Pathology Lab',
          status: 'Completed',
          summary: 'Normal baseline profile. LDL and HDL within recommended target ranges.',
          parameters: [
            { name: 'Total Cholesterol', value: '178', unit: 'mg/dL', referenceRange: '< 200 Desirable', status: 'Normal' },
            { name: 'HDL Cholesterol', value: '58', unit: 'mg/dL', referenceRange: '> 50 Optimal', status: 'Normal' },
            { name: 'LDL Cholesterol', value: '98', unit: 'mg/dL', referenceRange: '< 100 Optimal', status: 'Normal' },
            { name: 'Triglycerides', value: '110', unit: 'mg/dL', referenceRange: '< 150 Normal', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-9042',
            invoiceDate: '12 Aug 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct Pay',
            transactionId: 'TXN-LAB-90421',
            items: [
              { description: 'Automated Lipid Profile Panel', code: 'CPT-80061', quantity: 1, price: 95.00 }
            ],
            subtotal: 95.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 80.75,
            copayAmount: 14.25,
            tax: 0.00,
            totalPaid: 14.25
          }
        },
        {
          id: 'LAB-9041',
          testName: '12-Lead Resting Electrocardiogram (ECG)',
          category: 'Cardiology',
          doctor: 'Dr. Arthur Vance, MD',
          date: '12 Aug 2026',
          locationType: 'Hospital',
          locationName: 'HMS Cardiology Diagnostic Wing',
          status: 'Completed',
          summary: 'Normal sinus rhythm at 72 bpm. Normal axis, no ischemic ST-T changes.',
          parameters: [
            { name: 'Heart Rate', value: '72', unit: 'bpm', referenceRange: '60 - 100', status: 'Normal' },
            { name: 'PR Interval', value: '154', unit: 'ms', referenceRange: '120 - 200', status: 'Normal' },
            { name: 'QRS Duration', value: '86', unit: 'ms', referenceRange: '80 - 120', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-9041',
            invoiceDate: '12 Aug 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct Pay',
            transactionId: 'TXN-LAB-90419',
            items: [
              { description: '12-Lead Diagnostic ECG Telemetry', code: 'CPT-93000', quantity: 1, price: 65.00 }
            ],
            subtotal: 65.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 55.25,
            copayAmount: 9.75,
            tax: 0.00,
            totalPaid: 9.75
          }
        },
        {
          id: 'LAB-8910',
          testName: 'Complete Blood Count (CBC) with Differential',
          category: 'Hematology',
          doctor: 'Dr. Clara Reynolds, MD',
          date: '15 May 2026',
          locationType: 'Hospital',
          locationName: 'HMS Central Pathology Lab',
          status: 'Completed',
          summary: 'Hemoglobin and white blood cell parameters in optimal physiological ranges.',
          parameters: [
            { name: 'Hemoglobin', value: '14.1', unit: 'g/dL', referenceRange: '12.0 - 15.5', status: 'Normal' },
            { name: 'WBC Count', value: '6.4', unit: 'x10^3 / uL', referenceRange: '4.5 - 11.0', status: 'Normal' },
            { name: 'Platelets', value: '235', unit: 'x10^3 / uL', referenceRange: '150 - 450', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-8910',
            invoiceDate: '15 May 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct Pay',
            transactionId: 'TXN-LAB-89102',
            items: [
              { description: 'Automated Complete Blood Count', code: 'CPT-85025', quantity: 1, price: 65.00 }
            ],
            subtotal: 65.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 55.25,
            copayAmount: 9.75,
            tax: 0.00,
            totalPaid: 9.75
          }
        },
        {
          id: 'LAB-8801',
          testName: 'Comprehensive Metabolic Panel (CMP-14)',
          category: 'Biochemistry',
          doctor: 'Dr. Arthur Vance, MD',
          date: '10 Feb 2026',
          locationType: 'Hospital',
          locationName: 'HMS Central Pathology Lab',
          status: 'Completed',
          summary: 'Electrolytes, renal, and hepatic function within normal baseline.',
          parameters: [
            { name: 'Fasting Glucose', value: '94', unit: 'mg/dL', referenceRange: '70 - 99', status: 'Normal' },
            { name: 'Serum Creatinine', value: '0.88', unit: 'mg/dL', referenceRange: '0.60 - 1.20', status: 'Normal' },
            { name: 'eGFR', value: '108', unit: 'mL/min', referenceRange: '> 90', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-8801',
            invoiceDate: '10 Feb 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct Pay',
            transactionId: 'TXN-LAB-88019',
            items: [
              { description: 'Comprehensive Metabolic Panel', code: 'CPT-80053', quantity: 1, price: 85.00 }
            ],
            subtotal: 85.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 72.25,
            copayAmount: 12.75,
            tax: 0.00,
            totalPaid: 12.75
          }
        },
        {
          id: 'LAB-8702',
          testName: 'Cervical Spine Digital Radiography (X-Ray)',
          category: 'Radiology',
          doctor: 'Dr. Marcus Thorne, MD',
          date: '18 Nov 2025',
          locationType: 'Hospital',
          locationName: 'HMS Diagnostic Radiology Wing',
          status: 'Completed',
          summary: 'Normal vertebral alignment, no disc space narrowing or fractures.',
          parameters: [
            { name: 'Alignment', value: 'Normal', unit: 'Visual', referenceRange: 'Preserved cervical lordosis', status: 'Normal' },
            { name: 'Disc Spaces', value: 'Intact', unit: 'Visual', referenceRange: 'No height loss', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-8702',
            invoiceDate: '18 Nov 2025',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct Pay',
            transactionId: 'TXN-LAB-87029',
            items: [
              { description: 'Cervical Spine X-Ray 2 Views', code: 'CPT-72040', quantity: 1, price: 110.00 }
            ],
            subtotal: 110.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 93.50,
            copayAmount: 16.50,
            tax: 0.00,
            totalPaid: 16.50
          }
        },
        {
          id: 'LAB-8601',
          testName: 'Serum Ferritin & Iron Panel',
          category: 'Hematology',
          doctor: 'Dr. Clara Reynolds, MD',
          date: '05 Aug 2025',
          locationType: 'Hospital',
          locationName: 'HMS Central Pathology Lab',
          status: 'Completed',
          summary: 'Serum ferritin restored to normal baseline following iron therapy.',
          parameters: [
            { name: 'Serum Ferritin', value: '62', unit: 'ng/mL', referenceRange: '15 - 150', status: 'Normal' },
            { name: 'Serum Iron', value: '88', unit: 'ug/dL', referenceRange: '60 - 170', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-8601',
            invoiceDate: '05 Aug 2025',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct Pay',
            transactionId: 'TXN-LAB-86012',
            items: [
              { description: 'Serum Ferritin Assay', code: 'CPT-82728', quantity: 1, price: 55.00 }
            ],
            subtotal: 55.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 46.75,
            copayAmount: 8.25,
            tax: 0.00,
            totalPaid: 8.25
          }
        },
        {
          id: 'LAB-8501',
          testName: 'Total Serum IgE & Allergen Specific Panel',
          category: 'Immunology',
          doctor: 'Dr. Clara Reynolds, MD',
          date: '22 Apr 2025',
          locationType: 'Out',
          locationName: 'BioReference Outpatient Immunology Lab (Out)',
          status: 'Completed',
          summary: 'Elevated baseline seasonal IgE reactivity, non-reactive to foods.',
          parameters: [
            { name: 'Total Serum IgE', value: '115', unit: 'kU/L', referenceRange: '< 100', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-8501',
            invoiceDate: '22 Apr 2025',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct Pay',
            transactionId: 'TXN-LAB-85019',
            items: [
              { description: 'Total Serum IgE Quantitative Assay', code: 'CPT-82785', quantity: 1, price: 75.00 }
            ],
            subtotal: 75.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 63.75,
            copayAmount: 11.25,
            tax: 0.00,
            totalPaid: 11.25
          }
        },
        {
          id: 'LAB-8401',
          testName: 'Postural Ergonomics Physical Therapy Assessment',
          category: 'Physiotherapy',
          doctor: 'Dr. Marcus Thorne, MD',
          date: '14 Jan 2025',
          locationType: 'Hospital',
          locationName: 'HMS Physiotherapy & Rehabilitation Center',
          status: 'Completed',
          summary: 'Initial functional range of motion and trapezius muscle strength assessment.',
          parameters: [
            { name: 'Cervical Rotation', value: '75 deg', unit: 'Degrees', referenceRange: '80 - 90 deg', status: 'Normal' },
            { name: 'Trapezius Tone', value: 'Mild Spasm', unit: 'Clinical', referenceRange: 'Normal Tone', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-8401',
            invoiceDate: '14 Jan 2025',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct Pay',
            transactionId: 'TXN-LAB-84012',
            items: [
              { description: 'Physical Therapy Evaluation', code: 'CPT-97161', quantity: 1, price: 90.00 }
            ],
            subtotal: 90.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 76.50,
            copayAmount: 13.50,
            tax: 0.00,
            totalPaid: 13.50
          }
        },
        {
          id: 'LAB-8301',
          testName: 'Routine Electrocardiogram (ECG)',
          category: 'Cardiology',
          doctor: 'Dr. Arthur Vance, MD',
          date: '09 Oct 2024',
          locationType: 'Hospital',
          locationName: 'HMS Cardiology Diagnostic Wing',
          status: 'Completed',
          summary: 'Normal sinus rhythm at 75 bpm.',
          parameters: [
            { name: 'Heart Rate', value: '75', unit: 'bpm', referenceRange: '60 - 100', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-8301',
            invoiceDate: '09 Oct 2024',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct Pay',
            transactionId: 'TXN-LAB-83019',
            items: [
              { description: '12-Lead Resting ECG', code: 'CPT-93000', quantity: 1, price: 65.00 }
            ],
            subtotal: 65.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 55.25,
            copayAmount: 9.75,
            tax: 0.00,
            totalPaid: 9.75
          }
        },
        {
          id: 'LAB-8201',
          testName: 'Complete Blood Count & Viral Marker Panel',
          category: 'Hematology',
          doctor: 'Dr. Clara Reynolds, MD',
          date: '15 Jul 2024',
          locationType: 'Hospital',
          locationName: 'HMS Central Pathology Lab',
          status: 'Completed',
          summary: 'Mild reactive lymphocytosis consistent with acute viral illness.',
          parameters: [
            { name: 'Hemoglobin', value: '13.9', unit: 'g/dL', referenceRange: '12.0 - 15.5', status: 'Normal' },
            { name: 'WBC Count', value: '7.8', unit: 'x10^3 / uL', referenceRange: '4.5 - 11.0', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-8201',
            invoiceDate: '15 Jul 2024',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct Pay',
            transactionId: 'TXN-LAB-82012',
            items: [
              { description: 'Automated CBC with Differential', code: 'CPT-85025', quantity: 1, price: 65.00 }
            ],
            subtotal: 65.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 55.25,
            copayAmount: 9.75,
            tax: 0.00,
            totalPaid: 9.75
          }
        },
        {
          id: 'LAB-8101',
          testName: 'Lipid Profile & Serum Cholesterol',
          category: 'Biochemistry',
          doctor: 'Dr. Arthur Vance, MD',
          date: '28 Mar 2024',
          locationType: 'Hospital',
          locationName: 'HMS Central Pathology Lab',
          status: 'Completed',
          summary: 'Optimal lipid profile.',
          parameters: [
            { name: 'Total Cholesterol', value: '175', unit: 'mg/dL', referenceRange: '< 200', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-8101',
            invoiceDate: '28 Mar 2024',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct Pay',
            transactionId: 'TXN-LAB-81019',
            items: [
              { description: 'Automated Lipid Profile', code: 'CPT-80061', quantity: 1, price: 95.00 }
            ],
            subtotal: 95.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 80.75,
            copayAmount: 14.25,
            tax: 0.00,
            totalPaid: 14.25
          }
        },
        {
          id: 'LAB-8001',
          testName: 'Routine Comprehensive Metabolic Panel',
          category: 'Biochemistry',
          doctor: 'Dr. Clara Reynolds, MD',
          date: '10 Dec 2023',
          locationType: 'Hospital',
          locationName: 'HMS Central Pathology Lab',
          status: 'Completed',
          summary: 'Normal baseline metabolic parameters.',
          parameters: [
            { name: 'Fasting Blood Glucose', value: '91', unit: 'mg/dL', referenceRange: '70 - 99', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-8001',
            invoiceDate: '10 Dec 2023',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct Pay',
            transactionId: 'TXN-LAB-80012',
            items: [
              { description: 'Comprehensive Metabolic Panel', code: 'CPT-80053', quantity: 1, price: 85.00 }
            ],
            subtotal: 85.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 72.25,
            copayAmount: 12.75,
            tax: 0.00,
            totalPaid: 12.75
          }
        }
      ]
    },
    {
      id: 'PT-39102',
      name: 'Robert Langdon',
      dob: '22 June 1978',
      age: 48,
      gender: 'Male',
      bloodGroup: 'A+ Positive',
      phone: '+91 98230 45678',
      email: 'robert.langdon@example.com',
      address: '108 MG Road, Indiranagar, Bengaluru, Karnataka 560038',
      occupation: 'University Professor',
      maritalStatus: 'Single',
      nationalId: 'AADHAAR-****-****-8812',
      emergencyContact: '+91 97110 88990 (Faculty Desk)',
      insuranceProvider: 'HDFC ERGO Health Insurance',
      insurancePolicyNumber: 'HDFC-992104-RR',
      primaryPhysician: 'Dr. Clara Reynolds, MD',
      tokenNumber: 'T-102',
      vitals: {
        bp: '128/84 mmHg',
        pulse: '68 bpm',
        temp: '98.4 °F',
        spo2: '98%',
        weight: '78 kg',
        bmi: '24.1',
        bloodSugar: '105 mg/dL',
        recordedAt: 'Today, 09:00 AM'
      },
      previousVitals: [
        { bp: '130/86 mmHg', pulse: '72 bpm', temp: '98.6 °F', spo2: '97%', weight: '79 kg', bmi: '24.4', bloodSugar: '112 mg/dL', recordedAt: '18 Aug 2026, 03:30 PM' },
        { bp: '134/88 mmHg', pulse: '74 bpm', temp: '98.5 °F', spo2: '98%', weight: '79 kg', bmi: '24.4', bloodSugar: '118 mg/dL', recordedAt: '04 Jun 2026, 02:15 PM' },
        { bp: '132/85 mmHg', pulse: '70 bpm', temp: '98.4 °F', spo2: '98%', weight: '80 kg', bmi: '24.7', bloodSugar: '115 mg/dL', recordedAt: '20 Apr 2026, 11:30 AM' },
        { bp: '128/84 mmHg', pulse: '68 bpm', temp: '98.3 °F', spo2: '99%', weight: '80 kg', bmi: '24.7', bloodSugar: '108 mg/dL', recordedAt: '15 Feb 2026, 09:45 AM' },
        { bp: '136/88 mmHg', pulse: '76 bpm', temp: '98.6 °F', spo2: '97%', weight: '81 kg', bmi: '25.0', bloodSugar: '122 mg/dL', recordedAt: '10 Dec 2025, 04:00 PM' },
        { bp: '130/84 mmHg', pulse: '72 bpm', temp: '98.5 °F', spo2: '98%', weight: '81 kg', bmi: '25.0', bloodSugar: '114 mg/dL', recordedAt: '18 Oct 2025, 10:15 AM' },
        { bp: '135/86 mmHg', pulse: '75 bpm', temp: '98.6 °F', spo2: '98%', weight: '82 kg', bmi: '25.3', bloodSugar: '119 mg/dL', recordedAt: '25 Aug 2025, 02:30 PM' },
        { bp: '128/82 mmHg', pulse: '70 bpm', temp: '98.4 °F', spo2: '99%', weight: '82 kg', bmi: '25.3', bloodSugar: '110 mg/dL', recordedAt: '14 Jun 2025, 09:00 AM' },
        { bp: '138/90 mmHg', pulse: '78 bpm', temp: '98.7 °F', spo2: '97%', weight: '83 kg', bmi: '25.6', bloodSugar: '125 mg/dL', recordedAt: '08 Apr 2025, 03:45 PM' },
        { bp: '132/85 mmHg', pulse: '71 bpm', temp: '98.5 °F', spo2: '98%', weight: '83 kg', bmi: '25.6', bloodSugar: '116 mg/dL', recordedAt: '15 Jan 2025, 11:00 AM' },
        { bp: '136/88 mmHg', pulse: '74 bpm', temp: '98.6 °F', spo2: '97%', weight: '84 kg', bmi: '25.9', bloodSugar: '120 mg/dL', recordedAt: '20 Nov 2024, 01:30 PM' },
        { bp: '140/92 mmHg', pulse: '80 bpm', temp: '98.8 °F', spo2: '96%', weight: '84 kg', bmi: '25.9', bloodSugar: '130 mg/dL', recordedAt: '10 Sep 2024, 10:00 AM' }
      ],
      allergies: [
        { allergen: 'Shellfish & Marine Proteins', severity: 'Severe', reaction: 'Facial angioedema, intense pruritus', diagnosedDate: '12 Jul 2022, 08:30 PM', duration: '4 Years (Ongoing)', status: 'Active - Emergency EpiPen Assigned', diagnosedBy: 'Dr. Clara Reynolds, MD' },
        { allergen: 'Sulfa Drugs & Sulfonamides', severity: 'Moderate', reaction: 'Erythema multiforme, fever & hives', diagnosedDate: '10 Aug 2019, 03:00 PM', duration: '7 Years (Ongoing)', status: 'Active - Absolute Contraindication', diagnosedBy: 'Dr. Clara Reynolds, MD' },
        { allergen: 'Aspirin / NSAIDs', severity: 'Mild', reaction: 'Gastric irritation, mild facial rash', diagnosedDate: '05 Feb 2017, 11:30 AM', duration: '2 Years', status: 'Cured / Resolved (20 Mar 2019)', diagnosedBy: 'Dr. Arthur Vance, MD' }
      ],
      chronicConditions: ['Hypertension (Stage 1)'],
      chronicConditionsList: [
        { condition: 'Screen-Induced Tension Headaches', diagnosedDate: '04 Jun 2024', severity: 'Mild Episodic', doctor: 'Dr. Clara Reynolds, MD', duration: '1.5 Years', status: 'Cured / Resolved (18 Aug 2025)', notes: 'Resolved with blue-light filter prescription and hourly screen break regime.' },
        { condition: 'Lumbar Muscular Strain', diagnosedDate: '20 Nov 2023', severity: 'Moderate', doctor: 'Dr. Marcus Thorne, MD', duration: '6 Months', status: 'Cured / Resolved (15 May 2024)', notes: 'Full recovery achieved with physical therapy and lumbar support chair.' },
        { condition: 'Hypertension (Stage 1)', diagnosedDate: '15 May 2022', severity: 'Stage 1 Essential', doctor: 'Dr. Clara Reynolds, MD', duration: '4 Years (Ongoing)', status: 'Active - Daily Lisinopril 10', notes: 'Blood pressure well-controlled with standard morning dosage.' }
      ],
      currentMedications: [
        {
          name: 'Lisinopril',
          dosage: '10',
          frequency: 'Once daily',
          timing: 'Morning before breakfast',
          doctor: 'Dr. Clara Reynolds, MD',
          startDate: '15 May 2026',
          refillsRemaining: 3,
          pharmacy: 'HMS Main Pharmacy'
        }
      ],
      previousVisits: [
        {
          id: 'VIS-204',
          date: '04 Jun 2026',
          timeSlot: '02:30 PM',
          doctorName: 'Dr. Clara Reynolds, MD',
          specialty: 'Neurology',
          room: 'OPD Room 104',
          reason: 'Occasional tension-type headaches',
          diagnosis: 'Tension headaches secondary to screen fatigue, normal neurological exam.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-291034',
            date: '04 Jun 2026',
            doctorReg: 'MD-771920',
            diagnosis: 'Screen-Induced Tension Headache Syndrome',
            clinicalNotes: 'Eye-strain ergonomics advised. Rest periods between lectures.',
            medicines: [
              { name: 'Magnesium Glycinate', dosage: '400', frequency: 'Once daily', duration: '60 Days', instructions: 'Take with dinner' }
            ],
            advice: ['Take a 5-minute break every hour of screen work.'],
            nextFollowUp: 'As needed'
          },
          receipt: {
            receiptNumber: 'INV-2026-7712',
            invoiceDate: '04 Jun 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'UPI / NetBanking',
            transactionId: 'TXN-771209-RL',
            items: [
              { description: 'Neurological Specialist Consultation', code: 'CPT-99213', quantity: 1, price: 150.00 }
            ],
            subtotal: 150.00,
            insuranceCoveragePercent: 80,
            insuranceCoveredAmount: 120.00,
            copayAmount: 30.00,
            tax: 0.00,
            totalPaid: 30.00
          }
        }
      ],
      healthRecords: [
        {
          id: 'LAB-8812',
          testName: 'Complete Blood Count (CBC) with Differential',
          category: 'Hematology',
          doctor: 'Dr. Clara Reynolds, MD',
          date: '04 Jun 2026',
          locationType: 'Hospital',
          locationName: 'HMS Central Pathology Lab',
          status: 'Completed',
          summary: 'All hematological parameters within standard reference ranges.',
          parameters: [
            { name: 'Hemoglobin', value: '15.2', unit: 'g/dL', referenceRange: '13.8 - 17.2', status: 'Normal' },
            { name: 'WBC Count', value: '6.8', unit: 'x10^3 / uL', referenceRange: '4.5 - 11.0', status: 'Normal' },
            { name: 'Platelets', value: '240', unit: 'x10^3 / uL', referenceRange: '150 - 450', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-8812',
            invoiceDate: '04 Jun 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct Pay',
            transactionId: 'TXN-LAB-88120',
            items: [
              { description: 'Automated Complete Blood Count (CBC)', code: 'CPT-85025', quantity: 1, price: 65.00 }
            ],
            subtotal: 65.00,
            insuranceCoveragePercent: 80,
            insuranceCoveredAmount: 52.00,
            copayAmount: 13.00,
            tax: 0.00,
            totalPaid: 13.00
          }
        }
      ]
    },
    {
      id: 'PT-88129',
      name: 'Grace Hopper',
      dob: '09 December 1974',
      age: 52,
      gender: 'Female',
      bloodGroup: 'B+ Positive',
      phone: '+91 94430 56789',
      email: 'grace.hopper@example.com',
      address: '500 Anna Salai, T. Nagar, Chennai, Tamil Nadu 600017',
      occupation: 'Software Engineer',
      maritalStatus: 'Widowed',
      nationalId: 'AADHAAR-****-****-3341',
      emergencyContact: '+91 94250 22334 (Daughter)',
      insuranceProvider: 'Care Health Insurance Plus',
      insurancePolicyNumber: 'CARE-448201-GH',
      primaryPhysician: 'Dr. Marcus Thorne, MD',
      tokenNumber: 'T-103',
      vitals: {
        bp: '132/86 mmHg',
        pulse: '76 bpm',
        temp: '98.7 °F',
        spo2: '97%',
        weight: '70 kg',
        bmi: '26.2',
        bloodSugar: '124 mg/dL',
        recordedAt: 'Today, 09:15 AM'
      },
      previousVitals: [
        { bp: '135/88 mmHg', pulse: '78 bpm', temp: '98.8 °F', spo2: '97%', weight: '71 kg', bmi: '26.6', bloodSugar: '130 mg/dL', recordedAt: '20 Jul 2026, 10:30 AM' },
        { bp: '130/84 mmHg', pulse: '75 bpm', temp: '98.6 °F', spo2: '98%', weight: '71 kg', bmi: '26.6', bloodSugar: '126 mg/dL', recordedAt: '15 May 2026, 09:15 AM' },
        { bp: '134/86 mmHg', pulse: '77 bpm', temp: '98.7 °F', spo2: '97%', weight: '72 kg', bmi: '27.0', bloodSugar: '135 mg/dL', recordedAt: '10 Mar 2026, 02:00 PM' },
        { bp: '128/82 mmHg', pulse: '74 bpm', temp: '98.5 °F', spo2: '98%', weight: '72 kg', bmi: '27.0', bloodSugar: '122 mg/dL', recordedAt: '20 Jan 2026, 11:30 AM' },
        { bp: '136/88 mmHg', pulse: '80 bpm', temp: '98.8 °F', spo2: '96%', weight: '73 kg', bmi: '27.3', bloodSugar: '140 mg/dL', recordedAt: '12 Nov 2025, 03:45 PM' },
        { bp: '132/85 mmHg', pulse: '76 bpm', temp: '98.6 °F', spo2: '97%', weight: '73 kg', bmi: '27.3', bloodSugar: '128 mg/dL', recordedAt: '18 Sep 2025, 10:00 AM' },
        { bp: '138/90 mmHg', pulse: '82 bpm', temp: '98.9 °F', spo2: '96%', weight: '74 kg', bmi: '27.7', bloodSugar: '145 mg/dL', recordedAt: '05 Jul 2025, 01:15 PM' },
        { bp: '130/84 mmHg', pulse: '75 bpm', temp: '98.6 °F', spo2: '98%', weight: '74 kg', bmi: '27.7', bloodSugar: '125 mg/dL', recordedAt: '22 Apr 2025, 09:30 AM' },
        { bp: '134/86 mmHg', pulse: '78 bpm', temp: '98.7 °F', spo2: '97%', weight: '75 kg', bmi: '28.1', bloodSugar: '132 mg/dL', recordedAt: '15 Feb 2025, 02:45 PM' },
        { bp: '136/88 mmHg', pulse: '79 bpm', temp: '98.8 °F', spo2: '97%', weight: '75 kg', bmi: '28.1', bloodSugar: '138 mg/dL', recordedAt: '08 Dec 2024, 11:00 AM' },
        { bp: '132/85 mmHg', pulse: '76 bpm', temp: '98.6 °F', spo2: '98%', weight: '76 kg', bmi: '28.5', bloodSugar: '130 mg/dL', recordedAt: '25 Sep 2024, 03:15 PM' },
        { bp: '140/92 mmHg', pulse: '84 bpm', temp: '99.0 °F', spo2: '96%', weight: '76 kg', bmi: '28.5', bloodSugar: '150 mg/dL', recordedAt: '10 Jul 2024, 10:30 AM' }
      ],
      allergies: [
        { allergen: 'Latex & Rubber Accelerators', severity: 'Severe', reaction: 'Severe contact dermatitis, localized edema', diagnosedDate: '18 Nov 2020, 11:15 AM', duration: '6 Years (Ongoing)', status: 'Active - Latex-Safe Environment Required', diagnosedBy: 'Dr. Marcus Thorne, MD' },
        { allergen: 'Ciprofloxacin (Fluoroquinolones)', severity: 'Moderate', reaction: 'Achilles tendonitis pain, dizziness', diagnosedDate: '14 Jun 2018, 04:00 PM', duration: '3 Months', status: 'Cured / Resolved (15 Sep 2018)', diagnosedBy: 'Dr. Clara Reynolds, MD' },
        { allergen: 'Peanuts & Tree Nuts', severity: 'Severe', reaction: 'Urticaria, laryngeal edema', diagnosedDate: '09 Jan 2012, 01:30 PM', duration: '14 Years (Ongoing)', status: 'Active - Auto-injector Prescribed', diagnosedBy: 'Dr. Arthur Vance, MD' }
      ],
      chronicConditions: ['Type 2 Diabetes', 'Osteoarthritis'],
      chronicConditionsList: [
        { condition: 'Mild Bilateral Knee Osteoarthritis', diagnosedDate: '20 Jul 2024', severity: 'Grade 1 Early', doctor: 'Dr. Marcus Thorne, MD', duration: '2 Years (Ongoing)', status: 'Active - Glucosamine Therapy', notes: 'Physical therapy active, joint mobility well-preserved.' },
        { condition: 'Acute Bronchitis Episode', diagnosedDate: '10 Feb 2023', severity: 'Moderate', doctor: 'Dr. Clara Reynolds, MD', duration: '4 Weeks', status: 'Cured / Resolved (12 Mar 2023)', notes: 'Full resolution with 7-day course of azithromycin and steam inhalation.' },
        { condition: 'Type 2 Diabetes Mellitus', diagnosedDate: '20 Jan 2019', severity: 'Moderate (HbA1c 6.4%)', doctor: 'Dr. Marcus Thorne, MD', duration: '7 Years (Ongoing)', status: 'Active - Metformin 850 BD', notes: 'Stable glycemic control, biannual HbA1c monitoring.' }
      ],
      currentMedications: [
        {
          name: 'Amoxicillin Trihydrate',
          dosage: '500',
          frequency: '3 times daily',
          timing: 'After meals',
          doctor: 'Dr. Arthur Vance, MD',
          startDate: '10 Aug 2026',
          refillsRemaining: 2,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Cetirizine HCl',
          dosage: '10',
          frequency: 'Once daily',
          timing: 'At bedtime',
          doctor: 'Dr. Clara Reynolds, MD',
          startDate: '01 Jul 2026',
          refillsRemaining: 4,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Atorvastatin Calcium',
          dosage: '20',
          frequency: 'Once daily',
          timing: 'At bedtime after dinner',
          doctor: 'Dr. Arthur Vance, MD',
          startDate: '12 Aug 2026',
          refillsRemaining: 3,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Metformin HCl',
          dosage: '500',
          frequency: 'Twice daily',
          timing: 'With morning and evening meals',
          doctor: 'Dr. Arthur Vance, MD',
          startDate: '15 Jun 2026',
          refillsRemaining: 5,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Vitamin D3 Cholecalciferol',
          dosage: '60,000 IU',
          frequency: 'Once weekly',
          timing: 'Sunday morning with milk',
          doctor: 'Dr. Clara Reynolds, MD',
          startDate: '20 May 2026',
          refillsRemaining: 6,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Pantoprazole Sodium',
          dosage: '40',
          frequency: 'Once daily',
          timing: '30 minutes before breakfast',
          doctor: 'Dr. Arthur Vance, MD',
          startDate: '10 May 2026',
          refillsRemaining: 2,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Montelukast Sodium',
          dosage: '10',
          frequency: 'Once daily',
          timing: 'At bedtime',
          doctor: 'Dr. Clara Reynolds, MD',
          startDate: '05 Apr 2026',
          refillsRemaining: 3,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Probiotic Daily Complex',
          dosage: '50 Billion CFU',
          frequency: 'Once daily',
          timing: 'Mid-morning with water',
          doctor: 'Dr. Arthur Vance, MD',
          startDate: '15 Mar 2026',
          refillsRemaining: 1,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Omega-3 Triple Strength',
          dosage: '1000',
          frequency: 'Once daily',
          timing: 'With lunch',
          doctor: 'Dr. Arthur Vance, MD',
          startDate: '01 Feb 2026',
          refillsRemaining: 4,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Coenzyme Q10 (CoQ10)',
          dosage: '100',
          frequency: 'Once daily',
          timing: 'Morning dietary supplement',
          doctor: 'Dr. Arthur Vance, MD',
          startDate: '15 Jan 2026',
          refillsRemaining: 5,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Magnesium Glycinate',
          dosage: '400',
          frequency: 'Once daily',
          timing: 'Night before sleep',
          doctor: 'Dr. Clara Reynolds, MD',
          startDate: '10 Jan 2026',
          refillsRemaining: 2,
          pharmacy: 'HMS Main Pharmacy'
        },
        {
          name: 'Methylcobalamin B12',
          dosage: '1500 mcg',
          frequency: 'Once daily',
          timing: 'After breakfast',
          doctor: 'Dr. Clara Reynolds, MD',
          startDate: '01 Jan 2026',
          refillsRemaining: 6,
          pharmacy: 'HMS Main Pharmacy'
        }
      ],
      previousVisits: [
        {
          id: 'VIS-301',
          date: '12 Aug 2026',
          timeSlot: '09:30 AM',
          doctorName: 'Dr. Arthur Vance, MD',
          specialty: 'Cardiology',
          room: 'OPD Room 101',
          reason: 'Routine Annual Cardiac Checkup',
          diagnosis: 'Healthy cardiac rhythm, normal sinus baseline.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-884210',
            date: '12 Aug 2026',
            doctorReg: 'MD-882910',
            diagnosis: 'Routine Cardiovascular Wellness & Sinus Rhythm',
            clinicalNotes: 'Blood pressure is optimal. ECG shows standard sinus rhythm.',
            medicines: [
              { name: 'Omega-3 Fish Oil', dosage: '1000', frequency: 'Once daily', duration: '90 Days', instructions: 'Take with lunch' },
              { name: 'CoQ10 Softgels', dosage: '100', frequency: 'Once daily', duration: '60 Days', instructions: 'Take with water in the morning' }
            ],
            advice: [
              'Continue 30 minutes of aerobic cardio exercise 4 times a week.',
              'Maintain low-sodium dietary habits.'
            ],
            nextFollowUp: '12 Aug 2027 (Annual Review)'
          },
          receipt: {
            receiptNumber: 'INV-2026-9941',
            invoiceDate: '12 Aug 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'Credit Card (Visa ending in 4029)',
            transactionId: 'TXN-998201-PX',
            items: [
              { description: 'Cardiology Specialist OPD Consultation', code: 'CPT-99214', quantity: 1, price: 180.00 },
              { description: '12-Lead Electrocardiogram (ECG)', code: 'CPT-93000', quantity: 1, price: 95.00 }
            ],
            subtotal: 275.00,
            insuranceCoveragePercent: 80,
            insuranceCoveredAmount: 220.00,
            copayAmount: 55.00,
            tax: 0.00,
            totalPaid: 55.00
          }
        },
        {
          id: 'VIS-204',
          date: '15 Jan 2026',
          timeSlot: '11:15 AM',
          doctorName: 'Dr. Clara Reynolds, MD',
          specialty: 'Neurology',
          room: 'OPD Room 104',
          reason: 'Occasional Tension Headaches',
          diagnosis: 'Stress-induced tension headaches, advised hydration.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-772109',
            date: '15 Jan 2026',
            doctorReg: 'MD-991044',
            diagnosis: 'Episodic Tension Headache & Cervical Strain',
            clinicalNotes: 'Neurological examination cranial nerves II-XII intact.',
            medicines: [
              { name: 'Acetaminophen / Paracetamol', dosage: '500', frequency: 'As needed', duration: '14 Days', instructions: 'Take on headache onset, max 2g/day' },
              { name: 'Magnesium Glycinate', dosage: '400', frequency: 'Once daily', duration: '30 Days', instructions: 'Take at night before sleep' }
            ],
            advice: [
              'Take 10-minute posture breaks during computer work.',
              'Ensure minimum 2.5 liters of water daily.'
            ],
            nextFollowUp: 'As needed'
          },
          receipt: {
            receiptNumber: 'INV-2026-4412',
            invoiceDate: '15 Jan 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'Debit Card (Mastercard ending in 1182)',
            transactionId: 'TXN-773402-CR',
            items: [
              { description: 'Neurology Consultation & Assessment', code: 'CPT-99213', quantity: 1, price: 160.00 }
            ],
            subtotal: 160.00,
            insuranceCoveragePercent: 80,
            insuranceCoveredAmount: 128.00,
            copayAmount: 32.00,
            tax: 0.00,
            totalPaid: 32.00
          }
        },
        {
          id: 'VIS-198',
          date: '02 Dec 2025',
          timeSlot: '10:00 AM',
          doctorName: 'Dr. Marcus Thorne, MD',
          specialty: 'Orthopedics',
          room: 'OPD Room 202',
          reason: 'Right Knee Mild Strain & Running Assessment',
          diagnosis: 'Patellofemoral tracking strain, recommended quad strengthening.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-661092',
            date: '02 Dec 2025',
            doctorReg: 'MD-441029',
            diagnosis: 'Patellofemoral Overuse Syndrome',
            clinicalNotes: 'Ligaments stable, no joint effusion.',
            medicines: [
              { name: 'Topical Diclofenac Gel', dosage: 'Apply to knee', frequency: 'Twice daily', duration: '14 Days', instructions: 'Gently massage before sleeping' }
            ],
            advice: ['Perform straight leg raises and quad sets daily.'],
            nextFollowUp: 'As needed'
          },
          receipt: {
            receiptNumber: 'INV-2025-8819',
            invoiceDate: '02 Dec 2025',
            paymentStatus: 'PAID',
            paymentMethod: 'HSA Direct Pay',
            transactionId: 'TXN-551029-MT',
            items: [
              { description: 'Orthopedic Physical Assessment', code: 'CPT-99213', quantity: 1, price: 140.00 }
            ],
            subtotal: 140.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 119.00,
            copayAmount: 21.00,
            tax: 0.00,
            totalPaid: 21.00
          }
        },
        {
          id: 'VIS-185',
          date: '18 Oct 2025',
          timeSlot: '02:30 PM',
          doctorName: 'Dr. Arthur Vance, MD',
          specialty: 'Cardiology',
          room: 'OPD Room 101',
          reason: 'Blood Pressure Optimization Review',
          diagnosis: 'Blood pressure stably controlled on lifestyle therapy.',
          type: 'In-Person OPD',
          status: 'Completed'
        },
        {
          id: 'VIS-172',
          date: '05 Aug 2025',
          timeSlot: '11:45 AM',
          doctorName: 'Dr. Sarah Jenkins, MD',
          specialty: 'Cardiology',
          room: 'OPD Room 101',
          reason: 'Mid-Year Cardiovascular Telemetry Review',
          diagnosis: 'Optimal myocardial contractility and ejection fraction.',
          type: 'In-Person OPD',
          status: 'Completed'
        },
        {
          id: 'VIS-160',
          date: '22 Jun 2025',
          timeSlot: '09:15 AM',
          doctorName: 'Dr. Clara Reynolds, MD',
          specialty: 'Neurology',
          room: 'OPD Room 104',
          reason: 'Sleep Hygiene & Rest Routine Consultation',
          diagnosis: 'Circadian rhythm synchronization normal.',
          type: 'In-Person OPD',
          status: 'Completed'
        },
        {
          id: 'VIS-145',
          date: '14 Apr 2025',
          timeSlot: '03:00 PM',
          doctorName: 'Dr. Priya Nambiar, MS',
          specialty: 'ENT',
          room: 'OPD Room 301',
          reason: 'Seasonal Allergic Rhinitis Screening',
          diagnosis: 'Mild nasal mucosa hyperemia.',
          type: 'In-Person OPD',
          status: 'Completed'
        },
        {
          id: 'VIS-132',
          date: '08 Feb 2025',
          timeSlot: '10:30 AM',
          doctorName: 'Dr. Arthur Vance, MD',
          specialty: 'Cardiology',
          room: 'OPD Room 101',
          reason: 'ECG Rhythm Checkup',
          diagnosis: 'Normal sinus rhythm 72 bpm.',
          type: 'In-Person OPD',
          status: 'Completed'
        },
        {
          id: 'VIS-120',
          date: '19 Nov 2024',
          timeSlot: '01:15 PM',
          doctorName: 'Dr. Michael Chen, MD',
          specialty: 'Neurology',
          room: 'OPD Room 104',
          reason: 'Routine Neurological Reflex Assessment',
          diagnosis: 'Deep tendon reflexes 2+ symmetrical.',
          type: 'In-Person OPD',
          status: 'Completed'
        },
        {
          id: 'VIS-109',
          date: '27 Aug 2024',
          timeSlot: '11:00 AM',
          doctorName: 'Dr. Marcus Brody, MD',
          specialty: 'Orthopedics',
          room: 'OPD Room 202',
          reason: 'Ergonomic Workstation Posture Consultation',
          diagnosis: 'Good spine alignment, lumbar support advised.',
          type: 'In-Person OPD',
          status: 'Completed'
        },
        {
          id: 'VIS-095',
          date: '10 May 2024',
          timeSlot: '09:45 AM',
          doctorName: 'Dr. Arthur Vance, MD',
          specialty: 'Cardiology',
          room: 'OPD Room 101',
          reason: 'Comprehensive Lipid & Cardiac Risk Check',
          diagnosis: 'Low Framingham risk score.',
          type: 'In-Person OPD',
          status: 'Completed'
        },
        {
          id: 'VIS-082',
          date: '15 Jan 2024',
          timeSlot: '02:15 PM',
          doctorName: 'Dr. Clara Reynolds, MD',
          specialty: 'Neurology',
          room: 'OPD Room 104',
          reason: 'Baseline Cognitive & Neurological Wellness',
          diagnosis: 'Clear cognitive baseline and neurological health.',
          type: 'In-Person OPD',
          status: 'Completed'
        }
      ],
      healthRecords: [
        {
          id: 'LAB-8812',
          testName: 'Comprehensive Metabolic Panel (CMP)',
          category: 'Clinical Biochemistry',
          doctor: 'Dr. Arthur Vance, MD',
          date: '12 Aug 2026',
          locationType: 'Hospital',
          locationName: 'HMS Pathology & Diagnostic Wing, Floor 2',
          status: 'Completed',
          summary: 'All kidney, liver, and electrolyte markers within ideal clinical reference range.',
          parameters: [
            { name: 'Fasting Glucose', value: '92', unit: 'mg/dL', referenceRange: '70 - 99', status: 'Normal' },
            { name: 'Creatinine', value: '0.8', unit: 'mg/dL', referenceRange: '0.5 - 1.1', status: 'Normal' },
            { name: 'Sodium', value: '140', unit: 'mEq/L', referenceRange: '135 - 145', status: 'Normal' },
            { name: 'Potassium', value: '4.2', unit: 'mEq/L', referenceRange: '3.5 - 5.0', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-8812',
            invoiceDate: '12 Aug 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'Health Savings Account (HSA)',
            transactionId: 'TXN-LAB-88120',
            items: [
              { description: 'Comprehensive Metabolic Panel (CMP)', code: 'CPT-80053', quantity: 1, price: 120.00 },
              { description: 'Venipuncture & Specimen Handling', code: 'CPT-36415', quantity: 1, price: 25.00 }
            ],
            subtotal: 145.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 123.25,
            copayAmount: 21.75,
            tax: 0.00,
            totalPaid: 21.75
          }
        },
        {
          id: 'LAB-7741',
          testName: 'Lipid Profile Panel',
          category: 'Cardiovascular Diagnostics',
          doctor: 'Dr. Arthur Vance, MD',
          date: '12 Aug 2026',
          locationType: 'Out',
          locationName: 'Quest Diagnostics Partner Lab (External Out-Center)',
          status: 'Completed',
          summary: 'Excellent HDL cholesterol levels with optimal cardiovascular risk score.',
          parameters: [
            { name: 'Total Cholesterol', value: '175', unit: 'mg/dL', referenceRange: '< 200', status: 'Normal' },
            { name: 'HDL Cholesterol', value: '62', unit: 'mg/dL', referenceRange: '> 50', status: 'Normal' },
            { name: 'LDL Cholesterol', value: '94', unit: 'mg/dL', referenceRange: '< 100', status: 'Normal' },
            { name: 'Triglycerides', value: '110', unit: 'mg/dL', referenceRange: '< 150', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-7741',
            invoiceDate: '12 Aug 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'Health Savings Account (HSA)',
            transactionId: 'TXN-LAB-77410',
            items: [
              { description: 'Lipid Panel (Cholesterol, HDL, LDL, Triglycerides)', code: 'CPT-80061', quantity: 1, price: 95.00 }
            ],
            subtotal: 95.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 80.75,
            copayAmount: 14.25,
            tax: 0.00,
            totalPaid: 14.25
          }
        },
        {
          id: 'LAB-6620',
          testName: 'Brain MRI & Cervical Spine Scan',
          category: 'Diagnostic Neuroradiology',
          doctor: 'Dr. Clara Reynolds, MD',
          date: '15 Jan 2026',
          locationType: 'Hospital',
          locationName: 'HMS Advanced MRI & Radiology Suite',
          status: 'Completed',
          summary: 'Normal intracranial architecture without vascular or parenchymal lesions.'
        },
        {
          id: 'LAB-5519',
          testName: 'Digital X-Ray Right Knee & Ankle',
          category: 'Orthopedic Radiography',
          doctor: 'Dr. Marcus Thorne, MD',
          date: '02 Dec 2025',
          locationType: 'Hospital',
          locationName: 'HMS Diagnostic Imaging Pavilion',
          status: 'Completed',
          summary: 'Preserved joint spaces and intact bony contours without fracture.'
        },
        {
          id: 'LAB-4408',
          testName: '12-Lead Resting Electrocardiogram (ECG)',
          category: 'Cardiovascular Diagnostics',
          doctor: 'Dr. Arthur Vance, MD',
          date: '18 Oct 2025',
          locationType: 'Hospital',
          locationName: 'Cardiovascular Telemetry Center',
          status: 'Completed',
          summary: 'Normal sinus rhythm with regular rate and PR interval.'
        },
        {
          id: 'LAB-3397',
          testName: '2D Echocardiography & Color Doppler',
          category: 'Non-Invasive Cardiology',
          doctor: 'Dr. Sarah Jenkins, MD',
          date: '05 Aug 2025',
          locationType: 'Hospital',
          locationName: 'HMS Cardiac Ultrasound Lab',
          status: 'Completed',
          summary: 'Normal left ventricular systolic function (LVEF 65%), intact valves.'
        },
        {
          id: 'LAB-2286',
          testName: 'Serum Vitamin D & Vitamin B12 Immunoassay',
          category: 'Micronutrient Diagnostics',
          doctor: 'Dr. Clara Reynolds, MD',
          date: '22 Jun 2025',
          locationType: 'Out',
          locationName: 'Quest Diagnostics Partner Lab (External Out-Center)',
          status: 'Completed',
          summary: 'Adequate vitamin D (45 ng/mL) and optimal vitamin B12 (620 pg/mL).'
        },
        {
          id: 'LAB-1175',
          testName: 'Pure Tone Audiometry & Impedance Test',
          category: 'Audiological Telemetry',
          doctor: 'Dr. Priya Nambiar, MS',
          date: '14 Apr 2025',
          locationType: 'Hospital',
          locationName: 'HMS ENT Diagnostics Suite',
          status: 'Completed',
          summary: 'Bilateral normal hearing thresholds across all frequencies.'
        },
        {
          id: 'LAB-0964',
          testName: 'High-Sensitivity C-Reactive Protein (hs-CRP)',
          category: 'Inflammatory Biomarkers',
          doctor: 'Dr. Arthur Vance, MD',
          date: '08 Feb 2025',
          locationType: 'Out',
          locationName: 'Quest Diagnostics Partner Lab (External Out-Center)',
          status: 'Completed',
          summary: 'hs-CRP < 0.5 mg/L indicating lowest cardiovascular risk profile.'
        },
        {
          id: 'LAB-0853',
          testName: 'Glycated Hemoglobin (HbA1c) & Fasting Insulin',
          category: 'Metabolic & Endocrinology',
          doctor: 'Dr. Arthur Vance, MD',
          date: '19 Nov 2024',
          locationType: 'Hospital',
          locationName: 'HMS Central Pathology Lab',
          status: 'Completed',
          summary: 'HbA1c 5.4% indicating excellent long-term glycemic regulation.'
        },
        {
          id: 'LAB-0742',
          testName: 'Bone Mineral Density (DEXA Scan)',
          category: 'Bone Densitometry',
          doctor: 'Dr. Marcus Brody, MD',
          date: '27 Aug 2024',
          locationType: 'Hospital',
          locationName: 'HMS Diagnostic Radiology Center',
          status: 'Completed',
          summary: 'T-score +0.4 demonstrating optimal bone mass density.'
        },
        {
          id: 'LAB-0631',
          testName: 'Thyroid Function Profile (T3, T4, TSH)',
          category: 'Endocrine Diagnostics',
          doctor: 'Dr. Arthur Vance, MD',
          date: '10 May 2024',
          locationType: 'Out',
          locationName: 'Quest Diagnostics Partner Lab (External Out-Center)',
          status: 'Completed',
          summary: 'All thyroid hormone levels in standard physiological range.'
        }
      ]
    },
    {
      id: 'PT-39102',
      name: 'Robert Langdon',
      dob: '22 June 1978',
      age: 48,
      gender: 'Male',
      bloodGroup: 'A+ Positive',
      phone: '+91 98230 45678',
      email: 'robert.langdon@example.com',
      address: '108 MG Road, Indiranagar, Bengaluru, Karnataka 560038',
      occupation: 'University Professor',
      maritalStatus: 'Single',
      nationalId: 'AADHAAR-****-****-8812',
      emergencyContact: '+91 97110 88990 (Faculty Desk)',
      insuranceProvider: 'HDFC ERGO Health Insurance',
      insurancePolicyNumber: 'HDFC-992104-RR',
      primaryPhysician: 'Dr. Clara Reynolds, MD',
      tokenNumber: 'T-102',
      vitals: {
        bp: '128/84 mmHg',
        pulse: '68 bpm',
        temp: '98.4 °F',
        spo2: '98%',
        weight: '78 kg',
        bmi: '24.1',
        bloodSugar: '105 mg/dL',
        recordedAt: 'Today, 09:00 AM'
      },
      previousVitals: [
        { bp: '130/86 mmHg', pulse: '72 bpm', temp: '98.6 °F', spo2: '97%', weight: '79 kg', bmi: '24.4', bloodSugar: '112 mg/dL', recordedAt: '18 Aug 2026, 03:30 PM' },
        { bp: '134/88 mmHg', pulse: '74 bpm', temp: '98.5 °F', spo2: '98%', weight: '79 kg', bmi: '24.4', bloodSugar: '118 mg/dL', recordedAt: '04 Jun 2026, 02:15 PM' },
        { bp: '132/85 mmHg', pulse: '70 bpm', temp: '98.4 °F', spo2: '98%', weight: '80 kg', bmi: '24.7', bloodSugar: '115 mg/dL', recordedAt: '20 Apr 2026, 11:30 AM' },
        { bp: '128/84 mmHg', pulse: '68 bpm', temp: '98.3 °F', spo2: '99%', weight: '80 kg', bmi: '24.7', bloodSugar: '108 mg/dL', recordedAt: '15 Feb 2026, 09:45 AM' },
        { bp: '136/88 mmHg', pulse: '76 bpm', temp: '98.6 °F', spo2: '97%', weight: '81 kg', bmi: '25.0', bloodSugar: '122 mg/dL', recordedAt: '10 Dec 2025, 04:00 PM' },
        { bp: '130/84 mmHg', pulse: '72 bpm', temp: '98.5 °F', spo2: '98%', weight: '81 kg', bmi: '25.0', bloodSugar: '114 mg/dL', recordedAt: '18 Oct 2025, 10:15 AM' },
        { bp: '135/86 mmHg', pulse: '75 bpm', temp: '98.6 °F', spo2: '98%', weight: '82 kg', bmi: '25.3', bloodSugar: '119 mg/dL', recordedAt: '25 Aug 2025, 02:30 PM' },
        { bp: '128/82 mmHg', pulse: '70 bpm', temp: '98.4 °F', spo2: '99%', weight: '82 kg', bmi: '25.3', bloodSugar: '110 mg/dL', recordedAt: '14 Jun 2025, 09:00 AM' },
        { bp: '138/90 mmHg', pulse: '78 bpm', temp: '98.7 °F', spo2: '97%', weight: '83 kg', bmi: '25.6', bloodSugar: '125 mg/dL', recordedAt: '08 Apr 2025, 03:45 PM' },
        { bp: '132/85 mmHg', pulse: '71 bpm', temp: '98.5 °F', spo2: '98%', weight: '83 kg', bmi: '25.6', bloodSugar: '116 mg/dL', recordedAt: '15 Jan 2025, 11:00 AM' },
        { bp: '136/88 mmHg', pulse: '74 bpm', temp: '98.6 °F', spo2: '97%', weight: '84 kg', bmi: '25.9', bloodSugar: '120 mg/dL', recordedAt: '20 Nov 2024, 01:30 PM' },
        { bp: '140/92 mmHg', pulse: '80 bpm', temp: '98.8 °F', spo2: '96%', weight: '84 kg', bmi: '25.9', bloodSugar: '130 mg/dL', recordedAt: '10 Sep 2024, 10:00 AM' }
      ],
      allergies: [
        { allergen: 'Shellfish & Marine Proteins', severity: 'Severe', reaction: 'Facial angioedema, intense pruritus', diagnosedDate: '12 Jul 2022, 08:30 PM', duration: '4 Years (Ongoing)', status: 'Active - Emergency EpiPen Assigned', diagnosedBy: 'Dr. Clara Reynolds, MD' },
        { allergen: 'Sulfa Drugs & Sulfonamides', severity: 'Moderate', reaction: 'Erythema multiforme, fever & hives', diagnosedDate: '10 Aug 2019, 03:00 PM', duration: '7 Years (Ongoing)', status: 'Active - Absolute Contraindication', diagnosedBy: 'Dr. Clara Reynolds, MD' },
        { allergen: 'Aspirin / NSAIDs', severity: 'Mild', reaction: 'Gastric irritation, mild facial rash', diagnosedDate: '05 Feb 2017, 11:30 AM', duration: '2 Years', status: 'Cured / Resolved (20 Mar 2019)', diagnosedBy: 'Dr. Arthur Vance, MD' }
      ],
      chronicConditions: ['Hypertension (Stage 1)'],
      chronicConditionsList: [
        { condition: 'Screen-Induced Tension Headaches', diagnosedDate: '04 Jun 2024', severity: 'Mild Episodic', doctor: 'Dr. Clara Reynolds, MD', duration: '1.5 Years', status: 'Cured / Resolved (18 Aug 2025)', notes: 'Resolved with blue-light filter prescription and hourly screen break regime.' },
        { condition: 'Lumbar Muscular Strain', diagnosedDate: '20 Nov 2023', severity: 'Moderate', doctor: 'Dr. Marcus Thorne, MD', duration: '6 Months', status: 'Cured / Resolved (15 May 2024)', notes: 'Full recovery achieved with physical therapy and lumbar support chair.' },
        { condition: 'Hypertension (Stage 1)', diagnosedDate: '15 May 2022', severity: 'Stage 1 Essential', doctor: 'Dr. Clara Reynolds, MD', duration: '4 Years (Ongoing)', status: 'Active - Daily Lisinopril 10', notes: 'Blood pressure well-controlled with standard morning dosage.' }
      ],
      currentMedications: [
        {
          name: 'Lisinopril',
          dosage: '10',
          frequency: 'Once daily',
          timing: 'Morning before breakfast',
          doctor: 'Dr. Clara Reynolds, MD',
          startDate: '15 May 2026',
          refillsRemaining: 3,
          pharmacy: 'HMS Main Pharmacy'
        }
      ],
      previousVisits: [
        {
          id: 'VIS-204',
          date: '04 Jun 2026',
          timeSlot: '02:30 PM',
          doctorName: 'Dr. Clara Reynolds, MD',
          specialty: 'Neurology',
          room: 'OPD Room 104',
          reason: 'Occasional tension-type headaches',
          diagnosis: 'Tension headaches secondary to screen fatigue, normal neurological exam.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-291034',
            date: '04 Jun 2026',
            doctorReg: 'MD-771920',
            diagnosis: 'Screen-Induced Tension Headache Syndrome',
            clinicalNotes: 'Eye-strain ergonomics advised. Rest periods between lectures.',
            medicines: [
              { name: 'Magnesium Glycinate', dosage: '400', frequency: 'Once daily', duration: '60 Days', instructions: 'Take with dinner' }
            ],
            advice: ['Take a 5-minute break every hour of screen work.'],
            nextFollowUp: 'As needed'
          },
          receipt: {
            receiptNumber: 'INV-2026-7712',
            invoiceDate: '04 Jun 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'UPI / NetBanking',
            transactionId: 'TXN-771209-RL',
            items: [
              { description: 'Neurological Specialist Consultation', code: 'CPT-99213', quantity: 1, price: 150.00 }
            ],
            subtotal: 150.00,
            insuranceCoveragePercent: 80,
            insuranceCoveredAmount: 120.00,
            copayAmount: 30.00,
            tax: 0.00,
            totalPaid: 30.00
          }
        }
      ],
      healthRecords: [
        {
          id: 'LAB-8812',
          testName: 'Complete Blood Count (CBC) with Differential',
          category: 'Hematology',
          doctor: 'Dr. Clara Reynolds, MD',
          date: '04 Jun 2026',
          locationType: 'Hospital',
          locationName: 'HMS Central Pathology Lab',
          status: 'Completed',
          summary: 'All hematological parameters within standard reference ranges.',
          parameters: [
            { name: 'Hemoglobin', value: '15.2', unit: 'g/dL', referenceRange: '13.8 - 17.2', status: 'Normal' },
            { name: 'WBC Count', value: '6.8', unit: 'x10^3 / uL', referenceRange: '4.5 - 11.0', status: 'Normal' },
            { name: 'Platelets', value: '240', unit: 'x10^3 / uL', referenceRange: '150 - 450', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-8812',
            invoiceDate: '04 Jun 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct Pay',
            transactionId: 'TXN-LAB-88120',
            items: [
              { description: 'Automated Complete Blood Count (CBC)', code: 'CPT-85025', quantity: 1, price: 65.00 }
            ],
            subtotal: 65.00,
            insuranceCoveragePercent: 80,
            insuranceCoveredAmount: 52.00,
            copayAmount: 13.00,
            tax: 0.00,
            totalPaid: 13.00
          }
        }
      ]
    },
    {
      id: 'PT-88129',
      name: 'Grace Hopper',
      dob: '09 December 1974',
      age: 52,
      gender: 'Female',
      bloodGroup: 'B+ Positive',
      phone: '+91 94430 56789',
      email: 'grace.hopper@example.com',
      address: '500 Anna Salai, T. Nagar, Chennai, Tamil Nadu 600017',
      occupation: 'Software Engineer',
      maritalStatus: 'Widowed',
      nationalId: 'AADHAAR-****-****-3341',
      emergencyContact: '+91 94250 22334 (Daughter)',
      insuranceProvider: 'Care Health Insurance Plus',
      insurancePolicyNumber: 'CARE-448201-GH',
      primaryPhysician: 'Dr. Marcus Thorne, MD',
      tokenNumber: 'T-103',
      vitals: {
        bp: '132/86 mmHg',
        pulse: '76 bpm',
        temp: '98.7 °F',
        spo2: '97%',
        weight: '70 kg',
        bmi: '26.2',
        bloodSugar: '124 mg/dL',
        recordedAt: 'Today, 09:15 AM'
      },
      previousVitals: [
        { bp: '135/88 mmHg', pulse: '78 bpm', temp: '98.8 °F', spo2: '97%', weight: '71 kg', bmi: '26.6', bloodSugar: '130 mg/dL', recordedAt: '20 Jul 2026, 10:30 AM' },
        { bp: '130/84 mmHg', pulse: '75 bpm', temp: '98.6 °F', spo2: '98%', weight: '71 kg', bmi: '26.6', bloodSugar: '126 mg/dL', recordedAt: '15 May 2026, 09:15 AM' },
        { bp: '134/86 mmHg', pulse: '77 bpm', temp: '98.7 °F', spo2: '97%', weight: '72 kg', bmi: '27.0', bloodSugar: '135 mg/dL', recordedAt: '10 Mar 2026, 02:00 PM' },
        { bp: '128/82 mmHg', pulse: '74 bpm', temp: '98.5 °F', spo2: '98%', weight: '72 kg', bmi: '27.0', bloodSugar: '122 mg/dL', recordedAt: '20 Jan 2026, 11:30 AM' },
        { bp: '136/88 mmHg', pulse: '80 bpm', temp: '98.8 °F', spo2: '96%', weight: '73 kg', bmi: '27.3', bloodSugar: '140 mg/dL', recordedAt: '12 Nov 2025, 03:45 PM' },
        { bp: '132/85 mmHg', pulse: '76 bpm', temp: '98.6 °F', spo2: '97%', weight: '73 kg', bmi: '27.3', bloodSugar: '128 mg/dL', recordedAt: '18 Sep 2025, 10:00 AM' },
        { bp: '138/90 mmHg', pulse: '82 bpm', temp: '98.9 °F', spo2: '96%', weight: '74 kg', bmi: '27.7', bloodSugar: '145 mg/dL', recordedAt: '05 Jul 2025, 01:15 PM' },
        { bp: '130/84 mmHg', pulse: '75 bpm', temp: '98.6 °F', spo2: '98%', weight: '74 kg', bmi: '27.7', bloodSugar: '125 mg/dL', recordedAt: '22 Apr 2025, 09:30 AM' },
        { bp: '134/86 mmHg', pulse: '78 bpm', temp: '98.7 °F', spo2: '97%', weight: '75 kg', bmi: '28.1', bloodSugar: '132 mg/dL', recordedAt: '15 Feb 2025, 02:45 PM' },
        { bp: '136/88 mmHg', pulse: '79 bpm', temp: '98.8 °F', spo2: '97%', weight: '75 kg', bmi: '28.1', bloodSugar: '138 mg/dL', recordedAt: '08 Dec 2024, 11:00 AM' },
        { bp: '132/85 mmHg', pulse: '76 bpm', temp: '98.6 °F', spo2: '98%', weight: '76 kg', bmi: '28.5', bloodSugar: '130 mg/dL', recordedAt: '25 Sep 2024, 03:15 PM' },
        { bp: '140/92 mmHg', pulse: '84 bpm', temp: '99.0 °F', spo2: '96%', weight: '76 kg', bmi: '28.5', bloodSugar: '150 mg/dL', recordedAt: '10 Jul 2024, 10:30 AM' }
      ],
      allergies: [
        { allergen: 'Iodinated Radiocontrast Media', severity: 'Moderate', reaction: 'Flushing, nausea & generalized rash', diagnosedDate: '10 Mar 2021, 02:30 PM', duration: '5.5 Years (Ongoing)', status: 'Active - Pre-medication Required', diagnosedBy: 'Dr. Clara Reynolds, MD' },
        { allergen: 'Latex Gloves & Polymers', severity: 'Severe', reaction: 'Acute contact urticaria, wheezing', diagnosedDate: '15 Jan 2017, 09:00 AM', duration: '9.5 Years (Ongoing)', status: 'Active - Zero-Latex Hospital Alert', diagnosedBy: 'Dr. Marcus Thorne, MD' },
        { allergen: 'Erythromycin', severity: 'Mild', reaction: 'Gastrointestinal cramping, nausea', diagnosedDate: '05 Aug 2016, 11:00 AM', duration: '1 Year', status: 'Cured / Resolved (12 Sep 2017)', diagnosedBy: 'Dr. Arthur Vance, MD' }
      ],
      chronicConditions: ['Type 2 Diabetes', 'Osteoarthritis'],
      chronicConditionsList: [
        { condition: 'Post-Viral Fatigue Syndrome', diagnosedDate: '05 Apr 2023', severity: 'Moderate Fatigue', doctor: 'Dr. Clara Reynolds, MD', duration: '1.2 Years', status: 'Cured / Resolved (20 Jun 2024)', notes: 'Full vitality and physical endurance regained following graduated exercise therapy.' },
        { condition: 'Bilateral Knee Osteoarthritis', diagnosedDate: '14 Nov 2021', severity: 'Grade 2 Kellgren-Lawrence', doctor: 'Dr. Marcus Thorne, MD', duration: '5 Years (Ongoing)', status: 'Active - Physiotherapy & Pain Management', notes: 'Joint mobility maintained with low-impact aquatic exercises.' },
        { condition: 'Type 2 Diabetes Mellitus', diagnosedDate: '10 Jan 2019', severity: 'Moderate (HbA1c 6.4%)', doctor: 'Dr. Marcus Thorne, MD', duration: '7.5 Years (Ongoing)', status: 'Active - Metformin 850 BD', notes: 'Glycemic control stable under current dietary management and medication.' }
      ],
      currentMedications: [
        {
          name: 'Metformin HCl',
          dosage: '850',
          frequency: 'Twice daily',
          timing: 'With meals',
          doctor: 'Dr. Marcus Thorne, MD',
          startDate: '20 Jan 2026',
          refillsRemaining: 5,
          pharmacy: 'HMS Main Pharmacy'
        }
      ],
      previousVisits: [
        {
          id: 'VIS-402',
          date: '20 Jul 2026',
          timeSlot: '10:45 AM',
          doctorName: 'Dr. Marcus Thorne, MD',
          specialty: 'Orthopedics',
          room: 'OPD Room 202',
          reason: 'Knee joint pain consultation',
          diagnosis: 'Mild bilateral osteoarthritis, physical therapy recommended.',
          type: 'In-Person OPD',
          status: 'Completed',
          prescription: {
            rxNumber: 'RX-448201',
            date: '20 Jul 2026',
            doctorReg: 'MD-881290',
            diagnosis: 'Mild Bilateral Knee Osteoarthritis',
            clinicalNotes: 'Mild joint stiffness, range of motion maintained.',
            medicines: [
              { name: 'Glucosamine Chondroitin Complex', dosage: '1500', frequency: 'Once daily', duration: '90 Days', instructions: 'Take with food' }
            ],
            advice: ['Low-impact swimming and physical therapy.'],
            nextFollowUp: '20 Oct 2026'
          },
          receipt: {
            receiptNumber: 'INV-2026-8819',
            invoiceDate: '20 Jul 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct Pay',
            transactionId: 'TXN-881902-GH',
            items: [
              { description: 'Orthopedic Consultation & Joint Exam', code: 'CPT-99214', quantity: 1, price: 190.00 }
            ],
            subtotal: 190.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 161.50,
            copayAmount: 28.50,
            tax: 0.00,
            totalPaid: 28.50
          }
        }
      ],
      healthRecords: [
        {
          id: 'LAB-9923',
          testName: 'Glycated Hemoglobin (HbA1c)',
          category: 'Diabetes Endocrinology',
          doctor: 'Dr. Marcus Thorne, MD',
          date: '20 Jul 2026',
          locationType: 'Out',
          locationName: 'BioReference External Outpatient Lab (Out)',
          status: 'Completed',
          summary: 'Glycemic control stable under current Metformin regimen.',
          parameters: [
            { name: 'HbA1c', value: '6.4', unit: '%', referenceRange: '< 5.7 Normal, 5.7-6.4 Pre, >6.4 Diab', status: 'Normal' }
          ],
          receipt: {
            receiptNumber: 'LAB-INV-9923',
            invoiceDate: '20 Jul 2026',
            paymentStatus: 'PAID',
            paymentMethod: 'Insurance Direct Pay',
            transactionId: 'TXN-LAB-99230',
            items: [
              { description: 'Glycated Hemoglobin (HbA1c) Assay', code: 'CPT-83036', quantity: 1, price: 75.00 }
            ],
            subtotal: 75.00,
            insuranceCoveragePercent: 85,
            insuranceCoveredAmount: 63.75,
            copayAmount: 11.25,
            tax: 0.00,
            totalPaid: 11.25
          }
        }
      ]
    }
  ]);

  // Doctor OPD Rooms State
  readonly doctors = signal<DoctorStatus[]>([
    {
      id: 'DOC-1',
      name: 'Dr. Arthur Vance, MD',
      specialty: 'Cardiology',
      room: 'OPD Room 101',
      status: 'In Consultation',
      queueLength: 2,
      currentPatientToken: 'T-101'
    },
    {
      id: 'DOC-2',
      name: 'Dr. Clara Reynolds, MD',
      specialty: 'Neurology',
      room: 'OPD Room 104',
      status: 'Available',
      queueLength: 1,
      currentPatientToken: 'None'
    },
    {
      id: 'DOC-3',
      name: 'Dr. Marcus Thorne, MD',
      specialty: 'Orthopedics',
      room: 'OPD Room 202',
      status: 'In Consultation',
      queueLength: 1,
      currentPatientToken: 'T-103'
    }
  ]);

  // Drag and Drop Queue Reordering
  readonly draggedQueueIndex = signal<number | null>(null);
  readonly dragOverQueueIndex = signal<number | null>(null);

  // Live Token Queue
  readonly tokens = signal<TokenItem[]>([
    {
      tokenNumber: 'T-101',
      patientName: 'Eleanor Vance',
      patientId: 'PT-94821',
      doctorName: 'Dr. Arthur Vance, MD',
      department: 'Cardiology',
      room: 'OPD Room 101',
      time: '09:15 AM',
      type: 'Physical Walk-In',
      status: 'In Consultation'
    },
    {
      tokenNumber: 'T-102',
      patientName: 'Robert Langdon',
      patientId: 'PT-39102',
      doctorName: 'Dr. Clara Reynolds, MD',
      department: 'Neurology',
      room: 'OPD Room 104',
      time: '09:30 AM',
      type: 'Physical Walk-In',
      status: 'Waiting'
    },
    {
      tokenNumber: 'T-103',
      patientName: 'Grace Hopper',
      patientId: 'PT-88129',
      doctorName: 'Dr. Marcus Thorne, MD',
      department: 'Orthopedics',
      room: 'OPD Room 202',
      time: '09:45 AM',
      type: 'Physical Walk-In',
      status: 'In Consultation'
    },
    {
      tokenNumber: 'T-104',
      patientName: 'Alan Turing',
      patientId: 'PT-12903',
      doctorName: 'Dr. Arthur Vance, MD',
      department: 'Cardiology',
      room: 'OPD Room 101',
      time: '10:00 AM',
      type: 'Online Appointment',
      status: 'Waiting'
    },
    {
      tokenNumber: 'T-105',
      patientName: 'Ada Lovelace',
      patientId: 'PT-44820',
      doctorName: 'Dr. Clara Reynolds, MD',
      department: 'Neurology',
      room: 'OPD Room 104',
      time: '10:15 AM',
      type: 'Online Appointment',
      status: 'Waiting'
    },
    {
      tokenNumber: 'T-106',
      patientName: 'Nikola Tesla',
      patientId: 'PT-66102',
      doctorName: 'Dr. Marcus Thorne, MD',
      department: 'Orthopedics',
      room: 'OPD Room 202',
      time: '10:30 AM',
      type: 'Physical Walk-In',
      status: 'Waiting'
    },
    {
      tokenNumber: 'T-107',
      patientName: 'Margaret Hamilton',
      patientId: 'PT-55210',
      doctorName: 'Dr. Arthur Vance, MD',
      department: 'Cardiology',
      room: 'OPD Room 101',
      time: '10:45 AM',
      type: 'Phone Callback',
      status: 'Waiting'
    },
    {
      tokenNumber: 'T-108',
      patientName: 'James Maxwell',
      patientId: 'PT-77182',
      doctorName: 'Dr. Clara Reynolds, MD',
      department: 'Neurology',
      room: 'OPD Room 104',
      time: '11:00 AM',
      type: 'Physical Walk-In',
      status: 'Waiting'
    },
    {
      tokenNumber: 'T-109',
      patientName: 'Rosalind Franklin',
      patientId: 'PT-33910',
      doctorName: 'Dr. Marcus Thorne, MD',
      department: 'Orthopedics',
      room: 'OPD Room 202',
      time: '11:15 AM',
      type: 'Emergency',
      status: 'In Consultation'
    },
    {
      tokenNumber: 'T-110',
      patientName: 'Katherine Johnson',
      patientId: 'PT-22819',
      doctorName: 'Dr. Arthur Vance, MD',
      department: 'Cardiology',
      room: 'OPD Room 101',
      time: '11:30 AM',
      type: 'Physical Walk-In',
      status: 'Waiting'
    },
    {
      tokenNumber: 'T-111',
      patientName: 'Linus Pauling',
      patientId: 'PT-19283',
      doctorName: 'Dr. Clara Reynolds, MD',
      department: 'Neurology',
      room: 'OPD Room 104',
      time: '11:45 AM',
      type: 'Phone Callback',
      status: 'Waiting'
    },
    {
      tokenNumber: 'T-112',
      patientName: 'Dorothy Hodgkin',
      patientId: 'PT-61029',
      doctorName: 'Dr. Marcus Thorne, MD',
      department: 'Orthopedics',
      room: 'OPD Room 202',
      time: '12:00 PM',
      type: 'Online Appointment',
      status: 'Waiting'
    },
    {
      tokenNumber: 'T-113',
      patientName: 'Ernest Rutherford',
      patientId: 'PT-44912',
      doctorName: 'Dr. Arthur Vance, MD',
      department: 'Cardiology',
      room: 'OPD Room 101',
      time: '12:15 PM',
      type: 'Physical Walk-In',
      status: 'Waiting'
    }
  ]);

  // Online Appointment Requests
  readonly onlineAppointments = signal<OnlineAppointment[]>([
    {
      id: 'ONL-101',
      patientName: 'Alan Turing',
      patientId: 'PT-12903',
      phone: '+91 99001 78901',
      doctorName: 'Dr. Arthur Vance, MD',
      department: 'Cardiology',
      room: 'OPD Room 101',
      date: 'Today',
      timeSlot: '10:30 AM',
      symptoms: 'Follow-up ECG check and routine cardiac consultation.',
      status: 'Pending'
    },
    {
      id: 'ONL-102',
      patientName: 'Ada Lovelace',
      patientId: 'PT-44820',
      phone: '+91 98802 90123',
      doctorName: 'Dr. Clara Reynolds, MD',
      department: 'Neurology',
      room: 'OPD Room 104',
      date: 'Today',
      timeSlot: '11:30 AM',
      symptoms: 'Recurring migraine headaches and visual aura analysis.',
      status: 'Pending'
    },
    {
      id: 'ONL-103',
      patientName: 'Nikola Tesla',
      patientId: 'PT-66102',
      phone: '+91 97403 67890',
      doctorName: 'Dr. Marcus Thorne, MD',
      department: 'Orthopedics',
      room: 'OPD Room 202',
      date: 'Today',
      timeSlot: '02:00 PM',
      symptoms: 'Post-fracture wrist mobility checkup and X-Ray review.',
      status: 'Pending'
    },
    {
      id: 'ONL-104',
      patientName: 'Marie Curie',
      patientId: 'PT-10943',
      phone: '+91 91234 56780',
      doctorName: 'Dr. Arthur Vance, MD',
      department: 'Cardiology',
      room: 'OPD Room 101',
      date: 'Tomorrow',
      timeSlot: '09:30 AM',
      symptoms: 'Hypertension checkup and cardiac stress test review.',
      status: 'Pending'
    },
    {
      id: 'ONL-105',
      patientName: 'Isaac Newton',
      patientId: 'PT-55102',
      phone: '+91 92345 67891',
      doctorName: 'Dr. Clara Reynolds, MD',
      department: 'Neurology',
      room: 'OPD Room 104',
      date: 'Tomorrow',
      timeSlot: '10:00 AM',
      symptoms: 'Chronic insomnia and sleep study consultation.',
      status: 'Pending'
    },
    {
      id: 'ONL-106',
      patientName: 'Albert Einstein',
      patientId: 'PT-77291',
      phone: '+91 93456 78902',
      doctorName: 'Dr. Marcus Thorne, MD',
      department: 'Orthopedics',
      room: 'OPD Room 202',
      date: 'Tomorrow',
      timeSlot: '11:00 AM',
      symptoms: 'Knee arthroscopy rehabilitation follow-up.',
      status: 'Pending'
    },
    {
      id: 'ONL-107',
      patientName: 'Charles Darwin',
      patientId: 'PT-88319',
      phone: '+91 94567 89013',
      doctorName: 'Dr. Arthur Vance, MD',
      department: 'Cardiology',
      room: 'OPD Room 101',
      date: 'Thursday Aug 27',
      timeSlot: '02:30 PM',
      symptoms: 'Routine cardiovascular screening and lipid profile.',
      status: 'Pending'
    },
    {
      id: 'ONL-108',
      patientName: 'Louis Pasteur',
      patientId: 'PT-99420',
      phone: '+91 95678 90124',
      doctorName: 'Dr. Clara Reynolds, MD',
      department: 'Neurology',
      room: 'OPD Room 104',
      date: 'Thursday Aug 27',
      timeSlot: '03:00 PM',
      symptoms: 'Peripheral neuropathy assessment and EMG review.',
      status: 'Pending'
    },
    {
      id: 'ONL-109',
      patientName: 'Gregor Mendel',
      patientId: 'PT-33104',
      phone: '+91 96789 01235',
      doctorName: 'Dr. Marcus Thorne, MD',
      department: 'Orthopedics',
      room: 'OPD Room 202',
      date: 'Thursday Aug 27',
      timeSlot: '04:00 PM',
      symptoms: 'Spinal alignment post-injury evaluation.',
      status: 'Pending'
    },
    {
      id: 'ONL-110',
      patientName: 'James Watson',
      patientId: 'PT-44215',
      phone: '+91 97890 12346',
      doctorName: 'Dr. Arthur Vance, MD',
      department: 'Cardiology',
      room: 'OPD Room 101',
      date: 'Friday Aug 28',
      timeSlot: '10:00 AM',
      symptoms: 'Cholesterol and lipid panel medication review.',
      status: 'Pending'
    },
    {
      id: 'ONL-111',
      patientName: 'Francis Crick',
      patientId: 'PT-55326',
      phone: '+91 98901 23457',
      doctorName: 'Dr. Clara Reynolds, MD',
      department: 'Neurology',
      room: 'OPD Room 104',
      date: 'Friday Aug 28',
      timeSlot: '11:30 AM',
      symptoms: 'Post-concussion neurocognitive assessment.',
      status: 'Pending'
    },
    {
      id: 'ONL-112',
      patientName: 'Niels Bohr',
      patientId: 'PT-66437',
      phone: '+91 99012 34568',
      doctorName: 'Dr. Marcus Thorne, MD',
      department: 'Orthopedics',
      room: 'OPD Room 202',
      date: 'Friday Aug 28',
      timeSlot: '02:00 PM',
      symptoms: 'Shoulder rotator cuff mobility assessment.',
      status: 'Pending'
    },
    {
      id: 'ONL-113',
      patientName: 'Max Planck',
      patientId: 'PT-77548',
      phone: '+91 90123 45679',
      doctorName: 'Dr. Arthur Vance, MD',
      department: 'Cardiology',
      room: 'OPD Room 101',
      date: 'Friday Aug 28',
      timeSlot: '03:30 PM',
      symptoms: 'Arrhythmia monitoring consultation.',
      status: 'Pending'
    }
  ]);

  // Call Back Requests (Ordered from most recent to oldest)
  readonly callbackRequests = signal<CallbackItem[]>([
    {
      id: 'CB-213',
      name: 'Alexander Fleming',
      phone: '+91 84810 12345',
      preferredTime: 'Morning (08:00 - 10:00 AM)',
      note: 'Medication refill and prescription consultation.',
      date: 'Today',
      time: '02:30 PM',
      patientType: 'New Patient',
      status: 'Pending'
    },
    {
      id: 'CB-212',
      name: 'Jonas Salk',
      phone: '+91 85909 01234',
      preferredTime: 'Evening (04:00 - 06:00 PM)',
      note: 'Vaccination and preventive medicine schedule.',
      date: 'Today',
      time: '02:00 PM',
      patientType: 'Old Patient',
      status: 'Pending'
    },
    {
      id: 'CB-211',
      name: 'Rachel Carson',
      phone: '+91 86008 90123',
      preferredTime: 'Afternoon (02:00 - 04:00 PM)',
      note: 'General health records inquiry.',
      date: 'Today',
      time: '01:30 PM',
      patientType: 'New Patient',
      status: 'Pending'
    },
    {
      id: 'CB-210',
      name: 'Jane Goodall',
      phone: '+91 87107 89012',
      preferredTime: 'Morning (09:00 - 11:00 AM)',
      note: 'Orthopedic knee joint consultation.',
      date: 'Today',
      time: '01:00 PM',
      patientType: 'Old Patient',
      status: 'Pending'
    },
    {
      id: 'CB-209',
      name: 'Carl Sagan',
      phone: '+91 88206 78901',
      preferredTime: 'Anytime today',
      note: 'Cardiology preventive wellness inquiry.',
      date: 'Today',
      time: '12:30 PM',
      patientType: 'New Patient',
      status: 'Pending'
    },
    {
      id: 'CB-208',
      name: 'Stephen Hawking',
      phone: '+91 89305 67890',
      preferredTime: 'Afternoon (01:00 - 03:00 PM)',
      note: 'Neurology routine review booking.',
      date: 'Today',
      time: '12:00 PM',
      patientType: 'Old Patient',
      status: 'Pending'
    },
    {
      id: 'CB-207',
      name: 'Chien-Shiung Wu',
      phone: '+91 90404 56789',
      preferredTime: 'Morning (09:00 - 11:00 AM)',
      note: 'Requesting schedule for Dr. Thorne orthopedic checkup.',
      date: 'Today',
      time: '11:35 AM',
      patientType: 'Old Patient',
      status: 'Pending'
    },
    {
      id: 'CB-206',
      name: 'Enrico Fermi',
      phone: '+91 91503 45678',
      preferredTime: 'Evening (04:00 - 06:00 PM)',
      note: 'Neurology consultation inquiry regarding dizziness.',
      date: 'Today',
      time: '11:10 AM',
      patientType: 'New Patient',
      status: 'Pending'
    },
    {
      id: 'CB-205',
      name: 'Barbara McClintock',
      phone: '+91 92602 34567',
      preferredTime: 'Afternoon (02:00 - 04:00 PM)',
      note: 'Follow-up appointment for cardiology lab test results.',
      date: 'Today',
      time: '10:45 AM',
      patientType: 'Old Patient',
      status: 'Pending'
    },
    {
      id: 'CB-204',
      name: 'Richard Feynman',
      phone: '+91 93701 23456',
      preferredTime: 'Morning (10:00 - 12:00 PM)',
      note: 'General inquiry on orthopedic MRI scan booking.',
      date: 'Today',
      time: '10:15 AM',
      patientType: 'New Patient',
      status: 'Pending'
    },
    {
      id: 'CB-203',
      name: 'Katherine Johnson',
      phone: '+91 94806 12345',
      preferredTime: 'Anytime today',
      note: 'Requesting neurology consult schedule for chronic vertigo.',
      date: 'Today',
      time: '09:40 AM',
      patientType: 'Old Patient',
      status: 'Pending'
    },
    {
      id: 'CB-202',
      name: 'James Maxwell',
      phone: '+91 95355 89056',
      preferredTime: 'Afternoon (01:00 - 03:00 PM)',
      note: 'Needs appointment for cardiac blood pressure medication adjustment.',
      date: 'Today',
      time: '09:10 AM',
      patientType: 'New Patient',
      status: 'Pending'
    },
    {
      id: 'CB-201',
      name: 'Margaret Hamilton',
      phone: '+91 96114 78934',
      preferredTime: 'Morning (09:00 - 11:00 AM)',
      note: 'Inquiry regarding joint replacement consultation with Dr. Thorne.',
      date: 'Today',
      time: '08:30 AM',
      patientType: 'Old Patient',
      status: 'Pending'
    }
  ]);

  // Modal States
  readonly isSlotBookingModalOpen = signal<boolean>(false);
  readonly slotBookingModalTitle = signal<string>('Book Slot');
  readonly activeCallbackTarget = signal<CallbackItem | null>(null);
  readonly selectedBookingDoctorId = signal<string>('DOC-1');
  readonly selectedBookingDate = signal<string>('Friday Aug 21, 2026');
  readonly selectedBookingTimeSlot = signal<string>('09:00 AM - 10:00 AM');

  // Book Slot modal dates (All available / unshaded)
  readonly bookingDateOptions: BookingDateOption[] = [
    { dayOfWeek: 'FRI', dayNumber: '21', fullDate: 'Friday Aug 21, 2026', isAvailable: true },
    { dayOfWeek: 'SAT', dayNumber: '22', fullDate: 'Saturday Aug 22, 2026', isAvailable: true },
    { dayOfWeek: 'SUN', dayNumber: '23', fullDate: 'Sunday Aug 23, 2026', isAvailable: true },
    { dayOfWeek: 'MON', dayNumber: '24', fullDate: 'Monday Aug 24, 2026', isAvailable: true },
    { dayOfWeek: 'TUE', dayNumber: '25', fullDate: 'Tuesday Aug 25, 2026', isAvailable: true },
    { dayOfWeek: 'WED', dayNumber: '26', fullDate: 'Wednesday Aug 26, 2026', isAvailable: true },
    { dayOfWeek: 'THU', dayNumber: '27', fullDate: 'Thursday Aug 27, 2026', isAvailable: true }
  ];

  // Move Slot modal dates (Shaded / disabled slots per schedule)
  readonly rescheduleDateOptions: BookingDateOption[] = [
    { dayOfWeek: 'FRI', dayNumber: '21', fullDate: 'Friday Aug 21, 2026', isAvailable: false },
    { dayOfWeek: 'SAT', dayNumber: '22', fullDate: 'Saturday Aug 22, 2026', isAvailable: false },
    { dayOfWeek: 'SUN', dayNumber: '23', fullDate: 'Sunday Aug 23, 2026', isAvailable: false },
    { dayOfWeek: 'MON', dayNumber: '24', fullDate: 'Monday Aug 24, 2026', isAvailable: true },
    { dayOfWeek: 'TUE', dayNumber: '25', fullDate: 'Tuesday Aug 25, 2026', isAvailable: true },
    { dayOfWeek: 'WED', dayNumber: '26', fullDate: 'Wednesday Aug 26, 2026', isAvailable: false },
    { dayOfWeek: 'THU', dayNumber: '27', fullDate: 'Thursday Aug 27, 2026', isAvailable: true }
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

  readonly isAddPatientSearchModalOpen = signal<boolean>(false);
  readonly addPatientSearchQuery = signal<string>('');
  readonly addPatientSearchResults = signal<RegisteredPatient[]>([]);

  readonly isCreateAccountModalOpen = signal<boolean>(false);
  readonly isCreatePatientModalOpen = signal<boolean>(false);
  readonly slotBookingStep = signal<1 | 2>(1);
  readonly registrationStep = signal<1 | 2 | 3>(1);
  readonly registrationDoctorId = signal<string>('DOC-1');
  readonly registrationDate = signal<string>('Friday Aug 21, 2026');
  readonly registrationSlot = signal<string>('09:00 AM - 10:00 AM');
  readonly bookedTokenResult = signal<TokenItem | null>(null);

  readonly isBookModalOpen = signal<boolean>(false);
  readonly isCancelModalOpen = signal<boolean>(false);
  readonly isRescheduleModalOpen = signal<boolean>(false);
  readonly isPatientDetailsModalOpen = signal<boolean>(false);

  // Sub-modal states for Prescription & Receipt viewing from within Patient Details
  readonly selectedVisitPrescription = signal<{
    patientName: string;
    patientId: string;
    doctorName: string;
    specialty: string;
    prescription: PrescriptionDetails;
  } | null>(null);

  readonly selectedReceiptData = signal<{
    patientName: string;
    patientId: string;
    serviceContext: string;
    receipt: ReceiptDetails;
  } | null>(null);

  readonly activeBookingPatient = signal<RegisteredPatient | null>(null);
  readonly activeBookingCallback = signal<CallbackItem | null>(null);
  readonly activeCancelTarget = signal<OnlineAppointment | null>(null);
  readonly activeRescheduleTarget = signal<OnlineAppointment | null>(null);
  readonly activeReassignToken = signal<TokenItem | null>(null);
  readonly activePatientDetails = signal<RegisteredPatient | null>(null);

  cancelReasonSelection: string = 'Doctor emergency leave';
  customCancelReason: string = '';
  rescheduleDoctorId: string = 'DOC-1';
  rescheduleDate: string = '2026-08-22';
  rescheduleSlot: string = '11:30 AM';

  // Forms
  readonly patientForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    email: [''],
    address: [''],
    emergencyContact: [''],
    age: [30],
    gender: ['Female'],
    bloodGroup: ['O+ Positive']
  });

  readonly bookForm = this.fb.group({
    doctorId: ['DOC-1', [Validators.required]],
    date: ['2026-08-22', [Validators.required]],
    timeSlot: ['10:00 AM', [Validators.required]],
    type: ['Physical Walk-In', [Validators.required]]
  });

  // Computed Counts
  readonly activeQueueCount = computed(() => this.tokens().length);
  readonly pendingOnlineCount = computed(() => this.onlineAppointments().filter(a => a.status === 'Pending').length);
  readonly pendingCallbackCount = computed(() => this.callbackRequests().filter(c => c.status === 'Pending').length);

  // Patient Queue Filters & Pagination Computations
  readonly hasActiveQueueFilters = computed(() => {
    return (
      this.filterToken().trim().length > 0 ||
      this.filterPatient().trim().length > 0 ||
      this.filterDoctor() !== 'ALL' ||
      this.filterSourceType() !== 'ALL' ||
      this.filterStatus() !== 'ALL'
    );
  });

  readonly filteredTokens = computed(() => {
    const token = this.filterToken().toLowerCase().trim();
    const patient = this.filterPatient().toLowerCase().trim();
    const doctor = this.filterDoctor();
    const source = this.filterSourceType();
    const status = this.filterStatus();

    return this.tokens().filter(t => {
      // 1. Token filter
      if (token && !t.tokenNumber.toLowerCase().includes(token)) return false;

      // 2. Patient Name / ID filter (Prefix & word-boundary matching)
      if (patient) {
        const patientWords = t.patientName.toLowerCase().split(/\s+/);
        const nameMatch = t.patientName.toLowerCase().startsWith(patient) ||
                          patientWords.some(w => w.startsWith(patient)) ||
                          (patient.length >= 3 && t.patientName.toLowerCase().includes(patient));

        const idClean = t.patientId.toLowerCase().replace(/[^a-z0-9]/g, '');
        const patientClean = patient.replace(/[^a-z0-9]/g, '');
        const idMatch = t.patientId.toLowerCase().startsWith(patient) ||
                        (patientClean.length > 0 && idClean.includes(patientClean));

        if (!nameMatch && !idMatch) return false;
      }

      // 3. Doctor filter
      if (doctor !== 'ALL' && !t.doctorName.toLowerCase().includes(doctor.toLowerCase())) return false;

      // 4. Source Type filter
      if (source !== 'ALL' && t.type !== source) return false;

      // 5. Status filter
      if (status !== 'ALL' && t.status !== status) return false;

      return true;
    });
  });

  readonly totalQueuePages = computed(() => {
    return Math.ceil(this.filteredTokens().length / this.queuePageSize()) || 1;
  });

  readonly paginatedTokens = computed(() => {
    const page = Math.min(this.queuePage(), this.totalQueuePages());
    const start = (page - 1) * this.queuePageSize();
    return this.filteredTokens().slice(start, start + this.queuePageSize());
  });

  // Patient Queue Pagination Methods
  setQueuePage(p: number): void {
    if (p >= 1 && p <= this.totalQueuePages()) {
      this.queuePage.set(p);
    }
  }

  prevQueuePage(): void {
    this.queuePage.update(p => Math.max(1, p - 1));
  }

  nextQueuePage(): void {
    this.queuePage.update(p => Math.min(this.totalQueuePages(), p + 1));
  }

  firstQueuePage(): void {
    this.queuePage.set(1);
  }

  lastQueuePage(): void {
    this.queuePage.set(this.totalQueuePages());
  }

  onQueuePageSizeChange(size: number | string): void {
    this.queuePageSize.set(Number(size) || 10);
    this.queuePage.set(1);
  }

  getQueuePagesArray(): number[] {
    const total = this.totalQueuePages();
    const current = this.queuePage();
    const maxButtons = 5;

    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  clearQueueFilters(): void {
    this.filterToken.set('');
    this.filterPatient.set('');
    this.filterDoctor.set('ALL');
    this.filterSourceType.set('ALL');
    this.filterStatus.set('ALL');
    this.queuePage.set(1);
  }

  // Online Appointments Pagination Computations & Methods
  readonly totalOnlinePages = computed(() => {
    return Math.ceil(this.onlineAppointments().length / this.onlinePageSize()) || 1;
  });

  readonly paginatedOnlineAppointments = computed(() => {
    const page = Math.min(this.onlinePage(), this.totalOnlinePages());
    const start = (page - 1) * this.onlinePageSize();
    return this.onlineAppointments().slice(start, start + this.onlinePageSize());
  });

  setOnlinePage(p: number): void {
    if (p >= 1 && p <= this.totalOnlinePages()) {
      this.onlinePage.set(p);
    }
  }

  prevOnlinePage(): void {
    this.onlinePage.update(p => Math.max(1, p - 1));
  }

  nextOnlinePage(): void {
    this.onlinePage.update(p => Math.min(this.totalOnlinePages(), p + 1));
  }

  firstOnlinePage(): void {
    this.onlinePage.set(1);
  }

  lastOnlinePage(): void {
    this.onlinePage.set(this.totalOnlinePages());
  }

  onOnlinePageSizeChange(size: number | string): void {
    this.onlinePageSize.set(Number(size) || 10);
    this.onlinePage.set(1);
  }

  getOnlinePagesArray(): number[] {
    const total = this.totalOnlinePages();
    const current = this.onlinePage();
    const maxButtons = 5;

    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Call Back Requests Pagination Computations & Methods
  readonly totalCallbackPages = computed(() => {
    return Math.ceil(this.callbackRequests().length / this.callbackPageSize()) || 1;
  });

  readonly paginatedCallbackRequests = computed(() => {
    const page = Math.min(this.callbackPage(), this.totalCallbackPages());
    const start = (page - 1) * this.callbackPageSize();
    return this.callbackRequests().slice(start, start + this.callbackPageSize());
  });

  setCallbackPage(p: number): void {
    if (p >= 1 && p <= this.totalCallbackPages()) {
      this.callbackPage.set(p);
    }
  }

  prevCallbackPage(): void {
    this.callbackPage.update(p => Math.max(1, p - 1));
  }

  nextCallbackPage(): void {
    this.callbackPage.update(p => Math.min(this.totalCallbackPages(), p + 1));
  }

  firstCallbackPage(): void {
    this.callbackPage.set(1);
  }

  lastCallbackPage(): void {
    this.callbackPage.set(this.totalCallbackPages());
  }

  onCallbackPageSizeChange(size: number | string): void {
    this.callbackPageSize.set(Number(size) || 10);
    this.callbackPage.set(1);
  }

  getCallbackPagesArray(): number[] {
    const total = this.totalCallbackPages();
    const current = this.callbackPage();
    const maxButtons = 5;

    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Patient 360 Sub-Tab 1: Vitals History Pagination
  readonly totalPatientVitalsPages = computed(() => {
    const list = this.activePatientDetails()?.previousVitals || [];
    return Math.ceil(list.length / this.patientVitalsPageSize()) || 1;
  });

  readonly paginatedPatientVitals = computed(() => {
    const list = this.activePatientDetails()?.previousVitals || [];
    const page = Math.min(this.patientVitalsPage(), this.totalPatientVitalsPages());
    const start = (page - 1) * this.patientVitalsPageSize();
    return list.slice(start, start + this.patientVitalsPageSize());
  });

  setPatientVitalsPage(p: number): void {
    if (p >= 1 && p <= this.totalPatientVitalsPages()) {
      this.patientVitalsPage.set(p);
    }
  }

  prevPatientVitalsPage(): void {
    this.patientVitalsPage.update(p => Math.max(1, p - 1));
  }

  nextPatientVitalsPage(): void {
    this.patientVitalsPage.update(p => Math.min(this.totalPatientVitalsPages(), p + 1));
  }

  firstPatientVitalsPage(): void {
    this.patientVitalsPage.set(1);
  }

  lastPatientVitalsPage(): void {
    this.patientVitalsPage.set(this.totalPatientVitalsPages());
  }

  onPatientVitalsPageSizeChange(size: number | string): void {
    this.patientVitalsPageSize.set(Number(size) || 10);
    this.patientVitalsPage.set(1);
  }

  getPatientVitalsPagesArray(): number[] {
    const total = this.totalPatientVitalsPages();
    const current = this.patientVitalsPage();
    const maxButtons = 5;
    if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // Patient 360 Sub-Tab 2: Allergies & Reactions Pagination
  readonly totalPatientAllergiesPages = computed(() => {
    const list = this.activePatientDetails()?.allergies || [];
    return Math.ceil(list.length / this.patientAllergiesPageSize()) || 1;
  });

  readonly paginatedPatientAllergies = computed(() => {
    const list = this.activePatientDetails()?.allergies || [];
    const page = Math.min(this.patientAllergiesPage(), this.totalPatientAllergiesPages());
    const start = (page - 1) * this.patientAllergiesPageSize();
    return list.slice(start, start + this.patientAllergiesPageSize());
  });

  setPatientAllergiesPage(p: number): void {
    if (p >= 1 && p <= this.totalPatientAllergiesPages()) {
      this.patientAllergiesPage.set(p);
    }
  }

  prevPatientAllergiesPage(): void {
    this.patientAllergiesPage.update(p => Math.max(1, p - 1));
  }

  nextPatientAllergiesPage(): void {
    this.patientAllergiesPage.update(p => Math.min(this.totalPatientAllergiesPages(), p + 1));
  }

  firstPatientAllergiesPage(): void {
    this.patientAllergiesPage.set(1);
  }

  lastPatientAllergiesPage(): void {
    this.patientAllergiesPage.set(this.totalPatientAllergiesPages());
  }

  onPatientAllergiesPageSizeChange(size: number | string): void {
    this.patientAllergiesPageSize.set(Number(size) || 10);
    this.patientAllergiesPage.set(1);
  }

  getPatientAllergiesPagesArray(): number[] {
    const total = this.totalPatientAllergiesPages();
    const current = this.patientAllergiesPage();
    const maxButtons = 5;
    if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // Patient 360 Sub-Tab 3: Chronic Conditions Pagination
  readonly totalPatientChronicPages = computed(() => {
    const list = this.activePatientDetails()?.chronicConditionsList || [];
    return Math.ceil(list.length / this.patientChronicPageSize()) || 1;
  });

  readonly paginatedPatientChronic = computed(() => {
    const list = this.activePatientDetails()?.chronicConditionsList || [];
    const page = Math.min(this.patientChronicPage(), this.totalPatientChronicPages());
    const start = (page - 1) * this.patientChronicPageSize();
    return list.slice(start, start + this.patientChronicPageSize());
  });

  setPatientChronicPage(p: number): void {
    if (p >= 1 && p <= this.totalPatientChronicPages()) {
      this.patientChronicPage.set(p);
    }
  }

  prevPatientChronicPage(): void {
    this.patientChronicPage.update(p => Math.max(1, p - 1));
  }

  nextPatientChronicPage(): void {
    this.patientChronicPage.update(p => Math.min(this.totalPatientChronicPages(), p + 1));
  }

  firstPatientChronicPage(): void {
    this.patientChronicPage.set(1);
  }

  lastPatientChronicPage(): void {
    this.patientChronicPage.set(this.totalPatientChronicPages());
  }

  onPatientChronicPageSizeChange(size: number | string): void {
    this.patientChronicPageSize.set(Number(size) || 10);
    this.patientChronicPage.set(1);
  }

  getPatientChronicPagesArray(): number[] {
    const total = this.totalPatientChronicPages();
    const current = this.patientChronicPage();
    const maxButtons = 5;
    if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // Patient 360: Current Medications Pagination
  readonly totalPatientMedicationsPages = computed(() => {
    const list = this.activePatientDetails()?.currentMedications || [];
    return Math.ceil(list.length / this.patientMedicationsPageSize()) || 1;
  });

  readonly paginatedPatientMedications = computed(() => {
    const list = this.activePatientDetails()?.currentMedications || [];
    const page = Math.min(this.patientMedicationsPage(), this.totalPatientMedicationsPages());
    const start = (page - 1) * this.patientMedicationsPageSize();
    return list.slice(start, start + this.patientMedicationsPageSize());
  });

  setPatientMedicationsPage(p: number): void {
    if (p >= 1 && p <= this.totalPatientMedicationsPages()) {
      this.patientMedicationsPage.set(p);
    }
  }

  prevPatientMedicationsPage(): void {
    this.patientMedicationsPage.update(p => Math.max(1, p - 1));
  }

  nextPatientMedicationsPage(): void {
    this.patientMedicationsPage.update(p => Math.min(this.totalPatientMedicationsPages(), p + 1));
  }

  firstPatientMedicationsPage(): void {
    this.patientMedicationsPage.set(1);
  }

  lastPatientMedicationsPage(): void {
    this.patientMedicationsPage.set(this.totalPatientMedicationsPages());
  }

  onPatientMedicationsPageSizeChange(size: number | string): void {
    this.patientMedicationsPageSize.set(Number(size) || 10);
    this.patientMedicationsPage.set(1);
  }

  getPatientMedicationsPagesArray(): number[] {
    const total = this.totalPatientMedicationsPages();
    const current = this.patientMedicationsPage();
    const maxButtons = 5;
    if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // Patient 360: Previous Visits Pagination
  readonly totalPatientVisitsPages = computed(() => {
    const list = this.activePatientDetails()?.previousVisits || [];
    return Math.ceil(list.length / this.patientVisitsPageSize()) || 1;
  });

  readonly paginatedPatientVisits = computed(() => {
    const list = this.activePatientDetails()?.previousVisits || [];
    const page = Math.min(this.patientVisitsPage(), this.totalPatientVisitsPages());
    const start = (page - 1) * this.patientVisitsPageSize();
    return list.slice(start, start + this.patientVisitsPageSize());
  });

  setPatientVisitsPage(p: number): void {
    if (p >= 1 && p <= this.totalPatientVisitsPages()) {
      this.patientVisitsPage.set(p);
    }
  }

  prevPatientVisitsPage(): void {
    this.patientVisitsPage.update(p => Math.max(1, p - 1));
  }

  nextPatientVisitsPage(): void {
    this.patientVisitsPage.update(p => Math.min(this.totalPatientVisitsPages(), p + 1));
  }

  firstPatientVisitsPage(): void {
    this.patientVisitsPage.set(1);
  }

  lastPatientVisitsPage(): void {
    this.patientVisitsPage.set(this.totalPatientVisitsPages());
  }

  onPatientVisitsPageSizeChange(size: number | string): void {
    this.patientVisitsPageSize.set(Number(size) || 10);
    this.patientVisitsPage.set(1);
  }

  getPatientVisitsPagesArray(): number[] {
    const total = this.totalPatientVisitsPages();
    const current = this.patientVisitsPage();
    const maxButtons = 5;
    if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // Patient 360: Health Records Pagination
  readonly totalPatientRecordsPages = computed(() => {
    const list = this.activePatientDetails()?.healthRecords || [];
    return Math.ceil(list.length / this.patientRecordsPageSize()) || 1;
  });

  readonly paginatedPatientRecords = computed(() => {
    const list = this.activePatientDetails()?.healthRecords || [];
    const page = Math.min(this.patientRecordsPage(), this.totalPatientRecordsPages());
    const start = (page - 1) * this.patientRecordsPageSize();
    return list.slice(start, start + this.patientRecordsPageSize());
  });

  setPatientRecordsPage(p: number): void {
    if (p >= 1 && p <= this.totalPatientRecordsPages()) {
      this.patientRecordsPage.set(p);
    }
  }

  prevPatientRecordsPage(): void {
    this.patientRecordsPage.update(p => Math.max(1, p - 1));
  }

  nextPatientRecordsPage(): void {
    this.patientRecordsPage.update(p => Math.min(this.totalPatientRecordsPages(), p + 1));
  }

  firstPatientRecordsPage(): void {
    this.patientRecordsPage.set(1);
  }

  lastPatientRecordsPage(): void {
    this.patientRecordsPage.set(this.totalPatientRecordsPages());
  }

  onPatientRecordsPageSizeChange(size: number | string): void {
    this.patientRecordsPageSize.set(Number(size) || 10);
    this.patientRecordsPage.set(1);
  }

  getPatientRecordsPagesArray(): number[] {
    const total = this.totalPatientRecordsPages();
    const current = this.patientRecordsPage();
    const maxButtons = 5;
    if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // Search Logic (Prefix and Word-Boundary matching)
  onSearchInputChange(query: string): void {
    this.searchQuery.set(query);
    const q = query.trim().toLowerCase();
    if (!q) {
      this.searchResults.set([]);
      return;
    }

    const qDigits = q.replace(/\D/g, '');
    const matches = this.patients().filter(p => {
      // 1. Name match: checks if any word in the name starts with query or full name starts with query
      const nameWords = p.name.toLowerCase().split(/\s+/);
      const nameMatch = p.name.toLowerCase().startsWith(q) || nameWords.some(w => w.startsWith(q));

      // 2. ID match: checks if ID starts with query (e.g. PT-94821 or 94821)
      const idClean = p.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const qClean = q.replace(/[^a-z0-9]/g, '');
      const idMatch = p.id.toLowerCase().startsWith(q) || (qClean.length > 0 && idClean.includes(qClean));

      // 3. Phone match: requires at least 3 digits
      const phoneDigits = p.phone.replace(/\D/g, '');
      const phoneMatch = qDigits.length >= 3 && phoneDigits.includes(qDigits);

      return nameMatch || idMatch || phoneMatch;
    });
    this.searchResults.set(matches);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
  }

  // Add Patient Modal Search Logic
  openAddPatientSearchModal(): void {
    this.addPatientSearchQuery.set('');
    this.addPatientSearchResults.set([]);
    this.isAddPatientSearchModalOpen.set(true);
  }

  onAddPatientSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value || '';
    this.addPatientSearchQuery.set(query);
    const q = query.trim().toLowerCase();
    if (!q) {
      this.addPatientSearchResults.set([]);
      return;
    }

    const qDigits = q.replace(/\D/g, '');
    const matches = this.patients().filter(p => {
      const nameWords = p.name.toLowerCase().split(/\s+/);
      const nameMatch = p.name.toLowerCase().startsWith(q) || nameWords.some(w => w.startsWith(q));

      const idClean = p.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      const qClean = q.replace(/[^a-z0-9]/g, '');
      const idMatch = p.id.toLowerCase().startsWith(q) || (qClean.length > 0 && idClean.includes(qClean));

      const phoneDigits = p.phone.replace(/\D/g, '');
      const phoneMatch = qDigits.length >= 3 && phoneDigits.includes(qDigits);

      return nameMatch || idMatch || phoneMatch;
    });
    this.addPatientSearchResults.set(matches);
  }

  clearAddPatientSearch(): void {
    this.addPatientSearchQuery.set('');
    this.addPatientSearchResults.set([]);
  }

  selectSearchResultPatient(patient: RegisteredPatient): void {
    this.openPatientDetailsModal(patient);
    this.clearSearch();
  }

  openPatientDetailsById(patientId: string, fallbackName?: string): void {
    if (patientId) {
      const p = this.patients().find(pt => pt.id.toLowerCase() === patientId.toLowerCase());
      if (p) {
        this.openPatientDetailsModal(p);
        return;
      }
    }
    if (fallbackName) {
      const match = this.patients().find(pt => pt.name.toLowerCase() === fallbackName.toLowerCase());
      if (match) {
        this.openPatientDetailsModal(match);
        return;
      }
    }
    if (this.patients().length > 0) {
      this.openPatientDetailsModal(this.patients()[0]);
    }
  }

  openPatientDetailsModal(patient: RegisteredPatient): void {
    this.activePatientDetails.set(patient);
    this.patientDetailsTab.set('personal');
    this.clinicalSubTab.set('vitals');
    this.patientVitalsPage.set(1);
    this.patientAllergiesPage.set(1);
    this.patientChronicPage.set(1);
    this.patientMedicationsPage.set(1);
    this.patientVisitsPage.set(1);
    this.patientRecordsPage.set(1);
    this.isPatientDetailsModalOpen.set(true);
  }

  openVisitPrescription(visit: PatientPreviousVisit, patient: RegisteredPatient): void {
    if (!visit.prescription) return;
    this.selectedVisitPrescription.set({
      patientName: patient.name,
      patientId: patient.id,
      doctorName: visit.doctorName,
      specialty: visit.specialty,
      prescription: visit.prescription
    });
  }

  closePrescriptionModal(): void {
    this.selectedVisitPrescription.set(null);
  }

  openVisitReceipt(visit: PatientPreviousVisit, patient: RegisteredPatient): void {
    if (!visit.receipt) return;
    this.selectedReceiptData.set({
      patientName: patient.name,
      patientId: patient.id,
      serviceContext: `${visit.doctorName} (${visit.specialty})`,
      receipt: visit.receipt
    });
  }

  openLabReceipt(record: PatientHealthRecord, patient: RegisteredPatient): void {
    if (!record.receipt) return;
    this.selectedReceiptData.set({
      patientName: patient.name,
      patientId: patient.id,
      serviceContext: `${record.testName} (${record.category}) - ${record.locationName}`,
      receipt: record.receipt
    });
  }

  closeReceiptModal(): void {
    this.selectedReceiptData.set(null);
  }

  printModal(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  downloadPdf(docType: string): void {
  }

  downloadVisitReceiptPdf(visit: PatientPreviousVisit, patient: RegisteredPatient): void {
    if (!visit.receipt) return;
  }

  downloadLabReportPdf(record: PatientHealthRecord, patient: RegisteredPatient): void {
  }

  downloadLabReceiptPdf(record: PatientHealthRecord, patient: RegisteredPatient): void {
    if (!record.receipt) return;
  }

  // Slot Booking Modal Handlers (2-Step Direct Booking Flow)
  openSlotBookingForPatient(patient: RegisteredPatient): void {
    this.activeBookingPatient.set(patient);
    this.activeCallbackTarget.set(null);
    this.slotBookingStep.set(1);
    this.bookedTokenResult.set(null);
    this.slotBookingModalTitle.set('Book Slot');
    const defaultDoc = this.doctors()[0]?.id || 'DOC-1';
    this.selectedBookingDoctorId.set(defaultDoc);
    const firstDate = this.bookingDateOptions[0]?.fullDate || 'Friday Aug 21, 2026';
    this.selectedBookingDate.set(firstDate);
    const firstAvailableSlot = this.availableTimeSlots.find(s => this.isTimeSlotAvailable(s, firstDate, defaultDoc, false)) || '09:00 AM - 10:00 AM';
    this.selectedBookingTimeSlot.set(firstAvailableSlot);
    this.isAddPatientSearchModalOpen.set(false);
    this.isSlotBookingModalOpen.set(true);
  }

  openAddPatientSlotBookingModal(): void {
    this.activeBookingPatient.set(null);
    this.activeCallbackTarget.set(null);
    this.slotBookingStep.set(1);
    this.bookedTokenResult.set(null);
    this.slotBookingModalTitle.set('Book Slot');
    const defaultDoc = this.doctors()[0]?.id || 'DOC-1';
    this.selectedBookingDoctorId.set(defaultDoc);
    const firstDate = this.bookingDateOptions[0]?.fullDate || 'Friday Aug 21, 2026';
    this.selectedBookingDate.set(firstDate);
    const firstAvailableSlot = this.availableTimeSlots.find(s => this.isTimeSlotAvailable(s, firstDate, defaultDoc, false)) || '09:00 AM - 10:00 AM';
    this.selectedBookingTimeSlot.set(firstAvailableSlot);
    this.isSlotBookingModalOpen.set(true);
  }

  openCallbackBookingModal(cb: CallbackItem): void {
    this.activeBookingPatient.set(null);
    this.activeCallbackTarget.set(cb);
    this.slotBookingStep.set(1);
    this.bookedTokenResult.set(null);
    this.slotBookingModalTitle.set('Book Slot');
    
    // Auto-detect doctor if mentioned in inquiry note, or pick default
    const matchedDoc = this.doctors().find(d => cb.note && cb.note.toLowerCase().includes(d.name.toLowerCase().split(' ')[1]?.toLowerCase() || ''));
    const docId = matchedDoc ? matchedDoc.id : (this.doctors()[0]?.id || 'DOC-1');
    this.selectedBookingDoctorId.set(docId);

    const firstDate = this.bookingDateOptions[0]?.fullDate || 'Friday Aug 21, 2026';
    this.selectedBookingDate.set(firstDate);
    const firstAvailableSlot = this.availableTimeSlots.find(s => this.isTimeSlotAvailable(s, firstDate, docId, false)) || '09:00 AM - 10:00 AM';
    this.selectedBookingTimeSlot.set(firstAvailableSlot);
    this.isSlotBookingModalOpen.set(true);
  }

  selectBookingDate(fullDate: string): void {
    this.selectedBookingDate.set(fullDate);
    if (!this.isTimeSlotAvailable(this.selectedBookingTimeSlot(), fullDate, this.selectedBookingDoctorId(), false)) {
      const firstAvailableSlot = this.availableTimeSlots.find(s => this.isTimeSlotAvailable(s, fullDate, this.selectedBookingDoctorId(), false));
      if (firstAvailableSlot) {
        this.selectedBookingTimeSlot.set(firstAvailableSlot);
      }
    }
  }

  onBookingDoctorChange(doctorId: string): void {
    this.selectedBookingDoctorId.set(doctorId);
    if (!this.isTimeSlotAvailable(this.selectedBookingTimeSlot(), this.selectedBookingDate(), doctorId, false)) {
      const firstAvailableSlot = this.availableTimeSlots.find(s => this.isTimeSlotAvailable(s, this.selectedBookingDate(), doctorId, false));
      if (firstAvailableSlot) {
        this.selectedBookingTimeSlot.set(firstAvailableSlot);
      }
    }
  }

  confirmSlotBooking(): void {
    const cb = this.activeCallbackTarget();
    const patient = this.activeBookingPatient();
    const doc = this.doctors().find(d => d.id === this.selectedBookingDoctorId()) || this.doctors()[0];
    
    // Find existing patient ID if old patient, or generate new
    const existingPatient = patient || (cb ? this.patients().find(p => 
      p.name.toLowerCase() === cb.name.toLowerCase() ||
      p.phone.replace(/\D/g, '') === cb.phone.replace(/\D/g, '')
    ) : null);
    const patientId = existingPatient ? existingPatient.id : `PT-${Math.floor(10000 + Math.random() * 90000)}`;

    const maxNum = this.tokens().reduce((max, t) => {
      const num = parseInt(t.tokenNumber.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 100);
    const nextTokenNumber = `T-${maxNum + 1}`;
    const patientName = existingPatient ? existingPatient.name : (cb ? cb.name : 'Walk-In Patient');
    const patientType = cb ? 'Phone Callback' : 'Physical Walk-In';
    
    const newToken: TokenItem = {
      tokenNumber: nextTokenNumber,
      patientName: patientName,
      patientId: patientId,
      doctorName: doc.name,
      department: doc.specialty,
      room: doc.room,
      time: this.selectedBookingTimeSlot().split(' - ')[0],
      type: patientType,
      status: 'Waiting'
    };

    // Add to Patients Queue
    this.tokens.update(list => [...list, newToken]);

    // Update doctor's queue load
    this.doctors.update(docs => docs.map(d => d.id === doc.id ? { ...d, queueLength: d.queueLength + 1 } : d));

    // Keep item in Call Backs table, but mark status as Resolved
    if (cb) {
      this.callbackRequests.update(list => list.map(c => c.id === cb.id ? { ...c, status: 'Resolved' } : c));
    }

    this.bookedTokenResult.set(newToken);
    this.slotBookingStep.set(2);

    this.modalService.showToast(
      'Appointment Booked & Added to Queue',
      `Token ${nextTokenNumber} issued for ${patientName} with ${doc.name} (${this.selectedBookingDate()}, ${this.selectedBookingTimeSlot()}). Added to Patients Queue.`,
      'success'
    );
  }

  // Standalone Create Account Modal Handlers (from '+' button - no booking slot)
  openCreateAccountModal(presetQuery?: string): void {
    this.patientForm.reset({
      name: presetQuery && isNaN(Number(presetQuery.replace(/\D/g, ''))) ? presetQuery : '',
      phone: presetQuery && !isNaN(Number(presetQuery.replace(/\D/g, ''))) ? presetQuery : '+91 98765 43210',
      email: 'patient@example.com',
      address: '',
      emergencyContact: '',
      age: 30,
      gender: 'Female',
      bloodGroup: 'O+ Positive'
    });
    this.isCreateAccountModalOpen.set(true);
  }

  submitCreateAccount(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }
    const val = this.patientForm.value;
    const newPatientId = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPatient: RegisteredPatient = {
      id: newPatientId,
      name: val.name || 'New Patient',
      dob: '01 January 1995',
      phone: val.phone || '+91 98765 43210',
      email: val.email || `${(val.phone || '9876543210').replace(/\D/g, '')}@patient.hms.org`,
      age: val.age || 30,
      gender: (val.gender as any) || 'Female',
      bloodGroup: val.bloodGroup || 'O+ Positive',
      address: val.address || 'Flat 402, Green Glen Heights, Bengaluru, Karnataka',
      occupation: 'Professional',
      maritalStatus: 'Single',
      nationalId: `AADHAAR-****-****-${Math.floor(1000 + Math.random() * 9000)}`,
      emergencyContact: val.emergencyContact || val.phone || '+91 98450 12345 (Emergency)',
      insuranceProvider: 'Star Health Insurance',
      insurancePolicyNumber: `STAR-${Math.floor(100000 + Math.random() * 900000)}`,
      primaryPhysician: 'Dr. Arthur Vance, MD',
      vitals: {
        bp: '120/80 mmHg',
        pulse: '74 bpm',
        temp: '98.6 °F',
        spo2: '99%',
        weight: '68 kg',
        bmi: '23.5',
        bloodSugar: '92 mg/dL',
        recordedAt: 'Today, 09:30 AM'
      },
      allergies: [],
      chronicConditions: ['None'],
      currentMedications: [],
      previousVisits: [],
      healthRecords: []
    };

    this.patients.update(list => [newPatient, ...list]);
    this.isCreateAccountModalOpen.set(false);
    this.modalService.showToast(
      'Account Created',
      `Patient profile created for ${newPatient.name} (${newPatient.id}).`,
      'success'
    );
  }

  // Patient Registration Multi-Step Modal Handlers (from Search or Call Backs)
  openRegisterFromSearch(): void {
    const query = this.addPatientSearchQuery().trim();
    this.isAddPatientSearchModalOpen.set(false);
    this.openCreatePatientModal(query);
  }

  openCreatePatientModal(presetQuery?: string): void {
    this.activeCallbackTarget.set(null);
    this.registrationStep.set(1);
    this.bookedTokenResult.set(null);
    const isDigits = presetQuery && !isNaN(Number(presetQuery.replace(/\D/g, ''))) && presetQuery.replace(/\D/g, '').length >= 4;
    const namePreset = presetQuery && !isDigits ? presetQuery : '';
    const phonePreset = isDigits ? presetQuery : '+91 95355 89056';
    const emailPreset = namePreset ? `${namePreset.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com` : 'patient@example.com';
    
    this.patientForm.reset({
      name: namePreset,
      phone: phonePreset,
      email: emailPreset,
      address: '',
      emergencyContact: phonePreset,
      age: 30,
      gender: 'Female',
      bloodGroup: 'O+ Positive'
    });

    const defaultDoc = this.doctors()[0]?.id || 'DOC-1';
    this.registrationDoctorId.set(defaultDoc);
    const firstDate = this.bookingDateOptions[0]?.fullDate || 'Friday Aug 21, 2026';
    this.registrationDate.set(firstDate);
    const firstAvailableSlot = this.availableTimeSlots.find(s => this.isTimeSlotAvailable(s, firstDate, defaultDoc, false)) || '09:00 AM - 10:00 AM';
    this.registrationSlot.set(firstAvailableSlot);

    this.isCreatePatientModalOpen.set(true);
  }

  openRegisterModalFromCallback(cb: CallbackItem): void {
    this.activeCallbackTarget.set(cb);
    this.registrationStep.set(1);
    this.bookedTokenResult.set(null);
    this.patientForm.reset({
      name: cb.name,
      phone: cb.phone,
      email: `${cb.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      address: '',
      emergencyContact: cb.phone,
      age: 30,
      gender: 'Female',
      bloodGroup: 'O+ Positive'
    });

    const matchedDoc = this.doctors().find(d => cb.note && cb.note.toLowerCase().includes(d.name.toLowerCase().split(' ')[1]?.toLowerCase() || ''));
    const docId = matchedDoc ? matchedDoc.id : (this.doctors()[0]?.id || 'DOC-1');
    this.registrationDoctorId.set(docId);
    
    const firstDate = this.bookingDateOptions[0]?.fullDate || 'Friday Aug 21, 2026';
    this.registrationDate.set(firstDate);
    const firstAvailableSlot = this.availableTimeSlots.find(s => this.isTimeSlotAvailable(s, firstDate, docId, false)) || '09:00 AM - 10:00 AM';
    this.registrationSlot.set(firstAvailableSlot);

    this.isCreatePatientModalOpen.set(true);
  }

  selectRegistrationDate(fullDate: string): void {
    this.registrationDate.set(fullDate);
    if (!this.isTimeSlotAvailable(this.registrationSlot(), fullDate, this.registrationDoctorId(), false)) {
      const firstAvailableSlot = this.availableTimeSlots.find(s => this.isTimeSlotAvailable(s, fullDate, this.registrationDoctorId(), false));
      if (firstAvailableSlot) {
        this.registrationSlot.set(firstAvailableSlot);
      }
    }
  }

  onRegistrationDoctorChange(doctorId: string): void {
    this.registrationDoctorId.set(doctorId);
    if (!this.isTimeSlotAvailable(this.registrationSlot(), this.registrationDate(), doctorId, false)) {
      const firstAvailableSlot = this.availableTimeSlots.find(s => this.isTimeSlotAvailable(s, this.registrationDate(), doctorId, false));
      if (firstAvailableSlot) {
        this.registrationSlot.set(firstAvailableSlot);
      }
    }
  }

  proceedToBookingStep(): void {
    if (this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }
    this.registrationStep.set(2);
  }

  confirmRegistrationAndBooking(): void {
    if (this.patientForm.invalid) return;
    const val = this.patientForm.value;
    const cb = this.activeCallbackTarget();
    const doc = this.doctors().find(d => d.id === this.registrationDoctorId()) || this.doctors()[0];

    const newPatientId = `PT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPatient: RegisteredPatient = {
      id: newPatientId,
      name: val.name || 'New Patient',
      dob: '01 January 1995',
      phone: val.phone || '+91 98765 43210',
      email: val.email || `${(val.phone || '9876543210').replace(/\D/g, '')}@patient.hms.org`,
      age: val.age || 30,
      gender: (val.gender as any) || 'Female',
      bloodGroup: val.bloodGroup || 'O+ Positive',
      address: val.address || 'Flat 402, Green Glen Heights, Bengaluru, Karnataka',
      occupation: 'Professional',
      maritalStatus: 'Single',
      nationalId: `AADHAAR-****-****-${Math.floor(1000 + Math.random() * 9000)}`,
      emergencyContact: val.emergencyContact || val.phone || '+91 98450 12345 (Emergency)',
      insuranceProvider: 'Star Health Insurance',
      insurancePolicyNumber: `STAR-${Math.floor(100000 + Math.random() * 900000)}`,
      primaryPhysician: doc.name,
      vitals: {
        bp: '120/80 mmHg',
        pulse: '74 bpm',
        temp: '98.6 °F',
        spo2: '99%',
        weight: '68 kg',
        bmi: '23.5',
        bloodSugar: '92 mg/dL',
        recordedAt: 'Today, 09:30 AM'
      },
      allergies: [],
      chronicConditions: ['None'],
      currentMedications: [],
      previousVisits: [],
      healthRecords: []
    };

    // Save patient profile to registry
    this.patients.update(list => [newPatient, ...list]);

    // Issue Token
    const maxNum = this.tokens().reduce((max, t) => {
      const num = parseInt(t.tokenNumber.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 100);
    const nextTokenNumber = `T-${maxNum + 1}`;

    const newToken: TokenItem = {
      tokenNumber: nextTokenNumber,
      patientName: newPatient.name,
      patientId: newPatient.id,
      doctorName: doc.name,
      department: doc.specialty,
      room: doc.room,
      time: this.registrationSlot().split(' - ')[0],
      type: cb ? 'Phone Callback' : 'Physical Walk-In',
      status: 'Waiting'
    };

    // Add to Patients Queue
    this.tokens.update(list => [...list, newToken]);

    // Mark callback inquiry resolved if from callback
    if (cb) {
      this.callbackRequests.update(list => list.map(c => c.id === cb.id ? { ...c, status: 'Resolved' } : c));
    }

    this.bookedTokenResult.set(newToken);
    this.registrationStep.set(3);
  }

  finishRegistrationFlow(): void {
    const res = this.bookedTokenResult();
    this.isCreatePatientModalOpen.set(false);
    this.registrationStep.set(1);
    this.activeCallbackTarget.set(null);

    if (res) {
      this.modalService.showToast(
        'Registration & Booking Complete',
        `Token ${res.tokenNumber} created for ${res.patientName} with ${res.doctorName}. Visible in Patients Queue.`,
        'success'
      );
    }
  }

  onCreatePatientSubmit(): void {
    this.proceedToBookingStep();
  }

  // Appointment & Token Booking Flow
  openBookModalForPatient(patient: RegisteredPatient, callbackRef?: CallbackItem, forcedType: string = 'Physical Walk-In'): void {
    this.activeBookingPatient.set(patient);
    this.activeBookingCallback.set(callbackRef || null);
    this.bookForm.patchValue({
      doctorId: 'DOC-1',
      date: '2026-08-22',
      timeSlot: '10:00 AM',
      type: forcedType as any
    });
    this.isBookModalOpen.set(true);
  }

  onBookAppointmentSubmit(): void {
    if (this.bookForm.invalid) return;
    const patient = this.activeBookingPatient();
    if (!patient) return;

    const val = this.bookForm.value;
    const doc = this.doctors().find(d => d.id === val.doctorId) || this.doctors()[0];
    const nextNum = `T-${100 + this.tokens().length + 1}`;

    const newToken: TokenItem = {
      tokenNumber: nextNum,
      patientName: patient.name,
      patientId: patient.id,
      doctorName: doc.name,
      department: doc.specialty,
      room: doc.room,
      time: 'Just now',
      type: (val.type as any) || 'Physical Walk-In',
      status: 'Waiting'
    };

    // Add to Live Doctor Queue (Tab 1)
    this.tokens.update(list => [...list, newToken]);

    // Update doctor's queue load
    this.doctors.update(docs => docs.map(d => d.id === doc.id ? { ...d, queueLength: d.queueLength + 1 } : d));

    // If this was from a callback, mark callback as resolved
    const cb = this.activeBookingCallback();
    if (cb) {
      this.callbackRequests.update(list => list.map(c => c.id === cb.id ? { ...c, status: 'Resolved' } : c));
    }

    this.isBookModalOpen.set(false);
    this.clearSearch();
    this.modalService.showToast('Token Issued & Queued', `Token ${nextNum} assigned for ${patient.name} (${doc.room}).`, 'success');
  }

  // Online Appointments Actions
  confirmOnlineAppointment(req: OnlineAppointment): void {
    // 1. Remove from Online Appointments list
    this.onlineAppointments.update(list => list.filter(a => a.id !== req.id));

    // 2. Add to Patients Queue (Tab 1)
    const maxNum = this.tokens().reduce((max, t) => {
      const num = parseInt(t.tokenNumber.replace(/\D/g, ''), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 100);
    const nextNum = `T-${maxNum + 1}`;

    const newToken: TokenItem = {
      tokenNumber: nextNum,
      patientName: req.patientName,
      patientId: req.patientId,
      doctorName: req.doctorName,
      department: req.department,
      room: req.room,
      time: req.timeSlot || 'Just now',
      type: 'Online Appointment',
      status: 'Waiting'
    };
    this.tokens.update(list => [...list, newToken]);

    // 3. Update doctor's queue load
    this.doctors.update(docs => docs.map(d => d.name === req.doctorName ? { ...d, queueLength: d.queueLength + 1 } : d));

    this.modalService.showToast(
      'Appointment Confirmed & Queued',
      `Token ${nextNum} issued for ${req.patientName}. Added to Patients Queue.`,
      'success'
    );
  }

  openCancelModal(req: OnlineAppointment): void {
    this.activeCancelTarget.set(req);
    this.cancelReasonSelection = 'Doctor emergency leave';
    this.customCancelReason = '';
    this.isCancelModalOpen.set(true);
  }

  confirmCancelAppointment(): void {
    const target = this.activeCancelTarget();
    if (!target) return;

    const finalReason = this.cancelReasonSelection === 'Other'
      ? (this.customCancelReason.trim() || 'Other reason')
      : this.cancelReasonSelection;

    this.onlineAppointments.update(list => 
      list.map(a => a.id === target.id ? { ...a, status: 'Cancelled', cancelReason: finalReason } : a)
    );
    this.isCancelModalOpen.set(false);
    this.modalService.showToast('Appointment Cancelled', `Booking for ${target.patientName} was cancelled (${finalReason}).`, 'info');

    // Remove from online requests queue after 1.5 seconds
    setTimeout(() => {
      this.onlineAppointments.update(list => list.filter(a => a.id !== target.id));
    }, 1500);
  }

  openReassignTokenModal(t: TokenItem): void {
    this.activeReassignToken.set(t);
    this.activeRescheduleTarget.set(null);
    const existingDoc = this.doctors().find(d => d.name === t.doctorName);
    this.rescheduleDoctorId = existingDoc ? existingDoc.id : 'DOC-1';
    
    const firstAvailableDate = this.rescheduleDateOptions.find(d => d.isAvailable !== false)?.fullDate || 'Monday Aug 24, 2026';
    this.rescheduleDate = firstAvailableDate;
    
    const firstAvailableSlot = this.availableTimeSlots.find(s => this.isTimeSlotAvailable(s, this.rescheduleDate, this.rescheduleDoctorId, true)) || '08:00 AM - 09:00 AM';
    this.rescheduleSlot = firstAvailableSlot;
    
    this.isRescheduleModalOpen.set(true);
  }

  openRescheduleModal(req: OnlineAppointment): void {
    this.activeRescheduleTarget.set(req);
    this.activeReassignToken.set(null);
    const existingDoc = this.doctors().find(d => d.name === req.doctorName);
    this.rescheduleDoctorId = existingDoc ? existingDoc.id : 'DOC-1';
    
    const firstAvailableDate = this.rescheduleDateOptions.find(d => d.isAvailable !== false)?.fullDate || 'Monday Aug 24, 2026';
    this.rescheduleDate = firstAvailableDate;
    
    const firstAvailableSlot = this.availableTimeSlots.find(s => this.isTimeSlotAvailable(s, this.rescheduleDate, this.rescheduleDoctorId, true)) || '08:00 AM - 09:00 AM';
    this.rescheduleSlot = firstAvailableSlot;
    
    this.isRescheduleModalOpen.set(true);
  }

  isDateAvailable(fullDate: string, isReschedule: boolean = true): boolean {
    if (!isReschedule) return true;
    const opt = this.rescheduleDateOptions.find(d => d.fullDate === fullDate);
    return opt ? (opt.isAvailable !== false) : true;
  }

  isTimeSlotAvailable(slot: string, date: string = this.rescheduleDate, doctorId: string = this.rescheduleDoctorId, isReschedule: boolean = true): boolean {
    if (isReschedule && !this.isDateAvailable(date, true)) return false;
    
    // Lunch break and early morning unavailable across the hospital OPD
    if (slot === '06:00 AM - 07:00 AM' || slot === '01:00 PM - 02:00 PM') {
      return false;
    }
    
    // Doctor & date specific booked slots
    if (date.includes('21')) {
      return slot !== '08:00 AM - 09:00 AM' && slot !== '03:00 PM - 04:00 PM';
    }
    if (date.includes('22')) {
      return slot !== '10:00 AM - 11:00 AM' && slot !== '02:00 PM - 03:00 PM' && slot !== '05:00 PM - 06:00 PM';
    }
    if (date.includes('24')) {
      return slot !== '09:00 AM - 10:00 AM' && slot !== '11:00 AM - 12:00 PM';
    }
    if (date.includes('25')) {
      return slot !== '07:00 AM - 08:00 AM' && slot !== '04:00 PM - 05:00 PM';
    }
    if (date.includes('27')) {
      return slot !== '08:00 AM - 09:00 AM' && slot !== '12:00 PM - 01:00 PM';
    }

    return true;
  }

  getTimeSlotBadge(slot: string, date: string = this.rescheduleDate): string {
    if (slot === '01:00 PM - 02:00 PM') return 'Break';
    if (slot === '06:00 AM - 07:00 AM') return 'Off';
    return 'Booked';
  }

  selectRescheduleDate(fullDate: string): void {
    if (!this.isDateAvailable(fullDate)) return;
    this.rescheduleDate = fullDate;
    if (!this.isTimeSlotAvailable(this.rescheduleSlot, this.rescheduleDate, this.rescheduleDoctorId)) {
      const firstAvailableSlot = this.availableTimeSlots.find(s => this.isTimeSlotAvailable(s, this.rescheduleDate, this.rescheduleDoctorId));
      if (firstAvailableSlot) {
        this.rescheduleSlot = firstAvailableSlot;
      }
    }
  }

  onRescheduleDoctorChange(doctorId: string): void {
    this.rescheduleDoctorId = doctorId;
    if (!this.isTimeSlotAvailable(this.rescheduleSlot, this.rescheduleDate, this.rescheduleDoctorId)) {
      const firstAvailableSlot = this.availableTimeSlots.find(s => this.isTimeSlotAvailable(s, this.rescheduleDate, this.rescheduleDoctorId));
      if (firstAvailableSlot) {
        this.rescheduleSlot = firstAvailableSlot;
      }
    }
  }

  confirmReschedule(): void {
    const tokenTarget = this.activeReassignToken();
    const onlineTarget = this.activeRescheduleTarget();

    if (tokenTarget) {
      const oldDocName = tokenTarget.doctorName;
      const newDoc = this.doctors().find(d => d.id === this.rescheduleDoctorId) || this.doctors()[0];
      const timeOnly = this.rescheduleSlot.split(' - ')[0];

      // Update token in queue
      this.tokens.update(list => 
        list.map(t => t.tokenNumber === tokenTarget.tokenNumber ? {
          ...t,
          doctorName: newDoc.name,
          department: newDoc.specialty,
          room: newDoc.room,
          time: timeOnly
        } : t)
      );

      // If doctor changed, update queue lengths
      if (oldDocName !== newDoc.name) {
        this.doctors.update(docs => docs.map(d => {
          if (d.name === oldDocName) {
            return { ...d, queueLength: Math.max(0, d.queueLength - 1) };
          }
          if (d.name === newDoc.name) {
            return { ...d, queueLength: d.queueLength + 1 };
          }
          return d;
        }));
      }

      this.isRescheduleModalOpen.set(false);
      this.activeReassignToken.set(null);

      this.modalService.showToast(
        'Slot Reassigned',
        `Token ${tokenTarget.tokenNumber} for ${tokenTarget.patientName} reassigned to ${newDoc.name} (${this.rescheduleDate}, ${timeOnly}).`,
        'success'
      );
      return;
    }

    if (onlineTarget) {
      const doc = this.doctors().find(d => d.id === this.rescheduleDoctorId) || this.doctors()[0];
      const cleanedDate = this.rescheduleDate.split(',')[0].replace(/^(Friday|Saturday|Sunday|Monday|Tuesday|Wednesday|Thursday)\s+/i, '').trim();
      const timeOnly = this.rescheduleSlot.split(' - ')[0];

      this.onlineAppointments.update(list => 
        list.map(a => a.id === onlineTarget.id ? {
          ...a,
          status: 'Rescheduled',
          doctorName: doc.name,
          department: doc.specialty,
          room: doc.room,
          date: cleanedDate || this.rescheduleDate,
          timeSlot: timeOnly
        } : a)
      );

      this.isRescheduleModalOpen.set(false);
      this.activeRescheduleTarget.set(null);
      this.modalService.showToast('Slot Rescheduled', `Appointment for ${onlineTarget.patientName} moved to ${doc.name} (${this.rescheduleSlot}).`, 'success');
    }
  }

  getSlotDate(req: OnlineAppointment): string {
    if (!req.date) return 'Today';
    if (req.date.includes(',')) {
      const parts = req.date.split(',').map(s => s.trim());
      if (/\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/i.test(parts[parts.length - 1])) {
        return parts.slice(0, -1).join(', ').trim() || 'Today';
      }
    }
    return req.date;
  }

  getSlotTime(req: OnlineAppointment): string {
    if (req.timeSlot) return req.timeSlot;
    if (req.date && /\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/i.test(req.date)) {
      const match = req.date.match(/\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/i);
      if (match) return match[0];
    }
    return '10:00 AM';
  }

  getCallbackDay(cb: CallbackItem): string {
    if (cb.date && cb.date.includes(',')) {
      return cb.date.split(',')[0].trim();
    }
    return cb.date || 'Today';
  }

  getCallbackTime(cb: CallbackItem): string {
    if (cb.time) return cb.time;
    if (cb.date && cb.date.includes(',')) {
      return cb.date.split(',')[1].trim();
    }
    return '09:00 AM';
  }

  getCallbackPatientType(cb: CallbackItem): 'Old Patient' | 'New Patient' {
    if (cb.patientType) return cb.patientType;
    const exists = this.patients().some(p => 
      p.name.toLowerCase() === cb.name.toLowerCase() ||
      p.phone.replace(/\D/g, '') === cb.phone.replace(/\D/g, '')
    );
    return exists ? 'Old Patient' : 'New Patient';
  }

  // Callbacks Actions
  processCallbackBooking(cb: CallbackItem): void {
    // Check if patient exists in registry by phone or name
    const existing = this.patients().find(p => 
      p.name.toLowerCase() === cb.name.toLowerCase() ||
      p.phone.replace(/\D/g, '') === cb.phone.replace(/\D/g, '')
    );

    if (existing) {
      this.openBookModalForPatient(existing, cb, 'Phone Callback');
    } else {
      // Create quick patient profile for them
      const newPatient: RegisteredPatient = {
        id: `PT-${Math.floor(10000 + Math.random() * 90000)}`,
        name: cb.name,
        dob: '15 August 1990',
        phone: cb.phone,
        email: `${cb.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        age: 32,
        gender: 'Other',
        bloodGroup: 'O+ Positive',
        address: '45 Hospital Avenue, Springfield, OR',
        occupation: 'Client',
        maritalStatus: 'Single',
        nationalId: `SSN-***-**-${Math.floor(1000 + Math.random() * 9000)}`,
        emergencyContact: cb.phone,
        insuranceProvider: 'Standard Healthcare',
        insurancePolicyNumber: `INS-${Math.floor(100000 + Math.random() * 900000)}`,
        primaryPhysician: 'Dr. Arthur Vance, MD',
        vitals: {
          bp: '120/80 mmHg',
          pulse: '74 bpm',
          temp: '98.6 °F',
          spo2: '99%',
          weight: '68 kg',
          bmi: '23.5',
          bloodSugar: '92 mg/dL',
          recordedAt: 'Today, 09:30 AM'
        },
        allergies: [],
        chronicConditions: ['None'],
        currentMedications: [],
        previousVisits: [],
        healthRecords: []
      };
      this.patients.update(list => [newPatient, ...list]);
      this.openBookModalForPatient(newPatient, cb, 'Phone Callback');
    }
  }

  markCallbackResolved(cb: CallbackItem): void {
    this.callbackRequests.update(list => list.map(c => c.id === cb.id ? { ...c, status: 'Resolved' } : c));
    this.modalService.showToast('Callback Resolved', `Inquiry for ${cb.name} marked as resolved.`, 'info');
  }

  // Live Queue Actions
  advanceToken(token: TokenItem): void {
    this.tokens.update(list => 
      list.map(t => t.tokenNumber === token.tokenNumber ? { ...t, status: 'In Consultation' } : t)
    );
    this.doctors.update(docs => docs.map(d => {
      if (d.name === token.doctorName) {
        return {
          ...d,
          currentPatientToken: token.tokenNumber,
          status: 'In Consultation'
        };
      }
      return d;
    }));
  }

  completeToken(token: TokenItem): void {
    // Remove from active queue immediately
    this.tokens.update(list => list.filter(t => t.tokenNumber !== token.tokenNumber));

    // Free up doctor room & decrement doctor queue
    this.doctors.update(docs => docs.map(d => {
      if (d.currentPatientToken === token.tokenNumber) {
        return {
          ...d,
          currentPatientToken: 'None',
          status: 'Available',
          queueLength: Math.max(0, d.queueLength - 1)
        };
      }
      return d;
    }));

    this.modalService.showToast('Consultation Complete', `Token ${token.tokenNumber} completed and cleared from queue.`, 'success');
  }

  // Queue Drag & Drop Reordering Handlers
  onQueueDragStart(index: number, event: DragEvent): void {
    this.draggedQueueIndex.set(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', index.toString());
    }
  }

  onQueueDragOver(index: number, event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (this.dragOverQueueIndex() !== index) {
      this.dragOverQueueIndex.set(index);
    }
  }

  onQueueDrop(dropIndex: number, event: DragEvent): void {
    event.preventDefault();
    const fromIndex = this.draggedQueueIndex();
    if (fromIndex === null || fromIndex === dropIndex) {
      this.draggedQueueIndex.set(null);
      this.dragOverQueueIndex.set(null);
      return;
    }

    const currentTokens = [...this.tokens()];
    const [movedItem] = currentTokens.splice(fromIndex, 1);
    currentTokens.splice(dropIndex, 0, movedItem);
    this.tokens.set(currentTokens);

    this.draggedQueueIndex.set(null);
    this.dragOverQueueIndex.set(null);
  }

  onQueueDragEnd(): void {
    this.draggedQueueIndex.set(null);
    this.dragOverQueueIndex.set(null);
  }

  onLogout(): void {
    this.modalService.confirm({
      title: 'Confirm Logout',
      message: 'Are you sure you want to end your receptionist session and log out?',
      confirmText: 'Log Out',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'log-out',
      onConfirm: () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}
