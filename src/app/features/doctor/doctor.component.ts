import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { IconComponent } from '../../shared/icons/icon.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import {
  MOCK_REGISTERED_PATIENTS,
  RegisteredPatient,
  PatientVitals,
  PatientPreviousVisit,
  PatientHealthRecord,
  PrescriptionDetails,
  PrescriptionMedicine,
  PatientMedication,
  ReceiptDetails,
  MasterMedicine,
  MOCK_MEDICINE_CATALOG
} from '../../core/models/patient.model';

type DoctorLeftTab = 'clinical' | 'medications' | 'prescriptions' | 'records';
type PatientModalTab = 'personal' | 'clinical' | 'medications' | 'visits' | 'records';
type DoctorNavTab = 'consult' | 'schedule';

export interface DoctorScheduleSlot {
  id: string;
  dayIndex: number; // 0 = Mon, 1 = Tue, 2 = Wed, 3 = Thu, 4 = Fri, 5 = Sat
  dateStr: string;
  dayName: string;
  dayDate: string;
  startTime: string;
  endTime: string;
  startHour: number;
  durationHours: number;
  type: 'patient' | 'break' | 'rounds';
  title: string;
  patientId?: string;
  patientName?: string;
  tokenNumber?: string;
  phone?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  consultationType?: string;
  room?: string;
  status?: 'WAITING' | 'CONSULTING' | 'CONFIRMED' | 'COMPLETED' | 'SCHEDULED';
  notes?: string;
}

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, IconComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-screen w-full bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-teal-500 selection:text-white relative overflow-hidden">
      
      <!-- TOP NAVIGATION BAR (EXACT SAME AS NURSE PORTAL) -->
      <header class="h-16 w-full shrink-0 border-b border-slate-200 bg-white shadow-2xs z-40 sticky top-0">
        <div class="max-w-7xl mx-auto w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          <!-- Left: Brand Logo & Tag -->
          <a routerLink="/" class="flex items-center gap-2.5 group cursor-pointer shrink-0" aria-label="HMS Home">
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

          <!-- Right Side: Doctor Profile Badge & Logout -->
          <div class="flex items-center gap-2 sm:gap-3 shrink-0">
            <div class="flex items-center gap-2 bg-slate-100/90 border border-slate-200 rounded-full py-1 pl-1.5 pr-3">
              <app-avatar [name]="doctor()?.name || 'Dr. Sarah Johnson'" sizeClass="w-7 h-7 rounded-full" />
              <div class="flex flex-col text-left hidden sm:flex">
                <span class="text-xs font-bold text-slate-800 leading-tight">
                  {{ doctor()?.name || 'Dr. Sarah Johnson' }}
                </span>
                <span class="text-xs text-emerald-700 font-medium leading-none">
                  Doctor ({{ doctor()?.id || 'DOC-8841' }})
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
          class="group/sidebar h-full w-16 hover:w-64 bg-white border-r border-slate-200 shadow-xs flex flex-col z-30 transition-[width] duration-300 ease-in-out shrink-0 select-none overflow-hidden px-2.5 pt-4 pb-4"
        >
          <!-- Navigation Menu List: Consult, Schedule -->
          <nav class="space-y-2">
            
            <!-- 1. Consult -->
            <button 
              type="button" 
              (click)="doctorNavTab.set('consult')"
              class="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer group/btn"
              [class]="doctorNavTab() === 'consult' 
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'"
            >
              <div class="w-5 h-5 flex items-center justify-center shrink-0">
                <app-icon 
                  name="stethoscope" 
                  [wrapperClass]="doctorNavTab() === 'consult' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-500 group-hover/btn:text-teal-600 transition-colors'" 
                />
              </div>
              <span class="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
                Consult
              </span>
            </button>

            <!-- 2. Schedule -->
            <button 
              type="button" 
              (click)="doctorNavTab.set('schedule')"
              class="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer group/btn"
              [class]="doctorNavTab() === 'schedule' 
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'"
            >
              <div class="w-5 h-5 flex items-center justify-center shrink-0">
                <app-icon 
                  name="calendar" 
                  [wrapperClass]="doctorNavTab() === 'schedule' ? 'w-5 h-5 text-white' : 'w-5 h-5 text-slate-500 group-hover/btn:text-teal-600 transition-colors'" 
                />
              </div>
              <span class="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
                Schedule
              </span>
            </button>

          </nav>

        </aside>

        <!-- ============================================================= -->
        <!-- SECTION 2 (RIGHT): MAIN CONTENT SECTION (SCROLLABLE) -->
        <!-- ============================================================= -->
        <div class="flex-1 flex flex-col h-full overflow-hidden">
          
          <!-- CONSULT TAB (Current Consultation Page with Universal Search & Patient Details) -->
          @if (doctorNavTab() === 'consult') {
            <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5">
              <div class="max-w-7xl mx-auto space-y-5">
                
                <!-- 1. UNIVERSAL PATIENT SEARCH -->
                <div class="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs relative z-30">
          <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            
            <!-- Doctor Icon & Title -->
            <div class="flex items-center gap-2.5 shrink-0">
              <div class="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center">
                <app-icon name="stethoscope" wrapperClass="w-4 h-4" />
              </div>
              <div>
                <h2 class="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  Doctor
                </h2>
                <span class="text-xs font-medium text-slate-500 leading-none">Cardiology & Clinical Care</span>
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

        <!-- 2. PATIENT DETAILS PANEL WITH TABS (CLINICAL DATA, MEDICATIONS, PRESCRIPTIONS, HEALTH RECORDS) -->
        <div class="w-full bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5 animate-fade-in">
            
            @if (activePatient()) {
              <!-- Patient Header Summary -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-100">
                <div class="flex items-center gap-3.5">
                  <!-- Squircle Avatar with Initials -->
                  <div class="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#005f54] text-white font-bold text-lg flex items-center justify-center shadow-xs shrink-0">
                    {{ getInitials(activePatient()!.name) }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                        {{ activePatient()!.name }}
                      </h2>
                      <span class="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-teal-50 text-teal-800 border border-teal-200">
                        {{ activePatient()!.id }}
                      </span>
                      <span class="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-teal-50 text-teal-800 border border-teal-200">
                        Token: {{ activePatient()!.tokenNumber || 'T-102' }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-500 mt-1">
                      {{ activePatient()!.gender }}, {{ activePatient()!.age }} yrs • Blood: <strong class="text-slate-900 font-bold">{{ activePatient()!.bloodGroup }}</strong> • Primary: <strong class="text-slate-800 font-medium">{{ activePatient()!.primaryPhysician }}</strong>
                    </p>
                  </div>
                </div>

                <!-- Header Action Buttons: Prescribe & Full 360° Profile -->
                <div class="flex items-center gap-2.5 shrink-0">
                  <button 
                    type="button" 
                    (click)="openPrescribeModal()"
                    class="px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <app-icon name="plus" wrapperClass="w-3.5 h-3.5 text-white" />
                    <span>Prescribe</span>
                  </button>

                  <button 
                    type="button" 
                    (click)="openPatientDetailsModal(activePatient()!)"
                    class="px-4 py-2 rounded-2xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
                  >
                    <app-icon name="user" wrapperClass="w-4 h-4 text-teal-700" />
                    <span>Full 360° Profile</span>
                  </button>
                </div>
              </div>

              <!-- HORIZONTAL UNDERLINE TAB STRIP (SPACE-AROUND EVEN DISTRIBUTION) -->
              <div class="flex items-center justify-around border-b border-slate-200 px-1 overflow-x-auto select-none w-full gap-2 relative">
                <button 
                  type="button" 
                  (click)="leftPanelTab.set('clinical')"
                  class="relative pb-3.5 font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap px-3 sm:px-5 text-center flex flex-col items-center group"
                  [class]="leftPanelTab() === 'clinical' 
                    ? 'text-teal-800 font-bold' 
                    : 'text-slate-600 hover:text-slate-900'"
                >
                  <span>Clinical Data</span>
                  @if (leftPanelTab() === 'clinical') {
                    <span class="absolute bottom-0 left-0 right-0 h-0.75 bg-teal-600 rounded-t-full shadow-xs"></span>
                  }
                </button>

                <button 
                  type="button" 
                  (click)="leftPanelTab.set('medications')"
                  class="relative pb-3.5 font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap px-3 sm:px-5 text-center flex flex-col items-center group"
                  [class]="leftPanelTab() === 'medications' 
                    ? 'text-teal-800 font-bold' 
                    : 'text-slate-600 hover:text-slate-900'"
                >
                  <span>Current Medications</span>
                  @if (leftPanelTab() === 'medications') {
                    <span class="absolute bottom-0 left-0 right-0 h-0.75 bg-teal-600 rounded-t-full shadow-xs"></span>
                  }
                </button>

                <button 
                  type="button" 
                  (click)="leftPanelTab.set('prescriptions')"
                  class="relative pb-3.5 font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap px-3 sm:px-5 text-center flex flex-col items-center group"
                  [class]="leftPanelTab() === 'prescriptions' 
                    ? 'text-teal-800 font-bold' 
                    : 'text-slate-600 hover:text-slate-900'"
                >
                  <span>Prescriptions</span>
                  @if (leftPanelTab() === 'prescriptions') {
                    <span class="absolute bottom-0 left-0 right-0 h-0.75 bg-teal-600 rounded-t-full shadow-xs"></span>
                  }
                </button>

                <button 
                  type="button" 
                  (click)="leftPanelTab.set('records')"
                  class="relative pb-3.5 font-semibold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap px-3 sm:px-5 text-center flex flex-col items-center group"
                  [class]="leftPanelTab() === 'records' 
                    ? 'text-teal-800 font-bold' 
                    : 'text-slate-600 hover:text-slate-900'"
                >
                  <span>Health Records</span>
                  @if (leftPanelTab() === 'records') {
                    <span class="absolute bottom-0 left-0 right-0 h-0.75 bg-teal-600 rounded-t-full shadow-xs"></span>
                  }
                </button>
              </div>

              <!-- TAB 1: CLINICAL DATA (3 SUB-TABS: RECENT VITALS, ALLERGIES, CHRONICS) -->
              @if (leftPanelTab() === 'clinical') {
                <div class="space-y-4 animate-fade-in">
                  
                  <!-- SUB-TAB NAVIGATION BAR (CENTERED) -->
                  <div class="flex items-center justify-center p-2 bg-slate-50 rounded-2xl border border-slate-200/80 w-full">
                    <div class="flex items-center justify-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                      <!-- 1. Recent Vitals Sub-tab -->
                      <button
                        type="button"
                        (click)="clinicalDataSubTab.set('vitals')"
                        class="px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                        [class]="clinicalDataSubTab() === 'vitals' 
                          ? 'bg-teal-600 text-white shadow-xs' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
                      >
                        <app-icon name="activity" wrapperClass="w-3.5 h-3.5" />
                        <span>Recent Vitals</span>
                      </button>

                      <!-- 2. Allergies Sub-tab -->
                      <button
                        type="button"
                        (click)="clinicalDataSubTab.set('allergies')"
                        class="px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                        [class]="clinicalDataSubTab() === 'allergies' 
                          ? 'bg-teal-600 text-white shadow-xs' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
                      >
                        <app-icon name="shield-check" wrapperClass="w-3.5 h-3.5" />
                        <span>Allergies</span>
                        <span 
                          class="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
                          [class]="clinicalDataSubTab() === 'allergies' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'"
                        >
                          {{ (activePatient()?.allergies || []).length }}
                        </span>
                      </button>

                      <!-- 3. Chronics Sub-tab -->
                      <button
                        type="button"
                        (click)="clinicalDataSubTab.set('chronics')"
                        class="px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                        [class]="clinicalDataSubTab() === 'chronics' 
                          ? 'bg-teal-600 text-white shadow-xs' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
                      >
                        <app-icon name="file-text" wrapperClass="w-3.5 h-3.5" />
                        <span>Chronics</span>
                        <span 
                          class="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
                          [class]="clinicalDataSubTab() === 'chronics' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'"
                        >
                          {{ (activePatient()?.chronicConditionsList || []).length }}
                        </span>
                      </button>
                    </div>
                  </div>

                  <!-- SUB-TAB 1 DETAILS: RECENT VITALS -->
                  @if (clinicalDataSubTab() === 'vitals') {
                    <div class="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 animate-fade-in">
                      <!-- Card Header -->
                      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div class="flex items-center gap-2.5">
                          <div class="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                            <app-icon name="activity" wrapperClass="w-4 h-4 text-teal-600" />
                          </div>
                          <div>
                            <h3 class="text-sm font-bold text-slate-900 tracking-tight">Recent Vitals & Biometrics</h3>
                            <p class="text-[11px] text-slate-500">Baseline patient metrics recorded at triage</p>
                          </div>
                        </div>
                        <span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/80">
                          Recorded: {{ activePatient()?.vitals?.recordedAt || 'Today, 09:00 AM' }}
                        </span>
                      </div>

                      <!-- Vitals Grid (2 or 3 Rows Grid based on screen size) -->
                      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                        <!-- Blood Pressure -->
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-50/60 transition flex flex-col justify-between">
                          <div class="flex items-center justify-between text-slate-500 mb-1.5">
                            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Blood Pressure</span>
                            <app-icon name="heart-cross" wrapperClass="w-4 h-4 text-teal-600" />
                          </div>
                          <div class="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                            {{ activePatient()?.vitals?.bp || '120/80 mmHg' }}
                          </div>
                          <div class="mt-2">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-teal-50 text-teal-800 border border-teal-200">
                              Optimal
                            </span>
                          </div>
                        </div>

                        <!-- Pulse Rate -->
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-50/60 transition flex flex-col justify-between">
                          <div class="flex items-center justify-between text-slate-500 mb-1.5">
                            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Pulse Rate</span>
                            <app-icon name="activity" wrapperClass="w-4 h-4 text-teal-600" />
                          </div>
                          <div class="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                            {{ activePatient()?.vitals?.pulse || '72 bpm' }}
                          </div>
                          <div class="mt-2">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-teal-50 text-teal-800 border border-teal-200">
                              Normal Sinus
                            </span>
                          </div>
                        </div>

                        <!-- SpO2 -->
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-50/60 transition flex flex-col justify-between">
                          <div class="flex items-center justify-between text-slate-500 mb-1.5">
                            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Blood Oxygen (SpO2)</span>
                            <app-icon name="check-circle" wrapperClass="w-4 h-4 text-teal-600" />
                          </div>
                          <div class="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                            {{ activePatient()?.vitals?.spo2 || '98%' }}
                          </div>
                          <div class="mt-2">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-teal-50 text-teal-800 border border-teal-200">
                              Room Air
                            </span>
                          </div>
                        </div>

                        <!-- Blood Glucose -->
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-50/60 transition flex flex-col justify-between">
                          <div class="flex items-center justify-between text-slate-500 mb-1.5">
                            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Blood Glucose</span>
                            <app-icon name="activity" wrapperClass="w-4 h-4 text-teal-600" />
                          </div>
                          <div class="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                            {{ activePatient()?.vitals?.bloodSugar || '105 mg/dL' }}
                          </div>
                          <div class="mt-2">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-teal-50 text-teal-800 border border-teal-200">
                              Normoglycemic
                            </span>
                          </div>
                        </div>

                        <!-- Body Temperature -->
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-50/60 transition flex flex-col justify-between">
                          <div class="flex items-center justify-between text-slate-500 mb-1.5">
                            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Body Temp</span>
                            <app-icon name="activity" wrapperClass="w-4 h-4 text-teal-600" />
                          </div>
                          <div class="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                            {{ activePatient()?.vitals?.temp || '98.4 °F' }}
                          </div>
                          <div class="mt-2">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-teal-50 text-teal-800 border border-teal-200">
                              Afebrile
                            </span>
                          </div>
                        </div>

                        <!-- Weight & BMI -->
                        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-50/60 transition flex flex-col justify-between">
                          <div class="flex items-center justify-between text-slate-500 mb-1.5">
                            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Weight & BMI</span>
                            <app-icon name="user" wrapperClass="w-4 h-4 text-teal-600" />
                          </div>
                          <div class="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                            {{ activePatient()?.vitals?.weight || '78 kg' }}
                          </div>
                          <div class="mt-2">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-teal-50 text-teal-800 border border-teal-200">
                              BMI: {{ activePatient()?.vitals?.bmi || '24.1' }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- Clinical Observations Box -->
                      <div class="p-3.5 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center justify-between gap-3 text-xs flex-wrap">
                        <div class="flex items-center gap-2 text-teal-900">
                          <span class="font-bold">Respiratory Rate:</span>
                          <span>16 breaths/min (Regular)</span>
                        </div>
                        <div class="flex items-center gap-2 text-teal-900">
                          <span class="font-bold">Pain Score:</span>
                          <span class="px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold text-[11px]">0 / 10 (No Pain)</span>
                        </div>
                        <div class="flex items-center gap-2 text-teal-900">
                          <span class="font-bold">Consciousness:</span>
                          <span>Alert & Oriented x 3 (GCS 15/15)</span>
                        </div>
                      </div>
                    </div>
                  }

                  <!-- SUB-TAB 2 DETAILS: ALLERGIES (DATA TABLE SORTED BY MOST RECENT DATE) -->
                  @if (clinicalDataSubTab() === 'allergies') {
                    <div class="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xs animate-fade-in">
                      <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs sm:text-sm">
                          <thead class="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[11px] text-slate-700">
                            <tr>
                              <th class="p-3.5">Allergen</th>
                              <th class="p-3.5">Severity</th>
                              <th class="p-3.5">Clinical Reaction</th>
                              <th class="p-3.5 whitespace-nowrap">Diagnosed Date</th>
                              <th class="p-3.5">Status</th>
                              <th class="p-3.5 whitespace-nowrap">Diagnosed By</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-slate-100">
                            @for (al of paginatedActiveAllergies(); track al.allergen) {
                              <tr class="hover:bg-slate-50/80 transition-colors">
                                <td class="p-3.5 font-bold text-slate-900">
                                  {{ al.allergen }}
                                </td>
                                <td class="p-3.5">
                                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                                    {{ al.severity }}
                                  </span>
                                </td>
                                <td class="p-3.5 text-slate-700 font-medium max-w-xs">
                                  {{ al.reaction }}
                                </td>
                                <td class="p-3.5 font-semibold text-slate-900 whitespace-nowrap">
                                  {{ al.diagnosedDate || 'N/A' }}
                                </td>
                                <td class="p-3.5 whitespace-nowrap">
                                  <span class="font-semibold text-slate-800">{{ al.status || 'Active' }}</span>
                                </td>
                                <td class="p-3.5 text-slate-600 text-xs whitespace-nowrap">
                                  {{ al.diagnosedBy || 'HMS Specialist' }}
                                </td>
                              </tr>
                            } @empty {
                              <tr>
                                <td colspan="6" class="p-8 text-center text-xs text-slate-500 font-medium">
                                  No known allergies documented for this patient.
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>

                      <!-- Pagination: Allergies -->
                      <div class="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                        <span>Showing {{ sortedActivePatientAllergies().length === 0 ? 0 : (activeAllergiesPage() - 1) * 5 + 1 }} to {{ Math.min(activeAllergiesPage() * 5, sortedActivePatientAllergies().length) }} of {{ sortedActivePatientAllergies().length }} items</span>
                        <div class="flex items-center gap-1">
                          <button type="button" (click)="activeAllergiesPage.set(1)" [disabled]="activeAllergiesPage() === 1" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">«</button>
                          <button type="button" (click)="activeAllergiesPage.update(p => Math.max(1, p - 1))" [disabled]="activeAllergiesPage() === 1" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">‹</button>
                          <span class="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-bold">{{ activeAllergiesPage() }} / {{ totalActiveAllergiesPages() }}</span>
                          <button type="button" (click)="activeAllergiesPage.update(p => Math.min(totalActiveAllergiesPages(), p + 1))" [disabled]="activeAllergiesPage() === totalActiveAllergiesPages()" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">›</button>
                          <button type="button" (click)="activeAllergiesPage.set(totalActiveAllergiesPages())" [disabled]="activeAllergiesPage() === totalActiveAllergiesPages()" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">»</button>
                        </div>
                      </div>
                    </div>
                  }

                  <!-- SUB-TAB 3 DETAILS: CHRONICS (DATA TABLE SORTED BY MOST RECENT DATE) -->
                  @if (clinicalDataSubTab() === 'chronics') {
                    <div class="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xs animate-fade-in">
                      <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs sm:text-sm">
                          <thead class="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[11px] text-slate-700">
                            <tr>
                              <th class="p-3.5">Condition</th>
                              <th class="p-3.5 whitespace-nowrap">Diagnosed Date</th>
                              <th class="p-3.5 whitespace-nowrap">Severity / Stage</th>
                              <th class="p-3.5">Status</th>
                              <th class="p-3.5">Clinical Notes & Management</th>
                              <th class="p-3.5 whitespace-nowrap">Managing Physician</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-slate-100">
                            @for (cc of paginatedActiveChronics(); track cc.condition) {
                              <tr class="hover:bg-slate-50/80 transition-colors">
                                <td class="p-3.5 font-bold text-slate-900">
                                  {{ cc.condition }}
                                </td>
                                <td class="p-3.5 font-semibold text-slate-900 whitespace-nowrap">
                                  {{ cc.diagnosedDate }}
                                </td>
                                <td class="p-3.5 text-slate-700 font-medium whitespace-nowrap">
                                  {{ cc.severity || 'Moderate' }}
                                </td>
                                <td class="p-3.5 whitespace-nowrap">
                                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                                    {{ cc.status }}
                                  </span>
                                </td>
                                <td class="p-3.5 text-xs text-slate-700 max-w-sm">
                                  {{ cc.notes || 'No specific clinical notes documented.' }}
                                </td>
                                <td class="p-3.5 text-slate-600 text-xs whitespace-nowrap">
                                  {{ cc.doctor || 'Dr. Clara Reynolds, MD' }}
                                </td>
                              </tr>
                            } @empty {
                              <tr>
                                <td colspan="6" class="p-8 text-center text-xs text-slate-500 font-medium">
                                  No chronic conditions documented for this patient.
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>

                      <!-- Pagination: Chronics -->
                      <div class="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                        <span>Showing {{ sortedActivePatientChronics().length === 0 ? 0 : (activeChronicsPage() - 1) * 5 + 1 }} to {{ Math.min(activeChronicsPage() * 5, sortedActivePatientChronics().length) }} of {{ sortedActivePatientChronics().length }} items</span>
                        <div class="flex items-center gap-1">
                          <button type="button" (click)="activeChronicsPage.set(1)" [disabled]="activeChronicsPage() === 1" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">«</button>
                          <button type="button" (click)="activeChronicsPage.update(p => Math.max(1, p - 1))" [disabled]="activeChronicsPage() === 1" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">‹</button>
                          <span class="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-bold">{{ activeChronicsPage() }} / {{ totalActiveChronicsPages() }}</span>
                          <button type="button" (click)="activeChronicsPage.update(p => Math.min(totalActiveChronicsPages(), p + 1))" [disabled]="activeChronicsPage() === totalActiveChronicsPages()" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">›</button>
                          <button type="button" (click)="activeChronicsPage.set(totalActiveChronicsPages())" [disabled]="activeChronicsPage() === totalActiveChronicsPages()" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">»</button>
                        </div>
                      </div>
                    </div>
                  }

                </div>
              }

              <!-- TAB 2: CURRENT MEDICATIONS IN TABLE -->
              @if (leftPanelTab() === 'medications') {
                <div class="space-y-3 animate-fade-in">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Prescriptions & Current Medications</span>
                    <span class="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                      {{ (activePatient()?.currentMedications || []).length }} Medications
                    </span>
                  </div>

                  <div class="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xs">
                    <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                            <th class="py-3 px-4">Medication</th>
                            <th class="py-3 px-4">Daily Dosage & Timing</th>
                            <th class="py-3 px-4">Prescribed By</th>
                            <th class="py-3 px-4 whitespace-nowrap">Start Date</th>
                            <th class="py-3 px-4 whitespace-nowrap">Refills & Pharmacy</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-800">
                          @for (med of paginatedActiveMedications(); track med.name) {
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
                              <td class="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                                <span class="font-semibold text-slate-800">{{ med.refillsRemaining }} refills</span> • {{ med.pharmacy }}
                              </td>
                            </tr>
                          } @empty {
                            <tr>
                              <td colspan="5" class="py-8 text-center text-slate-500 text-xs">
                                No active medications documented for this patient.
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>

                    <!-- Pagination: Medications -->
                    <div class="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                      <span>Showing {{ (activePatient()?.currentMedications || []).length === 0 ? 0 : (activeMedicationsPage() - 1) * 5 + 1 }} to {{ Math.min(activeMedicationsPage() * 5, (activePatient()?.currentMedications || []).length) }} of {{ (activePatient()?.currentMedications || []).length }} items</span>
                      <div class="flex items-center gap-1">
                        <button type="button" (click)="activeMedicationsPage.set(1)" [disabled]="activeMedicationsPage() === 1" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">«</button>
                        <button type="button" (click)="activeMedicationsPage.update(p => Math.max(1, p - 1))" [disabled]="activeMedicationsPage() === 1" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">‹</button>
                        <span class="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-bold">{{ activeMedicationsPage() }} / {{ totalActiveMedicationsPages() }}</span>
                        <button type="button" (click)="activeMedicationsPage.update(p => Math.min(totalActiveMedicationsPages(), p + 1))" [disabled]="activeMedicationsPage() === totalActiveMedicationsPages()" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">›</button>
                        <button type="button" (click)="activeMedicationsPage.set(totalActiveMedicationsPages())" [disabled]="activeMedicationsPage() === totalActiveMedicationsPages()" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">»</button>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- TAB 3: PREVIOUS PRESCRIPTIONS IN TABLE -->
              @if (leftPanelTab() === 'prescriptions') {
                <div class="space-y-3 animate-fade-in">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Consultation Visits & Issued Prescriptions</span>
                    <span class="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                      {{ (activePatient()?.previousVisits || []).length }} Visits
                    </span>
                  </div>

                  <div class="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xs">
                    <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                            <th class="py-3 px-4 whitespace-nowrap">Visit Date & Slot</th>
                            <th class="py-3 px-4">Diagnosis & Clinical Findings</th>
                            <th class="py-3 px-4">Attending Doctor</th>
                            <th class="py-3 px-4">Prescribed Medicines</th>
                            <th class="py-3 px-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-800">
                          @for (visit of paginatedActivePrescriptions(); track visit.id) {
                            <tr class="hover:bg-teal-50/30 transition-colors">
                              <td class="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                                <div>{{ visit.date }}</div>
                                <div class="text-xs text-slate-500 font-normal">{{ visit.timeSlot || '10:00 AM' }}</div>
                              </td>
                              <td class="py-3.5 px-4">
                                <div class="font-bold text-slate-900">{{ visit.diagnosis }}</div>
                                @if (visit.prescription?.clinicalNotes) {
                                  <div class="text-xs text-slate-500 mt-0.5">{{ visit.prescription?.clinicalNotes }}</div>
                                }
                              </td>
                              <td class="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                                <div>{{ visit.doctorName }}</div>
                                <div class="text-xs text-slate-500 font-normal">{{ visit.specialty }} • {{ visit.room }}</div>
                              </td>
                              <td class="py-3.5 px-4 text-slate-700 text-xs">
                                @if (visit.prescription?.medicines && visit.prescription!.medicines.length > 0) {
                                  <div class="space-y-1">
                                    @for (m of visit.prescription!.medicines; track m.name) {
                                      <div class="font-medium text-slate-900">• {{ m.name }} ({{ m.dosage }})</div>
                                    }
                                  </div>
                                } @else {
                                  <span class="text-slate-400">Routine examination</span>
                                }
                              </td>
                              <td class="py-3.5 px-4 text-center whitespace-nowrap">
                                @if (visit.prescription) {
                                  <button 
                                    type="button" 
                                    (click)="openVisitPrescription(visit, activePatient()!)"
                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 hover:border-teal-600 font-bold text-xs transition cursor-pointer shadow-2xs"
                                  >
                                    <app-icon name="file-text" wrapperClass="w-3.5 h-3.5" />
                                    <span>View Rx</span>
                                  </button>
                                } @else {
                                  <span class="text-xs text-slate-400">N/A</span>
                                }
                              </td>
                            </tr>
                          } @empty {
                            <tr>
                              <td colspan="5" class="py-8 text-center text-slate-500 text-xs">
                                No prior prescriptions recorded for this patient.
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>

                    <!-- Pagination: Prescriptions -->
                    <div class="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                      <span>Showing {{ (activePatient()?.previousVisits || []).length === 0 ? 0 : (activePrescriptionsPage() - 1) * 5 + 1 }} to {{ Math.min(activePrescriptionsPage() * 5, (activePatient()?.previousVisits || []).length) }} of {{ (activePatient()?.previousVisits || []).length }} items</span>
                      <div class="flex items-center gap-1">
                        <button type="button" (click)="activePrescriptionsPage.set(1)" [disabled]="activePrescriptionsPage() === 1" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">«</button>
                        <button type="button" (click)="activePrescriptionsPage.update(p => Math.max(1, p - 1))" [disabled]="activePrescriptionsPage() === 1" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">‹</button>
                        <span class="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-bold">{{ activePrescriptionsPage() }} / {{ totalActivePrescriptionsPages() }}</span>
                        <button type="button" (click)="activePrescriptionsPage.update(p => Math.min(totalActivePrescriptionsPages(), p + 1))" [disabled]="activePrescriptionsPage() === totalActivePrescriptionsPages()" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">›</button>
                        <button type="button" (click)="activePrescriptionsPage.set(totalActivePrescriptionsPages())" [disabled]="activePrescriptionsPage() === totalActivePrescriptionsPages()" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">»</button>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- TAB 4: HEALTH RECORDS IN TABLE -->
              @if (leftPanelTab() === 'records') {
                <div class="space-y-3 animate-fade-in">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Diagnostic Lab & Medical Test Reports</span>
                    <span class="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                      {{ (activePatient()?.healthRecords || []).length }} Reports
                    </span>
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
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-800">
                          @for (rec of paginatedActiveRecords(); track rec.id) {
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
                                  <span>{{ rec.locationType === 'Hospital' ? 'Hospital (In-House)' : 'External Lab' }}</span>
                                </span>
                              </td>
                              <td class="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                                {{ rec.doctor }}
                              </td>
                              <td class="py-3.5 px-4 text-slate-700 font-medium whitespace-nowrap">
                                {{ rec.date }}
                              </td>
                            </tr>
                          } @empty {
                            <tr>
                              <td colspan="4" class="py-8 text-center text-slate-500 text-xs">
                                No diagnostic health records available for this patient.
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>

                    <!-- Pagination: Records -->
                    <div class="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                      <span>Showing {{ (activePatient()?.healthRecords || []).length === 0 ? 0 : (activeRecordsPage() - 1) * 5 + 1 }} to {{ Math.min(activeRecordsPage() * 5, (activePatient()?.healthRecords || []).length) }} of {{ (activePatient()?.healthRecords || []).length }} items</span>
                      <div class="flex items-center gap-1">
                        <button type="button" (click)="activeRecordsPage.set(1)" [disabled]="activeRecordsPage() === 1" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">«</button>
                        <button type="button" (click)="activeRecordsPage.update(p => Math.max(1, p - 1))" [disabled]="activeRecordsPage() === 1" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">‹</button>
                        <span class="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-bold">{{ activeRecordsPage() }} / {{ totalActiveRecordsPages() }}</span>
                        <button type="button" (click)="activeRecordsPage.update(p => Math.min(totalActiveRecordsPages(), p + 1))" [disabled]="activeRecordsPage() === totalActiveRecordsPages()" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">›</button>
                        <button type="button" (click)="activeRecordsPage.set(totalActiveRecordsPages())" [disabled]="activeRecordsPage() === totalActiveRecordsPages()" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs font-semibold">»</button>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- BOTTOM ACTION BAR: CONSULTED BUTTON -->
              <div class="pt-5 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div class="flex items-center gap-2 text-xs text-slate-500">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active Consultation for <strong class="text-slate-800 font-semibold">{{ activePatient()!.name }}</strong> ({{ activePatient()!.id }})</span>
                </div>
                <button 
                  type="button" 
                  (click)="onConsulted()"
                  class="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-md shadow-teal-600/20"
                >
                  <app-icon name="check-circle" wrapperClass="w-4 h-4 text-white" />
                  <span>Consulted</span>
                </button>
              </div>

            } @else {
              <!-- Empty / Search Placeholder State -->
              <div class="py-16 sm:py-20 text-center space-y-3 px-4 flex flex-col items-center justify-center">
                <div class="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-600 flex items-center justify-center mx-auto shadow-2xs">
                  <app-icon name="search" wrapperClass="w-8 h-8 text-teal-600" />
                </div>
                <h2 class="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                  Search for the patient to view details and prescribe
                </h2>
                <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Type a patient's name, phone number, or ID in the search bar above and click on their name to view clinical records and issue prescriptions.
                </p>
              </div>
            }

          </div>

        </div>

      </main>
    }

    <!-- ============================================================= -->
    <!-- SCHEDULE TAB (TEAMS-STYLE CALENDAR IN GREEN & SMOKE WHITE THEME) -->
    <!-- ============================================================= -->
    @if (doctorNavTab() === 'schedule') {
      <main class="flex-1 flex flex-col h-full bg-[#f8fafc] text-slate-800 overflow-hidden select-none">
        
        <!-- 1. TEAMS CALENDAR TOP HEADER -->
        <div class="h-12 bg-white border-b border-slate-200/90 px-4 flex items-center justify-between shrink-0 shadow-2xs">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <app-icon name="calendar" wrapperClass="w-4 h-4 text-white" />
            </div>
            <span class="font-bold text-sm tracking-tight text-slate-800">Calendar</span>
          </div>

          <div class="flex items-center gap-3">
            <div class="text-xs text-slate-500 font-medium hidden sm:block">
              Cardiology OPD • {{ doctor()?.name || 'Dr. Sarah Johnson' }}
            </div>
          </div>
        </div>

        <!-- 2. DAY HEADERS ROW (Large Number + Day Name in Smoke White & Green, 5 Days: Today + 4 Days) -->
        <div class="bg-[#f8fafc] border-b border-slate-200 flex select-none text-slate-800 sticky top-0 z-30 shrink-0 shadow-2xs">
          
          <!-- Left Time Gutter Header Blank Spacer (Wide w-24 / 96px gutter) -->
          <div class="w-24 shrink-0 border-r border-slate-200 bg-[#f8fafc]"></div>

          <!-- Day Column Headers (Permanent 5-Column Work Week) -->
          <div class="flex-1 grid grid-cols-5 divide-x divide-slate-200 min-w-[750px]">
            @for (day of visibleScheduleDays(); track day.index) {
              <div 
                class="py-2.5 px-3 flex flex-col justify-center text-left transition"
                [class]="day.isToday ? 'bg-teal-50/80 border-b-2 border-b-teal-600' : 'bg-[#f8fafc] hover:bg-slate-100/50'"
              >
                <div class="text-xl sm:text-2xl font-bold tracking-tight" [class]="day.isToday ? 'text-teal-800 font-black' : 'text-slate-800'">
                  {{ day.dateNumber }}
                </div>
                <div class="text-[11px] font-semibold" [class]="day.isToday ? 'text-teal-700 font-bold' : 'text-slate-500'">
                  {{ day.dayName }}
                </div>
              </div>
            }
          </div>

        </div>

        <!-- 4. SCROLLABLE TIME-GRID (Generous 140px/hour with Spacious Cards) -->
        <div class="flex-1 overflow-y-auto overflow-x-auto bg-[#f8fafc] relative flex select-none min-h-0">
          
          <!-- Left Time Column (Wide w-24 Gutter with 140px per hour) -->
          <div class="w-24 shrink-0 border-r border-slate-200 flex flex-col select-none bg-[#f8fafc] sticky left-0 z-20">
            @for (h of scheduleTimeHours; track h.label) {
              <div class="h-[140px] min-h-[140px] max-h-[140px] shrink-0 relative border-b border-slate-200">
                <!-- Full Hour Label cleanly aligned right with ample margin -->
                <span class="absolute top-2 right-3 text-xs font-bold text-slate-800 font-mono tracking-tight select-none">
                  {{ h.label }}
                </span>
                <!-- Half-hour label at exact 70px line -->
                <span class="absolute top-[68px] right-3 text-[10px] font-semibold text-slate-500 font-mono select-none">
                  {{ h.half }}
                </span>
              </div>
            }
          </div>

          <!-- Days Grid Columns with Spacious 2D Positioned Event Cards (Always 5-Column Work Week) -->
          <div class="flex-1 grid grid-cols-5 divide-x divide-slate-200 relative min-w-[750px] bg-[#fafafa]">
            @for (day of visibleScheduleDays(); track day.index) {
              <div 
                class="relative h-[1540px] min-h-[1540px] shrink-0 select-none"
                [class]="day.isToday ? 'bg-teal-50/15' : 'bg-transparent'"
              >
                <!-- Horizontal Hourly & Half-Hourly Guidelines (140px per hour) -->
                @for (h of scheduleTimeHours; track h.label) {
                  <div class="h-[140px] min-h-[140px] max-h-[140px] shrink-0 border-b border-slate-200 relative pointer-events-none">
                    <!-- Faint half-hour dashed line at 70px -->
                    <div class="h-[70px] border-b border-dashed border-slate-200/70"></div>
                  </div>
                }

                <!-- Green Current Time Indicator Line (At 10:45 AM = 385px) -->
                @if (day.isToday) {
                  <div 
                    class="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                    style="top: 385px;"
                  >
                    <span class="w-3.5 h-3.5 rounded-full bg-teal-600 -ml-1.5 shadow-sm ring-2 ring-white"></span>
                    <span class="flex-1 h-[2px] bg-teal-600 shadow-sm"></span>
                    <span class="w-3.5 h-3.5 rounded-full bg-teal-600 -mr-1.5 shadow-sm ring-2 ring-white"></span>
                  </div>
                }

                <!-- Render Event Cards (Full Data Visibility, No Cutoff, Clean Teams Layout) -->
                @for (slot of getSlotsForDay(day.index); track slot.id) {
                  <div
                    (click)="onSlotClick(slot)"
                    class="absolute left-1.5 right-1.5 z-10 rounded-xs p-3 transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md border-l-[4px] flex flex-col justify-between overflow-hidden group select-none"
                    [class]="slot.status === 'CONSULTING' 
                      ? 'bg-[#d8f0e3] hover:bg-[#cbead8] border-l-emerald-700 ring-1 ring-emerald-600/30 text-emerald-950' 
                      : (slot.status === 'COMPLETED' 
                        ? 'bg-[#edf2f4] hover:bg-[#e2e9ec] border-l-slate-400 text-slate-700 opacity-90' 
                        : 'bg-[#e7f5ed] hover:bg-[#daf0e3] border-l-teal-600 text-slate-900')"
                    [style.top]="getSlotTop(slot.startHour)"
                    [style.height]="getSlotHeight(slot.durationHours)"
                  >
                    <!-- Top: Time Badge Aligned Directly to Slot Start Line -->
                    <div class="flex items-center justify-start gap-1 mb-2">
                      <span class="font-mono text-[10px] font-bold text-teal-900 bg-teal-100/90 px-2 py-0.5 rounded border border-teal-300/80 leading-none">
                        {{ slot.startTime }} – {{ slot.endTime }}
                      </span>
                    </div>

                    <!-- Middle: Full Details (Title, Specialty, Demographics) -->
                    <div class="space-y-1 min-w-0 pr-0.5 flex-1">
                      <!-- Line 1: Title (e.g. Eleanor Vance) -->
                      <div class="font-bold text-sm leading-snug tracking-tight text-slate-900 truncate group-hover:text-teal-950">
                        {{ slot.title }}
                      </div>

                      <!-- Line 2: Room / Consultation Specialty -->
                      <div class="text-xs leading-snug tracking-tight text-teal-900 font-semibold truncate">
                        {{ slot.consultationType || slot.room }}
                      </div>

                      <!-- Line 3: Patient Demographics & Token -->
                      <div class="text-[11px] leading-snug tracking-tight text-slate-600 font-medium truncate">
                        {{ slot.patientName ? (slot.room + (slot.tokenNumber ? ' • ' + slot.tokenNumber : '') + (slot.gender ? ' • ' + slot.gender + ', ' + slot.age + 'y' : '')) : (doctor()?.name || 'Dr. Sarah Johnson') }}
                      </div>
                    </div>

                    <!-- Bottom: Circular Sync Icon in bottom right corner -->
                    <div class="flex items-center justify-end pt-1 mt-auto">
                      <span class="text-teal-700/50 group-hover:text-teal-900 transition-colors">
                        <app-icon name="sync" wrapperClass="w-3.5 h-3.5 text-current" />
                      </span>
                    </div>

                  </div>
                }

              </div>
            }
          </div>

        </div>

      </main>
    }

  </div>

</div>

      <!-- ============================================================= -->
      <!-- FULL PATIENT DETAILS 360° MODAL -->
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

            <!-- Tab Switcher Navigation -->
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
                      <app-icon name="activity" wrapperClass="w-3.5 h-3.5 text-teal-600" />
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

                  <!-- Sub-Tab Content -->
                  @if (clinicalSubTab() === 'vitals') {
                    <div class="space-y-3">
                      <div class="overflow-x-auto border border-slate-200 rounded-2xl">
                        <table class="w-full text-left text-xs sm:text-sm">
                          <thead class="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-700">
                            <tr>
                              <th class="p-3">Date & Time</th>
                              <th class="p-3">Weight</th>
                              <th class="p-3">BP</th>
                              <th class="p-3">Pulse</th>
                              <th class="p-3">SpO2</th>
                              <th class="p-3">Blood Sugar</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-slate-100">
                            @for (v of paginatedModalVitals(); track v.recordedAt) {
                              <tr class="hover:bg-slate-50">
                                <td class="p-3 font-semibold text-slate-900">{{ v.recordedAt }}</td>
                                <td class="p-3">{{ v.weight }}</td>
                                <td class="p-3">{{ v.bp }}</td>
                                <td class="p-3">{{ v.pulse }}</td>
                                <td class="p-3">{{ v.spo2 }}</td>
                                <td class="p-3">{{ v.bloodSugar || '110 mg/dL' }}</td>
                              </tr>
                            } @empty {
                              <tr>
                                <td colspan="6" class="p-6 text-center text-xs text-slate-500">No vitals history recorded.</td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>

                      <!-- Pagination: Modal Vitals -->
                      <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                        <span>Showing {{ (activePatientDetails()?.previousVitals || []).length === 0 ? 0 : (modalVitalsPage() - 1) * 5 + 1 }} to {{ Math.min(modalVitalsPage() * 5, (activePatientDetails()?.previousVitals || []).length) }} of {{ (activePatientDetails()?.previousVitals || []).length }} items</span>
                        <div class="flex items-center gap-1">
                          <button type="button" (click)="modalVitalsPage.set(1)" [disabled]="modalVitalsPage() === 1" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">«</button>
                          <button type="button" (click)="modalVitalsPage.update(p => Math.max(1, p - 1))" [disabled]="modalVitalsPage() === 1" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">‹</button>
                          <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-bold">{{ modalVitalsPage() }} / {{ totalModalVitalsPages() }}</span>
                          <button type="button" (click)="modalVitalsPage.update(p => Math.min(totalModalVitalsPages(), p + 1))" [disabled]="modalVitalsPage() === totalModalVitalsPages()" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">›</button>
                          <button type="button" (click)="modalVitalsPage.set(totalModalVitalsPages())" [disabled]="modalVitalsPage() === totalModalVitalsPages()" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">»</button>
                        </div>
                      </div>
                    </div>
                  }

                  @if (clinicalSubTab() === 'allergies') {
                    <div class="space-y-3">
                      <div class="overflow-x-auto border border-slate-200 rounded-2xl">
                        <table class="w-full text-left text-xs sm:text-sm">
                          <thead class="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-700">
                            <tr>
                              <th class="p-3">Allergen</th>
                              <th class="p-3">Severity</th>
                              <th class="p-3">Reaction</th>
                              <th class="p-3">Diagnosed Date</th>
                              <th class="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-slate-100">
                            @for (al of paginatedModalAllergies(); track al.allergen) {
                              <tr class="hover:bg-slate-50">
                                <td class="p-3 font-bold text-slate-900">{{ al.allergen }}</td>
                                <td class="p-3">
                                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">{{ al.severity }}</span>
                                </td>
                                <td class="p-3 text-slate-700">{{ al.reaction }}</td>
                                <td class="p-3 text-slate-600">{{ al.diagnosedDate }}</td>
                                <td class="p-3 font-medium">{{ al.status }}</td>
                              </tr>
                            } @empty {
                              <tr>
                                <td colspan="5" class="p-6 text-center text-xs text-slate-500">No allergies documented.</td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>

                      <!-- Pagination: Modal Allergies -->
                      <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                        <span>Showing {{ (activePatientDetails()?.allergies || []).length === 0 ? 0 : (modalAllergiesPage() - 1) * 5 + 1 }} to {{ Math.min(modalAllergiesPage() * 5, (activePatientDetails()?.allergies || []).length) }} of {{ (activePatientDetails()?.allergies || []).length }} items</span>
                        <div class="flex items-center gap-1">
                          <button type="button" (click)="modalAllergiesPage.set(1)" [disabled]="modalAllergiesPage() === 1" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">«</button>
                          <button type="button" (click)="modalAllergiesPage.update(p => Math.max(1, p - 1))" [disabled]="modalAllergiesPage() === 1" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">‹</button>
                          <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-bold">{{ modalAllergiesPage() }} / {{ totalModalAllergiesPages() }}</span>
                          <button type="button" (click)="modalAllergiesPage.update(p => Math.min(totalModalAllergiesPages(), p + 1))" [disabled]="modalAllergiesPage() === totalModalAllergiesPages()" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">›</button>
                          <button type="button" (click)="modalAllergiesPage.set(totalModalAllergiesPages())" [disabled]="modalAllergiesPage() === totalModalAllergiesPages()" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">»</button>
                        </div>
                      </div>
                    </div>
                  }

                  @if (clinicalSubTab() === 'chronic') {
                    <div class="space-y-3">
                      <div class="overflow-x-auto border border-slate-200 rounded-2xl">
                        <table class="w-full text-left text-xs sm:text-sm">
                          <thead class="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-700">
                            <tr>
                              <th class="p-3">Condition</th>
                              <th class="p-3">Diagnosed Date</th>
                              <th class="p-3">Severity</th>
                              <th class="p-3">Status</th>
                              <th class="p-3">Physician</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-slate-100">
                            @for (cc of paginatedModalChronics(); track cc.condition) {
                              <tr class="hover:bg-slate-50">
                                <td class="p-3 font-bold text-slate-900">{{ cc.condition }}</td>
                                <td class="p-3">{{ cc.diagnosedDate }}</td>
                                <td class="p-3">{{ cc.severity || 'Moderate' }}</td>
                                <td class="p-3">
                                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">{{ cc.status }}</span>
                                </td>
                                <td class="p-3 text-slate-600">{{ cc.doctor }}</td>
                              </tr>
                            } @empty {
                              <tr>
                                <td colspan="5" class="p-6 text-center text-xs text-slate-500">No chronic conditions recorded.</td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>

                      <!-- Pagination: Modal Chronics -->
                      <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                        <span>Showing {{ (activePatientDetails()?.chronicConditionsList || []).length === 0 ? 0 : (modalChronicsPage() - 1) * 5 + 1 }} to {{ Math.min(modalChronicsPage() * 5, (activePatientDetails()?.chronicConditionsList || []).length) }} of {{ (activePatientDetails()?.chronicConditionsList || []).length }} items</span>
                        <div class="flex items-center gap-1">
                          <button type="button" (click)="modalChronicsPage.set(1)" [disabled]="modalChronicsPage() === 1" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">«</button>
                          <button type="button" (click)="modalChronicsPage.update(p => Math.max(1, p - 1))" [disabled]="modalChronicsPage() === 1" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">‹</button>
                          <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-bold">{{ modalChronicsPage() }} / {{ totalModalChronicsPages() }}</span>
                          <button type="button" (click)="modalChronicsPage.update(p => Math.min(totalModalChronicsPages(), p + 1))" [disabled]="modalChronicsPage() === totalModalChronicsPages()" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">›</button>
                          <button type="button" (click)="modalChronicsPage.set(totalModalChronicsPages())" [disabled]="modalChronicsPage() === totalModalChronicsPages()" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">»</button>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- 3. MEDICATIONS TAB -->
              @if (patientDetailsTab() === 'medications') {
                <div class="space-y-3">
                  <div class="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table class="w-full text-left text-xs sm:text-sm">
                      <thead class="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-700">
                        <tr>
                          <th class="p-3">Medication</th>
                          <th class="p-3">Daily Dosage</th>
                          <th class="p-3">Doctor</th>
                          <th class="p-3">Start Date</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (med of paginatedModalMedications(); track med.name) {
                          <tr class="hover:bg-slate-50">
                            <td class="p-3 font-bold text-slate-900">{{ med.name }}</td>
                            <td class="p-3">{{ med.dosage }} • {{ med.frequency }}</td>
                            <td class="p-3">{{ med.doctor }}</td>
                            <td class="p-3">{{ med.startDate }}</td>
                          </tr>
                        } @empty {
                          <tr>
                            <td colspan="4" class="p-6 text-center text-xs text-slate-500">No active medications recorded.</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>

                  <!-- Pagination: Modal Medications -->
                  <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                    <span>Showing {{ (activePatientDetails()?.currentMedications || []).length === 0 ? 0 : (modalMedicationsPage() - 1) * 5 + 1 }} to {{ Math.min(modalMedicationsPage() * 5, (activePatientDetails()?.currentMedications || []).length) }} of {{ (activePatientDetails()?.currentMedications || []).length }} items</span>
                    <div class="flex items-center gap-1">
                      <button type="button" (click)="modalMedicationsPage.set(1)" [disabled]="modalMedicationsPage() === 1" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">«</button>
                      <button type="button" (click)="modalMedicationsPage.update(p => Math.max(1, p - 1))" [disabled]="modalMedicationsPage() === 1" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">‹</button>
                      <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-bold">{{ modalMedicationsPage() }} / {{ totalModalMedicationsPages() }}</span>
                      <button type="button" (click)="modalMedicationsPage.update(p => Math.min(totalModalMedicationsPages(), p + 1))" [disabled]="modalMedicationsPage() === totalModalMedicationsPages()" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">›</button>
                      <button type="button" (click)="modalMedicationsPage.set(totalModalMedicationsPages())" [disabled]="modalMedicationsPage() === totalModalMedicationsPages()" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">»</button>
                    </div>
                  </div>
                </div>
              }

              <!-- 4. VISITS TAB -->
              @if (patientDetailsTab() === 'visits') {
                <div class="space-y-3">
                  <div class="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table class="w-full text-left text-xs sm:text-sm">
                      <thead class="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-700">
                        <tr>
                          <th class="p-3">Attending Doctor</th>
                          <th class="p-3">Visit Date</th>
                          <th class="p-3">Status</th>
                          <th class="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (visit of paginatedModalVisits(); track visit.id) {
                          <tr class="hover:bg-slate-50">
                            <td class="p-3 font-semibold">{{ visit.doctorName }}</td>
                            <td class="p-3">{{ visit.date }}</td>
                            <td class="p-3">{{ visit.status }}</td>
                            <td class="p-3">
                              @if (visit.prescription) {
                                <button (click)="openVisitPrescription(visit, activePatientDetails()!)" class="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-bold border border-teal-200 cursor-pointer">
                                  View Rx
                                </button>
                              }
                            </td>
                          </tr>
                        } @empty {
                          <tr>
                            <td colspan="4" class="p-6 text-center text-xs text-slate-500">No previous visits recorded.</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>

                  <!-- Pagination: Modal Visits -->
                  <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                    <span>Showing {{ (activePatientDetails()?.previousVisits || []).length === 0 ? 0 : (modalVisitsPage() - 1) * 5 + 1 }} to {{ Math.min(modalVisitsPage() * 5, (activePatientDetails()?.previousVisits || []).length) }} of {{ (activePatientDetails()?.previousVisits || []).length }} items</span>
                    <div class="flex items-center gap-1">
                      <button type="button" (click)="modalVisitsPage.set(1)" [disabled]="modalVisitsPage() === 1" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">«</button>
                      <button type="button" (click)="modalVisitsPage.update(p => Math.max(1, p - 1))" [disabled]="modalVisitsPage() === 1" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">‹</button>
                      <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-bold">{{ modalVisitsPage() }} / {{ totalModalVisitsPages() }}</span>
                      <button type="button" (click)="modalVisitsPage.update(p => Math.min(totalModalVisitsPages(), p + 1))" [disabled]="modalVisitsPage() === totalModalVisitsPages()" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">›</button>
                      <button type="button" (click)="modalVisitsPage.set(totalModalVisitsPages())" [disabled]="modalVisitsPage() === totalModalVisitsPages()" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">»</button>
                    </div>
                  </div>
                </div>
              }

              <!-- 5. HEALTH RECORDS TAB -->
              @if (patientDetailsTab() === 'records') {
                <div class="space-y-3">
                  <div class="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table class="w-full text-left text-xs sm:text-sm">
                      <thead class="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-700">
                        <tr>
                          <th class="p-3">Diagnostic Examination</th>
                          <th class="p-3">Doctor</th>
                          <th class="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (rec of paginatedModalRecords(); track rec.id) {
                          <tr class="hover:bg-slate-50">
                            <td class="p-3 font-semibold">{{ rec.testName }}</td>
                            <td class="p-3">{{ rec.doctor }}</td>
                            <td class="p-3">{{ rec.date }}</td>
                          </tr>
                        } @empty {
                          <tr>
                            <td colspan="3" class="p-6 text-center text-xs text-slate-500">No diagnostic reports available.</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>

                  <!-- Pagination: Modal Records -->
                  <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                    <span>Showing {{ (activePatientDetails()?.healthRecords || []).length === 0 ? 0 : (modalRecordsPage() - 1) * 5 + 1 }} to {{ Math.min(modalRecordsPage() * 5, (activePatientDetails()?.healthRecords || []).length) }} of {{ (activePatientDetails()?.healthRecords || []).length }} items</span>
                    <div class="flex items-center gap-1">
                      <button type="button" (click)="modalRecordsPage.set(1)" [disabled]="modalRecordsPage() === 1" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">«</button>
                      <button type="button" (click)="modalRecordsPage.update(p => Math.max(1, p - 1))" [disabled]="modalRecordsPage() === 1" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">‹</button>
                      <span class="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-bold">{{ modalRecordsPage() }} / {{ totalModalRecordsPages() }}</span>
                      <button type="button" (click)="modalRecordsPage.update(p => Math.min(totalModalRecordsPages(), p + 1))" [disabled]="modalRecordsPage() === totalModalRecordsPages()" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">›</button>
                      <button type="button" (click)="modalRecordsPage.set(totalModalRecordsPages())" [disabled]="modalRecordsPage() === totalModalRecordsPages()" class="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs font-semibold">»</button>
                    </div>
                  </div>
                </div>
              }

            </div>

            <!-- Modal Footer -->
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

      <!-- FULL PRESCRIPTION (Rx) DIALOG MODAL -->
      @if (selectedVisitPrescription(); as item) {
        <div class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-fade-in" (click)="closePrescriptionModal()">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up" (click)="$event.stopPropagation()">
            
            <!-- Header -->
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

            <!-- Body -->
            <div class="p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
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

              <div>
                <h4 class="font-bold text-slate-900 text-sm mb-2">Prescribed Medications</h4>
                <div class="overflow-x-auto rounded-xl border border-slate-200">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-slate-100 border-b border-slate-200 text-xs font-semibold uppercase text-slate-700">
                        <th class="p-3">Medicine & Strength</th>
                        <th class="p-3">Dosage</th>
                        <th class="p-3">Frequency</th>
                        <th class="p-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-xs font-medium">
                      @for (med of item.prescription.medicines; track med.name) {
                        <tr class="hover:bg-slate-50">
                          <td class="p-3 font-bold text-slate-900">{{ med.name }}</td>
                          <td class="p-3">{{ med.dosage }}</td>
                          <td class="p-3 font-semibold text-teal-700">{{ med.frequency }}</td>
                          <td class="p-3">{{ med.duration }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              @if (item.prescription.advice && item.prescription.advice.length > 0) {
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider">Clinical Advice</h4>
                  <ul class="space-y-1 text-xs text-slate-700">
                    @for (adv of item.prescription.advice; track adv) {
                      <li>• {{ adv }}</li>
                    }
                  </ul>
                </div>
              }
            </div>

            <!-- Footer -->
            <div class="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between gap-3">
              <button (click)="printModal()" class="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold">Print Rx</button>
              <button (click)="closePrescriptionModal()" class="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold">Close</button>
            </div>

          </div>
        </div>
      }

      <!-- FULL PAYMENT RECEIPT / INVOICE DIALOG MODAL -->
      @if (selectedReceiptData(); as item) {
        <div class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-fade-in" (click)="closeReceiptModal()">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up" (click)="$event.stopPropagation()">
            
            <div class="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <app-icon name="receipt" wrapperClass="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-white">Payment Receipt</h3>
                  <p class="text-xs text-slate-300">HMS Patient Billing Receipt</p>
                </div>
              </div>
              <button (click)="closeReceiptModal()" class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"><app-icon name="x" wrapperClass="w-4 h-4" /></button>
            </div>

            <div class="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span class="font-bold text-emerald-900">Payment Status: {{ item.receipt.paymentStatus }}</span>
                <span class="font-mono text-emerald-700">Ref: {{ item.receipt.transactionId }}</span>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div>Patient: <strong>{{ item.patientName }}</strong> ({{ item.patientId }})</div>
                <div>Invoice No: <strong class="font-mono">{{ item.receipt.receiptNumber }}</strong></div>
                <div>Total Paid: <strong class="text-teal-700 font-mono text-base">₹{{ item.receipt.totalPaid.toFixed(2) }}</strong></div>
              </div>
            </div>

            <div class="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-end">
              <button (click)="closeReceiptModal()" class="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold">Close</button>
            </div>
          </div>
        </div>
      }

      <!-- ADD NEW VITALS POPUP MODAL -->
      @if (isAddVitalsModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in" (click)="closeAddVitalsModal()">
          <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up" (click)="$event.stopPropagation()">
            <div class="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-5 text-white flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
                  <app-icon name="activity" wrapperClass="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-bold text-lg leading-tight">Add New Vitals</h3>
                  <p class="text-xs text-teal-200/80">Recording vitals for {{ activePatient()?.name }} ({{ activePatient()?.id }})</p>
                </div>
              </div>
              <button (click)="closeAddVitalsModal()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"><app-icon name="x" wrapperClass="w-4 h-4" /></button>
            </div>

            <form [formGroup]="vitalsForm" (ngSubmit)="onSaveVitals()" class="p-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Weight *</label>
                  <input type="text" formControlName="weight" placeholder="e.g. 78 kg" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">BP *</label>
                  <input type="text" formControlName="bp" placeholder="e.g. 120/80 mmHg" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Pulse *</label>
                  <input type="text" formControlName="pulse" placeholder="e.g. 72 bpm" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">SpO2 *</label>
                  <input type="text" formControlName="spo2" placeholder="e.g. 98%" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Blood Sugar *</label>
                  <input type="text" formControlName="bloodSugar" placeholder="e.g. 105 mg/dL" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Temperature *</label>
                  <input type="text" formControlName="temperature" placeholder="e.g. 98.4 °F" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" (click)="closeAddVitalsModal()" class="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold">Cancel</button>
                <button type="submit" [disabled]="vitalsForm.invalid || isSavingVitals()" class="px-5 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs disabled:opacity-50">Record Vitals</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- ============================================================= -->
      <!-- PRESCRIBE MEDICATIONS POPUP MODAL (2-COLUMN INTERACTIVE PAD)  -->
      <!-- ============================================================= -->
      @if (isPrescribeModalOpen()) {
        <div 
          class="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-slate-900/65 backdrop-blur-xs animate-fade-in overflow-y-auto"
          (click)="closePrescribeModal()"
        >
          <div 
            class="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-in my-auto"
            (click)="$event.stopPropagation()"
          >
            
            <!-- MODAL HEADER -->
            <div class="px-5 sm:px-6 py-4 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-xs">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 text-white shadow-inner">
                  <app-icon name="pill" wrapperClass="w-5 h-5 text-teal-200" />
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="text-base sm:text-lg font-black tracking-tight text-white">
                      Digital Prescription (Rx) Pad
                    </h3>
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/30 text-teal-100 border border-teal-400/30">
                      {{ doctor()?.name || 'Dr. Sarah Johnson' }}
                    </span>
                  </div>
                  <p class="text-xs text-teal-100/90 flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span>Patient: <strong class="text-white font-bold">{{ activePatient()?.name }}</strong></span>
                    <span>•</span>
                    <span class="font-mono text-teal-200">{{ activePatient()?.id }}</span>
                    <span>•</span>
                    <span>{{ activePatient()?.gender }}, {{ activePatient()?.age }} yrs</span>
                    <span>•</span>
                    <span>Blood: <strong class="text-white">{{ activePatient()?.bloodGroup }}</strong></span>
                    <span>•</span>
                    <span class="bg-amber-400/20 text-amber-200 px-2 py-0.2 rounded-md font-mono text-[11px]">Token: {{ activePatient()?.tokenNumber || 'T-102' }}</span>
                  </p>
                </div>
              </div>

              <!-- Close X -->
              <button 
                type="button" 
                (click)="closePrescribeModal()"
                class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer border border-white/10"
                aria-label="Close modal"
              >
                <app-icon name="x" wrapperClass="w-4 h-4 text-white" />
              </button>
            </div>

            <!-- MODAL BODY: 2 PANELS (Left: Prescribed Medicines, Right: Search, Why Medicine & Dosage in Text) -->
            <div class="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70">
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                
                <!-- LEFT PANEL (COL-SPAN 6): PRESCRIBED MEDICINES LIST ONLY -->
                <div class="lg:col-span-6 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col space-y-4">
                  
                  <!-- Left Header -->
                  <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                        <app-icon name="file-text" wrapperClass="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <h4 class="text-sm font-bold text-slate-900 tracking-tight">Prescribed Medicines</h4>
                        <p class="text-[11px] text-slate-500">Medicines added for this prescription</p>
                      </div>
                    </div>
                    <span 
                      class="px-2.5 py-1 rounded-full text-xs font-bold font-mono transition-all"
                      [class]="prescribedMedicines().length > 0 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'"
                    >
                      {{ prescribedMedicines().length }} {{ prescribedMedicines().length === 1 ? 'Medicine' : 'Medicines' }}
                    </span>
                  </div>

                  <!-- Prescribed Medicines Scrollable List -->
                  <div class="space-y-3 min-h-[280px] max-h-[460px] overflow-y-auto pr-1">
                    @for (med of prescribedMedicines(); track $index) {
                      <div class="p-3.5 rounded-xl bg-[#f8fafc] border border-slate-200 hover:border-teal-300 transition-all space-y-2.5 relative group shadow-2xs">
                        
                        <!-- Top Row: Name, Form/Strength & Delete Action -->
                        <div class="flex items-start justify-between gap-2">
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="w-5 h-5 rounded-full bg-teal-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                              {{ $index + 1 }}
                            </span>
                            <span class="font-bold text-slate-900 text-sm">
                              {{ med.name }}
                            </span>
                            @if (med.form || med.strength) {
                              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                                {{ med.form || 'Tablet' }} {{ med.strength ? '• ' + med.strength : '' }}
                              </span>
                            }
                          </div>

                          <!-- Delete button -->
                          <button 
                            type="button" 
                            (click)="removePrescribedMedicine($index)"
                            class="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
                            title="Remove medicine"
                            aria-label="Remove medicine"
                          >
                            <app-icon name="trash" wrapperClass="w-4 h-4" />
                          </button>
                        </div>

                        <!-- Dosage in Text -->
                        <div class="bg-white p-2.5 rounded-lg border border-slate-100 text-xs">
                          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Dosage</span>
                          <span class="font-bold text-slate-900 text-xs sm:text-sm">{{ med.dosage }}</span>
                        </div>

                        <!-- Directions to Use -->
                        @if (med.instructions || med.reason) {
                          <div class="p-2.5 rounded-lg bg-teal-50/70 border border-teal-200/70 text-xs text-teal-900 space-y-0.5">
                            <span class="font-bold text-teal-800 text-[10px] uppercase tracking-wide block">Directions to Use:</span>
                            <p class="font-medium text-teal-950 text-xs leading-relaxed">{{ med.instructions || med.reason }}</p>
                          </div>
                        }
                      </div>
                    } @empty {
                      <!-- Empty State -->
                      <div class="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-2.5">
                        <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                          <app-icon name="pill" wrapperClass="w-6 h-6 text-teal-600" />
                        </div>
                        <div class="space-y-1">
                          <h5 class="text-sm font-bold text-slate-800">No medicines prescribed yet</h5>
                          <p class="text-xs text-slate-500 max-w-xs leading-relaxed">
                            Search for a medicine on the right, enter dosage & directions to use, and click <strong class="text-teal-700 font-semibold">"Add Medicine"</strong>.
                          </p>
                        </div>
                      </div>
                    }
                  </div>

                </div>

                <!-- RIGHT PANEL (COL-SPAN 6): MEDICINE SEARCH, DOSAGE & DIRECTIONS TO USE -->
                <div class="lg:col-span-6 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col space-y-4">
                  
                  <!-- Right Header -->
                  <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                        <app-icon name="search" wrapperClass="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <h4 class="text-sm font-bold text-slate-900 tracking-tight">Search & Add Medicine</h4>
                        <p class="text-[11px] text-slate-500">Search a medicine, set dosage & directions to use, then add</p>
                      </div>
                    </div>
                    @if (selectedMasterMedicine()) {
                      <button 
                        type="button" 
                        (click)="clearSelectedMasterMedicine()"
                        class="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline"
                      >
                        Clear Selection
                      </button>
                    }
                  </div>

                  <!-- 1. SEARCH MEDICINE WITH AUTOCOMPLETE DROPDOWN -->
                  <div class="relative">
                    <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Search Medicine *
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <app-icon name="search" wrapperClass="w-4 h-4 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        [ngModel]="medicineSearchQuery()"
                        (ngModelChange)="onMedicineSearchChange($event)"
                        placeholder="Search medicine (e.g. Dolo, Augmentin, Paracetamol, Pan-D, Telma...)"
                        class="w-full pl-11 pr-11 py-2.5 bg-white border-2 border-teal-500 rounded-2xl text-slate-900 text-xs sm:text-sm placeholder-slate-400 outline-none transition shadow-2xs focus:ring-2 focus:ring-teal-500/20"
                      />
                      @if (medicineSearchQuery().trim().length > 0) {
                        <button 
                          type="button" 
                          (click)="clearMedicineSearch()"
                          class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                          aria-label="Clear search"
                        >
                          <app-icon name="x" wrapperClass="w-4 h-4" />
                        </button>
                      }
                    </div>

                    <!-- Autocomplete Dropdown suggestions on typing -->
                    @if (isMedicineDropdownOpen()) {
                      <div class="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden max-h-60 overflow-y-auto py-1 divide-y divide-slate-100 animate-fade-in">
                        @if (filteredMasterMedicines().length > 0) {
                          @for (med of filteredMasterMedicines(); track med.id) {
                            <button 
                              type="button" 
                              (click)="selectMasterMedicine(med)"
                              class="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-teal-50/70 transition cursor-pointer group"
                            >
                              <div class="flex items-center gap-2 flex-wrap">
                                <span class="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-teal-900">
                                  {{ med.name }}
                                </span>
                                <span class="text-xs text-slate-500 font-medium">
                                  • {{ med.composition }}
                                </span>
                              </div>

                              <div class="flex items-center gap-3 shrink-0">
                                <span class="text-xs font-mono font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200/60">
                                  {{ med.id }}
                                </span>
                                <span class="text-xs font-semibold text-teal-600 group-hover:text-teal-700 flex items-center gap-0.5">
                                  Select <app-icon name="chevron-right" wrapperClass="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </button>
                          }
                        } @else {
                          <div class="px-4 py-3 text-xs text-slate-500 font-medium select-none text-center">
                            No medicine found matching "<strong>{{ medicineSearchQuery().trim() }}</strong>"
                          </div>
                        }
                      </div>
                    }
                  </div>

                  <!-- Selected Medicine Highlight Box -->
                  @if (selectedMasterMedicine()) {
                    <div class="p-3 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between gap-2">
                      <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          Rx
                        </div>
                        <div>
                          <div class="flex items-center gap-2 flex-wrap">
                            <span class="font-bold text-slate-900 text-xs sm:text-sm">{{ selectedMasterMedicine()!.name }}</span>
                            <span class="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                              {{ selectedMasterMedicine()!.strength }} • {{ selectedMasterMedicine()!.dosageForm }}
                            </span>
                          </div>
                          <p class="text-[11px] text-teal-800">{{ selectedMasterMedicine()!.genericName }} ({{ selectedMasterMedicine()!.route }} Route)</p>
                        </div>
                      </div>

                      <button 
                        type="button" 
                        (click)="clearSelectedMasterMedicine()"
                        class="text-xs text-teal-700 hover:text-teal-900 font-semibold cursor-pointer underline shrink-0"
                      >
                        Change
                      </button>
                    </div>
                  }

                  <!-- 2. DOSAGE (IN TEXT) -->
                  <div>
                    <label class="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Dosage (in Text) *
                    </label>
                    <input 
                      type="text" 
                      [ngModel]="medDosage()"
                      (ngModelChange)="medDosage.set($event)"
                      placeholder="e.g. 1 Tablet (650) twice daily after food"
                      class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-2xs"
                    />
                  </div>

                  <!-- 3. DIRECTIONS TO USE -->
                  <div>
                    <label class="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Directions to Use *
                    </label>
                    <textarea 
                      rows="2"
                      [ngModel]="medReason()"
                      (ngModelChange)="medReason.set($event)"
                      placeholder="e.g. Take with a glass of water after meals. Complete full 5-day course."
                      class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-2xs resize-none"
                    ></textarea>
                  </div>

                  <!-- 4. ADD MEDICINE BUTTON -->
                  <div class="pt-2">
                    <button 
                      type="button" 
                      (click)="addMedicineToPrescription()"
                      [disabled]="(!selectedMasterMedicine() && !medicineSearchQuery().trim()) || !medDosage().trim()"
                      class="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-teal-600/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <app-icon name="plus" wrapperClass="w-4 h-4 text-white" />
                      <span>Add Medicine</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>

            <!-- MODAL FOOTER ACTIONS (CANCEL & DONE) -->
            <div class="px-5 sm:px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div class="text-xs text-slate-500 font-medium hidden sm:block">
                {{ prescribedMedicines().length }} {{ prescribedMedicines().length === 1 ? 'medicine' : 'medicines' }} ready to prescribe
              </div>

              <div class="flex items-center gap-3 justify-end ml-auto">
                <button 
                  type="button" 
                  (click)="closePrescribeModal()"
                  class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button 
                  type="button" 
                  (click)="onSavePrescriptionAndDone()"
                  class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-md shadow-teal-600/25 active:scale-95"
                >
                  <app-icon name="check-circle" wrapperClass="w-4 h-4 text-white" />
                  <span>Done</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- ============================================================= -->
      <!-- SCHEDULE SLOT DETAILS MODAL -->
      <!-- ============================================================= -->
      @if (selectedScheduleSlot(); as slot) {
        <div class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-fade-in" (click)="selectedScheduleSlot.set(null)">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-scale-up" (click)="$event.stopPropagation()">
            
            <!-- Modal Header -->
            <div class="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                  <app-icon [name]="slot.type === 'break' ? 'coffee' : (slot.type === 'rounds' ? 'stethoscope' : 'user')" wrapperClass="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-white">{{ slot.title }}</h3>
                  <p class="text-xs text-teal-100/80">{{ slot.dayName }}, {{ slot.dayDate }} 2026 • {{ slot.startTime }} - {{ slot.endTime }}</p>
                </div>
              </div>
              <button 
                type="button" 
                (click)="selectedScheduleSlot.set(null)"
                class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition"
                aria-label="Close"
              >
                <app-icon name="x" wrapperClass="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Body Content -->
            <div class="p-6 space-y-4 text-xs sm:text-sm text-slate-800 overflow-y-auto">
              
              <!-- Patient Specific Details -->
              @if (slot.type === 'patient') {
                <div class="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <span class="text-[11px] font-semibold text-slate-500 uppercase block">Patient ID</span>
                    <span class="font-bold text-teal-800 font-mono">{{ slot.patientId }}</span>
                  </div>
                  <div>
                    <span class="text-[11px] font-semibold text-slate-500 uppercase block">Token Number</span>
                    <span class="font-bold text-slate-900 font-mono">{{ slot.tokenNumber || 'T-102' }}</span>
                  </div>
                  <div>
                    <span class="text-[11px] font-semibold text-slate-500 uppercase block">Demographics</span>
                    <span class="font-semibold text-slate-800">{{ slot.gender }}, {{ slot.age }} yrs</span>
                  </div>
                  <div>
                    <span class="text-[11px] font-semibold text-slate-500 uppercase block">Blood Group</span>
                    <span class="font-bold text-slate-900">{{ slot.bloodGroup || 'A+ Positive' }}</span>
                  </div>
                  <div class="col-span-2">
                    <span class="text-[11px] font-semibold text-slate-500 uppercase block">Contact Phone</span>
                    <span class="font-bold text-slate-900">{{ slot.phone || '+91 98765 43210' }}</span>
                  </div>
                </div>

                <div class="p-4 rounded-2xl bg-teal-50/70 border border-teal-100 space-y-1">
                  <span class="text-[11px] font-bold text-teal-800 uppercase block">Consultation Reason & Type</span>
                  <p class="font-bold text-slate-900 text-sm">{{ slot.consultationType }}</p>
                  <p class="text-xs text-slate-600">{{ slot.notes }}</p>
                </div>
              }

              <!-- Break / Rounds Details -->
              @if (slot.type !== 'patient') {
                <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-800 uppercase">Location / Room</span>
                    <span class="font-semibold text-slate-900">{{ slot.room }}</span>
                  </div>
                  <div class="text-xs text-slate-600">
                    {{ slot.notes }}
                  </div>
                </div>
              }

              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <span class="text-slate-500 font-medium">Slot Status:</span>
                <span class="font-bold text-teal-800 uppercase">{{ slot.status || 'Scheduled' }}</span>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button 
                type="button" 
                (click)="selectedScheduleSlot.set(null)"
                class="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition cursor-pointer"
              >
                Close
              </button>

              @if (slot.type === 'patient') {
                <button 
                  type="button" 
                  (click)="openConsultationFromSchedule(slot)"
                  class="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-md shadow-teal-600/20"
                >
                  <app-icon name="stethoscope" wrapperClass="w-4 h-4 text-white" />
                  <span>Start Consultation</span>
                </button>
              }
            </div>

          </div>
        </div>
      }

      <!-- ============================================================= -->
      <!-- QUICK ADD SCHEDULE SLOT MODAL -->
      <!-- ============================================================= -->
      @if (isAddSlotModalOpen()) {
        <div class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-fade-in" (click)="isAddSlotModalOpen.set(false)">
          <div class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-scale-up" (click)="$event.stopPropagation()">
            
            <div class="p-5 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <app-icon name="calendar" wrapperClass="w-5 h-5 text-white" />
                <h3 class="font-bold text-base text-white">Add Schedule Slot</h3>
              </div>
              <button (click)="isAddSlotModalOpen.set(false)" class="text-white hover:text-teal-200 cursor-pointer">
                <app-icon name="x" wrapperClass="w-4 h-4" />
              </button>
            </div>

            <div class="p-5 space-y-3.5 text-xs sm:text-sm">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Day of Week</label>
                <select 
                  [ngModel]="newSlotDay()" 
                  (ngModelChange)="newSlotDay.set($event)"
                  class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
                >
                  <option [value]="0">Monday (24 Aug)</option>
                  <option [value]="1">Tuesday (25 Aug)</option>
                  <option [value]="2">Wednesday (26 Aug)</option>
                  <option [value]="3">Thursday (27 Aug - Today)</option>
                  <option [value]="4">Friday (28 Aug)</option>
                  <option [value]="5">Saturday (29 Aug)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Slot Type</label>
                <select 
                  [ngModel]="newSlotType()" 
                  (ngModelChange)="newSlotType.set($event)"
                  class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="patient">Patient Consultation</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {{ newSlotType() === 'patient' ? 'Patient Name *' : 'Slot Title *' }}
                </label>
                <input 
                  type="text" 
                  [ngModel]="newSlotTitle()" 
                  (ngModelChange)="newSlotTitle.set($event)"
                  [placeholder]="newSlotType() === 'patient' ? 'e.g. Robert Langdon' : 'e.g. Lunch Break'"
                  class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div class="grid grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Start Time</label>
                  <input 
                    type="text" 
                    [ngModel]="newSlotStartTime()" 
                    (ngModelChange)="newSlotStartTime.set($event)"
                    placeholder="e.g. 11:30 AM"
                    class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase mb-1">End Time</label>
                  <input 
                    type="text" 
                    [ngModel]="newSlotEndTime()" 
                    (ngModelChange)="newSlotEndTime.set($event)"
                    placeholder="e.g. 12:30 PM"
                    class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Room / Location</label>
                <input 
                  type="text" 
                  [ngModel]="newSlotRoom()" 
                  (ngModelChange)="newSlotRoom.set($event)"
                  placeholder="e.g. OPD Room 104"
                  class="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div class="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button 
                type="button" 
                (click)="isAddSlotModalOpen.set(false)"
                class="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                (click)="saveNewScheduleSlot()"
                class="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-teal-600/20"
              >
                Add Slot
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class DoctorComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);
  private readonly fb = inject(FormBuilder);
  protected readonly Math = Math;

  readonly doctor = computed(() => this.authService.currentDoctor());

  // Doctor side navigation menu ('consult' | 'schedule')
  readonly doctorNavTab = signal<DoctorNavTab>('consult');

  // Schedule Signals & State
  readonly scheduleViewMode = signal<'workweek' | 'fullweek' | 'day'>('workweek');
  readonly scheduleTypeFilter = signal<'all' | 'patients' | 'breaks'>('all');
  readonly selectedScheduleSlot = signal<DoctorScheduleSlot | null>(null);
  readonly isAddSlotModalOpen = signal<boolean>(false);

  readonly newSlotDay = signal<number>(3);
  readonly newSlotType = signal<'patient' | 'break' | 'rounds'>('patient');
  readonly newSlotTitle = signal<string>('');
  readonly newSlotStartTime = signal<string>('11:30 AM');
  readonly newSlotEndTime = signal<string>('12:30 PM');
  readonly newSlotRoom = signal<string>('OPD Room 104');

  readonly scheduleDays = [
    { index: 0, dayName: 'Thursday', dateNumber: '27', fullDate: '27 Aug 2026', isToday: true },
    { index: 1, dayName: 'Friday', dateNumber: '28', fullDate: '28 Aug 2026', isToday: false },
    { index: 2, dayName: 'Saturday', dateNumber: '29', fullDate: '29 Aug 2026', isToday: false },
    { index: 3, dayName: 'Sunday', dateNumber: '30', fullDate: '30 Aug 2026', isToday: false },
    { index: 4, dayName: 'Monday', dateNumber: '31', fullDate: '31 Aug 2026', isToday: false },
  ];

  readonly visibleScheduleDays = computed(() => {
    return this.scheduleDays; // Always 5 days: Today (Thursday) + 4 upcoming days
  });

  readonly scheduleTimeHours = [
    { label: '8 AM', half: '8:30' },
    { label: '9 AM', half: '9:30' },
    { label: '10 AM', half: '10:30' },
    { label: '11 AM', half: '11:30' },
    { label: '12 PM', half: '12:30' },
    { label: '1 PM', half: '1:30' },
    { label: '2 PM', half: '2:30' },
    { label: '3 PM', half: '3:30' },
    { label: '4 PM', half: '4:30' },
    { label: '5 PM', half: '5:30' },
    { label: '6 PM', half: '6:30' },
  ];

  readonly scheduleSlots = signal<DoctorScheduleSlot[]>([
    // Day 0: Thursday Aug 27 (TODAY)
    {
      id: 'SCH-401',
      dayIndex: 0,
      dateStr: '2026-08-27',
      dayName: 'Thursday',
      dayDate: '27 Aug',
      startTime: '08:30 AM',
      endTime: '09:30 AM',
      startHour: 8.5,
      durationHours: 1.0,
      type: 'patient',
      title: 'Eleanor Vance',
      patientId: 'PT-10821',
      patientName: 'Eleanor Vance',
      tokenNumber: 'T-101',
      phone: '+91 98765 43210',
      age: 52,
      gender: 'Female',
      bloodGroup: 'O+ Positive',
      consultationType: 'Pre-Procedure Vitals Review',
      room: 'OPD Room 104',
      status: 'COMPLETED',
      notes: 'Baseline check before scheduled stress test'
    },
    {
      id: 'SCH-402',
      dayIndex: 0,
      dateStr: '2026-08-27',
      dayName: 'Thursday',
      dayDate: '27 Aug',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      startHour: 10.0,
      durationHours: 1.0,
      type: 'patient',
      title: 'Robert Langdon',
      patientId: 'PT-39102',
      patientName: 'Robert Langdon',
      tokenNumber: 'T-102',
      phone: '+91 98765 43211',
      age: 48,
      gender: 'Male',
      bloodGroup: 'A+ Positive',
      consultationType: 'Clinical Consultation & Prescription',
      room: 'OPD Room 104',
      status: 'CONSULTING',
      notes: 'Active consultation slot: prescribing medication & evaluating health record'
    },
    {
      id: 'SCH-403',
      dayIndex: 0,
      dateStr: '2026-08-27',
      dayName: 'Thursday',
      dayDate: '27 Aug',
      startTime: '11:30 AM',
      endTime: '12:30 PM',
      startHour: 11.5,
      durationHours: 1.0,
      type: 'patient',
      title: 'Sophia Martinez',
      patientId: 'PT-44102',
      patientName: 'Sophia Martinez',
      tokenNumber: 'T-103',
      phone: '+91 98765 43212',
      age: 29,
      gender: 'Female',
      bloodGroup: 'B- Negative',
      consultationType: 'BP & Cardiac Rhythm Follow-up',
      room: 'OPD Room 104',
      status: 'WAITING',
      notes: 'Patient checked in at reception; vitals taken'
    },
    {
      id: 'SCH-405',
      dayIndex: 0,
      dateStr: '2026-08-27',
      dayName: 'Thursday',
      dayDate: '27 Aug',
      startTime: '02:30 PM',
      endTime: '03:30 PM',
      startHour: 14.5,
      durationHours: 1.0,
      type: 'patient',
      title: 'David Kim',
      patientId: 'PT-55420',
      patientName: 'David Kim',
      tokenNumber: 'T-104',
      phone: '+91 98765 43213',
      age: 41,
      gender: 'Male',
      bloodGroup: 'A- Negative',
      consultationType: 'Treadmill Test Result Review',
      room: 'OPD Room 104',
      status: 'SCHEDULED',
      notes: 'Awaiting lab reports from internal diagnostics'
    },
    {
      id: 'SCH-406',
      dayIndex: 0,
      dateStr: '2026-08-27',
      dayName: 'Thursday',
      dayDate: '27 Aug',
      startTime: '04:00 PM',
      endTime: '05:00 PM',
      startHour: 16.0,
      durationHours: 1.0,
      type: 'patient',
      title: 'Priya Sharma',
      patientId: 'PT-22019',
      patientName: 'Priya Sharma',
      tokenNumber: 'T-105',
      phone: '+91 98765 43214',
      age: 38,
      gender: 'Female',
      bloodGroup: 'B+ Positive',
      consultationType: 'Post-Medication Follow-up',
      room: 'OPD Room 104',
      status: 'SCHEDULED',
      notes: 'Routine hypertension dosage check'
    },

    // Day 1: Friday Aug 28
    {
      id: 'SCH-501',
      dayIndex: 1,
      dateStr: '2026-08-28',
      dayName: 'Friday',
      dayDate: '28 Aug',
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      startHour: 9.0,
      durationHours: 1.0,
      type: 'patient',
      title: 'James Wilson',
      patientId: 'PT-88912',
      patientName: 'James Wilson',
      tokenNumber: 'T-106',
      phone: '+91 98765 43215',
      age: 63,
      gender: 'Male',
      bloodGroup: 'AB+ Positive',
      consultationType: 'Pacemaker Telemetry Check',
      room: 'OPD Room 104',
      status: 'SCHEDULED',
      notes: 'Device interrogation and battery check'
    },
    {
      id: 'SCH-502',
      dayIndex: 1,
      dateStr: '2026-08-28',
      dayName: 'Friday',
      dayDate: '28 Aug',
      startTime: '10:30 AM',
      endTime: '11:30 AM',
      startHour: 10.5,
      durationHours: 1.0,
      type: 'patient',
      title: 'Michael Chang',
      patientId: 'PT-66321',
      patientName: 'Michael Chang',
      tokenNumber: 'T-107',
      phone: '+91 98765 43216',
      age: 47,
      gender: 'Male',
      bloodGroup: 'O- Negative',
      consultationType: 'Cholesterol & Diet Review',
      room: 'OPD Room 104',
      status: 'SCHEDULED',
      notes: 'Statin titration follow-up'
    },
    {
      id: 'SCH-504',
      dayIndex: 1,
      dateStr: '2026-08-28',
      dayName: 'Friday',
      dayDate: '28 Aug',
      startTime: '02:30 PM',
      endTime: '03:30 PM',
      startHour: 14.5,
      durationHours: 1.0,
      type: 'patient',
      title: 'Anita Desai',
      patientId: 'PT-77820',
      patientName: 'Anita Desai',
      tokenNumber: 'T-108',
      phone: '+91 98765 43217',
      age: 56,
      gender: 'Female',
      bloodGroup: 'A+ Positive',
      consultationType: 'Exercise Tolerance Evaluation',
      room: 'OPD Room 104',
      status: 'SCHEDULED',
      notes: 'Cardiac rehabilitation progression check'
    },

    // Day 2: Saturday Aug 29
    {
      id: 'SCH-601',
      dayIndex: 2,
      dateStr: '2026-08-29',
      dayName: 'Saturday',
      dayDate: '29 Aug',
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      startHour: 9.0,
      durationHours: 1.0,
      type: 'patient',
      title: 'Eleanor Vance',
      patientId: 'PT-10821',
      patientName: 'Eleanor Vance',
      tokenNumber: 'T-101',
      phone: '+91 98765 43210',
      age: 52,
      gender: 'Female',
      bloodGroup: 'O+ Positive',
      consultationType: 'Weekend OPD Follow-up',
      room: 'OPD Room 104',
      status: 'SCHEDULED',
      notes: 'Post-treatment progress check'
    },
    {
      id: 'SCH-602',
      dayIndex: 2,
      dateStr: '2026-08-29',
      dayName: 'Saturday',
      dayDate: '29 Aug',
      startTime: '11:00 AM',
      endTime: '12:00 PM',
      startHour: 11.0,
      durationHours: 1.0,
      type: 'patient',
      title: 'David Kim',
      patientId: 'PT-55420',
      patientName: 'David Kim',
      tokenNumber: 'T-104',
      phone: '+91 98765 43213',
      age: 41,
      gender: 'Male',
      bloodGroup: 'A- Negative',
      consultationType: 'Stress Test Follow-up',
      room: 'OPD Room 104',
      status: 'SCHEDULED',
      notes: 'Weekend Holter readout review'
    },

    // Day 3: Sunday Aug 30
    {
      id: 'SCH-701',
      dayIndex: 3,
      dateStr: '2026-08-30',
      dayName: 'Sunday',
      dayDate: '30 Aug',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      startHour: 10.0,
      durationHours: 1.0,
      type: 'patient',
      title: 'Marcus Brody',
      patientId: 'PT-19940',
      patientName: 'Marcus Brody',
      tokenNumber: 'T-109',
      phone: '+91 98765 43218',
      age: 65,
      gender: 'Male',
      bloodGroup: 'O+ Positive',
      consultationType: 'Routine Cardiac Health Checkup',
      room: 'OPD Room 104',
      status: 'SCHEDULED',
      notes: 'Annual comprehensive cardiac screening'
    },

    // Day 4: Monday Aug 31
    {
      id: 'SCH-801',
      dayIndex: 4,
      dateStr: '2026-08-31',
      dayName: 'Monday',
      dayDate: '31 Aug',
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      startHour: 9.0,
      durationHours: 1.0,
      type: 'patient',
      title: 'Eleanor Vance',
      patientId: 'PT-10821',
      patientName: 'Eleanor Vance',
      tokenNumber: 'T-101',
      phone: '+91 98765 43210',
      age: 52,
      gender: 'Female',
      bloodGroup: 'O+ Positive',
      consultationType: 'Cardiology Follow-up & Vitals',
      room: 'OPD Room 104',
      status: 'SCHEDULED',
      notes: 'Hypertension evaluation & ACE-inhibitor medication review'
    },
    {
      id: 'SCH-802',
      dayIndex: 4,
      dateStr: '2026-08-31',
      dayName: 'Monday',
      dayDate: '31 Aug',
      startTime: '10:30 AM',
      endTime: '11:30 AM',
      startHour: 10.5,
      durationHours: 1.0,
      type: 'patient',
      title: 'David Kim',
      patientId: 'PT-55420',
      patientName: 'David Kim',
      tokenNumber: 'T-104',
      phone: '+91 98765 43213',
      age: 41,
      gender: 'Male',
      bloodGroup: 'A- Negative',
      consultationType: 'ECG & Holter Monitor Analysis',
      room: 'OPD Room 104',
      status: 'SCHEDULED',
      notes: 'Palpitations during exercise; Holter report review'
    },
    {
      id: 'SCH-803',
      dayIndex: 4,
      dateStr: '2026-08-31',
      dayName: 'Monday',
      dayDate: '31 Aug',
      startTime: '03:00 PM',
      endTime: '04:00 PM',
      startHour: 15.0,
      durationHours: 1.0,
      type: 'patient',
      title: 'James Wilson',
      patientId: 'PT-88912',
      patientName: 'James Wilson',
      tokenNumber: 'T-106',
      phone: '+91 98765 43215',
      age: 63,
      gender: 'Male',
      bloodGroup: 'AB+ Positive',
      consultationType: 'Post-Angioplasty Stent Follow-up',
      room: 'OPD Room 104',
      status: 'SCHEDULED',
      notes: 'Dual antiplatelet therapy assessment'
    },
    {
      id: 'SCH-804',
      dayIndex: 4,
      dateStr: '2026-08-31',
      dayName: 'Monday',
      dayDate: '31 Aug',
      startTime: '04:30 PM',
      endTime: '05:30 PM',
      startHour: 16.5,
      durationHours: 1.0,
      type: 'patient',
      title: 'Priya Sharma',
      patientId: 'PT-22019',
      patientName: 'Priya Sharma',
      tokenNumber: 'T-105',
      phone: '+91 98765 43214',
      age: 38,
      gender: 'Female',
      bloodGroup: 'B+ Positive',
      consultationType: 'Echocardiogram Diagnostic Review',
      room: 'OPD Room 104',
      status: 'SCHEDULED',
      notes: 'Mild mitral valve prolapse evaluation'
    }
  ]);

  // Patient database & search state
  readonly patients = signal<RegisteredPatient[]>(MOCK_REGISTERED_PATIENTS);
  readonly searchQuery = signal<string>('');
  readonly searchResults = signal<RegisteredPatient[]>([]);

  // Initially no active patient selected until doctor searches and clicks
  readonly activePatient = signal<RegisteredPatient | null>(null);
  readonly activePatientDetails = signal<RegisteredPatient | null>(null);
  readonly isPatientDetailsModalOpen = signal<boolean>(false);
  readonly patientDetailsTab = signal<PatientModalTab>('personal');

  // Left Panel Main Tabs: Clinical Data | Current Medications | Previous Prescriptions | Health Records
  readonly leftPanelTab = signal<DoctorLeftTab>('clinical');

  // ==========================================
  // Prescribe Medications Modal State
  // ==========================================
  readonly isPrescribeModalOpen = signal<boolean>(false);
  readonly isMedicineDropdownOpen = signal<boolean>(false);
  readonly medicineCatalog = signal<MasterMedicine[]>(MOCK_MEDICINE_CATALOG);
  readonly prescribedMedicines = signal<PrescriptionMedicine[]>([]);
  readonly medicineSearchQuery = signal<string>('');
  readonly selectedMasterMedicine = signal<MasterMedicine | null>(null);

  // Active drafted medicine formulation fields
  readonly medDosage = signal<string>('');
  readonly medReason = signal<string>('');

  readonly filteredMasterMedicines = computed(() => {
    const q = this.medicineSearchQuery().trim().toLowerCase();
    const list = this.medicineCatalog();
    if (!q) {
      return list;
    }

    // Match strictly against medicine name, generic name, composition, and ID
    const matches = list.filter(m => {
      const name = m.name.toLowerCase();
      const generic = m.genericName.toLowerCase();
      const comp = m.composition.toLowerCase();
      const id = m.id.toLowerCase();
      return name.includes(q) || generic.includes(q) || comp.includes(q) || id.includes(q);
    });

    // Rank prefix matches (medicine name starting with query or word in name starting with query) first
    return matches.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      const aStarts = aName.startsWith(q) || aName.split(/[\s\-\/]+/).some(w => w.startsWith(q));
      const bStarts = bName.startsWith(q) || bName.split(/[\s\-\/]+/).some(w => w.startsWith(q));

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      return aName.localeCompare(bName);
    });
  });

  // Add Vitals Modal
  readonly isAddVitalsModalOpen = signal<boolean>(false);

  // Left Panel: Active Patient Medications Pagination
  readonly activeMedicationsPage = signal<number>(1);
  readonly totalActiveMedicationsPages = computed(() => {
    const list = this.activePatient()?.currentMedications || [];
    return Math.ceil(list.length / 5) || 1;
  });
  readonly paginatedActiveMedications = computed(() => {
    const list = this.activePatient()?.currentMedications || [];
    const page = Math.min(this.activeMedicationsPage(), this.totalActiveMedicationsPages());
    const start = (page - 1) * 5;
    return list.slice(start, start + 5);
  });

  // Left Panel: Active Patient Prescriptions Pagination
  readonly activePrescriptionsPage = signal<number>(1);
  readonly totalActivePrescriptionsPages = computed(() => {
    const list = this.activePatient()?.previousVisits || [];
    return Math.ceil(list.length / 5) || 1;
  });
  readonly paginatedActivePrescriptions = computed(() => {
    const list = this.activePatient()?.previousVisits || [];
    const page = Math.min(this.activePrescriptionsPage(), this.totalActivePrescriptionsPages());
    const start = (page - 1) * 5;
    return list.slice(start, start + 5);
  });

  // Left Panel: Active Patient Health Records Pagination
  readonly activeRecordsPage = signal<number>(1);
  readonly totalActiveRecordsPages = computed(() => {
    const list = this.activePatient()?.healthRecords || [];
    return Math.ceil(list.length / 5) || 1;
  });
  readonly paginatedActiveRecords = computed(() => {
    const list = this.activePatient()?.healthRecords || [];
    const page = Math.min(this.activeRecordsPage(), this.totalActiveRecordsPages());
    const start = (page - 1) * 5;
    return list.slice(start, start + 5);
  });

  // Clinical Data Sub-Tab Switcher in Main Doctor Panel (Recent Vitals, Allergies, Chronics)
  readonly clinicalDataSubTab = signal<'vitals' | 'allergies' | 'chronics'>('vitals');

  private parseDateToTimestamp(dateStr?: string): number {
    if (!dateStr) return 0;
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) return parsed;
    const parts = dateStr.split(/[\s,]+/);
    if (parts.length >= 3) {
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      const fallback = Date.parse(`${month} ${day}, ${year}`);
      if (!isNaN(fallback)) return fallback;
    }
    return 0;
  }

  // Sorted Allergies (Most Recent Diagnosis on Top)
  readonly sortedActivePatientAllergies = computed(() => {
    const list = [...(this.activePatient()?.allergies || [])];
    return list.sort((a, b) => {
      const dateA = this.parseDateToTimestamp(a.diagnosedDate);
      const dateB = this.parseDateToTimestamp(b.diagnosedDate);
      return dateB - dateA;
    });
  });

  // Left Panel: Active Patient Allergies Pagination
  readonly activeAllergiesPage = signal<number>(1);
  readonly totalActiveAllergiesPages = computed(() => {
    const list = this.sortedActivePatientAllergies();
    return Math.ceil(list.length / 5) || 1;
  });
  readonly paginatedActiveAllergies = computed(() => {
    const list = this.sortedActivePatientAllergies();
    const page = Math.min(this.activeAllergiesPage(), this.totalActiveAllergiesPages());
    const start = (page - 1) * 5;
    return list.slice(start, start + 5);
  });

  // Sorted Chronic Conditions (Most Recent Diagnosis on Top)
  readonly sortedActivePatientChronics = computed(() => {
    const list = [...(this.activePatient()?.chronicConditionsList || [])];
    return list.sort((a, b) => {
      const dateA = this.parseDateToTimestamp(a.diagnosedDate);
      const dateB = this.parseDateToTimestamp(b.diagnosedDate);
      return dateB - dateA;
    });
  });

  // Left Panel: Active Patient Chronics Pagination
  readonly activeChronicsPage = signal<number>(1);
  readonly totalActiveChronicsPages = computed(() => {
    const list = this.sortedActivePatientChronics();
    return Math.ceil(list.length / 5) || 1;
  });
  readonly paginatedActiveChronics = computed(() => {
    const list = this.sortedActivePatientChronics();
    const page = Math.min(this.activeChronicsPage(), this.totalActiveChronicsPages());
    const start = (page - 1) * 5;
    return list.slice(start, start + 5);
  });

  // Patient 360° Modal: Vitals Pagination
  readonly modalVitalsPage = signal<number>(1);
  readonly totalModalVitalsPages = computed(() => {
    const list = this.activePatientDetails()?.previousVitals || [];
    return Math.ceil(list.length / 5) || 1;
  });
  readonly paginatedModalVitals = computed(() => {
    const list = this.activePatientDetails()?.previousVitals || [];
    const page = Math.min(this.modalVitalsPage(), this.totalModalVitalsPages());
    const start = (page - 1) * 5;
    return list.slice(start, start + 5);
  });

  // Patient 360° Modal: Allergies Pagination
  readonly modalAllergiesPage = signal<number>(1);
  readonly totalModalAllergiesPages = computed(() => {
    const list = this.activePatientDetails()?.allergies || [];
    return Math.ceil(list.length / 5) || 1;
  });
  readonly paginatedModalAllergies = computed(() => {
    const list = this.activePatientDetails()?.allergies || [];
    const page = Math.min(this.modalAllergiesPage(), this.totalModalAllergiesPages());
    const start = (page - 1) * 5;
    return list.slice(start, start + 5);
  });

  // Patient 360° Modal: Chronics Pagination
  readonly modalChronicsPage = signal<number>(1);
  readonly totalModalChronicsPages = computed(() => {
    const list = this.activePatientDetails()?.chronicConditionsList || [];
    return Math.ceil(list.length / 5) || 1;
  });
  readonly paginatedModalChronics = computed(() => {
    const list = this.activePatientDetails()?.chronicConditionsList || [];
    const page = Math.min(this.modalChronicsPage(), this.totalModalChronicsPages());
    const start = (page - 1) * 5;
    return list.slice(start, start + 5);
  });

  // Patient 360° Modal: Medications Pagination
  readonly modalMedicationsPage = signal<number>(1);
  readonly totalModalMedicationsPages = computed(() => {
    const list = this.activePatientDetails()?.currentMedications || [];
    return Math.ceil(list.length / 5) || 1;
  });
  readonly paginatedModalMedications = computed(() => {
    const list = this.activePatientDetails()?.currentMedications || [];
    const page = Math.min(this.modalMedicationsPage(), this.totalModalMedicationsPages());
    const start = (page - 1) * 5;
    return list.slice(start, start + 5);
  });

  // Patient 360° Modal: Visits Pagination
  readonly modalVisitsPage = signal<number>(1);
  readonly totalModalVisitsPages = computed(() => {
    const list = this.activePatientDetails()?.previousVisits || [];
    return Math.ceil(list.length / 5) || 1;
  });
  readonly paginatedModalVisits = computed(() => {
    const list = this.activePatientDetails()?.previousVisits || [];
    const page = Math.min(this.modalVisitsPage(), this.totalModalVisitsPages());
    const start = (page - 1) * 5;
    return list.slice(start, start + 5);
  });

  // Patient 360° Modal: Health Records Pagination
  readonly modalRecordsPage = signal<number>(1);
  readonly totalModalRecordsPages = computed(() => {
    const list = this.activePatientDetails()?.healthRecords || [];
    return Math.ceil(list.length / 5) || 1;
  });
  readonly paginatedModalRecords = computed(() => {
    const list = this.activePatientDetails()?.healthRecords || [];
    const page = Math.min(this.modalRecordsPage(), this.totalModalRecordsPages());
    const start = (page - 1) * 5;
    return list.slice(start, start + 5);
  });

  // Clinical & Vitals 3-SubTab Switcher in Patient 360 Modal
  readonly clinicalSubTab = signal<'vitals' | 'allergies' | 'chronic'>('vitals');

  // Sub-modal states for Prescription & Receipt viewing
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

  // IDs of patients whose vitals have been recorded in current session
  readonly completedPatientIds = signal<string[]>([]);

  readonly isSavingVitals = signal<boolean>(false);

  vitalsForm = this.fb.group({
    weight: ['', [Validators.required]],
    bp: ['', [Validators.required]],
    pulse: ['', [Validators.required]],
    spo2: ['', [Validators.required]],
    bloodSugar: ['', [Validators.required]],
    temperature: ['', [Validators.required]]
  });

  openAddVitalsModal(): void {
    this.vitalsForm.reset({
      weight: '',
      bp: '',
      pulse: '',
      spo2: '',
      bloodSugar: '',
      temperature: ''
    });
    this.isAddVitalsModalOpen.set(true);
  }

  closeAddVitalsModal(): void {
    this.isAddVitalsModalOpen.set(false);
  }

  onSaveVitals(): void {
    if (this.vitalsForm.invalid) {
      this.vitalsForm.markAllAsTouched();
      return;
    }

    const currentPatient = this.activePatient();
    if (!currentPatient) return;

    this.isSavingVitals.set(true);
    const val = this.vitalsForm.value;
    const now = new Date();
    const recordedAt = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const weightStr = val.weight?.trim().toLowerCase().includes('kg') ? val.weight.trim() : `${val.weight?.trim()} kg`;
    const bpStr = val.bp?.trim().toLowerCase().includes('mmhg') ? val.bp.trim() : `${val.bp?.trim()} mmHg`;
    const pulseStr = val.pulse?.trim().toLowerCase().includes('bpm') ? val.pulse.trim() : `${val.pulse?.trim()} bpm`;
    const spo2Str = val.spo2?.trim().includes('%') ? val.spo2.trim() : `${val.spo2?.trim()}%`;
    const sugarStr = val.bloodSugar?.trim().toLowerCase().includes('mg/dl') ? val.bloodSugar.trim() : `${val.bloodSugar?.trim()} mg/dL`;
    const tempStr = val.temperature?.trim().toLowerCase().includes('°f') || val.temperature?.trim().toLowerCase().includes('f') ? val.temperature.trim() : `${val.temperature?.trim()} °F`;

    const newVitals: PatientVitals = {
      bp: bpStr,
      pulse: pulseStr,
      temp: tempStr,
      spo2: spo2Str,
      weight: weightStr,
      bmi: currentPatient.vitals?.bmi || '24.1',
      bloodSugar: sugarStr,
      recordedAt
    };

    const updatedPrevious = [newVitals, ...(currentPatient.previousVitals || [])];
    const updatedPatient: RegisteredPatient = {
      ...currentPatient,
      vitals: newVitals,
      previousVitals: updatedPrevious
    };

    this.completedPatientIds.update(ids => ids.includes(currentPatient.id) ? ids : [...ids, currentPatient.id]);
    this.patients.update(list => list.map(p => p.id === currentPatient.id ? updatedPatient : p));
    this.activePatient.set(updatedPatient);
    if (this.activePatientDetails()?.id === currentPatient.id) {
      this.activePatientDetails.set(updatedPatient);
    }

    setTimeout(() => {
      this.isSavingVitals.set(false);
      this.closeAddVitalsModal();
      this.modalService.showToast('Vitals Recorded', `New vitals recorded successfully for ${currentPatient.name}.`, 'success');
    }, 250);
  }

  selectPatient(patient: RegisteredPatient): void {
    this.activePatient.set(patient);
    this.activeAllergiesPage.set(1);
    this.activeChronicsPage.set(1);
    this.activeMedicationsPage.set(1);
    this.activePrescriptionsPage.set(1);
    this.activeRecordsPage.set(1);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  onSearchInputChange(query: string): void {
    this.searchQuery.set(query);
    const q = query.trim().toLowerCase();
    if (!q) {
      this.searchResults.set([]);
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
    this.searchResults.set(matches);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
  }

  selectSearchResultPatient(patient: RegisteredPatient): void {
    this.selectPatient(patient);
    this.clearSearch();
  }

  onConsulted(): void {
    const current = this.activePatient();
    if (current) {
      this.completedPatientIds.update(ids => ids.includes(current.id) ? ids : [...ids, current.id]);
      this.modalService.showToast(
        'Consultation Completed',
        `Consultation with ${current.name} (${current.id}) marked as completed.`,
        'success'
      );
    }
    this.activePatient.set(null);
    this.clearSearch();
  }

  openPatientDetailsModal(patient: RegisteredPatient): void {
    this.activePatientDetails.set(patient);
    this.patientDetailsTab.set('personal');
    this.clinicalSubTab.set('vitals');
    this.modalVitalsPage.set(1);
    this.modalAllergiesPage.set(1);
    this.modalChronicsPage.set(1);
    this.modalMedicationsPage.set(1);
    this.modalVisitsPage.set(1);
    this.modalRecordsPage.set(1);
    this.isPatientDetailsModalOpen.set(true);
  }

  openPrescribeModal(): void {
    const current = this.activePatient();
    if (!current) {
      this.modalService.showToast('No Patient Selected', 'Please select a patient from the queue before prescribing.', 'warning');
      return;
    }

    this.prescribedMedicines.set([]);
    this.selectedMasterMedicine.set(null);
    this.medicineSearchQuery.set('');
    this.isMedicineDropdownOpen.set(false);
    this.medDosage.set('');
    this.medReason.set('');

    this.isPrescribeModalOpen.set(true);
  }

  closePrescribeModal(): void {
    this.isPrescribeModalOpen.set(false);
    this.isMedicineDropdownOpen.set(false);
  }

  onMedicineSearchChange(query: string): void {
    this.medicineSearchQuery.set(query);
    this.isMedicineDropdownOpen.set(query.trim().length > 0);
  }

  clearMedicineSearch(): void {
    this.medicineSearchQuery.set('');
    this.selectedMasterMedicine.set(null);
    this.isMedicineDropdownOpen.set(false);
  }

  selectMasterMedicine(med: MasterMedicine): void {
    this.selectedMasterMedicine.set(med);
    this.medicineSearchQuery.set(med.name);
    this.isMedicineDropdownOpen.set(false);
    this.medDosage.set(med.defaultDosage);
    this.medReason.set(med.defaultInstructions || med.defaultReason);
  }

  clearSelectedMasterMedicine(): void {
    this.selectedMasterMedicine.set(null);
    this.medicineSearchQuery.set('');
    this.isMedicineDropdownOpen.set(false);
    this.medDosage.set('');
    this.medReason.set('');
  }

  addMedicineToPrescription(): void {
    const selected = this.selectedMasterMedicine();
    const searched = this.medicineSearchQuery().trim();
    const medName = selected?.name || searched;

    if (!medName) {
      this.modalService.showToast('Missing Medicine Name', 'Please search and select a medicine.', 'warning');
      return;
    }

    const dosage = this.medDosage().trim();
    if (!dosage) {
      this.modalService.showToast('Missing Dosage', 'Please enter dosage in text (e.g. 1 Tablet twice daily after food).', 'warning');
      return;
    }

    const directions = this.medReason().trim() || selected?.defaultInstructions || selected?.defaultReason || 'Take as directed by physician';

    const newItem: PrescriptionMedicine = {
      name: medName,
      dosage,
      frequency: selected?.defaultFrequency || 'As prescribed',
      duration: selected?.defaultDuration || '5 Days',
      instructions: directions,
      reason: directions,
      form: selected?.dosageForm || 'Tablet',
      strength: selected?.strength || ''
    };

    this.prescribedMedicines.update(list => [...list, newItem]);

    // Clear right panel formulation fields ready for next medicine!
    this.selectedMasterMedicine.set(null);
    this.medicineSearchQuery.set('');
    this.isMedicineDropdownOpen.set(false);
    this.medDosage.set('');
    this.medReason.set('');

    this.modalService.showToast('Medicine Added', `${newItem.name} added to prescription pad.`, 'info');
  }

  removePrescribedMedicine(index: number): void {
    const item = this.prescribedMedicines()[index];
    this.prescribedMedicines.update(list => list.filter((_, i) => i !== index));
    if (item) {
      this.modalService.showToast('Medicine Removed', `${item.name} removed from prescription.`, 'info');
    }
  }

  onSavePrescriptionAndDone(): void {
    const currentPatient = this.activePatient();
    if (!currentPatient) return;

    if (this.prescribedMedicines().length === 0) {
      this.modalService.showToast('No Medicines Prescribed', 'Please search and add at least one medicine before completing prescription.', 'warning');
      return;
    }

    const currentDoctor = this.doctor()?.name || 'Dr. Sarah Johnson';
    const now = new Date();
    const dateStr = `${now.getDate()} ${now.toLocaleString('en-US', { month: 'short' })} ${now.getFullYear()}`;
    const rxNumber = 'RX-' + Math.floor(100000 + Math.random() * 900000);
    const diagnosis = currentPatient.previousVisits?.[0]?.diagnosis || 'Clinical Consultation & Prescription';

    const newPrescription: PrescriptionDetails = {
      rxNumber,
      date: dateStr,
      doctorReg: this.doctor()?.id ? `MD-${this.doctor()?.id}` : 'MD-884102',
      diagnosis,
      clinicalNotes: 'Prescribed structured medications following evaluation.',
      medicines: [...this.prescribedMedicines()],
      advice: ['Follow prescribed dosage and maintain adequate hydration.'],
      nextFollowUp: '7 Days'
    };

    const newVisit: PatientPreviousVisit = {
      id: 'VST-' + Math.floor(1000 + Math.random() * 9000),
      date: dateStr,
      timeSlot: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      doctorName: currentDoctor,
      specialty: 'Cardiology & Clinical Care',
      room: 'OPD Consultation Room 104',
      reason: diagnosis,
      diagnosis,
      type: 'In-Person OPD',
      status: 'Completed',
      prescription: newPrescription
    };

    const newMedications: PatientMedication[] = this.prescribedMedicines().map(m => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      timing: m.instructions,
      doctor: currentDoctor,
      startDate: dateStr,
      refillsRemaining: 2,
      pharmacy: 'HMS Main Pharmacy (Floor 1)'
    }));

    const updatedPatient: RegisteredPatient = {
      ...currentPatient,
      previousVisits: [newVisit, ...(currentPatient.previousVisits || [])],
      currentMedications: [...newMedications, ...(currentPatient.currentMedications || [])]
    };

    // Update patient in state & queue
    this.completedPatientIds.update(ids => ids.includes(currentPatient.id) ? ids : [...ids, currentPatient.id]);
    this.patients.update(list => list.map(p => p.id === currentPatient.id ? updatedPatient : p));
    this.activePatient.set(updatedPatient);
    if (this.activePatientDetails()?.id === currentPatient.id) {
      this.activePatientDetails.set(updatedPatient);
    }

    this.isPrescribeModalOpen.set(false);
    this.isMedicineDropdownOpen.set(false);
    this.leftPanelTab.set('prescriptions');
    this.activePrescriptionsPage.set(1);

    this.modalService.showToast(
      'Prescription Completed',
      `Prescription ${rxNumber} generated successfully for ${currentPatient.name}. Sent to Pharmacy queue.`,
      'success'
    );
  }

  onLogout(): void {
    this.modalService.confirm({
      title: 'Confirm Logout',
      message: 'Are you sure you want to end your doctor session and log out?',
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

  // ==========================================
  // SCHEDULE METHODS
  // ==========================================
  getSlotsForDay(dayIndex: number): DoctorScheduleSlot[] {
    return this.scheduleSlots().filter(s => s.dayIndex === dayIndex && s.type === 'patient');
  }

  onSlotClick(slot: DoctorScheduleSlot): void {
    this.selectedScheduleSlot.set(slot);
  }

  onTodayClick(): void {
    this.scheduleViewMode.set('workweek');
    this.modalService.showToast('Today', 'Viewing current week schedule (Thu, 27 Aug 2026).', 'info');
  }

  onPrevWeek(): void {
    this.modalService.showToast('Previous Week', 'Viewing week of 17 Aug – 22 Aug 2026.', 'info');
  }

  onNextWeek(): void {
    this.modalService.showToast('Next Week', 'Viewing week of 31 Aug – 05 Sep 2026.', 'info');
  }

  openAddSlotModal(): void {
    this.newSlotDay.set(3);
    this.newSlotType.set('patient');
    this.newSlotTitle.set('');
    this.newSlotStartTime.set('11:30 AM');
    this.newSlotEndTime.set('12:30 PM');
    this.newSlotRoom.set('OPD Room 104');
    this.isAddSlotModalOpen.set(true);
  }

  saveNewScheduleSlot(): void {
    const title = this.newSlotTitle().trim();
    if (!title) {
      this.modalService.showToast('Missing Title', 'Please enter a patient name or slot title.', 'warning');
      return;
    }

    const dayIdx = Number(this.newSlotDay());
    const dayObj = this.scheduleDays.find(d => d.index === dayIdx) || this.scheduleDays[3];

    const newSlot: DoctorScheduleSlot = {
      id: 'SCH-' + Math.floor(1000 + Math.random() * 9000),
      dayIndex: dayIdx,
      dateStr: dayObj.fullDate,
      dayName: dayObj.dayName,
      dayDate: `${dayObj.dateNumber} Aug`,
      startTime: this.newSlotStartTime().trim() || '11:30 AM',
      endTime: this.newSlotEndTime().trim() || '12:30 PM',
      startHour: 11.5,
      durationHours: 1.0,
      type: this.newSlotType(),
      title,
      patientName: this.newSlotType() === 'patient' ? title : undefined,
      patientId: this.newSlotType() === 'patient' ? 'PT-' + Math.floor(10000 + Math.random() * 90000) : undefined,
      tokenNumber: this.newSlotType() === 'patient' ? 'T-' + Math.floor(100 + Math.random() * 900) : undefined,
      phone: '+91 98765 43210',
      age: 45,
      gender: 'Other',
      bloodGroup: 'B+ Positive',
      consultationType: this.newSlotType() === 'patient' ? 'Scheduled Clinical Consultation' : undefined,
      room: this.newSlotRoom().trim() || 'OPD Room 104',
      status: 'SCHEDULED',
      notes: 'Scheduled by Doctor'
    };

    this.scheduleSlots.update(slots => [...slots, newSlot]);
    this.isAddSlotModalOpen.set(false);
    this.modalService.showToast('Slot Scheduled', `Added slot "${title}" to ${dayObj.dayName} schedule.`, 'success');
  }

  openConsultationFromSchedule(slot: DoctorScheduleSlot): void {
    this.selectedScheduleSlot.set(null);
    if (!slot.patientId && !slot.patientName) {
      this.doctorNavTab.set('consult');
      return;
    }

    // Find in patients list or build patient
    const found = this.patients().find(p => p.id === slot.patientId || p.name.toLowerCase() === slot.patientName?.toLowerCase());
    if (found) {
      this.selectPatient(found);
    } else {
      const fallback = this.patients()[0];
      if (fallback) this.selectPatient(fallback);
    }

    this.doctorNavTab.set('consult');
    this.modalService.showToast(
      'Consultation Opened',
      `Loaded consultation details for ${slot.patientName || slot.title}.`,
      'info'
    );
  }

  getSlotTop(startHour: number): string {
    const offset = Math.max(0, startHour - 8.0);
    return `${offset * 140}px`;
  }

  getSlotHeight(durationHours: number): string {
    const heightPx = Math.max(50, durationHours * 140 - 4);
    return `${heightPx}px`;
  }
}
