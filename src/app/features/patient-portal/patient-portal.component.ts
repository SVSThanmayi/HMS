import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, PatientProfile } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { IconComponent } from '../../shared/icons/icon.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';

type PortalTab = 'my-dashboard' | 'my-appointments' | 'my-health-records';
type DashboardSubTab = 'personal' | 'medications' | 'clinical';

interface PrescriptionMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionDetails {
  rxNumber: string;
  date: string;
  doctorReg: string;
  diagnosis: string;
  clinicalNotes: string;
  medicines: PrescriptionMedicine[];
  advice: string[];
  nextFollowUp: string;
}

interface ReceiptItem {
  description: string;
  code: string;
  quantity: number;
  price: number;
}

interface ReceiptDetails {
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

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled';

interface PatientAppointment {
  id: string;
  doctorName: string;
  doctorDegree: string;
  specialty: string;
  avatar: string;
  cause: string;
  date: string;
  time: string;
  room: string;
  type: 'In-Person' | 'Telehealth Video';
  status: AppointmentStatus;
  prescription?: PrescriptionDetails;
  receipt?: ReceiptDetails;
}

interface LabReportParameter {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'High' | 'Low';
}

interface StatusTimelineStep {
  title: string;
  timestamp: string;
  description: string;
  completed: boolean;
  active: boolean;
}

interface LabReport {
  id: string;
  testName: string;
  doctor: string;
  date: string;
  time: string;
  locationType: 'Hospital' | 'Out';
  locationName: string;
  status: 'Normal' | 'Completed' | 'In Processing' | 'Pending Review';
  fileSize: string;
  category: string;
  labTechnician: string;
  specimen: string;
  parameters: LabReportParameter[];
  summaryNotes: string;
  timeline: StatusTimelineStep[];
}

interface PrescriptionItem {
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  doctor: string;
  startDate?: string;
  refillInDays: number;
  pharmacy: string;
}

interface BookingDoctor {
  id: string;
  name: string;
  degree: string;
  specialty: string;
  avatar: string;
  experience: string;
  rating: number;
}

@Component({
  selector: 'app-patient-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, IconComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-screen w-full bg-[#f5f5f5] text-slate-900 flex flex-col overflow-hidden selection:bg-teal-500 selection:text-white relative">
      
      <!-- ============================================================= -->
      <!-- TOP NAVIGATION BAR (FULL WIDTH AT TOP, FIXED, NO HAMBURGER ICON) -->
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
              Patient Portal
            </span>
          </div>
        </a>

        <!-- Right: Patient Profile Chip & Logout Action -->
        <div class="flex items-center gap-2 sm:gap-4 shrink-0">
          <!-- Patient Profile Chip -->
          <div class="flex items-center gap-2 bg-slate-100/90 border border-slate-200 rounded-full py-1 pl-1.5 pr-3">
            <app-avatar [name]="patient()?.name || 'Patient'" sizeClass="w-7 h-7 rounded-full" />
            <div class="flex flex-col text-left hidden sm:flex">
              <span class="text-xs font-bold text-slate-800 leading-tight">{{ patient()?.name || 'Patient' }}</span>
              <span class="text-xs text-teal-700 font-medium leading-none">{{ patient()?.id || 'PT-94821' }}</span>
            </div>
          </div>

          <!-- Quick Action: Book Appointment -->
          <button 
            type="button" 
            (click)="openNewAppointmentModal()" 
            class="btn-healthcare-primary inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer hover:shadow-md transition"
          >
            <app-icon name="plus" wrapperClass="w-3.5 h-3.5" />
            <span class="hidden sm:inline">Book Appointment</span>
          </button>

          <!-- Logout Button -->
          <button 
            type="button" 
            (click)="onLogout()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-700 text-xs font-bold transition cursor-pointer shadow-2xs"
            aria-label="Log Out"
          >
            <app-icon name="log-out" wrapperClass="w-4 h-4" />
            <span class="hidden sm:inline">Logout</span>
          </button>
        </div>

      </header>

      <!-- ============================================================= -->
      <!-- 2 SIDE-BY-SIDE SECTIONS UNDER NAVBAR: SIDE MENU & DISPLAY SECTION -->
      <!-- ============================================================= -->
      <div class="flex flex-1 w-full h-[calc(100vh-4rem)] overflow-hidden">
        
        <!-- ============================================================= -->
        <!-- SECTION 1 (LEFT): SIDE MENU BAR (FIXED, NON-SCROLLING) -->
        <!-- ============================================================= -->
        <aside 
          class="group/sidebar h-full w-16 hover:w-64 bg-white border-r border-slate-200 shadow-xs flex flex-col justify-between z-30 transition-[width] duration-300 ease-in-out shrink-0 select-none overflow-hidden px-2.5 pt-4 pb-4"
        >
          <!-- Navigation Menu List: My Dashboard, My Appointments, My Health Records -->
          <nav class="space-y-2">
            
            <!-- 1. My Dashboard -->
            <button 
              type="button" 
              (click)="selectTab('my-dashboard')"
              class="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer group/btn"
              [class]="activeTab() === 'my-dashboard' 
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'"
            >
              <div class="w-5 h-5 flex items-center justify-center shrink-0">
                <app-icon 
                  name="activity" 
                  [wrapperClass]="activeTab() === 'my-dashboard' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-500 group-hover/btn:text-teal-600 transition-colors'" 
                />
              </div>
              <span class="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
                My Dashboard
              </span>
            </button>

            <!-- 2. My Appointments -->
            <button 
              type="button" 
              (click)="selectTab('my-appointments')"
              class="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer group/btn"
              [class]="activeTab() === 'my-appointments' 
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'"
            >
              <div class="w-5 h-5 flex items-center justify-center shrink-0">
                <app-icon 
                  name="calendar" 
                  [wrapperClass]="activeTab() === 'my-appointments' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-500 group-hover/btn:text-teal-600 transition-colors'" 
                />
              </div>
              <span class="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
                My Appointments
              </span>
            </button>

            <!-- 3. Diagnostic Reports -->
            <button 
              type="button" 
              (click)="selectTab('my-health-records')"
              class="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer group/btn"
              [class]="activeTab() === 'my-health-records' 
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'"
            >
              <div class="w-5 h-5 flex items-center justify-center shrink-0">
                <app-icon 
                  name="file-text" 
                  [wrapperClass]="activeTab() === 'my-health-records' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-500 group-hover/btn:text-teal-600 transition-colors'" 
                />
              </div>
              <span class="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
                Diagnostic Reports
              </span>
            </button>

          </nav>

          <!-- Sidebar Footer: Patient Card Summary -->
          <div class="border-t border-slate-200/80 pt-3 flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
              <app-icon name="heart-cross" wrapperClass="w-5 h-5 text-teal-600" />
            </div>
            <div class="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 flex flex-col min-w-0">
              <span class="text-xs font-bold text-slate-900 truncate">HMS Healthcare</span>
              <span class="text-xs text-slate-500 truncate">Patient Health ID</span>
            </div>
          </div>

        </aside>

        <!-- ============================================================= -->
        <!-- SECTION 2 (RIGHT): MAIN TAB CONTENT DISPLAY SECTION (SCROLLABLE) -->
        <!-- ============================================================= -->
        <div class="flex-1 flex flex-col h-full overflow-hidden">
          
          <main class="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 space-y-8">
            
            <!-- =========================================================== -->
            <!-- 1. MY DASHBOARD -->
            <!-- =========================================================== -->
            @if (activeTab() === 'my-dashboard') {
              <div class="space-y-8 animate-fade-in">
                
                <!-- Welcome Patient Banner -->
                <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl space-y-4">
                  <div class="absolute -right-20 -top-20 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div class="relative z-10 space-y-2 max-w-2xl">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold border border-teal-400/30">
                      <app-icon name="shield-check" wrapperClass="w-3.5 h-3.5 text-teal-300" />
                      <span>Verified Patient Account • {{ patient()?.id }}</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                      Welcome back, {{ patient()?.name || 'Patient' }}!
                    </h1>
                    <p class="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-normal">
                      Access your scheduled appointments, diagnostic reports, and medical records in real time.
                    </p>
                  </div>

                  <div class="relative z-10 pt-2 flex flex-wrap items-center gap-3">
                    <!-- New Appointment Button -->
                    <button 
                      type="button" 
                      (click)="openNewAppointmentModal()"
                      class="btn-healthcare-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-lg shadow-teal-950/40 cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform"
                    >
                      <app-icon name="calendar" wrapperClass="w-4 h-4 text-teal-100" />
                      <span>New Appointment</span>
                    </button>

                    <button 
                      type="button" 
                      (click)="selectTab('my-health-records')"
                      class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 text-teal-100 text-xs font-semibold cursor-pointer transition"
                    >
                      <app-icon name="file-text" wrapperClass="w-4 h-4 text-teal-200" />
                      <span>View Health Records</span>
                    </button>
                  </div>
                </div>

                <!-- LIVE APPOINTMENT STATUS PANEL (SHOWN ONLY IF HAVING APPOINTMENT) -->
                @if (appointments().length > 0 && appointments()[0]; as activeApt) {
                  <div class="p-5 sm:p-6 pb-3 sm:pb-3.5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 animate-fade-in relative overflow-hidden">
                    
                    <!-- Panel Top Bar -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div class="flex items-center gap-3.5">
                        <div class="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shrink-0">
                          <app-icon name="calendar" wrapperClass="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <span class="text-xs font-bold uppercase tracking-wider text-slate-700 block">Live Appointment Status</span>
                          <h3 class="text-base sm:text-lg font-bold text-slate-900 leading-tight mt-0.5">
                            Consultation with {{ activeApt.doctorName }}
                          </h3>
                        </div>
                      </div>

                      <!-- Status Badge (in place of All Appointments) -->
                      <div class="self-start sm:self-auto">
                        <span 
                          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-2xs"
                          [class]="getStatusBadgeClass(activeApt.status)"
                        >
                          <span class="w-2 h-2 rounded-full" [class]="getStatusDotClass(activeApt.status)"></span>
                          <span>{{ activeApt.status }}</span>
                        </span>
                      </div>
                    </div>

                    <!-- 2 Meta Metric Chips: Schedule Time & Appointment ID -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Schedule Time</span>
                        <p class="text-xs font-bold text-slate-900">{{ activeApt.date }}</p>
                        <p class="text-xs text-teal-700 font-semibold">{{ activeApt.time }}</p>
                      </div>

                      <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Appointment ID</span>
                        <p class="text-xs font-mono font-bold text-slate-900">{{ activeApt.id }}</p>
                        <p class="text-xs font-semibold" [class]="activeApt.status === 'Confirmed' ? 'text-emerald-700' : activeApt.status === 'Pending' ? 'text-amber-700' : 'text-rose-700'">
                          {{ activeApt.status }} Status
                        </p>
                      </div>
                    </div>

                    <!-- Reason Description -->
                    <div class="flex items-center gap-2 text-xs text-slate-700 pt-0.5">
                      <span class="font-bold text-slate-700">Reason:</span>
                      <span class="font-medium text-slate-800">{{ activeApt.cause }}</span>
                    </div>

                    <!-- Action Buttons Below Reason -->
                    <div class="pt-2.5 border-t border-slate-100 flex items-center justify-end">
                    @if (activeApt.status !== 'Cancelled') {
                      <button 
                        type="button" 
                        (click)="cancelAppointment(activeApt.id)"
                        class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 text-xs font-bold transition-all cursor-pointer shadow-2xs group active:scale-95"
                      >
                        <app-icon name="x" wrapperClass="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                        <span>Cancel Appointment</span>
                      </button>
                    } @else {
                      <button 
                        type="button" 
                        (click)="openNewAppointmentModal()"
                        class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-xs active:scale-95"
                      >
                        <app-icon name="calendar" wrapperClass="w-3.5 h-3.5 text-white" />
                        <span>Rebook Consultation</span>
                      </button>
                    }
                  </div>

                </div>
              }

              <!-- DASHBOARD TAB SECTION (3 OPTIONS: PERSONAL DETAILS, MEDICATIONS & PRESCRIPTIONS, CLINICAL PROFILE & EMERGENCY DATA) -->
              <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                
                <!-- Underline-Style Tab Bar (Matching Reference Design) -->
                <div class="border-b border-slate-200">
                  <nav class="flex -mb-px overflow-x-auto" aria-label="Dashboard Sub-Tabs">
                    
                    <!-- Tab 1: Profile -->
                    <button 
                      type="button" 
                      (click)="dashboardSubTab.set('personal')"
                      class="flex-1 py-3.5 px-4 text-center border-b-2 text-xs sm:text-sm transition-all duration-200 cursor-pointer whitespace-nowrap"
                      [class]="dashboardSubTab() === 'personal' 
                        ? 'border-teal-600 text-teal-800 font-bold' 
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 font-semibold'"
                    >
                      <span>Profile</span>
                    </button>

                    <!-- Tab 2: Current Medications -->
                    <button 
                      type="button" 
                      (click)="dashboardSubTab.set('medications')"
                      class="flex-1 py-3.5 px-4 text-center border-b-2 text-xs sm:text-sm transition-all duration-200 cursor-pointer whitespace-nowrap"
                      [class]="dashboardSubTab() === 'medications' 
                        ? 'border-teal-600 text-teal-800 font-bold' 
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 font-semibold'"
                    >
                      <span>Current Medications</span>
                    </button>

                    <!-- Tab 3: Clinical Profile -->
                    <button 
                      type="button" 
                      (click)="dashboardSubTab.set('clinical')"
                      class="flex-1 py-3.5 px-4 text-center border-b-2 text-xs sm:text-sm transition-all duration-200 cursor-pointer whitespace-nowrap"
                      [class]="dashboardSubTab() === 'clinical' 
                        ? 'border-teal-600 text-teal-800 font-bold' 
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 font-semibold'"
                    >
                      <span>Clinical Profile</span>
                    </button>

                  </nav>
                </div>

                <!-- SUB-TAB 1: PERSONAL DETAILS -->
                @if (dashboardSubTab() === 'personal') {
                  <div class="space-y-6 animate-fade-in">
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                      
                      <!-- Full Name -->
                      <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Full Name</span>
                        <span class="text-base font-bold text-slate-900 block">{{ patient()?.name || 'Eleanor Vance' }}</span>
                      </div>

                      <!-- Contact Email -->
                      <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Email Address</span>
                        <span class="text-base font-bold text-slate-900 block break-words">{{ patient()?.email || 'eleanor.vance@example.com' }}</span>
                      </div>

                      <!-- Phone Number -->
                      <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Phone Number</span>
                        <span class="text-base font-bold text-slate-900 block">{{ patient()?.phone || '+91 98765 43210' }}</span>
                      </div>

                      <!-- Patient ID / MRN -->
                      <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Patient ID / MRN</span>
                        <span class="text-base font-mono font-bold text-teal-700 block">{{ patient()?.id || 'PT-94821' }}</span>
                      </div>

                      <!-- Age & Gender -->
                      <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Age & Gender</span>
                        <span class="text-base font-bold text-slate-900 block">{{ patient()?.age || 34 }} yrs • {{ patient()?.gender || 'Female' }}</span>
                      </div>

                      <!-- Member Since -->
                      <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Member Since</span>
                        <span class="text-base font-bold text-slate-900 block">{{ patient()?.memberSince || 'March 2024' }}</span>
                      </div>

                      <!-- Insurance Provider -->
                      <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Insurance Provider</span>
                        <span class="text-base font-bold text-slate-900 block">{{ patient()?.insuranceProvider || 'Star Health & Allied Insurance' }}</span>
                      </div>

                      <!-- Policy Number -->
                      <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Policy Number</span>
                        <span class="text-base font-mono font-bold text-slate-900 block">{{ patient()?.insurancePolicyNumber || 'STAR-882910-PX' }}</span>
                      </div>

                    </div>
                  </div>
                }

                <!-- SUB-TAB 2: CURRENT MEDICATIONS & PRESCRIPTIONS -->
                @if (dashboardSubTab() === 'medications') {
                  <div class="space-y-4 animate-fade-in">
                    <div class="flex items-center justify-between">
                      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
                        <app-icon name="pill" wrapperClass="w-4 h-4 text-teal-600" />
                        <span>{{ prescriptions().length }} Active Prescriptions</span>
                      </div>
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
                            @for (med of paginatedPrescriptions(); track med.name) {
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
                                  {{ med.startDate || '10 Aug 2026' }}
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>

                      <!-- Table Paginator: Current Medications (10 Rows Default) -->
                      <div class="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 select-none text-xs text-slate-600">
                        <div>
                          @if (prescriptions().length > 0) {
                            Showing <strong class="text-slate-900 font-semibold">{{ (dashboardMedicationPage() - 1) * dashboardMedicationPageSize() + 1 }}</strong> to <strong class="text-slate-900 font-semibold">{{ Math.min(dashboardMedicationPage() * dashboardMedicationPageSize(), prescriptions().length) }}</strong> of <strong class="text-slate-900 font-semibold">{{ prescriptions().length }}</strong> prescriptions
                          } @else {
                            <span>0 prescriptions</span>
                          }
                        </div>

                        <div class="flex items-center gap-2">
                          <div class="flex items-center gap-1">
                            <button 
                              type="button" 
                              (click)="firstDashboardMedicationPage()"
                              [disabled]="dashboardMedicationPage() === 1"
                              class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                              title="First Page"
                            >
                              &laquo;
                            </button>
                            <button 
                              type="button" 
                              (click)="prevDashboardMedicationPage()"
                              [disabled]="dashboardMedicationPage() === 1"
                              class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                              title="Previous Page"
                            >
                              &lsaquo;
                            </button>
                            @for (p of getDashboardMedicationPagesArray(); track p) {
                              <button 
                                type="button" 
                                (click)="setDashboardMedicationPage(p)"
                                class="w-7 h-7 rounded-full text-xs transition cursor-pointer flex items-center justify-center font-bold"
                                [class]="dashboardMedicationPage() === p 
                                  ? 'bg-teal-50 text-teal-700 border border-teal-300 shadow-2xs font-extrabold ring-2 ring-teal-500/10' 
                                  : 'text-slate-600 hover:bg-slate-100'"
                              >
                                {{ p }}
                              </button>
                            }
                            <button 
                              type="button" 
                              (click)="nextDashboardMedicationPage()"
                              [disabled]="dashboardMedicationPage() === totalDashboardMedicationPages()"
                              class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                              title="Next Page"
                            >
                              &rsaquo;
                            </button>
                            <button 
                              type="button" 
                              (click)="lastDashboardMedicationPage()"
                              [disabled]="dashboardMedicationPage() === totalDashboardMedicationPages()"
                              class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                              title="Last Page"
                            >
                              &raquo;
                            </button>
                          </div>

                          <div class="relative flex items-center pl-1 border-l border-slate-200">
                            <select 
                              [ngModel]="dashboardMedicationPageSize()" 
                              (ngModelChange)="onDashboardMedicationPageSizeChange($event)"
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

                <!-- SUB-TAB 3: CLINICAL PROFILE & EMERGENCY DATA -->
                @if (dashboardSubTab() === 'clinical') {
                  <div class="space-y-6 animate-fade-in">
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      
                      <!-- Blood Group -->
                      <div class="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Blood Group</span>
                        <span class="text-lg font-bold text-rose-600 block">{{ patient()?.bloodGroup || 'O+ Positive' }}</span>
                      </div>

                      <!-- Primary Emergency Contact -->
                      <div class="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Primary Emergency Contact</span>
                        <span class="text-base font-bold text-slate-900 block">{{ patient()?.emergencyContact || '+91 98450 12345 (Spouse)' }}</span>
                      </div>

                      <!-- Known Allergies -->
                      <div class="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Known Allergies</span>
                        <span class="text-base font-bold text-amber-700 block">Penicillin, Peanuts (Mild)</span>
                      </div>

                      <!-- Chronic Conditions -->
                      <div class="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Chronic Conditions</span>
                        <span class="text-base font-bold text-slate-800 block">Hypertension (Stage 1)</span>
                      </div>

                      <!-- Blood Pressure -->
                      <div class="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Blood Pressure (Latest)</span>
                        <span class="text-base font-bold text-slate-900 block">120/80 mmHg</span>
                      </div>

                      <!-- Heart Rate -->
                      <div class="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Resting Heart Rate</span>
                        <span class="text-base font-bold text-slate-900 block">72 bpm (Normal Sinus)</span>
                      </div>

                      <!-- Blood Glucose -->
                      <div class="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Blood Glucose</span>
                        <span class="text-base font-bold text-emerald-700 block">98 mg/dL (Fasting)</span>
                      </div>

                      <!-- SpO2 Oxygen Saturation -->
                      <div class="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">SpO2 Oxygen Saturation</span>
                        <span class="text-base font-bold text-teal-700 block">99% (Ambient Air)</span>
                      </div>

                      <!-- Body Temperature -->
                      <div class="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-teal-300 transition-colors space-y-2">
                        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Body Temperature</span>
                        <span class="text-base font-bold text-slate-900 block">98.6 °F (Oral)</span>
                      </div>

                    </div>
                  </div>
                }

              </div>

            </div>
          }

          <!-- =========================================================== -->
          <!-- 2. MY APPOINTMENTS -->
          <!-- =========================================================== -->
          @if (activeTab() === 'my-appointments') {
            <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs animate-fade-in space-y-6">
              
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 class="text-2xl font-bold text-slate-900 tracking-tight">My Appointments</h2>
                  <p class="text-xs sm:text-sm text-slate-700 mt-0.5">
                    Review doctor consultation details, view prescriptions, and download official payment receipts.
                  </p>
                </div>

                <button 
                  type="button" 
                  (click)="openNewAppointmentModal()" 
                  class="btn-healthcare-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer hover:scale-[1.02] active:scale-95 transition-transform shrink-0"
                >
                  <app-icon name="calendar" wrapperClass="w-4 h-4 text-teal-100" />
                  <span>Book New Appointment</span>
                </button>
              </div>

              <!-- 2.1 Appointments Table with Pagination (10 Rows per Page) -->
              <div class="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xs">
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                        <th class="py-3.5 px-5">Doctor Name</th>
                        <th class="py-3.5 px-5">Date & Time</th>
                        <th class="py-3.5 px-5">Cause of Visit</th>
                        <th class="py-3.5 px-5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-800">
                      @for (apt of pagedAppointments(); track apt.id) {
                        <tr class="hover:bg-teal-50/30 transition-colors">
                          
                          <!-- 1. Doctor Name Column: Doctor Name, Specialist In, and Study -->
                          <td class="py-4 px-5 align-top">
                            <div class="flex items-start gap-3">
                              <app-avatar [src]="apt.avatar" [name]="apt.doctorName" sizeClass="w-10 h-10 rounded-xl shrink-0 mt-0.5" />
                              <div class="min-w-0">
                                <h4 class="font-bold text-slate-900 text-sm sm:text-base leading-tight">{{ apt.doctorName }}</h4>
                                <p class="text-xs text-teal-700 font-semibold mt-0.5">Specialist in {{ apt.specialty }}</p>
                                <p class="text-xs text-slate-500 font-normal leading-tight mt-0.5">{{ apt.doctorDegree }}</p>
                              </div>
                            </div>
                          </td>

                          <!-- 2. Date & Time Column: Date and Time -->
                          <td class="py-4 px-5 align-top whitespace-nowrap">
                            <div class="font-bold text-slate-900 text-sm">{{ apt.date }}</div>
                            <div class="text-xs text-teal-700 font-semibold mt-0.5 flex items-center gap-1">
                              <app-icon name="clock" wrapperClass="w-3.5 h-3.5 text-teal-600 inline" />
                              <span>{{ apt.time }}</span>
                            </div>
                          </td>

                          <!-- 3. Cause of Visit Column -->
                          <td class="py-4 px-5 align-top">
                            <p class="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">{{ apt.cause }}</p>
                            <div class="mt-1.5 flex items-center gap-2">
                              @if (apt.status === 'Pending') {
                                <span 
                                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border bg-amber-50 text-amber-800 border-amber-300 shadow-2xs"
                                >
                                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                  <span>Pending</span>
                                </span>
                              }
                              <span class="text-[11px] text-slate-400 font-mono">{{ apt.room }}</span>
                            </div>
                          </td>

                          <!-- 4. Actions Column: Icon buttons with tooltips (Both in Emerald Green) -->
                          <td class="py-4 px-5 align-top text-center">
                            <div class="flex items-center justify-center gap-2">
                              
                              <!-- Prescription Action Button with Tooltip -->
                              @if (apt.prescription) {
                                <div class="relative group/tooltip">
                                  <button 
                                    type="button" 
                                    (click)="openPrescriptionModal(apt)"
                                    class="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 flex items-center justify-center transition-all shadow-2xs hover:shadow-md cursor-pointer active:scale-95 group/iconbtn"
                                    aria-label="View Prescription"
                                  >
                                    <app-icon name="file-text" wrapperClass="w-4 h-4 text-emerald-700 group-hover/iconbtn:text-white transition-colors" />
                                  </button>
                                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-30">
                                    <div class="px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 rounded-lg shadow-lg whitespace-nowrap">
                                      Prescription (Rx)
                                    </div>
                                    <div class="w-2 h-1 bg-slate-900 [clip-path:polygon(50%_100%,0_0,100%_0)]"></div>
                                  </div>
                                </div>
                              }

                              <!-- View/Download Receipt PDF Action Button with Tooltip -->
                              @if (apt.receipt) {
                                <div class="relative group/tooltip">
                                  <button 
                                    type="button" 
                                    (click)="downloadReceiptPdf(apt)"
                                    class="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 flex items-center justify-center transition-all shadow-2xs hover:shadow-md cursor-pointer active:scale-95 group/iconbtn"
                                    aria-label="Download Receipt PDF"
                                  >
                                    <app-icon name="receipt" wrapperClass="w-4 h-4 text-emerald-700 group-hover/iconbtn:text-white transition-colors" />
                                  </button>
                                  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-30">
                                    <div class="px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 rounded-lg shadow-lg whitespace-nowrap">
                                      View & Download Receipt PDF
                                    </div>
                                    <div class="w-2 h-1 bg-slate-900 [clip-path:polygon(50%_100%,0_0,100%_0)]"></div>
                                  </div>
                                </div>
                              }

                            </div>
                          </td>

                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- Table Paginator: My Appointments (10 Rows Default) -->
                <div class="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 select-none">
                  <div>
                    Showing <strong class="text-slate-900 font-semibold">{{ (appointmentPage() - 1) * appointmentPageSize() + 1 }}</strong> to <strong class="text-slate-900 font-semibold">{{ Math.min(appointmentPage() * appointmentPageSize(), sortedAppointments().length) }}</strong> of <strong class="text-slate-900 font-semibold">{{ sortedAppointments().length }}</strong> appointments
                  </div>

                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1">
                      <button 
                        type="button" 
                        (click)="firstAppointmentPage()"
                        [disabled]="appointmentPage() === 1"
                        class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                        title="First Page"
                      >
                        &laquo;
                      </button>
                      <button 
                        type="button" 
                        (click)="prevAppointmentPage()"
                        [disabled]="appointmentPage() === 1"
                        class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                        title="Previous Page"
                      >
                        &lsaquo;
                      </button>

                      @for (p of getPagesArray(); track p) {
                        <button 
                          type="button" 
                          (click)="setAppointmentPage(p)"
                          class="w-7 h-7 rounded-full text-xs transition cursor-pointer flex items-center justify-center font-bold"
                          [class]="appointmentPage() === p 
                            ? 'bg-teal-50 text-teal-700 border border-teal-300 shadow-2xs font-extrabold ring-2 ring-teal-500/10' 
                            : 'text-slate-600 hover:bg-slate-100'"
                        >
                          {{ p }}
                        </button>
                      }

                      <button 
                        type="button" 
                        (click)="nextAppointmentPage()"
                        [disabled]="appointmentPage() === totalAppointmentPages()"
                        class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                        title="Next Page"
                      >
                        &rsaquo;
                      </button>
                      <button 
                        type="button" 
                        (click)="lastAppointmentPage()"
                        [disabled]="appointmentPage() === totalAppointmentPages()"
                        class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                        title="Last Page"
                      >
                        &raquo;
                      </button>
                    </div>

                    <div class="relative flex items-center pl-1 border-l border-slate-200">
                      <select 
                        [ngModel]="appointmentPageSize()" 
                        (ngModelChange)="onAppointmentPageSizeChange($event)"
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

        <!-- ============================================================= -->
        <!-- VIEW 3: MY HEALTH RECORDS (DIAGNOSTIC RECORDS & TEST REPORTS TABLE) -->
        <!-- ============================================================= -->
        @if (activeTab() === 'my-health-records') {
          <div class="space-y-6 animate-fade-in">
            
            <!-- 3.1 Diagnostic Lab Reports & Diagnostic Records -->
            <div class="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              
              <div>
                <h3 class="text-2xl font-bold text-slate-900 tracking-tight">Diagnostic Records & Test Reports</h3>
                <p class="text-xs sm:text-sm text-slate-700 mt-0.5">
                  Complete telemetry records of hospital and external laboratory diagnostics.
                </p>
              </div>

              <!-- Lab Reports Data Table -->
              <div class="overflow-hidden border border-slate-200 rounded-2xl">
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                        <th class="p-4">Date & Time</th>
                        <th class="p-4">Diagnostic Examination</th>
                        <th class="p-4">Physician</th>
                        <th class="p-4">Location</th>
                        <th class="p-4">Status</th>
                        <th class="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-800">
                      @for (report of pagedLabReports(); track report.id) {
                        <tr class="hover:bg-teal-50/30 transition-colors">
                          <td class="p-4 whitespace-nowrap font-medium text-slate-900">
                            <div>{{ report.date }}</div>
                            <div class="text-xs text-slate-600">{{ report.time }}</div>
                          </td>
                          <td class="p-4 font-semibold text-slate-900">
                            <div>{{ report.testName }}</div>
                            <div class="text-xs text-teal-700 font-bold mt-0.5">{{ report.category }}</div>
                          </td>
                          <td class="p-4 text-slate-700 font-medium">
                            {{ report.doctor }}
                          </td>
                          <td class="p-4 whitespace-nowrap">
                            <span 
                              class="px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide inline-flex items-center gap-1.5"
                              [class]="report.locationType === 'Hospital' ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-blue-50 text-blue-800 border border-blue-200'"
                            >
                              <span class="w-1.5 h-1.5 rounded-full" [class]="report.locationType === 'Hospital' ? 'bg-teal-600' : 'bg-blue-600'"></span>
                              <span>{{ report.locationType === 'Hospital' ? 'Hospital (In-House)' : 'External Lab (Out)' }}</span>
                            </span>
                          </td>
                          <td class="p-4 whitespace-nowrap">
                            <span 
                              class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                              [class]="report.status === 'Normal' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                            >
                              {{ report.status }}
                            </span>
                          </td>
                          
                          <!-- Actions: View Report, View Status -->
                          <td class="p-4 text-center whitespace-nowrap">
                            <div class="inline-flex items-center justify-center gap-1.5">
                              
                              <!-- View Full Telemetry Report Button -->
                              <div class="relative group/tooltip inline-block">
                                <button 
                                  type="button" 
                                  (click)="openLabReportModal(report)"
                                  class="w-8 h-8 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 hover:border-teal-600 transition cursor-pointer shadow-2xs hover:shadow-xs flex items-center justify-center group/iconbtn"
                                  aria-label="View Diagnostic Telemetry Report"
                                >
                                  <app-icon name="file-text" wrapperClass="w-4 h-4 text-teal-700 group-hover/iconbtn:text-white transition-colors" />
                                </button>
                                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-30">
                                  <div class="px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 rounded-lg shadow-lg whitespace-nowrap">
                                    View Report
                                  </div>
                                  <div class="w-2 h-1 bg-slate-900 [clip-path:polygon(50%_100%,0_0,100%_0)]"></div>
                                </div>
                              </div>

                              <!-- View Status Stepper Modal Button -->
                              <div class="relative group/tooltip inline-block">
                                <button 
                                  type="button" 
                                  (click)="openStatusModal(report)"
                                  class="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 transition cursor-pointer shadow-2xs hover:shadow-xs flex items-center justify-center group/iconbtn"
                                  aria-label="View Processing Status"
                                >
                                  <app-icon name="activity" wrapperClass="w-4 h-4 text-emerald-700 group-hover/iconbtn:text-white transition-colors" />
                                </button>
                                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:flex flex-col items-center pointer-events-none z-30">
                                  <div class="px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 rounded-lg shadow-lg whitespace-nowrap">
                                    View Status
                                  </div>
                                  <div class="w-2 h-1 bg-slate-900 [clip-path:polygon(50%_100%,0_0,100%_0)]"></div>
                                </div>
                              </div>

                            </div>
                          </td>

                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- Table Paginator: Diagnostic Records (10 Rows Default) -->
                <div class="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 select-none">
                  <div>
                    Showing <strong class="text-slate-900 font-semibold">{{ (labReportPage() - 1) * labReportPageSize() + 1 }}</strong> to <strong class="text-slate-900 font-semibold">{{ Math.min(labReportPage() * labReportPageSize(), sortedLabReports().length) }}</strong> of <strong class="text-slate-900 font-semibold">{{ sortedLabReports().length }}</strong> diagnostic records
                  </div>

                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-1">
                      <button 
                        type="button" 
                        (click)="firstLabReportPage()"
                        [disabled]="labReportPage() === 1"
                        class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                        title="First Page"
                      >
                        &laquo;
                      </button>
                      <button 
                        type="button" 
                        (click)="prevLabReportPage()"
                        [disabled]="labReportPage() === 1"
                        class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                        title="Previous Page"
                      >
                        &lsaquo;
                      </button>

                      @for (p of getLabReportPagesArray(); track p) {
                        <button 
                          type="button" 
                          (click)="setLabReportPage(p)"
                          class="w-7 h-7 rounded-full text-xs transition cursor-pointer flex items-center justify-center font-bold"
                          [class]="labReportPage() === p 
                            ? 'bg-teal-50 text-teal-700 border border-teal-300 shadow-2xs font-extrabold ring-2 ring-teal-500/10' 
                            : 'text-slate-600 hover:bg-slate-100'"
                        >
                          {{ p }}
                        </button>
                      }

                      <button 
                        type="button" 
                        (click)="nextLabReportPage()"
                        [disabled]="labReportPage() === totalLabReportPages()"
                        class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                        title="Next Page"
                      >
                        &rsaquo;
                      </button>
                      <button 
                        type="button" 
                        (click)="lastLabReportPage()"
                        [disabled]="labReportPage() === totalLabReportPages()"
                        class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                        title="Last Page"
                      >
                        &raquo;
                      </button>
                    </div>

                    <div class="relative flex items-center pl-1 border-l border-slate-200">
                      <select 
                        [ngModel]="labReportPageSize()" 
                        (ngModelChange)="onLabReportPageSizeChange($event)"
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

          </div>
        }

          </main>

          <!-- Footer Security Notice (Light) -->
          <footer class="w-full px-4 py-4 text-center text-xs text-slate-600 border-t border-slate-200 bg-white mt-auto shrink-0">
            <span>HMS Healthcare Digital Portal • Protected by 256-bit HIPAA Electronic Health Records Encryption.</span>
          </footer>

        </div>

      </div>

      <!-- ================================================================= -->
      <!-- 2.1.1 FULL PRESCRIPTION DIALOG MODAL -->
      <!-- ================================================================= -->
      @if (selectedPrescriptionApt(); as apt) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in" (click)="closeModals()">
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
                (click)="closeModals()"
                class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition"
                aria-label="Close"
              >
                <app-icon name="x" wrapperClass="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Body (Scrollable) -->
            @if (apt.prescription; as rx) {
              <div class="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
                
                <!-- Meta Header Box: Patient & Doctor details -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <span class="text-xs uppercase font-medium text-slate-500 block">Patient Name</span>
                    <span class="font-bold text-slate-900">{{ patient()?.name }}</span>
                  </div>
                  <div>
                    <span class="text-xs uppercase font-medium text-slate-500 block">Patient ID</span>
                    <span class="font-bold text-teal-700 font-mono">{{ patient()?.id }}</span>
                  </div>
                  <div>
                    <span class="text-xs uppercase font-medium text-slate-500 block">Rx Number</span>
                    <span class="font-bold text-slate-800 font-mono">{{ rx.rxNumber }}</span>
                  </div>
                  <div>
                    <span class="text-xs uppercase font-medium text-slate-500 block">Date of Issue</span>
                    <span class="font-bold text-slate-800">{{ rx.date }}</span>
                  </div>
                </div>

                <!-- Doctor & Diagnosis Info -->
                <div class="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <app-avatar [src]="apt.avatar" [name]="apt.doctorName" sizeClass="w-11 h-11 rounded-xl" />
                    <div>
                      <span class="text-xs uppercase font-semibold text-teal-800 block">Prescribing Specialist</span>
                      <span class="font-bold text-slate-900 text-sm sm:text-base">{{ apt.doctorName }}</span>
                      <span class="text-xs text-slate-700 block">{{ apt.specialty }} • Reg: {{ rx.doctorReg }}</span>
                    </div>
                  </div>

                  <div class="sm:text-right">
                    <span class="text-xs uppercase font-semibold text-teal-800 block">Primary Diagnosis</span>
                    <span class="font-bold text-teal-900 text-xs sm:text-sm">{{ rx.diagnosis }}</span>
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
                        @for (med of rx.medicines; track med.name) {
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
                    @for (adv of rx.advice; track adv) {
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
                    <span class="text-xs font-bold text-teal-800">{{ rx.nextFollowUp }}</span>
                  </div>

                  <div class="flex items-center gap-3 sm:text-right">
                    <div class="w-10 h-10 rounded-full bg-teal-100 border border-teal-300 text-teal-800 flex items-center justify-center font-bold text-xs">
                      ✓ RX
                    </div>
                    <div>
                      <span class="text-xs font-bold text-slate-800 block">Digitally Signed & Validated</span>
                      <span class="text-xs text-slate-500">HMS Medical Record Registry</span>
                    </div>
                  </div>
                </div>

              </div>
            }

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
                  (click)="downloadPrescriptionPdf(apt)"
                  class="btn-healthcare-primary inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <app-icon name="download" wrapperClass="w-4 h-4" />
                  <span>Download PDF</span>
                </button>

                <button 
                  type="button" 
                  (click)="closeModals()"
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
      <!-- 2.1.2 FULL RECEIPT / INVOICE DIALOG MODAL -->
      <!-- ================================================================= -->
      @if (selectedReceiptApt(); as apt) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in" (click)="closeModals()">
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
                (click)="closeModals()"
                class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition"
                aria-label="Close"
              >
                <app-icon name="x" wrapperClass="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Body (Scrollable) -->
            @if (apt.receipt; as rct) {
              <div class="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
                
                <!-- Invoice Status Banner -->
                <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <span class="text-xs font-bold text-emerald-900 block">Payment Completed Successfully</span>
                      <span class="text-xs text-emerald-700">Ref ID: {{ rct.transactionId }}</span>
                    </div>
                  </div>

                  <span class="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold tracking-wider">
                    {{ rct.paymentStatus }}
                  </span>
                </div>

                <!-- Bill To & Hospital Meta Info -->
                <div class="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <span class="text-xs uppercase font-medium text-slate-500 block mb-1">Billed Patient</span>
                    <span class="font-bold text-slate-900 block text-sm">{{ patient()?.name }}</span>
                    <span class="text-xs text-slate-700 block">Patient ID: {{ patient()?.id }}</span>
                    <span class="text-xs text-slate-700 block">Phone: {{ patient()?.phone }}</span>
                  </div>

                  <div class="text-right">
                    <span class="text-xs uppercase font-medium text-slate-500 block mb-1">Invoice Details</span>
                    <span class="font-bold text-slate-900 block font-mono text-sm">{{ rct.receiptNumber }}</span>
                    <span class="text-xs text-slate-700 block">{{ rct.invoiceDate }}</span>
                    <span class="text-xs text-teal-700 font-bold block">{{ apt.doctorName }} ({{ apt.specialty }})</span>
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
                        @for (item of rct.items; track item.description) {
                          <tr class="hover:bg-slate-50">
                            <td class="p-3 font-bold text-slate-900">{{ item.description }}</td>
                            <td class="p-3 font-mono text-slate-600">{{ item.code }}</td>
                            <td class="p-3 text-center">{{ item.quantity }}</td>
                            <td class="p-3 text-right font-bold text-slate-900">₹{{ item.price.toFixed(2) }}</td>
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
                    <span class="font-semibold text-slate-900">₹{{ rct.subtotal.toFixed(2) }}</span>
                  </div>

                  <div class="flex justify-between text-xs text-emerald-700 font-semibold">
                    <span>Insurance Coverage ({{ rct.insuranceCoveragePercent }}% Covered - {{ patient()?.insuranceProvider }}):</span>
                    <span>-₹{{ rct.insuranceCoveredAmount.toFixed(2) }}</span>
                  </div>

                  <div class="flex justify-between text-xs text-slate-700">
                    <span>Taxes & Hospital Surcharges (0%):</span>
                    <span>₹{{ rct.tax.toFixed(2) }}</span>
                  </div>

                  <div class="border-t border-slate-200 pt-2 flex justify-between text-sm sm:text-base font-bold text-slate-900">
                    <span>Total Amount Paid by Patient:</span>
                    <span class="text-teal-700 font-mono">₹{{ rct.totalPaid.toFixed(2) }}</span>
                  </div>
                </div>

                <!-- Payment Method Info -->
                <div class="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span>Payment Method: <strong class="text-slate-800">{{ rct.paymentMethod }}</strong></span>
                  <span>Authorized Hospital Cashier Stamp Verified</span>
                </div>

              </div>
            }

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
                  (click)="downloadReceiptPdf(apt)"
                  class="btn-healthcare-primary inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <app-icon name="download" wrapperClass="w-4 h-4" />
                  <span>Download PDF</span>
                </button>

                <button 
                  type="button" 
                  (click)="closeModals()"
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
      <!-- 3.1 FULL DIAGNOSTIC LAB REPORT MODAL (VIEW REPORT) -->
      <!-- ================================================================= -->
      @if (selectedLabReport(); as report) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in" (click)="closeModals()">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up" (click)="$event.stopPropagation()">
            
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <app-icon name="activity" wrapperClass="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-lg sm:text-xl font-bold tracking-tight text-white">{{ report.testName }}</h3>
                  <p class="text-xs text-emerald-100">HMS Certified Clinical Laboratory Telemetry</p>
                </div>
              </div>

              <button 
                type="button" 
                (click)="closeModals()"
                class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition"
                aria-label="Close"
              >
                <app-icon name="x" wrapperClass="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
              
              <!-- Report Meta Box -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span class="text-xs uppercase font-medium text-slate-500 block">Report ID</span>
                  <span class="font-bold text-teal-700 font-mono">{{ report.id }}</span>
                </div>
                <div>
                  <span class="text-xs uppercase font-medium text-slate-500 block">Sample Date & Time</span>
                  <span class="font-bold text-slate-900">{{ report.date }} • {{ report.time }}</span>
                </div>
                <div>
                  <span class="text-xs uppercase font-medium text-slate-500 block">Diagnostic Facility</span>
                  <span class="font-bold text-slate-800">{{ report.locationType === 'Hospital' ? 'Hospital (In-House)' : 'Out (External)' }}</span>
                </div>
                <div>
                  <span class="text-xs uppercase font-medium text-slate-500 block">Lab Status</span>
                  <span class="font-bold text-emerald-700">{{ report.status }}</span>
                </div>
              </div>

              <!-- Lab Parameters Table -->
              <div>
                <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Test Telemetry Metrics & Reference Ranges</h4>

                <div class="overflow-x-auto rounded-xl border border-slate-200">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-slate-100 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-700">
                        <th class="p-3">Parameter Test</th>
                        <th class="p-3">Result Value</th>
                        <th class="p-3">Units</th>
                        <th class="p-3">Reference Range</th>
                        <th class="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-xs font-medium">
                      @for (p of report.parameters; track p.name) {
                        <tr class="hover:bg-slate-50">
                          <td class="p-3 font-bold text-slate-900">{{ p.name }}</td>
                          <td class="p-3 font-bold text-slate-900">{{ p.value }}</td>
                          <td class="p-3 text-slate-600 font-mono">{{ p.unit }}</td>
                          <td class="p-3 text-slate-700">{{ p.referenceRange }}</td>
                          <td class="p-3 text-center">
                            <span 
                              class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                              [class]="p.status === 'Normal' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                            >
                              {{ p.status }}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Clinical Summary Notes -->
              <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span class="text-xs uppercase font-semibold text-emerald-800 block">Pathologist Clinical Interpretation</span>
                <p class="text-xs font-medium text-emerald-950 mt-1 leading-relaxed">
                  {{ report.summaryNotes }}
                </p>
                <p class="text-xs text-emerald-800 mt-2 font-medium">
                  Lab Facility: {{ report.locationName }} • Lab Technician: {{ report.labTechnician }} • Supervised by {{ report.doctor }}
                </p>
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
                <span>Print Report</span>
              </button>

              <div class="flex items-center gap-2">
                <button 
                  type="button" 
                  (click)="downloadReport(report)"
                  class="btn-healthcare-primary inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <app-icon name="download" wrapperClass="w-4 h-4" />
                  <span>Download PDF</span>
                </button>

                <button 
                  type="button" 
                  (click)="closeModals()"
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
      <!-- 3.1 DIAGNOSTIC STATUS TIMELINE MODAL (VIEW STATUS) -->
      <!-- ================================================================= -->
      @if (selectedStatusReport(); as report) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in" (click)="closeModals()">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up" (click)="$event.stopPropagation()">
            
            <!-- Modal Header -->
            <div class="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
                  <app-icon name="activity" wrapperClass="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 class="text-lg font-bold tracking-tight text-white">Diagnostic Processing Status</h3>
                  <p class="text-xs text-slate-300">{{ report.testName }} ({{ report.id }})</p>
                </div>
              </div>

              <button 
                type="button" 
                (click)="closeModals()"
                class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition"
                aria-label="Close"
              >
                <app-icon name="x" wrapperClass="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Body: Interactive Status Timeline -->
            <div class="p-6 overflow-y-auto space-y-6 text-slate-800">
              
              <!-- Quick Meta Pill -->
              <div class="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-center justify-between">
                <div>
                  <span class="text-xs uppercase font-semibold text-teal-800 block">Facility & Collection Time</span>
                  <span class="text-xs font-bold text-slate-900">{{ report.locationName }} ({{ report.locationType }})</span>
                  <span class="text-xs text-slate-600 block">{{ report.date }} at {{ report.time }}</span>
                </div>

                <span class="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold">
                  {{ report.status }}
                </span>
              </div>

              <!-- Vertical Status Stepper -->
              <div class="space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-200">
                @for (step of report.timeline; track step.title) {
                  <div class="relative">
                    
                    <!-- Stepper Dot -->
                    <div 
                      class="absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-semibold"
                      [class]="step.completed 
                        ? 'bg-teal-600 border-teal-600 text-white shadow-xs' 
                        : step.active 
                        ? 'bg-white border-teal-600 text-teal-600 animate-pulse' 
                        : 'bg-white border-slate-300 text-slate-500'"
                    >
                      @if (step.completed) {
                        <span>✓</span>
                      } @else {
                        <span class="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                      }
                    </div>

                    <!-- Step Content -->
                    <div class="pl-2">
                      <div class="flex items-center justify-between">
                        <h4 class="font-bold text-sm text-slate-900">{{ step.title }}</h4>
                        <span class="text-xs text-slate-600 font-mono">{{ step.timestamp }}</span>
                      </div>
                      <p class="text-xs text-slate-700 mt-0.5 leading-relaxed">{{ step.description }}</p>
                    </div>

                  </div>
                }
              </div>

            </div>

            <!-- Modal Footer Actions -->
            <div class="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between gap-3">
              <button 
                type="button" 
                (click)="openLabReportModal(report)"
                class="btn-healthcare-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <app-icon name="file-text" wrapperClass="w-4 h-4" />
                <span>View Full Telemetry Report</span>
              </button>

              <button 
                type="button" 
                (click)="closeModals()"
                class="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class PatientPortalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);
  private readonly router = inject(Router);

  readonly patient = this.authService.currentPatient;
  
  // Default active tab is 'my-dashboard'
  readonly activeTab = signal<PortalTab>('my-dashboard');
  readonly dashboardSubTab = signal<DashboardSubTab>('personal');
  readonly isSidebarHovered = signal<boolean>(false);
  readonly isSidebarOpen = computed(() => this.isSidebarHovered());
  readonly isSidebarCollapsed = computed(() => !this.isSidebarHovered());
  readonly isBooking = signal<boolean>(false);
  readonly todayDate = new Date().toISOString().split('T')[0];

  selectTab(tab: PortalTab): void {
    this.activeTab.set(tab);
  }

  toggleSidebar(): void {
    this.isSidebarHovered.set(!this.isSidebarHovered());
  }

  // Modals state
  readonly selectedPrescriptionApt = signal<PatientAppointment | null>(null);
  readonly selectedReceiptApt = signal<PatientAppointment | null>(null);
  readonly selectedLabReport = signal<LabReport | null>(null);
  readonly selectedStatusReport = signal<LabReport | null>(null);

  readonly specialties = [
    { name: 'Cardiology', icon: 'heart-cross' },
    { name: 'Neurology', icon: 'activity' },
    { name: 'Pediatrics', icon: 'user' },
    { name: 'Orthopedics', icon: 'shield-check' },
    { name: 'Oncology', icon: 'sparkles' },
    { name: 'Dermatology', icon: 'check-circle' }
  ];

  readonly doctors: BookingDoctor[] = [
    {
      id: 'DOC-1',
      name: 'Dr. Sarah Jenkins, MD',
      degree: 'MD, FACC (Harvard Med)',
      specialty: 'Cardiology',
      avatar: 'assets/images/doctors/dr-sarah-jenkins.png',
      experience: '16 yrs',
      rating: 4.9
    },
    {
      id: 'DOC-2',
      name: 'Dr. Michael Chen, MD',
      degree: 'MD, PhD (Johns Hopkins)',
      specialty: 'Neurology',
      avatar: 'assets/images/doctors/dr-michael-chen.png',
      experience: '14 yrs',
      rating: 4.8
    },
    {
      id: 'DOC-3',
      name: 'Dr. Elena Rostova, MD',
      degree: 'MD, FAAP (Stanford Med)',
      specialty: 'Pediatrics',
      avatar: 'assets/images/doctors/dr-elena-rostova.png',
      experience: '12 yrs',
      rating: 4.9
    },
    {
      id: 'DOC-4',
      name: 'Dr. Marcus Brody, MD',
      degree: 'MD, FAAOS (Mayo Clinic)',
      specialty: 'Orthopedics',
      avatar: 'assets/images/doctors/dr-marcus-brody.png',
      experience: '18 yrs',
      rating: 4.9
    },
    {
      id: 'DOC-5',
      name: 'Dr. Aisha Patel, MD',
      degree: 'MD, FACP (Oxford Med)',
      specialty: 'Oncology',
      avatar: 'assets/images/doctors/dr-aisha-patel.png',
      experience: '15 yrs',
      rating: 4.8
    },
    {
      id: 'DOC-6',
      name: 'Dr. David Kim, MD',
      degree: 'MD, FAAD (UCSF Med)',
      specialty: 'Dermatology',
      avatar: 'assets/images/doctors/dr-david-kim.png',
      experience: '11 yrs',
      rating: 4.7
    }
  ];

  bookingForm = this.fb.group({
    specialty: ['Cardiology', [Validators.required]],
    doctorId: ['DOC-1', [Validators.required]],
    type: ['In-Person', [Validators.required]],
    date: [this.todayDate, [Validators.required]],
    time: ['10:30 AM - 11:15 AM', [Validators.required]],
    symptoms: ['']
  });

  readonly Math = Math;

  // Sorted appointments by date (newest/upcoming first)
  readonly sortedAppointments = computed(() => {
    return [...this.appointments()].sort((a, b) => {
      const timeA = new Date(a.date).getTime() || 0;
      const timeB = new Date(b.date).getTime() || 0;
      return timeB - timeA;
    });
  });

  // Pagination state for Dashboard Current Medications (10 rows per page)
  readonly dashboardMedicationPage = signal<number>(1);
  readonly dashboardMedicationPageSize = signal<number>(10);

  readonly totalDashboardMedicationPages = computed(() =>
    Math.ceil(this.prescriptions().length / this.dashboardMedicationPageSize()) || 1
  );

  readonly paginatedPrescriptions = computed(() => {
    const page = Math.min(this.dashboardMedicationPage(), this.totalDashboardMedicationPages());
    const start = (page - 1) * this.dashboardMedicationPageSize();
    return this.prescriptions().slice(start, start + this.dashboardMedicationPageSize());
  });

  setDashboardMedicationPage(page: number): void {
    if (page >= 1 && page <= this.totalDashboardMedicationPages()) {
      this.dashboardMedicationPage.set(page);
    }
  }

  prevDashboardMedicationPage(): void {
    this.dashboardMedicationPage.update(p => Math.max(1, p - 1));
  }

  nextDashboardMedicationPage(): void {
    this.dashboardMedicationPage.update(p => Math.min(this.totalDashboardMedicationPages(), p + 1));
  }

  firstDashboardMedicationPage(): void {
    this.dashboardMedicationPage.set(1);
  }

  lastDashboardMedicationPage(): void {
    this.dashboardMedicationPage.set(this.totalDashboardMedicationPages());
  }

  onDashboardMedicationPageSizeChange(size: number | string): void {
    this.dashboardMedicationPageSize.set(Number(size) || 10);
    this.dashboardMedicationPage.set(1);
  }

  getDashboardMedicationPagesArray(): number[] {
    const total = this.totalDashboardMedicationPages();
    const current = this.dashboardMedicationPage();
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

  // Pagination state for My Appointments (10 rows per page)
  readonly appointmentPage = signal<number>(1);
  readonly appointmentPageSize = signal<number>(10);

  readonly totalAppointmentPages = computed(() => 
    Math.ceil(this.sortedAppointments().length / this.appointmentPageSize()) || 1
  );

  readonly pagedAppointments = computed(() => {
    const page = Math.min(this.appointmentPage(), this.totalAppointmentPages());
    const start = (page - 1) * this.appointmentPageSize();
    return this.sortedAppointments().slice(start, start + this.appointmentPageSize());
  });

  setAppointmentPage(page: number): void {
    if (page >= 1 && page <= this.totalAppointmentPages()) {
      this.appointmentPage.set(page);
    }
  }

  nextAppointmentPage(): void {
    this.appointmentPage.update(p => Math.min(this.totalAppointmentPages(), p + 1));
  }

  prevAppointmentPage(): void {
    this.appointmentPage.update(p => Math.max(1, p - 1));
  }

  firstAppointmentPage(): void {
    this.appointmentPage.set(1);
  }

  lastAppointmentPage(): void {
    this.appointmentPage.set(this.totalAppointmentPages());
  }

  onAppointmentPageSizeChange(size: number | string): void {
    this.appointmentPageSize.set(Number(size) || 10);
    this.appointmentPage.set(1);
  }

  getPagesArray(): number[] {
    const total = this.totalAppointmentPages();
    const current = this.appointmentPage();
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

  // Pagination state for Diagnostic Records (10 rows per page)
  readonly labReportPage = signal<number>(1);
  readonly labReportPageSize = signal<number>(10);

  readonly sortedLabReports = computed(() => {
    return [...this.labReports()].sort((a, b) => {
      const timeA = new Date(a.date).getTime() || 0;
      const timeB = new Date(b.date).getTime() || 0;
      return timeB - timeA;
    });
  });

  readonly totalLabReportPages = computed(() => 
    Math.ceil(this.sortedLabReports().length / this.labReportPageSize()) || 1
  );

  readonly pagedLabReports = computed(() => {
    const page = Math.min(this.labReportPage(), this.totalLabReportPages());
    const start = (page - 1) * this.labReportPageSize();
    return this.sortedLabReports().slice(start, start + this.labReportPageSize());
  });

  setLabReportPage(page: number): void {
    if (page >= 1 && page <= this.totalLabReportPages()) {
      this.labReportPage.set(page);
    }
  }

  nextLabReportPage(): void {
    this.labReportPage.update(p => Math.min(this.totalLabReportPages(), p + 1));
  }

  prevLabReportPage(): void {
    this.labReportPage.update(p => Math.max(1, p - 1));
  }

  firstLabReportPage(): void {
    this.labReportPage.set(1);
  }

  lastLabReportPage(): void {
    this.labReportPage.set(this.totalLabReportPages());
  }

  onLabReportPageSizeChange(size: number | string): void {
    this.labReportPageSize.set(Number(size) || 10);
    this.labReportPage.set(1);
  }

  getLabReportPagesArray(): number[] {
    const total = this.totalLabReportPages();
    const current = this.labReportPage();
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

  readonly appointments = signal<PatientAppointment[]>([
    {
      id: 'APT-101',
      doctorName: 'Dr. Sarah Jenkins, MD',
      doctorDegree: 'MD, FACC (Harvard Med)',
      specialty: 'Cardiology',
      avatar: 'assets/images/doctors/dr-sarah-jenkins.png',
      cause: 'Hypertension Follow-up & Routine Cardiovascular Assessment',
      date: 'Aug 22, 2026',
      time: '10:30 AM - 11:15 AM',
      room: 'Cardiovascular Wing, Suite 402',
      type: 'In-Person',
      status: 'Confirmed',
      prescription: {
        rxNumber: 'RX-2026-9812',
        date: 'Aug 22, 2026',
        doctorReg: 'MED-CA-8921',
        diagnosis: 'Primary Stage-1 Hypertension, Normal Sinus Rhythm (BP 128/82 mmHg)',
        clinicalNotes: 'Patient responding well to oral therapy. ECG shows clear sinus rhythm with no ST deviations.',
        medicines: [
          {
            name: 'Atorvastatin Calcium',
            dosage: '20',
            frequency: '1-0-0 (Once daily)',
            duration: '30 Days',
            instructions: 'Take at night after dinner with water'
          },
          {
            name: 'Telmisartan Tablets',
            dosage: '40',
            frequency: '1-0-0 (Morning)',
            duration: '30 Days',
            instructions: 'Take 30 mins before breakfast'
          },
          {
            name: 'Aspirin Low Dose',
            dosage: '81',
            frequency: '0-1-0 (Afternoon)',
            duration: '30 Days',
            instructions: 'Take after lunch with plenty of water'
          }
        ],
        advice: [
          'Maintain a low-sodium (< 2.0g/day) Mediterranean diet rich in leafy greens.',
          'Engage in 30 minutes of moderate aerobic cardiovascular exercise 5 days/week.',
          'Log daily morning and evening blood pressure measurements in patient portal.'
        ],
        nextFollowUp: 'Sept 22, 2026 (In 30 Days)'
      },
      receipt: {
        receiptNumber: 'INV-2026-8941',
        invoiceDate: 'Aug 22, 2026, 11:20 AM',
        paymentStatus: 'PAID',
        paymentMethod: 'Visa Card (ending in 4242)',
        transactionId: 'TXN-8829104',
        items: [
          { description: 'Senior Consultant Cardiologist Consultation Fee', code: 'CPT-99214', quantity: 1, price: 150.00 },
          { description: '12-Lead Diagnostic ECG & Telemetry Interpretation', code: 'CPT-93000', quantity: 1, price: 85.00 },
          { description: 'Hospital Outpatient Facility & Records Surcharge', code: 'ADM-102', quantity: 1, price: 25.00 }
        ],
        subtotal: 260.00,
        insuranceCoveragePercent: 80,
        insuranceCoveredAmount: 208.00,
        copayAmount: 52.00,
        tax: 0.00,
        totalPaid: 52.00
      }
    },
    {
      id: 'APT-102',
      doctorName: 'Dr. Michael Chen, MD',
      doctorDegree: 'MD, PhD (Johns Hopkins)',
      specialty: 'Neurology',
      avatar: 'assets/images/doctors/dr-michael-chen.png',
      cause: 'Chronic Migraine Management & 3T Brain MRI Review',
      date: 'Aug 29, 2026',
      time: '02:00 PM - 02:45 PM',
      room: 'Virtual Telehealth HD Room 3',
      type: 'Telehealth Video',
      status: 'Pending',
      prescription: {
        rxNumber: 'RX-2026-8845',
        date: 'Aug 29, 2026',
        doctorReg: 'MED-NE-4412',
        diagnosis: 'Episodic Migraine without Aura, Tension-Type Cephalea',
        clinicalNotes: 'Brain MRI confirmed unremarkable parenchyma. Prophylactic therapy recommended.',
        medicines: [
          {
            name: 'Propranolol Hydrochloride',
            dosage: '40',
            frequency: '1-0-1 (Twice daily)',
            duration: '30 Days',
            instructions: 'Take with or immediately after food'
          },
          {
            name: 'Rizatriptan Benzoate',
            dosage: '10',
            frequency: 'As needed (SOS)',
            duration: '10 Tabs',
            instructions: 'Take 1 tablet at initial onset of acute migraine headache'
          }
        ],
        advice: [
          'Maintain regular sleep schedule (7-8 hours per night).',
          'Identify and avoid dietary triggers such as aged cheeses and excess caffeine.',
          'Stay adequately hydrated (minimum 2.5 liters water daily).'
        ],
        nextFollowUp: 'Oct 15, 2026 (In 6 Weeks)'
      },
      receipt: {
        receiptNumber: 'INV-2026-7832',
        invoiceDate: 'Aug 29, 2026, 02:50 PM',
        paymentStatus: 'PAID',
        paymentMethod: 'Insurance Direct Electronic Settlement',
        transactionId: 'TXN-7731902',
        items: [
          { description: 'Telehealth Video Consultation with Neurologist', code: 'CPT-99213', quantity: 1, price: 130.00 },
          { description: '3T Contrast Brain MRI Analysis & Imaging Review', code: 'CPT-70553', quantity: 1, price: 120.00 }
        ],
        subtotal: 250.00,
        insuranceCoveragePercent: 80,
        insuranceCoveredAmount: 200.00,
        copayAmount: 50.00,
        tax: 0.00,
        totalPaid: 50.00
      }
    },
    {
      id: 'APT-103',
      doctorName: 'Dr. Elena Rostova, MD',
      doctorDegree: 'MD, FAAP (Stanford Med)',
      specialty: 'Pediatrics',
      avatar: 'assets/images/doctors/dr-elena-rostova.png',
      cause: 'Annual Pediatric Wellness Consultation & Vaccination Review',
      date: 'Aug 05, 2026',
      time: '11:00 AM - 11:30 AM',
      room: 'Pediatric Clinic, Wing B',
      type: 'In-Person',
      status: 'Confirmed',
      prescription: {
        rxNumber: 'RX-2026-7104',
        date: 'Aug 05, 2026',
        doctorReg: 'MED-PD-1120',
        diagnosis: 'Pediatric General Health Clearance & Age-Specific Immunization',
        clinicalNotes: 'Child is growing normally along 75th percentile. Administered booster shot.',
        medicines: [
          { name: 'Pediatric Multivitamin Drops', dosage: '1 ml', frequency: '1-0-0 (Morning)', duration: '60 Days', instructions: 'Give after morning feed' }
        ],
        advice: ['Maintain balanced nutritional diet', 'Next vaccination scheduled at age 6'],
        nextFollowUp: 'Feb 05, 2027'
      },
      receipt: {
        receiptNumber: 'INV-2026-6512',
        invoiceDate: 'Aug 05, 2026, 11:35 AM',
        paymentStatus: 'PAID',
        paymentMethod: 'UPI / Google Pay',
        transactionId: 'TXN-6512903',
        items: [
          { description: 'Pediatric Comprehensive Consultation & Developmental Check', code: 'CPT-99382', quantity: 1, price: 120.00 },
          { description: 'Immunization Vaccine Administration Fee', code: 'CPT-90471', quantity: 1, price: 40.00 }
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
      id: 'APT-104',
      doctorName: 'Dr. Marcus Brody, MD',
      doctorDegree: 'MD, FAAOS (Mayo Clinic)',
      specialty: 'Orthopedics',
      avatar: 'assets/images/doctors/dr-marcus-brody.png',
      cause: 'Right Knee Arthroscopy Post-Op Evaluation & Mobility Rehab',
      date: 'Jul 24, 2026',
      time: '03:15 PM - 04:00 PM',
      room: 'Orthopedic Center, Suite 105',
      type: 'In-Person',
      status: 'Confirmed',
      prescription: {
        rxNumber: 'RX-2026-6410',
        date: 'Jul 24, 2026',
        doctorReg: 'MED-OR-9912',
        diagnosis: 'Right Knee Meniscus Post-Surgical Healing',
        clinicalNotes: 'Good range of motion observed. Swelling significantly reduced.',
        medicines: [
          { name: 'Glucosamine & Chondroitin Complex', dosage: '500', frequency: '1-0-1', duration: '30 Days', instructions: 'Take with food' }
        ],
        advice: ['Continue targeted quadriceps isometric exercises', 'Avoid high impact running for 4 weeks'],
        nextFollowUp: 'Aug 24, 2026'
      },
      receipt: {
        receiptNumber: 'INV-2026-5590',
        invoiceDate: 'Jul 24, 2026, 04:10 PM',
        paymentStatus: 'PAID',
        paymentMethod: 'Mastercard Debit',
        transactionId: 'TXN-5590123',
        items: [
          { description: 'Post-Op Orthopedic Surgical Follow-up & Joint Assessment', code: 'CPT-99214', quantity: 1, price: 140.00 }
        ],
        subtotal: 140.00,
        insuranceCoveragePercent: 80,
        insuranceCoveredAmount: 112.00,
        copayAmount: 28.00,
        tax: 0.00,
        totalPaid: 28.00
      }
    },
    {
      id: 'APT-105',
      doctorName: 'Dr. Aisha Patel, MD',
      doctorDegree: 'MD, FACP (Oxford Med)',
      specialty: 'Oncology',
      avatar: 'assets/images/doctors/dr-aisha-patel.png',
      cause: 'Routine Annual Preventative Cancer Screening & Tumor Marker Evaluation',
      date: 'Jul 12, 2026',
      time: '09:00 AM - 09:45 AM',
      room: 'Oncology Pavilion, Floor 3',
      type: 'In-Person',
      status: 'Confirmed',
      prescription: {
        rxNumber: 'RX-2026-5120',
        date: 'Jul 12, 2026',
        doctorReg: 'MED-ON-3041',
        diagnosis: 'Normal Preventive Screening Profile (CEA, CA-125 Unremarkable)',
        clinicalNotes: 'All screening parameters are normal. Recommended regular annual checkups.',
        medicines: [
          { name: 'Antioxidant Multi-Carotene Softgels', dosage: '1 Cap', frequency: '1-0-0', duration: '30 Days', instructions: 'Take with breakfast' }
        ],
        advice: ['Maintain plant-forward diet', 'Repeat routine blood panels in 12 months'],
        nextFollowUp: 'Jul 12, 2027'
      },
      receipt: {
        receiptNumber: 'INV-2026-4481',
        invoiceDate: 'Jul 12, 2026, 10:00 AM',
        paymentStatus: 'PAID',
        paymentMethod: 'Corporate Health Insurance',
        transactionId: 'TXN-4481902',
        items: [
          { description: 'Comprehensive Preventative Oncology Consultation', code: 'CPT-99204', quantity: 1, price: 160.00 }
        ],
        subtotal: 160.00,
        insuranceCoveragePercent: 90,
        insuranceCoveredAmount: 144.00,
        copayAmount: 16.00,
        tax: 0.00,
        totalPaid: 16.00
      }
    },
    {
      id: 'APT-106',
      doctorName: 'Dr. David Kim, MD',
      doctorDegree: 'MD, FAAD (UCSF Med)',
      specialty: 'Dermatology',
      avatar: 'assets/images/doctors/dr-david-kim.png',
      cause: 'Contact Dermatitis Treatment & Skin Barrier Restoration Consultation',
      date: 'Jun 28, 2026',
      time: '11:30 AM - 12:00 PM',
      room: 'Dermatology Clinic, Room 102',
      type: 'In-Person',
      status: 'Confirmed',
      prescription: {
        rxNumber: 'RX-2026-4190',
        date: 'Jun 28, 2026',
        doctorReg: 'MED-DM-8821',
        diagnosis: 'Acute Eczematous Contact Dermatitis (Resolved)',
        clinicalNotes: 'Inflammation resolved with topical barrier cream.',
        medicines: [
          { name: 'Ceramide Barrier Repair Cream', dosage: 'Apply thin layer', frequency: '0-0-1', duration: '14 Days', instructions: 'Apply before sleeping' }
        ],
        advice: ['Use fragrance-free gentle cleansers', 'Avoid harsh chemical soaps'],
        nextFollowUp: 'As needed'
      },
      receipt: {
        receiptNumber: 'INV-2026-3820',
        invoiceDate: 'Jun 28, 2026, 12:10 PM',
        paymentStatus: 'PAID',
        paymentMethod: 'Credit Card',
        transactionId: 'TXN-3820491',
        items: [
          { description: 'Dermatology Specialized Consultation & Skin Barrier Therapy', code: 'CPT-99213', quantity: 1, price: 110.00 }
        ],
        subtotal: 110.00,
        insuranceCoveragePercent: 80,
        insuranceCoveredAmount: 88.00,
        copayAmount: 22.00,
        tax: 0.00,
        totalPaid: 22.00
      }
    },
    {
      id: 'APT-107',
      doctorName: 'Dr. Karthik Reddy, MD',
      doctorDegree: 'MD, DM (Gastroenterology)',
      specialty: 'Gastroenterology',
      avatar: 'assets/images/doctors/dr-karthik-reddy.png',
      cause: 'Gastroesophageal Reflux Disease (GERD) & Upper GI Endoscopy Review',
      date: 'Jun 14, 2026',
      time: '01:30 PM - 02:15 PM',
      room: 'Endoscopy & GI Center, Floor 2',
      type: 'In-Person',
      status: 'Confirmed',
      prescription: {
        rxNumber: 'RX-2026-3391',
        date: 'Jun 14, 2026',
        doctorReg: 'MED-GA-5521',
        diagnosis: 'Grade-A Reflux Esophagitis, Mild Antral Gastritis',
        clinicalNotes: 'Endoscopy confirmed intact mucosal architecture with mild distal hyperemia.',
        medicines: [
          { name: 'Esomeprazole Magnesium', dosage: '40', frequency: '1-0-0', duration: '30 Days', instructions: 'Take 30 mins before breakfast' }
        ],
        advice: ['Elevate head of bed 15 degrees', 'Avoid late night meals within 3 hours of sleep'],
        nextFollowUp: 'Jul 14, 2026'
      },
      receipt: {
        receiptNumber: 'INV-2026-3102',
        invoiceDate: 'Jun 14, 2026, 02:25 PM',
        paymentStatus: 'PAID',
        paymentMethod: 'Net Banking',
        transactionId: 'TXN-3102941',
        items: [
          { description: 'Consultant Gastroenterologist Consultation', code: 'CPT-99214', quantity: 1, price: 135.00 },
          { description: 'Upper Diagnostic Video Endoscopy Analysis', code: 'CPT-43235', quantity: 1, price: 210.00 }
        ],
        subtotal: 345.00,
        insuranceCoveragePercent: 85,
        insuranceCoveredAmount: 293.25,
        copayAmount: 51.75,
        tax: 0.00,
        totalPaid: 51.75
      }
    },
    {
      id: 'APT-108',
      doctorName: 'Dr. Priya Nambiar, MS',
      doctorDegree: 'MS (ENT), Fellowship Otology',
      specialty: 'ENT',
      avatar: 'assets/images/doctors/dr-priya-nambiar.png',
      cause: 'Chronic Sinusitis Evaluation & Pure Tone Audiometry Diagnostics',
      date: 'May 30, 2026',
      time: '10:00 AM - 10:45 AM',
      room: 'ENT Outpatient Wing, Room 301',
      type: 'In-Person',
      status: 'Confirmed',
      prescription: {
        rxNumber: 'RX-2026-2819',
        date: 'May 30, 2026',
        doctorReg: 'MED-ENT-7712',
        diagnosis: 'Bilateral Maxillary Sinus Congestion & Eustachian Tube Dysfunction',
        clinicalNotes: 'Nasal endoscopy shows clear drainage pathways with minimal turbinate hypertrophy.',
        medicines: [
          { name: 'Fluticasone Furoate Nasal Spray', dosage: '2 Sprays', frequency: '1-0-1', duration: '30 Days', instructions: 'Spray into each nostril twice daily' }
        ],
        advice: ['Steam inhalation twice daily with saline drops', 'Avoid direct cold air exposure'],
        nextFollowUp: 'Jun 30, 2026'
      },
      receipt: {
        receiptNumber: 'INV-2026-2489',
        invoiceDate: 'May 30, 2026, 10:55 AM',
        paymentStatus: 'PAID',
        paymentMethod: 'Debit Card',
        transactionId: 'TXN-2489102',
        items: [
          { description: 'Otorhinolaryngology (ENT) Diagnostic Evaluation', code: 'CPT-99213', quantity: 1, price: 115.00 },
          { description: 'Diagnostic Audiometry & Tympanometry Testing', code: 'CPT-92557', quantity: 1, price: 65.00 }
        ],
        subtotal: 180.00,
        insuranceCoveragePercent: 80,
        insuranceCoveredAmount: 144.00,
        copayAmount: 36.00,
        tax: 0.00,
        totalPaid: 36.00
      }
    },
    {
      id: 'APT-109',
      doctorName: 'Dr. Arvind Swaminathan, MD',
      doctorDegree: 'MD (Internal Medicine), FACP',
      specialty: 'General Medicine',
      avatar: 'assets/images/doctors/dr-arvind-swaminathan.png',
      cause: 'Comprehensive Executive Health Checkup & Fasting Blood Sugar Review',
      date: 'May 18, 2026',
      time: '08:30 AM - 09:30 AM',
      room: 'Executive Health Clinic, Suite 501',
      type: 'In-Person',
      status: 'Confirmed',
      prescription: {
        rxNumber: 'RX-2026-2104',
        date: 'May 18, 2026',
        doctorReg: 'MED-GM-1092',
        diagnosis: 'Executive Wellness Clearance — All Biomarkers Optimal',
        clinicalNotes: 'Fasting glucose 94 mg/dL, HbA1c 5.4%. Lipid ratio well-maintained.',
        medicines: [
          { name: 'Vitamin D3 Cholecalciferol', dosage: '60,000 IU', frequency: 'Once weekly', duration: '8 Weeks', instructions: 'Take with milk after breakfast' }
        ],
        advice: ['Continue 10,000 steps daily routine', 'Repeat annual executive profile in May 2027'],
        nextFollowUp: 'May 18, 2027'
      },
      receipt: {
        receiptNumber: 'INV-2026-1890',
        invoiceDate: 'May 18, 2026, 09:40 AM',
        paymentStatus: 'PAID',
        paymentMethod: 'Corporate Cashless Card',
        transactionId: 'TXN-1890214',
        items: [
          { description: 'Executive Health Screening & Internal Medicine Assessment', code: 'CPT-99395', quantity: 1, price: 180.00 }
        ],
        subtotal: 180.00,
        insuranceCoveragePercent: 90,
        insuranceCoveredAmount: 162.00,
        copayAmount: 18.00,
        tax: 0.00,
        totalPaid: 18.00
      }
    },
    {
      id: 'APT-110',
      doctorName: 'Dr. Vikram Malhotra, MS',
      doctorDegree: 'MS, MCh (Urology), DNB',
      specialty: 'Urology',
      avatar: 'assets/images/doctors/dr-vikram-malhotra.png',
      cause: 'Renal Ultrasound Review & Kidney Hydration Health Assessment',
      date: 'May 04, 2026',
      time: '02:30 PM - 03:15 PM',
      room: 'Renal & Urology Suite, Room 204',
      type: 'In-Person',
      status: 'Confirmed',
      prescription: {
        rxNumber: 'RX-2026-1582',
        date: 'May 04, 2026',
        doctorReg: 'MED-UR-4482',
        diagnosis: 'Normal Renal Bilateral Telemetry, No Calculi or Hydronephrosis',
        clinicalNotes: 'Ultrasound KUB confirmed normal renal parenchymal thickness.',
        medicines: [
          { name: 'Potassium Citrate Oral Solution', dosage: '10 ml', frequency: '0-1-0', duration: '14 Days', instructions: 'Dilute in glass of water after meals' }
        ],
        advice: ['Maintain 3+ liters daily water hydration', 'Limit dietary oxalates (spinach, beetroot)'],
        nextFollowUp: 'Nov 04, 2026'
      },
      receipt: {
        receiptNumber: 'INV-2026-1401',
        invoiceDate: 'May 04, 2026, 03:25 PM',
        paymentStatus: 'PAID',
        paymentMethod: 'Visa Debit Card',
        transactionId: 'TXN-1401924',
        items: [
          { description: 'Specialist Urologist Consultation & Ultrasound Review', code: 'CPT-99214', quantity: 1, price: 145.00 }
        ],
        subtotal: 145.00,
        insuranceCoveragePercent: 80,
        insuranceCoveredAmount: 116.00,
        copayAmount: 29.00,
        tax: 0.00,
        totalPaid: 29.00
      }
    },
    {
      id: 'APT-111',
      doctorName: 'Dr. Maya Nair, MPT',
      doctorDegree: 'MPT (Sports Rehab & Physio)',
      specialty: 'Physiotherapy',
      avatar: 'assets/images/doctors/dr-maya-nair.png',
      cause: 'Lumbar Spine Postural Alignment & Ergonomic Core Strength Therapy',
      date: 'Apr 20, 2026',
      time: '04:00 PM - 04:45 PM',
      room: 'Physiotherapy & Rehabilitation Gym',
      type: 'In-Person',
      status: 'Confirmed',
      prescription: {
        rxNumber: 'RX-2026-1124',
        date: 'Apr 20, 2026',
        doctorReg: 'MED-PT-9012',
        diagnosis: 'Ergonomic Mechanical Lower Back Strain',
        clinicalNotes: 'Patient completed 4 weeks of physical rehabilitation with 90% pain reduction.',
        medicines: [
          { name: 'Topical Diclofenac Gel', dosage: 'Apply to lumbar area', frequency: 'As needed', duration: '10 Days', instructions: 'Gently massage without heat pack' }
        ],
        advice: ['Use ergonomic lumbar support cushion at workstation', 'Perform daily cat-camel stretches'],
        nextFollowUp: 'As needed'
      },
      receipt: {
        receiptNumber: 'INV-2026-0982',
        invoiceDate: 'Apr 20, 2026, 04:50 PM',
        paymentStatus: 'PAID',
        paymentMethod: 'UPI Payment',
        transactionId: 'TXN-0982314',
        items: [
          { description: 'Physical Therapy & Lumbar Spinal Rehabilitation Session', code: 'CPT-97110', quantity: 1, price: 80.00 }
        ],
        subtotal: 80.00,
        insuranceCoveragePercent: 80,
        insuranceCoveredAmount: 64.00,
        copayAmount: 16.00,
        tax: 0.00,
        totalPaid: 16.00
      }
    },
    {
      id: 'APT-112',
      doctorName: 'Dr. Devika Sharma, MD',
      doctorDegree: 'MD (Psychiatry), DPM',
      specialty: 'Psychiatry',
      avatar: 'assets/images/doctors/dr-devika-sharma.png',
      cause: 'Workplace Stress Management & Sleep Hygiene Consultation',
      date: 'Apr 08, 2026',
      time: '05:00 PM - 05:45 PM',
      room: 'Behavioral Health Suite 101',
      type: 'In-Person',
      status: 'Confirmed',
      prescription: {
        rxNumber: 'RX-2026-0811',
        date: 'Apr 08, 2026',
        doctorReg: 'MED-PS-2201',
        diagnosis: 'Situational Stress Response with Mild Sleep Onset Latency',
        clinicalNotes: 'Mindfulness breathing and cognitive reframing techniques initiated.',
        medicines: [
          { name: 'Melatonin Sleep Support (Sublingual)', dosage: '3', frequency: '0-0-1 (Night)', duration: '14 Days', instructions: 'Take 30 mins before scheduled sleep' }
        ],
        advice: ['Eliminate blue light screens 1 hour before bed', 'Practice 15 minutes evening meditation'],
        nextFollowUp: 'May 08, 2026'
      },
      receipt: {
        receiptNumber: 'INV-2026-0741',
        invoiceDate: 'Apr 08, 2026, 05:50 PM',
        paymentStatus: 'PAID',
        paymentMethod: 'Credit Card',
        transactionId: 'TXN-0741982',
        items: [
          { description: 'Psychiatric Wellness & Behavioral Health Evaluation', code: 'CPT-90791', quantity: 1, price: 130.00 }
        ],
        subtotal: 130.00,
        insuranceCoveragePercent: 80,
        insuranceCoveredAmount: 104.00,
        copayAmount: 26.00,
        tax: 0.00,
        totalPaid: 26.00
      }
    }
  ]);

  // 3.1 Diagnostic Records: Date, Time, Test Name, Hospital or Out, View Report, View Status
  readonly labReports = signal<LabReport[]>([
    {
      id: 'RPT-8821',
      testName: 'Complete Blood Count (CBC) & Lipid Profile',
      doctor: 'Dr. Sarah Jenkins, MD',
      date: 'Aug 18, 2026',
      time: '09:30 AM',
      locationType: 'Hospital',
      locationName: 'HMS Central Pathology Wing',
      status: 'Normal',
      fileSize: '1.8 MB',
      category: 'Hematology & Biochemistry',
      labTechnician: 'Sarah Al-Mansoor, CLS',
      specimen: 'Venous Whole Blood & Serum',
      parameters: [
        { name: 'Hemoglobin (Hb)', value: '14.2', unit: 'g/dL', referenceRange: '12.0 - 15.5', status: 'Normal' },
        { name: 'Total White Blood Cells (WBC)', value: '6,800', unit: '/mcL', referenceRange: '4,500 - 11,000', status: 'Normal' },
        { name: 'Platelet Count', value: '245,000', unit: '/mcL', referenceRange: '150,000 - 450,000', status: 'Normal' },
        { name: 'Total Cholesterol', value: '178', unit: 'mg/dL', referenceRange: '< 200', status: 'Normal' },
        { name: 'HDL High-Density Lipoprotein', value: '58', unit: 'mg/dL', referenceRange: '> 50', status: 'Normal' },
        { name: 'LDL Low-Density Lipoprotein', value: '98', unit: 'mg/dL', referenceRange: '< 100', status: 'Normal' },
        { name: 'Triglycerides', value: '110', unit: 'mg/dL', referenceRange: '< 150', status: 'Normal' }
      ],
      summaryNotes: 'All hematological parameters within optimal physiological baseline ranges. Lipid profile reflects healthy cardiovascular response to prescribed regimen.',
      timeline: [
        { title: 'Blood Specimen Collected', timestamp: 'Aug 18, 09:30 AM', description: 'Venous whole blood drawn at Phlebotomy Station 2 by Sarah Al-Mansoor.', completed: true, active: false },
        { title: 'Automated Hematology Telemetry', timestamp: 'Aug 18, 10:15 AM', description: 'Sample processed through Sysmex XN-9000 automated analyzer.', completed: true, active: false },
        { title: 'Pathologist Verification', timestamp: 'Aug 18, 11:00 AM', description: 'Reviewed & signed off by Dr. Sarah Jenkins, MD.', completed: true, active: false },
        { title: 'Report Published to Patient Portal', timestamp: 'Aug 18, 11:20 AM', description: 'Diagnostic certificate generated with digital medical stamp.', completed: true, active: false }
      ]
    },
    {
      id: 'RPT-8822',
      testName: 'Contrast 3T Brain MRI & Angiography',
      doctor: 'Dr. Michael Chen, MD',
      date: 'Aug 10, 2026',
      time: '02:15 PM',
      locationType: 'Hospital',
      locationName: 'HMS Neuroimaging Center',
      status: 'Normal',
      fileSize: '4.2 MB',
      category: 'Neuroimaging & Radiology',
      labTechnician: 'David Vance, RT(R)(MR)',
      specimen: 'Multi-planar 3T MRI Scans with IV Gadolinium',
      parameters: [
        { name: 'Cerebral Parenchyma', value: 'Normal', unit: 'Index', referenceRange: 'Normal architecture', status: 'Normal' },
        { name: 'Ventricular System', value: 'Symmetrical', unit: 'Index', referenceRange: 'Normal size & shape', status: 'Normal' },
        { name: 'Intracranial Vasculature', value: 'Patent', unit: 'Index', referenceRange: 'No aneurysm/stenosis', status: 'Normal' },
        { name: 'White Matter Signal', value: 'No demyelination', unit: 'Index', referenceRange: 'Unremarkable', status: 'Normal' }
      ],
      summaryNotes: 'High-resolution 3T MRI brain scan reveals completely normal brain parenchyma and intact circle of Willis vasculature without intracranial abnormality.',
      timeline: [
        { title: 'MRI Scan Performed', timestamp: 'Aug 10, 02:15 PM', description: 'Completed multi-sequence 3T MRI acquisition with IV contrast.', completed: true, active: false },
        { title: 'DICOM Radiography Processing', timestamp: 'Aug 10, 03:00 PM', description: '3D Angiography reconstruction generated on PACS telemetry server.', completed: true, active: false },
        { title: 'Neuroradiologist Interpretation', timestamp: 'Aug 10, 04:30 PM', description: 'Verified and annotated by Dr. Michael Chen, MD.', completed: true, active: false },
        { title: 'Report Published to Patient Portal', timestamp: 'Aug 10, 05:00 PM', description: 'Diagnostic imaging telemetry available for download.', completed: true, active: false }
      ]
    },
    {
      id: 'RPT-8823',
      testName: 'Comprehensive Thyroid Panel (TSH, FT3, FT4)',
      doctor: 'Dr. Elena Rostova, MD',
      date: 'Jul 28, 2026',
      time: '08:45 AM',
      locationType: 'Out',
      locationName: 'Quest Diagnostics Partner Lab (Out)',
      status: 'Normal',
      fileSize: '950 KB',
      category: 'Endocrinology Telemetry',
      labTechnician: 'Maya Lin, MLS(ASCP)',
      specimen: 'Serum Blood',
      parameters: [
        { name: 'Thyroid Stimulating Hormone (TSH)', value: '2.14', unit: 'uIU/mL', referenceRange: '0.40 - 4.50', status: 'Normal' },
        { name: 'Free Triiodothyronine (FT3)', value: '3.2', unit: 'pg/mL', referenceRange: '2.3 - 4.2', status: 'Normal' },
        { name: 'Free Thyroxine (FT4)', value: '1.28', unit: 'ng/dL', referenceRange: '0.8 - 1.8', status: 'Normal' }
      ],
      summaryNotes: 'Euthyroid state confirmed. Normal baseline endocrine regulation without thyroid dysfunction.',
      timeline: [
        { title: 'Out-Lab Sample Collection', timestamp: 'Jul 28, 08:45 AM', description: 'Serum sample collected at Quest Diagnostics Partner Lab.', completed: true, active: false },
        { title: 'Chemiluminescent Immunoassay', timestamp: 'Jul 28, 11:30 AM', description: 'Processed on Beckman Coulter UniCel DxI 800 analyzer.', completed: true, active: false },
        { title: 'Clinical Validation & Transfer', timestamp: 'Jul 28, 01:15 PM', description: 'Transferred securely to HMS Electronic Health Record system.', completed: true, active: false },
        { title: 'Report Published to Patient Portal', timestamp: 'Jul 28, 01:45 PM', description: 'Integrated and approved by Dr. Elena Rostova, MD.', completed: true, active: false }
      ]
    },
    {
      id: 'RPT-8824',
      testName: 'Glycated Hemoglobin (HbA1c) & Fasting Glucose',
      doctor: 'Dr. Arvind Swaminathan, MD',
      date: 'Jul 15, 2026',
      time: '08:00 AM',
      locationType: 'Hospital',
      locationName: 'HMS Diabetes & Endocrinology Lab',
      status: 'Normal',
      fileSize: '1.2 MB',
      category: 'Diabetes Telemetry',
      labTechnician: 'Rahul Verma, MLS',
      specimen: 'EDTA Whole Blood & Sodium Fluoride Plasma',
      parameters: [
        { name: 'Glycated Hemoglobin (HbA1c)', value: '5.4', unit: '%', referenceRange: '< 5.7', status: 'Normal' },
        { name: 'Estimated Average Glucose (eAG)', value: '108', unit: 'mg/dL', referenceRange: '< 117', status: 'Normal' },
        { name: 'Fasting Blood Glucose', value: '92', unit: 'mg/dL', referenceRange: '70 - 99', status: 'Normal' }
      ],
      summaryNotes: 'Glycemic control is within non-diabetic reference parameters. Excellent metabolic control maintained.',
      timeline: [
        { title: 'Fasting Sample Drawn', timestamp: 'Jul 15, 08:00 AM', description: 'Collected following 10-hour overnight fast.', completed: true, active: false },
        { title: 'HPLC Assay Telemetry', timestamp: 'Jul 15, 09:30 AM', description: 'Automated high-performance liquid chromatography analysis.', completed: true, active: false },
        { title: 'Physician Review', timestamp: 'Jul 15, 10:15 AM', description: 'Validated by Dr. Arvind Swaminathan, MD.', completed: true, active: false }
      ]
    },
    {
      id: 'RPT-8825',
      testName: 'Comprehensive Liver Function Profile (LFT)',
      doctor: 'Dr. Karthik Reddy, MD',
      date: 'Jul 02, 2026',
      time: '09:15 AM',
      locationType: 'Hospital',
      locationName: 'HMS Central Pathology Wing',
      status: 'Normal',
      fileSize: '1.4 MB',
      category: 'Hepatic Biochemistry',
      labTechnician: 'Sarah Al-Mansoor, CLS',
      specimen: 'Serum Blood',
      parameters: [
        { name: 'Total Bilirubin', value: '0.8', unit: 'mg/dL', referenceRange: '0.2 - 1.2', status: 'Normal' },
        { name: 'SGOT / AST', value: '24', unit: 'U/L', referenceRange: '8 - 48', status: 'Normal' },
        { name: 'SGPT / ALT', value: '28', unit: 'U/L', referenceRange: '7 - 55', status: 'Normal' },
        { name: 'Alkaline Phosphatase (ALP)', value: '68', unit: 'U/L', referenceRange: '44 - 147', status: 'Normal' },
        { name: 'Serum Albumin', value: '4.5', unit: 'g/dL', referenceRange: '3.5 - 5.0', status: 'Normal' }
      ],
      summaryNotes: 'Hepatic enzymes and protein synthesis markers are normal. No evidence of hepatocellular injury.',
      timeline: [
        { title: 'Specimen Collection', timestamp: 'Jul 02, 09:15 AM', description: 'Serum sample obtained at outpatient phlebotomy.', completed: true, active: false },
        { title: 'Biochemistry Processing', timestamp: 'Jul 02, 10:45 AM', description: 'Completed on Roche Cobas 8000 analyzer.', completed: true, active: false },
        { title: 'Report Published', timestamp: 'Jul 02, 11:30 AM', description: 'Approved by Dr. Karthik Reddy, MD.', completed: true, active: false }
      ]
    },
    {
      id: 'RPT-8826',
      testName: 'Renal Function Panel & Serum Electrolytes',
      doctor: 'Dr. Vikram Malhotra, MS',
      date: 'Jun 20, 2026',
      time: '10:00 AM',
      locationType: 'Hospital',
      locationName: 'HMS Nephrology & Renal Care Lab',
      status: 'Normal',
      fileSize: '1.1 MB',
      category: 'Nephrology & Renal Panel',
      labTechnician: 'Ananya Roy, MLS',
      specimen: 'Serum & Plasma',
      parameters: [
        { name: 'Serum Creatinine', value: '0.92', unit: 'mg/dL', referenceRange: '0.70 - 1.30', status: 'Normal' },
        { name: 'Blood Urea Nitrogen (BUN)', value: '14', unit: 'mg/dL', referenceRange: '7 - 20', status: 'Normal' },
        { name: 'eGFR Filtration Rate', value: '102', unit: 'mL/min/1.73m²', referenceRange: '> 90', status: 'Normal' },
        { name: 'Serum Sodium (Na+)', value: '140', unit: 'mEq/L', referenceRange: '135 - 145', status: 'Normal' },
        { name: 'Serum Potassium (K+)', value: '4.2', unit: 'mEq/L', referenceRange: '3.5 - 5.1', status: 'Normal' }
      ],
      summaryNotes: 'Optimal renal clearance and filtration capacity. Serum electrolyte balance is normal.',
      timeline: [
        { title: 'Sample Collection', timestamp: 'Jun 20, 10:00 AM', description: 'Serum drawn for renal chemistry evaluation.', completed: true, active: false },
        { title: 'Electrolyte Telemetry', timestamp: 'Jun 20, 11:15 AM', description: 'Ion-selective electrode telemetry processed.', completed: true, active: false },
        { title: 'Nephrologist Review', timestamp: 'Jun 20, 12:00 PM', description: 'Signed by Dr. Vikram Malhotra, MS.', completed: true, active: false }
      ]
    },
    {
      id: 'RPT-8827',
      testName: 'Digital Chest Radiography (X-Ray PA View)',
      doctor: 'Dr. Arvind Swaminathan, MD',
      date: 'Jun 05, 2026',
      time: '11:20 AM',
      locationType: 'Hospital',
      locationName: 'HMS Diagnostic Radiology Center',
      status: 'Normal',
      fileSize: '3.8 MB',
      category: 'Diagnostic Radiology',
      labTechnician: 'Thomas Lee, RT(R)',
      specimen: 'High-Resolution Digital DICOM Radiograph',
      parameters: [
        { name: 'Lung Fields', value: 'Clear', unit: 'Visual', referenceRange: 'No focal consolidation', status: 'Normal' },
        { name: 'Cardiothoracic Ratio', value: '0.46', unit: 'Ratio', referenceRange: '< 0.50', status: 'Normal' },
        { name: 'Pleural Spaces', value: 'Clear', unit: 'Visual', referenceRange: 'No effusion / pneumothorax', status: 'Normal' }
      ],
      summaryNotes: 'Both lung fields are clear with normal vascular markings. Cardiac silhouette is normal.',
      timeline: [
        { title: 'Digital X-Ray Acquired', timestamp: 'Jun 05, 11:20 AM', description: 'Acquired in posteroanterior standing projection.', completed: true, active: false },
        { title: 'PACS Radiography Transfer', timestamp: 'Jun 05, 11:45 AM', description: 'Diagnostic radiograph rendered for interpretation.', completed: true, active: false },
        { title: 'Report Published', timestamp: 'Jun 05, 12:30 PM', description: 'Validated by Dr. Arvind Swaminathan, MD.', completed: true, active: false }
      ]
    },
    {
      id: 'RPT-8828',
      testName: '12-Lead Electrocardiogram (ECG Telemetry)',
      doctor: 'Dr. Sarah Jenkins, MD',
      date: 'May 22, 2026',
      time: '10:40 AM',
      locationType: 'Hospital',
      locationName: 'HMS Cardiology Diagnostic Wing',
      status: 'Normal',
      fileSize: '1.5 MB',
      category: 'Cardiovascular Telemetry',
      labTechnician: 'Pooja Iyer, ECG Technologist',
      specimen: '12-Lead Simultaneous Surface ECG Waveforms',
      parameters: [
        { name: 'Heart Rate', value: '72', unit: 'bpm', referenceRange: '60 - 100', status: 'Normal' },
        { name: 'PR Interval', value: '156', unit: 'ms', referenceRange: '120 - 200', status: 'Normal' },
        { name: 'QRS Duration', value: '88', unit: 'ms', referenceRange: '80 - 120', status: 'Normal' },
        { name: 'QTc Interval', value: '418', unit: 'ms', referenceRange: '< 450', status: 'Normal' }
      ],
      summaryNotes: 'Normal sinus rhythm at 72 bpm. Normal axis, no ischemic ST-T elevation or conduction delays.',
      timeline: [
        { title: 'ECG Recording Complete', timestamp: 'May 22, 10:40 AM', description: '12-lead calibrated tracing acquired.', completed: true, active: false },
        { title: 'Cardiologist Sign-Off', timestamp: 'May 22, 11:15 AM', description: 'Reviewed & verified by Dr. Sarah Jenkins, MD.', completed: true, active: false }
      ]
    },
    {
      id: 'RPT-8829',
      testName: 'Serum 25-Hydroxy Vitamin D & B12 Panel',
      doctor: 'Dr. Devika Sharma, MD',
      date: 'May 10, 2026',
      time: '08:30 AM',
      locationType: 'Out',
      locationName: 'Metropolis Healthcare Diagnostics (Out)',
      status: 'Normal',
      fileSize: '820 KB',
      category: 'Micronutrient Telemetry',
      labTechnician: 'Kavita Joshi, CLS',
      specimen: 'Serum Blood',
      parameters: [
        { name: '25-OH Vitamin D', value: '42.6', unit: 'ng/mL', referenceRange: '30.0 - 100.0', status: 'Normal' },
        { name: 'Vitamin B12 (Cyanocobalamin)', value: '580', unit: 'pg/mL', referenceRange: '200 - 900', status: 'Normal' }
      ],
      summaryNotes: 'Adequate vitamin D and B12 stores. Neuro-supportive nutritional biomarkers are optimal.',
      timeline: [
        { title: 'Sample Collection', timestamp: 'May 10, 08:30 AM', description: 'Venous whole blood drawn at partner facility.', completed: true, active: false },
        { title: 'Immunoassay Processing', timestamp: 'May 10, 11:00 AM', description: 'Chemiluminescence microparticle assay complete.', completed: true, active: false },
        { title: 'Integrated to Portal', timestamp: 'May 10, 01:00 PM', description: 'Transferred to HMS EHR records system.', completed: true, active: false }
      ]
    },
    {
      id: 'RPT-8830',
      testName: 'Ultrasound Whole Abdomen & Pelvic Scan',
      doctor: 'Dr. Karthik Reddy, MD',
      date: 'Apr 25, 2026',
      time: '02:45 PM',
      locationType: 'Hospital',
      locationName: 'HMS Diagnostic Ultrasound Clinic',
      status: 'Normal',
      fileSize: '2.9 MB',
      category: 'Diagnostic Ultrasonography',
      labTechnician: 'Dr. R. K. Varma, Radiologist',
      specimen: 'Real-Time Dynamic Abdominal Ultrasonogram',
      parameters: [
        { name: 'Liver Architecture', value: 'Normal', unit: 'Visual', referenceRange: 'Normal parenchymal echotexture', status: 'Normal' },
        { name: 'Gallbladder', value: 'Normal', unit: 'Visual', referenceRange: 'Acalculous, thin-walled', status: 'Normal' },
        { name: 'Kidneys Bilateral', value: 'Normal', unit: 'Visual', referenceRange: 'Normal corticomedullary differentiation', status: 'Normal' },
        { name: 'Spleen & Pancreas', value: 'Normal', unit: 'Visual', referenceRange: 'Normal size and echo pattern', status: 'Normal' }
      ],
      summaryNotes: 'Unremarkable whole abdomen sonogram without hepatomegaly, cholelithiasis, or nephrolithiasis.',
      timeline: [
        { title: 'Ultrasound Examination', timestamp: 'Apr 25, 02:45 PM', description: 'High-frequency sonography scan completed.', completed: true, active: false },
        { title: 'Radiology Annotation', timestamp: 'Apr 25, 03:30 PM', description: 'Images archived and report generated.', completed: true, active: false }
      ]
    },
    {
      id: 'RPT-8831',
      testName: 'Automated Urine Routine & Microscopy',
      doctor: 'Dr. Vikram Malhotra, MS',
      date: 'Apr 12, 2026',
      time: '09:00 AM',
      locationType: 'Hospital',
      locationName: 'HMS Central Pathology Wing',
      status: 'Normal',
      fileSize: '780 KB',
      category: 'Clinical Microscopy',
      labTechnician: 'Sarah Al-Mansoor, CLS',
      specimen: 'Clean Catch Midstream Urine',
      parameters: [
        { name: 'Specific Gravity', value: '1.018', unit: 'Index', referenceRange: '1.005 - 1.030', status: 'Normal' },
        { name: 'pH', value: '6.0', unit: 'pH', referenceRange: '4.5 - 8.0', status: 'Normal' },
        { name: 'Urine Protein', value: 'Nil / Negative', unit: 'mg/dL', referenceRange: 'Negative', status: 'Normal' },
        { name: 'Urine Glucose', value: 'Nil / Negative', unit: 'mg/dL', referenceRange: 'Negative', status: 'Normal' },
        { name: 'Pus Cells (WBC)', value: '1 - 2', unit: '/HPF', referenceRange: '0 - 5', status: 'Normal' }
      ],
      summaryNotes: 'Normal urinalysis profile. No protein leakage, crystalluria, or bacteriological growth detected.',
      timeline: [
        { title: 'Specimen Handed In', timestamp: 'Apr 12, 09:00 AM', description: 'Midstream sample accepted at pathology reception.', completed: true, active: false },
        { title: 'Automated Urinalysis', timestamp: 'Apr 12, 09:45 AM', description: 'Flow cytometry telemetry completed.', completed: true, active: false }
      ]
    }
  ]);

  readonly prescriptions = signal<PrescriptionItem[]>([
    {
      name: 'Coenzyme Q10 Complex',
      dosage: '100',
      frequency: 'Once Daily',
      timing: 'Morning dietary supplement',
      doctor: 'Dr. Elena Rostova',
      startDate: '01 Aug 2026',
      refillInDays: 30,
      pharmacy: 'Walgreens Community Partner Rx'
    },
    {
      name: 'Atorvastatin Calcium',
      dosage: '20',
      frequency: 'Once Daily',
      timing: 'Take at night before bed',
      doctor: 'Dr. Sarah Jenkins',
      startDate: '12 Jul 2026',
      refillInDays: 14,
      pharmacy: 'HMS Main Hospital In-House Pharmacy'
    },
    {
      name: 'Aspirin Low Dose',
      dosage: '81',
      frequency: 'Once Daily',
      timing: 'Take after breakfast with water',
      doctor: 'Dr. Sarah Jenkins',
      startDate: '15 Jun 2026',
      refillInDays: 20,
      pharmacy: 'HMS Main Hospital In-House Pharmacy'
    },
    {
      name: 'Vitamin D3 Cholecalciferol',
      dosage: '60,000 IU',
      frequency: 'Once Weekly',
      timing: 'Sunday morning with breakfast',
      doctor: 'Dr. Michael Chen',
      startDate: '05 May 2026',
      refillInDays: 45,
      pharmacy: 'HMS Main Hospital In-House Pharmacy'
    },
    {
      name: 'Telmisartan Tablets',
      dosage: '40',
      frequency: 'Once Daily',
      timing: 'Morning 30 mins before breakfast',
      doctor: 'Dr. Sarah Jenkins',
      startDate: '20 May 2026',
      refillInDays: 10,
      pharmacy: 'HMS Main Hospital In-House Pharmacy'
    },
    {
      name: 'Pantoprazole Sodium',
      dosage: '40',
      frequency: 'Once Daily',
      timing: 'Empty stomach in the morning',
      doctor: 'Dr. Karthik Reddy',
      startDate: '14 Apr 2026',
      refillInDays: 25,
      pharmacy: 'HMS Main Hospital In-House Pharmacy'
    },
    {
      name: 'Cetirizine HCl',
      dosage: '10',
      frequency: 'Once Daily',
      timing: 'At bedtime as needed',
      doctor: 'Dr. Priya Nambiar',
      startDate: '30 Mar 2026',
      refillInDays: 15,
      pharmacy: 'CVS Caremark Partner Rx'
    },
    {
      name: 'Metformin HCl',
      dosage: '500',
      frequency: 'Twice Daily',
      timing: 'With morning and evening meals',
      doctor: 'Dr. Sarah Jenkins',
      startDate: '10 Mar 2026',
      refillInDays: 12,
      pharmacy: 'HMS Main Hospital In-House Pharmacy'
    },
    {
      name: 'Omega-3 Fish Oil Concentrate',
      dosage: '1000',
      frequency: 'Once Daily',
      timing: 'With afternoon meal',
      doctor: 'Dr. Sarah Jenkins',
      startDate: '15 Feb 2026',
      refillInDays: 40,
      pharmacy: 'HMS Main Hospital In-House Pharmacy'
    },
    {
      name: 'Magnesium Glycinate',
      dosage: '400',
      frequency: 'Once Daily',
      timing: 'At night 30 mins before sleep',
      doctor: 'Dr. Michael Chen',
      startDate: '20 Jan 2026',
      refillInDays: 18,
      pharmacy: 'HMS Main Hospital In-House Pharmacy'
    },
    {
      name: 'Methylcobalamin (B12)',
      dosage: '1500 mcg',
      frequency: 'Once Daily',
      timing: 'After breakfast',
      doctor: 'Dr. Elena Rostova',
      startDate: '10 Jan 2026',
      refillInDays: 50,
      pharmacy: 'HMS Main Hospital In-House Pharmacy'
    },
    {
      name: 'Probiotic Multi-Strain',
      dosage: '50 Billion CFU',
      frequency: 'Once Daily',
      timing: 'Mid-morning with water',
      doctor: 'Dr. Karthik Reddy',
      startDate: '01 Jan 2026',
      refillInDays: 30,
      pharmacy: 'HMS Main Hospital In-House Pharmacy'
    }
  ]);

  filteredDoctors(): BookingDoctor[] {
    const selectedSpec = this.bookingForm.get('specialty')?.value;
    if (!selectedSpec) return this.doctors;
    const match = this.doctors.filter(d => d.specialty.toLowerCase() === selectedSpec.toLowerCase());
    return match.length ? match : this.doctors;
  }

  openPrescriptionModal(apt: PatientAppointment): void {
    this.selectedPrescriptionApt.set(apt);
  }

  openReceiptModal(apt: PatientAppointment): void {
    this.selectedReceiptApt.set(apt);
  }

  openLabReportModal(report: LabReport): void {
    this.selectedStatusReport.set(null);
    this.selectedLabReport.set(report);
  }

  openStatusModal(report: LabReport): void {
    this.selectedLabReport.set(null);
    this.selectedStatusReport.set(report);
  }

  closeModals(): void {
    this.selectedPrescriptionApt.set(null);
    this.selectedReceiptApt.set(null);
    this.selectedLabReport.set(null);
    this.selectedStatusReport.set(null);
  }

  printModal(): void {
    window.print();
  }

  downloadPrescriptionPdf(apt: PatientAppointment): void {
    if (!apt.prescription) return;
    const rx = apt.prescription;
    const patientName = this.patient()?.name || 'Patient';
    const patientId = this.patient()?.id || 'PT-94143';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Prescription_${rx.rxNumber}.pdf</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #0f766e; }
            .badge { display: inline-block; background: #f0fdf4; color: #166534; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; border: 1px solid #bbf7d0; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
            th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .advice-box { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; border-left: 4px solid #0d9488; }
            .footer { text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">HMS HEALTHCARE</div>
              <div style="font-size: 12px; color: #64748b;">Clinical Medical Prescription (Rx)</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: bold; color: #0f766e;">MEDICAL PRESCRIPTION</div>
              <div style="font-size: 12px; color: #64748b;">Rx #: ${rx.rxNumber}</div>
              <div style="margin-top: 5px;"><span class="badge">VALID DIGITAL RX</span></div>
            </div>
          </div>
          
          <div class="meta-grid">
            <div>
              <strong>Patient Name:</strong> ${patientName}<br>
              <strong>Patient ID:</strong> ${patientId}<br>
              <strong>Date of Issue:</strong> ${rx.date}
            </div>
            <div style="text-align: right;">
              <strong>Prescribing Doctor:</strong> ${apt.doctorName}<br>
              <strong>Specialty:</strong> ${apt.specialty}<br>
              <strong>Doctor Reg:</strong> ${rx.doctorReg}
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <strong>Primary Diagnosis:</strong> <span style="color: #0f766e;">${rx.diagnosis}</span>
          </div>

          <h3 style="font-size: 15px; margin-bottom: 10px;">Prescribed Medications (℞)</h3>
          <table>
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
                <th>Instructions</th>
              </tr>
            </thead>
            <tbody>
              ${rx.medicines.map(m => `
                <tr>
                  <td><strong>${m.name}</strong></td>
                  <td>${m.dosage}</td>
                  <td style="color: #0f766e; font-weight: bold;">${m.frequency}</td>
                  <td>${m.duration}</td>
                  <td>${m.instructions}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="advice-box">
            <strong>Clinical Advice & Instructions:</strong>
            <ul style="margin: 5px 0 0 20px; padding: 0;">
              ${rx.advice.map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-top: 20px;">
            <div><strong>Next Follow-Up:</strong> ${rx.nextFollowUp}</div>
            <div style="text-align: right;"><strong>Digital Stamp:</strong> HMS Certified Medical Practitioner ✓</div>
          </div>

          <div class="footer">
            <p>Protected by 256-bit HIPAA Electronic Health Records Encryption.</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    this.modalService.showToast('Prescription Download', `Prescription ${rx.rxNumber} generated for print/download.`, 'success');
  }

  downloadReceiptPdf(apt: PatientAppointment): void {
    if (!apt.receipt) {
      this.modalService.showToast('Receipt Unavailable', 'No receipt record found for this appointment.', 'info');
      return;
    }
    const rct = apt.receipt;
    const patientName = this.patient()?.name || 'Patient';
    const patientId = this.patient()?.id || 'PT-94143';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt_${rct.receiptNumber}.pdf</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #0f766e; }
            .badge { display: inline-block; background: #ecfdf5; color: #047857; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
            th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .totals { margin-left: auto; width: 300px; font-size: 13px; margin-bottom: 30px; }
            .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-paid { font-size: 16px; font-weight: bold; color: #0f766e; border-top: 2px solid #cbd5e1; padding-top: 8px; }
            .footer { text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">HMS HEALTHCARE</div>
              <div style="font-size: 12px; color: #64748b;">Hospital Management & Clinical Services</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: bold;">PAYMENT RECEIPT</div>
              <div style="font-size: 12px; color: #64748b;">Receipt #: ${rct.receiptNumber}</div>
              <div style="margin-top: 5px;"><span class="badge">PAID IN FULL</span></div>
            </div>
          </div>
          
          <div class="meta-grid">
            <div>
              <strong>Patient Name:</strong> ${patientName}<br>
              <strong>Patient ID:</strong> ${patientId}<br>
              <strong>Doctor:</strong> ${apt.doctorName} (${apt.specialty})
            </div>
            <div style="text-align: right;">
              <strong>Invoice Date:</strong> ${rct.invoiceDate}<br>
              <strong>Payment Method:</strong> ${rct.paymentMethod}<br>
              <strong>Transaction ID:</strong> ${rct.transactionId}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Service Description</th>
                <th>Code</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${rct.items.map(item => `
                <tr>
                  <td><strong>${item.description}</strong></td>
                  <td style="font-family: monospace;">${item.code}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row"><span>Subtotal:</span><span>₹${rct.subtotal.toFixed(2)}</span></div>
            <div class="totals-row" style="color: #059669;"><span>Insurance Coverage (${rct.insuranceCoveragePercent}%):</span><span>-₹${rct.insuranceCoveredAmount.toFixed(2)}</span></div>
            <div class="totals-row"><span>Taxes / Surcharges:</span><span>₹${rct.tax.toFixed(2)}</span></div>
            <div class="totals-row total-paid"><span>Total Paid:</span><span>₹${rct.totalPaid.toFixed(2)}</span></div>
          </div>

          <div class="footer">
            <p>Thank you for choosing HMS Healthcare. This is a computer-generated receipt requiring no physical signature.</p>
            <p>Protected by 256-bit HIPAA Electronic Health Records Encryption.</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    this.modalService.showToast('Downloading Receipt', `Receipt ${rct.receiptNumber} generated for print/download.`, 'success');
  }

  openNewAppointmentModal(): void {
    this.router.navigate(['/book-appointment']);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  getStatusBadgeClass(status: AppointmentStatus): string {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  }

  getStatusDotClass(status: AppointmentStatus): string {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500 animate-pulse';
      case 'Confirmed':
        return 'bg-emerald-500 animate-pulse';
      case 'Cancelled':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  }

  getStatusDescription(status: AppointmentStatus): string {
    switch (status) {
      case 'Pending':
        return 'Appointment request has been submitted and is waiting for confirmation.';
      case 'Confirmed':
        return 'Hospital/doctor has accepted the appointment.';
      case 'Cancelled':
        return 'Appointment was cancelled by the patient or hospital.';
      default:
        return '';
    }
  }

  cancelAppointment(aptId: string): void {
    const apt = this.appointments().find(a => a.id === aptId);
    const doctorName = apt?.doctorName || 'your doctor';

    this.modalService.confirm({
      title: 'Cancel Appointment',
      message: `Are you sure you want to cancel your scheduled appointment with ${doctorName}? This action cannot be undone.`,
      confirmText: 'Yes, Cancel Appointment',
      cancelText: 'Keep Appointment',
      type: 'danger',
      icon: 'x',
      onConfirm: () => {
        this.appointments.update(list =>
          list.map(a => a.id === aptId ? { ...a, status: 'Cancelled' as AppointmentStatus } : a)
        );
        this.modalService.showToast('Appointment Cancelled', `Your appointment with ${doctorName} has been cancelled.`, 'info');
      }
    });
  }

  onBookAppointmentSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const formVal = this.bookingForm.value;
    const selectedDoctor = this.doctors.find(d => d.id === formVal.doctorId) || this.doctors[0];

    this.modalService.confirm({
      title: 'Confirm Appointment Request',
      message: `Are you sure you want to submit an appointment booking request with ${selectedDoctor.name} for ${formVal.date || 'Tomorrow'} at ${formVal.time || '10:30 AM'}?`,
      confirmText: 'Submit Request',
      cancelText: 'Edit Details',
      type: 'primary',
      icon: 'calendar',
      onConfirm: () => {
        this.isBooking.set(true);

        setTimeout(() => {
          this.isBooking.set(false);
          
          const newApt: PatientAppointment = {
            id: `APT-${Math.floor(100 + Math.random() * 900)}`,
            doctorName: selectedDoctor.name,
            doctorDegree: selectedDoctor.degree,
            specialty: selectedDoctor.specialty,
            avatar: selectedDoctor.avatar,
            cause: formVal.symptoms ? formVal.symptoms : `${selectedDoctor.specialty} Consultation & Comprehensive Evaluation`,
            date: formVal.date || 'Tomorrow',
            time: formVal.time || '10:30 AM - 11:15 AM',
            room: formVal.type === 'Telehealth Video' ? 'Virtual HD Room 1' : 'Specialist Outpatient Clinic #204',
            type: (formVal.type as any) || 'In-Person',
            status: 'Pending',
            prescription: {
              rxNumber: `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              date: formVal.date || 'Aug 22, 2026',
              doctorReg: 'MED-HMS-0091',
              diagnosis: `${selectedDoctor.specialty} Clinical Review & Preventative Health Plan`,
              clinicalNotes: 'Initial patient diagnostic assessment complete. Follow prescribed regimen.',
              medicines: [
                {
                  name: 'Multivitamin & Mineral Complex',
                  dosage: '1 Tab',
                  frequency: '1-0-0 (Morning)',
                  duration: '30 Days',
                  instructions: 'Take after breakfast'
                }
              ],
              advice: [
                'Follow general wellness lifestyle guidelines.',
                'Report any persistent symptoms to hospital helpline.'
              ],
              nextFollowUp: 'In 30 Days'
            },
            receipt: {
              receiptNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              invoiceDate: `${formVal.date || 'Today'}, 10:30 AM`,
              paymentStatus: 'PAID',
              paymentMethod: 'Insurance Direct Billing',
              transactionId: `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`,
              items: [
                { description: `Specialist Consultation Fee (${selectedDoctor.name})`, code: 'CPT-99214', quantity: 1, price: 150.00 },
                { description: 'Digital Electronic Records Registration', code: 'ADM-101', quantity: 1, price: 20.00 }
              ],
              subtotal: 170.00,
              insuranceCoveragePercent: 80,
              insuranceCoveredAmount: 136.00,
              copayAmount: 34.00,
              tax: 0.00,
              totalPaid: 34.00
            }
          };

          this.appointments.update(list => [newApt, ...list]);
          this.modalService.showToast('Appointment Request Submitted!', `Appointment request has been submitted and is waiting for confirmation.`, 'info');
          
          // Automatically switch to 'My Appointments' to review the booking!
          this.activeTab.set('my-appointments');
        }, 700);
      }
    });
  }

  downloadReport(report: LabReport): void {
    const patientName = this.patient()?.name || 'Patient';
    const patientId = this.patient()?.id || 'PT-94143';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>LabReport_${report.id}.pdf</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #0f766e; }
            .badge { display: inline-block; background: #ecfdf5; color: #047857; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; border: 1px solid #a7f3d0; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
            th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .summary-box { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; color: #064e3b; }
            .footer { text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">HMS HEALTHCARE</div>
              <div style="font-size: 12px; color: #64748b;">Clinical Diagnostic Laboratory Services</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: bold; color: #0f766e;">DIAGNOSTIC LAB REPORT</div>
              <div style="font-size: 12px; color: #64748b;">Report ID: ${report.id}</div>
              <div style="margin-top: 5px;"><span class="badge">${report.status}</span></div>
            </div>
          </div>
          
          <div class="meta-grid">
            <div>
              <strong>Patient Name:</strong> ${patientName}<br>
              <strong>Patient ID:</strong> ${patientId}<br>
              <strong>Sample Collection:</strong> ${report.date} at ${report.time}<br>
              <strong>Specimen:</strong> ${report.specimen}
            </div>
            <div style="text-align: right;">
              <strong>Ordered by:</strong> ${report.doctor}<br>
              <strong>Lab Facility:</strong> ${report.locationName} (${report.locationType})<br>
              <strong>Technician:</strong> ${report.labTechnician}<br>
              <strong>Category:</strong> ${report.category}
            </div>
          </div>

          <h3 style="font-size: 15px; margin-bottom: 10px;">Test Telemetry Parameters: ${report.testName}</h3>
          <table>
            <thead>
              <tr>
                <th>Parameter Name</th>
                <th>Result Value</th>
                <th>Units</th>
                <th>Reference Range</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${report.parameters.map(p => `
                <tr>
                  <td><strong>${p.name}</strong></td>
                  <td><strong>${p.value}</strong></td>
                  <td style="font-family: monospace; color: #64748b;">${p.unit}</td>
                  <td>${p.referenceRange}</td>
                  <td style="text-align: center;"><span style="color: #047857; font-weight: bold;">${p.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="summary-box">
            <strong>Pathologist Clinical Interpretation:</strong>
            <p style="margin: 5px 0 0 0;">${report.summaryNotes}</p>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-top: 20px;">
            <div><strong>Verification Status:</strong> Certified Electronic Record</div>
            <div style="text-align: right;"><strong>Supervised by:</strong> ${report.doctor} ✓</div>
          </div>

          <div class="footer">
            <p>This is an authenticated diagnostic telemetry report generated from the HMS Clinical Pathology Information System.</p>
            <p>Protected by 256-bit HIPAA Electronic Health Records Encryption.</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    this.modalService.showToast('Report Download', `Diagnostic report ${report.id} generated for print/download.`, 'success');
  }

  downloadLabReceipt(report: LabReport): void {
    const patientName = this.patient()?.name || 'Patient';
    const patientId = this.patient()?.id || 'PT-94143';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptNum = `LAB-INV-${report.id.replace('RPT-', '')}`;
    const testCost = 85.00;
    const handlingFee = 15.00;
    const subtotal = testCost + handlingFee;
    const insurancePercent = 80;
    const coveredAmount = (subtotal * insurancePercent) / 100;
    const copayAmount = subtotal - coveredAmount;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>LabReceipt_${receiptNum}.pdf</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #0f766e; }
            .badge { display: inline-block; background: #ecfdf5; color: #047857; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
            th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; }
            td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
            .totals { margin-left: auto; width: 300px; font-size: 13px; margin-bottom: 30px; }
            .totals-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-paid { font-size: 16px; font-weight: bold; color: #0f766e; border-top: 2px solid #cbd5e1; padding-top: 8px; }
            .footer { text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">HMS HEALTHCARE</div>
              <div style="font-size: 12px; color: #64748b;">Diagnostic Pathology & Laboratory Services</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: bold; color: #0f766e;">DIAGNOSTIC PAYMENT RECEIPT</div>
              <div style="font-size: 12px; color: #64748b;">Receipt #: ${receiptNum}</div>
              <div style="margin-top: 5px;"><span class="badge">PAID IN FULL</span></div>
            </div>
          </div>
          
          <div class="meta-grid">
            <div>
              <strong>Patient Name:</strong> ${patientName}<br>
              <strong>Patient ID:</strong> ${patientId}<br>
              <strong>Ordered By:</strong> ${report.doctor}<br>
              <strong>Lab ID:</strong> ${report.id}
            </div>
            <div style="text-align: right;">
              <strong>Date of Service:</strong> ${report.date}, ${report.time}<br>
              <strong>Facility:</strong> ${report.locationName} (${report.locationType})<br>
              <strong>Payment Method:</strong> Cashless Healthcare Card<br>
              <strong>Status:</strong> Completed & Verified
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Diagnostic Service Description</th>
                <th>Service Code</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${report.testName}</strong><br><small style="color: #64748b;">Specimen: ${report.specimen} • ${report.category}</small></td>
                <td style="font-family: monospace;">LAB-${report.id}</td>
                <td style="text-align: center;">1</td>
                <td style="text-align: right;">₹${testCost.toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Phlebotomy, Specimen Handling & Telemetry Processing</strong></td>
                <td style="font-family: monospace;">LAB-FEE-01</td>
                <td style="text-align: center;">1</td>
                <td style="text-align: right;">₹${handlingFee.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row"><span>Subtotal:</span><span>₹${subtotal.toFixed(2)}</span></div>
            <div class="totals-row" style="color: #059669;"><span>Insurance Coverage (${insurancePercent}%):</span><span>-₹${coveredAmount.toFixed(2)}</span></div>
            <div class="totals-row"><span>Taxes / Fees:</span><span>₹0.00</span></div>
            <div class="totals-row total-paid"><span>Total Paid:</span><span>₹${copayAmount.toFixed(2)}</span></div>
          </div>

          <div class="footer">
            <p>Thank you for choosing HMS Healthcare Diagnostic Services. Computer-generated official laboratory billing record.</p>
            <p>Protected by 256-bit HIPAA Electronic Health Records Encryption.</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    this.modalService.showToast('Downloading Receipt', `Diagnostic receipt ${receiptNum} generated for print/download.`, 'success');
  }

  requestRefill(med: PrescriptionItem): void {
    this.modalService.showToast('Refill Requested', `Electronic refill request sent to ${med.pharmacy} for ${med.name}.`, 'success');
  }

  onLogout(): void {
    this.modalService.confirm({
      title: 'Confirm Logout',
      message: 'Are you sure you want to end your patient portal session and log out?',
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

