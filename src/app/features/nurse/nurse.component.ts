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
  ReceiptDetails
} from '../../core/models/patient.model';

type PatientModalTab = 'personal' | 'clinical' | 'medications' | 'visits' | 'records';

@Component({
  selector: 'app-nurse',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, IconComponent, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-teal-500 selection:text-white relative overflow-x-hidden">
      
      <!-- TOP NAVIGATION BAR -->
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

          <!-- Right Side: Nurse Profile Badge & Logout -->
          <div class="flex items-center gap-2 sm:gap-3 shrink-0">
            <div class="flex items-center gap-2 bg-slate-100/90 border border-slate-200 rounded-full py-1 pl-1.5 pr-3">
              <app-avatar [name]="nurse()?.name || 'Emily Watson'" sizeClass="w-7 h-7 rounded-full" />
              <div class="flex flex-col text-left hidden sm:flex">
                <span class="text-xs font-bold text-slate-800 leading-tight">
                  {{ nurse()?.name || 'Emily Watson' }}
                </span>
                <span class="text-xs text-cyan-700 font-medium leading-none">
                  Nurse ({{ nurse()?.id || 'NUR-1042' }})
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

      <!-- MAIN CONTENT: Below nav bar showing nurse portal & search bar -->
      <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5 flex flex-col z-10">
        
        <!-- 1. UNIVERSAL PATIENT SEARCH & NURSE ACTIONS BAR (SAME AS RECEPTIONIST) -->
        <div class="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs relative z-30">
          <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            
            <!-- Nurse Title -->
            <div class="flex items-center gap-2.5 shrink-0">
              <div class="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-700 flex items-center justify-center">
                <app-icon name="activity" wrapperClass="w-4 h-4" />
              </div>
              <div>
                <h1 class="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
                  Nurse
                </h1>
                <span class="text-xs font-medium text-slate-500 leading-none">Ward & Patient Care</span>
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

        <!-- GRID LAYOUT: ACTIVE PATIENT DETAILS & VITALS TABLE ON LEFT (2 COLS) + PATIENTS QUEUE ON RIGHT (1 COL) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 animate-fade-in items-start">
          
          <!-- LEFT COLUMN (2 COLS): ACTIVE PATIENT DETAILS & VITALS TABLE -->
          <div class="lg:col-span-2 space-y-4">
            @if (activePatient()) {
              <div class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4 animate-fade-in">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-3.5 border-b border-slate-100">
                  <div class="flex items-center gap-3.5">
                    <!-- Squircle Avatar with Initials -->
                    <div class="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 text-white font-bold text-lg flex items-center justify-center shadow-xs shrink-0">
                      {{ getInitials(activePatient()!.name) }}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                          {{ activePatient()!.name }}
                        </h2>
                        <span class="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-[#e6fbf7] text-[#0d9488] border border-[#a7f3d0]">
                          {{ activePatient()!.id }}
                        </span>
                        <span class="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                          Token: {{ activePatient()!.tokenNumber || 'T-102' }}
                        </span>
                      </div>
                      <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
                        {{ activePatient()!.gender }}, {{ activePatient()!.age }} yrs • Blood: <strong class="text-slate-900 font-bold">{{ activePatient()!.bloodGroup }}</strong> • Primary Doctor: {{ activePatient()!.primaryPhysician }}
                      </p>
                    </div>
                  </div>

                  <!-- Action buttons -->
                  <div class="flex items-center gap-2.5 shrink-0">
                    <button 
                      type="button" 
                      (click)="openPatientDetailsModal(activePatient()!)"
                      class="px-4 py-2 rounded-xl bg-[#ecfdf5] hover:bg-[#d1fae5] border border-[#a7f3d0] text-[#047857] text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs active:scale-95"
                    >
                      <app-icon name="user" wrapperClass="w-4 h-4 text-[#059669]" />
                      <span>Full 360° Profile</span>
                    </button>
                  </div>
                </div>

                <!-- PATIENT VITALS HISTORY SECTION (TABLE WITH PAGINATOR & ADD BUTTON) -->
                <div class="space-y-3 pt-1">
                  <!-- Top Bar: Heading on Left, Add New Vitals Button on Right -->
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Patient Vitals History</span>
                      <span class="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                        {{ (activePatient()?.previousVitals || []).length }} Records
                      </span>
                    </div>

                    <button 
                      type="button" 
                      (click)="openAddVitalsModal()"
                      class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <app-icon name="plus" wrapperClass="w-4 h-4 text-white" />
                      <span>Add New Vitals</span>
                    </button>
                  </div>

                  <!-- Vitals Table -->
                  <div class="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xs">
                    <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
                            <th class="py-3 px-4 whitespace-nowrap">Date & Time</th>
                            <th class="py-3 px-4">Weight</th>
                            <th class="py-3 px-4">BP</th>
                            <th class="py-3 px-4">Pulse</th>
                            <th class="py-3 px-4">SpO2</th>
                            <th class="py-3 px-4 whitespace-nowrap">Blood Sugar</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-800">
                          @for (v of paginatedNurseVitals(); track v.recordedAt) {
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
                                No previous vitals recorded for this patient. Click "Add New Vitals" to record.
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>

                    <!-- Table Paginator: Patient Vitals History (10 Rows Default) -->
                    <div class="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 select-none text-xs text-slate-600">
                      <div>
                        @if ((activePatient()?.previousVitals || []).length > 0) {
                          Showing <strong class="text-slate-900 font-semibold">{{ (nurseVitalsPage() - 1) * nurseVitalsPageSize() + 1 }}</strong> to <strong class="text-slate-900 font-semibold">{{ Math.min(nurseVitalsPage() * nurseVitalsPageSize(), (activePatient()?.previousVitals || []).length) }}</strong> of <strong class="text-slate-900 font-semibold">{{ (activePatient()?.previousVitals || []).length }}</strong> vitals records
                        } @else {
                          <span>0 vitals records</span>
                        }
                      </div>

                      <div class="flex items-center gap-2">
                        <div class="flex items-center gap-1">
                          <button 
                            type="button" 
                            (click)="firstNurseVitalsPage()"
                            [disabled]="nurseVitalsPage() === 1"
                            class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                            title="First Page"
                          >
                            &laquo;
                          </button>
                          <button 
                            type="button" 
                            (click)="prevNurseVitalsPage()"
                            [disabled]="nurseVitalsPage() === 1"
                            class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                            title="Previous Page"
                          >
                            &lsaquo;
                          </button>
                          @for (p of getNurseVitalsPagesArray(); track p) {
                            <button 
                              type="button" 
                              (click)="setNurseVitalsPage(p)"
                              class="w-7 h-7 rounded-full text-xs transition cursor-pointer flex items-center justify-center font-bold"
                              [class]="nurseVitalsPage() === p 
                                ? 'bg-teal-50 text-teal-700 border border-teal-300 shadow-2xs font-extrabold ring-2 ring-teal-500/10' 
                                : 'text-slate-600 hover:bg-slate-100'"
                            >
                              {{ p }}
                            </button>
                          }
                          <button 
                            type="button" 
                            (click)="nextNurseVitalsPage()"
                            [disabled]="nurseVitalsPage() === totalNurseVitalsPages()"
                            class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                            title="Next Page"
                          >
                            &rsaquo;
                          </button>
                          <button 
                            type="button" 
                            (click)="lastNurseVitalsPage()"
                            [disabled]="nurseVitalsPage() === totalNurseVitalsPages()"
                            class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center cursor-pointer transition text-xs font-bold"
                            title="Last Page"
                          >
                            &raquo;
                          </button>
                        </div>

                        <div class="relative flex items-center pl-1 border-l border-slate-200">
                          <select 
                            [ngModel]="nurseVitalsPageSize()" 
                            (ngModelChange)="onNurseVitalsPageSizeChange($event)"
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
            } @else {
              <!-- NO PATIENT SELECTED -->
              <div class="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-center max-w-xl mx-auto space-y-4 animate-fade-in my-6">
                <div class="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-600 flex items-center justify-center mx-auto shadow-inner">
                  <app-icon name="check-circle" wrapperClass="w-8 h-8 text-teal-600" />
                </div>
                <div class="space-y-1.5">
                  <h2 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    No Patient Selected
                  </h2>
                  <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    Select a patient from the queue on the right to view their vitals history and medical profile.
                  </p>
                </div>
                <div class="pt-2">
                  <button 
                    type="button" 
                    (click)="resetQueue()"
                    class="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-sm active:scale-95 inline-flex items-center gap-2"
                  >
                    <app-icon name="activity" wrapperClass="w-4 h-4 text-white" />
                    <span>Reload Patient Queue</span>
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- RIGHT COLUMN (1 COL): PATIENT QUEUE (MATCHING DOCTOR OPD ROOMS CARD DESIGN) -->
          <div class="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3.5 sticky top-20">
            <div>
              <div class="flex items-center justify-between">
                <h2 class="text-base font-bold text-slate-900 tracking-tight">Today's Patient Queue</h2>
                <span class="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  {{ patients().length }} in Queue
                </span>
              </div>
              <p class="text-xs text-slate-500 font-medium mt-0.5">Patient triage status & live consultation queue</p>
            </div>

            <div class="space-y-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              @for (p of patients(); track p.id) {
                <button
                  type="button"
                  (click)="selectPatient(p)"
                  class="w-full p-3.5 rounded-2xl border text-left transition cursor-pointer space-y-2 block group relative"
                  [class]="activePatient()?.id === p.id 
                    ? 'bg-teal-50/70 border-teal-300 ring-2 ring-teal-500/20 shadow-xs' 
                    : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300'"
                >
                  <!-- Top Row: Name + Subtitle on Left, Status Badge on Right -->
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0 flex-1">
                      <div class="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-teal-900 transition-colors truncate">
                        {{ p.name }}
                      </div>
                      <div class="text-xs text-teal-700 font-medium mt-0.5 truncate">
                        {{ p.gender }}, {{ p.age }} yrs • Blood: <strong class="text-teal-900">{{ p.bloodGroup }}</strong>
                      </div>
                    </div>

                    <!-- Status Badge (Matching CONSULTING / AVAILABLE style) -->
                    <span 
                      class="px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider shrink-0"
                      [class]="completedPatientIds().includes(p.id) 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/60' 
                        : (p.tokenNumber === 'T-101' || p.tokenNumber === 'T-103'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200/60' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200/60')"
                    >
                      {{ completedPatientIds().includes(p.id) ? 'Vitals Done' : (p.tokenNumber === 'T-101' || p.tokenNumber === 'T-103' ? 'Consulting' : 'Waiting') }}
                    </span>
                  </div>

                  <!-- Bottom Row: Doctor on Left, Token on Right -->
                  <div class="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                    <span class="truncate pr-2">Doctor: <strong class="text-slate-800 font-medium">{{ p.primaryPhysician }}</strong></span>
                    <span class="shrink-0">Active: <strong class="text-teal-700 font-mono font-bold">{{ p.tokenNumber || 'T-102' }}</strong></span>
                  </div>
                </button>
              }
            </div>
          </div>

        </div>

      </main>

      <!-- ============================================================= -->
      <!-- FULL PATIENT DETAILS 360° MODAL (SAME AS RECEPTIONIST) -->
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
      <!-- FULL PRESCRIPTION (Rx) DIALOG MODAL -->
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
      <!-- FULL PAYMENT RECEIPT / INVOICE DIALOG MODAL -->
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

      <!-- ADD NEW VITALS POPUP MODAL -->
      @if (isAddVitalsModalOpen()) {
        <div 
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          (click)="closeAddVitalsModal()"
        >
          <div 
            class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up"
            (click)="$event.stopPropagation()"
          >
            <!-- Modal Header -->
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

              <button 
                type="button" 
                (click)="closeAddVitalsModal()"
                class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition"
                aria-label="Close"
              >
                <app-icon name="x" wrapperClass="w-4 h-4" />
              </button>
            </div>

            <!-- Modal Body Form -->
            <form [formGroup]="vitalsForm" (ngSubmit)="onSaveVitals()" class="p-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <!-- Weight -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Weight <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    formControlName="weight"
                    placeholder="e.g. 78 kg"
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-2xs"
                    [class.border-rose-400]="isFieldInvalid('weight')"
                  />
                </div>

                <!-- BP -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    BP <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    formControlName="bp"
                    placeholder="e.g. 120/80 mmHg"
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-2xs"
                    [class.border-rose-400]="isFieldInvalid('bp')"
                  />
                </div>

                <!-- Pulse -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pulse <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    formControlName="pulse"
                    placeholder="e.g. 72 bpm"
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-2xs"
                    [class.border-rose-400]="isFieldInvalid('pulse')"
                  />
                </div>

                <!-- SpO2 -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    SpO2 <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    formControlName="spo2"
                    placeholder="e.g. 98%"
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-2xs"
                    [class.border-rose-400]="isFieldInvalid('spo2')"
                  />
                </div>

                <!-- Blood Sugar -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Blood Sugar <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    formControlName="bloodSugar"
                    placeholder="e.g. 110 mg/dL"
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-2xs"
                    [class.border-rose-400]="isFieldInvalid('bloodSugar')"
                  />
                </div>

                <!-- Temperature -->
                <div>
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Temperature <span class="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    formControlName="temperature"
                    placeholder="e.g. 98.6 °F"
                    class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs sm:text-sm placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition shadow-2xs"
                    [class.border-rose-400]="isFieldInvalid('temperature')"
                  />
                </div>
              </div>

              <!-- Modal Footer Actions -->
              <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  (click)="closeAddVitalsModal()"
                  class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  [disabled]="vitalsForm.invalid || isSavingVitals()"
                  class="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs active:scale-95 flex items-center gap-1.5"
                >
                  <app-icon name="check" wrapperClass="w-4 h-4 text-white" />
                  <span>Record Vitals</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `
})
export class NurseComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);
  private readonly fb = inject(FormBuilder);
  protected readonly Math = Math;

  readonly nurse = computed(() => this.authService.currentNurse());

  // Patient database & search state (Exact same logic and dataset as receptionist portal)
  readonly patients = signal<RegisteredPatient[]>(MOCK_REGISTERED_PATIENTS);
  readonly searchQuery = signal<string>('');
  readonly searchResults = signal<RegisteredPatient[]>([]);

  // Default active patient set to Robert Langdon (PT-39102) matching screenshot
  readonly activePatient = signal<RegisteredPatient | null>(MOCK_REGISTERED_PATIENTS[1]);
  readonly activePatientDetails = signal<RegisteredPatient | null>(null);
  readonly isPatientDetailsModalOpen = signal<boolean>(false);
  readonly patientDetailsTab = signal<PatientModalTab>('personal');

  // Add Vitals Modal
  readonly isAddVitalsModalOpen = signal<boolean>(false);

  // Table Pagination for Patient Vitals History (10 rows default per referral)
  readonly nurseVitalsPage = signal<number>(1);
  readonly nurseVitalsPageSize = signal<number>(10);

  readonly totalNurseVitalsPages = computed(() => {
    const list = this.activePatient()?.previousVitals || [];
    return Math.ceil(list.length / this.nurseVitalsPageSize()) || 1;
  });

  readonly paginatedNurseVitals = computed(() => {
    const list = this.activePatient()?.previousVitals || [];
    const page = Math.min(this.nurseVitalsPage(), this.totalNurseVitalsPages());
    const start = (page - 1) * this.nurseVitalsPageSize();
    return list.slice(start, start + this.nurseVitalsPageSize());
  });

  setNurseVitalsPage(p: number): void {
    if (p >= 1 && p <= this.totalNurseVitalsPages()) {
      this.nurseVitalsPage.set(p);
    }
  }

  prevNurseVitalsPage(): void {
    this.nurseVitalsPage.update(p => Math.max(1, p - 1));
  }

  nextNurseVitalsPage(): void {
    this.nurseVitalsPage.update(p => Math.min(this.totalNurseVitalsPages(), p + 1));
  }

  firstNurseVitalsPage(): void {
    this.nurseVitalsPage.set(1);
  }

  lastNurseVitalsPage(): void {
    this.nurseVitalsPage.set(this.totalNurseVitalsPages());
  }

  onNurseVitalsPageSizeChange(size: number | string): void {
    this.nurseVitalsPageSize.set(Number(size) || 10);
    this.nurseVitalsPage.set(1);
  }

  getNurseVitalsPagesArray(): number[] {
    const total = this.totalNurseVitalsPages();
    const current = this.nurseVitalsPage();
    const maxButtons = 5;
    if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  // Clinical & Vitals 3-SubTab Switcher in Patient 360 Modal
  readonly clinicalSubTab = signal<'vitals' | 'allergies' | 'chronic'>('vitals');

  // Sub-Tab 1: Vitals History Pagination (in 360 modal)
  readonly patientVitalsPage = signal<number>(1);
  readonly patientVitalsPageSize = signal<number>(10);

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

  // Sub-Tab 2: Allergies & Reactions Pagination (in 360 modal)
  readonly patientAllergiesPage = signal<number>(1);
  readonly patientAllergiesPageSize = signal<number>(10);

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

  // Sub-Tab 3: Chronic Conditions Pagination (in 360 modal)
  readonly patientChronicPage = signal<number>(1);
  readonly patientChronicPageSize = signal<number>(10);

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
  readonly patientMedicationsPage = signal<number>(1);
  readonly patientMedicationsPageSize = signal<number>(10);

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
  readonly patientVisitsPage = signal<number>(1);
  readonly patientVisitsPageSize = signal<number>(10);

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
  readonly patientRecordsPage = signal<number>(1);
  readonly patientRecordsPageSize = signal<number>(10);

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

  // IDs of patients whose vitals have been recorded in current session
  readonly completedPatientIds = signal<string[]>([]);

  // Active waiting queue
  readonly waitingPatients = computed(() => {
    return this.patients().filter(p => !this.completedPatientIds().includes(p.id));
  });

  readonly isSavingVitals = signal<boolean>(false);

  vitalsForm = this.fb.group({
    weight: ['', [Validators.required]],
    bp: ['', [Validators.required]],
    pulse: ['', [Validators.required]],
    spo2: ['', [Validators.required]],
    bloodSugar: ['', [Validators.required]],
    temperature: ['', [Validators.required]]
  });

  isFieldInvalid(field: string): boolean {
    const ctrl = this.vitalsForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

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
    this.nurseVitalsPage.set(1);

    setTimeout(() => {
      this.isSavingVitals.set(false);
      this.closeAddVitalsModal();
      this.modalService.showToast('Vitals Recorded', `New vitals recorded successfully for ${currentPatient.name}.`, 'success');
    }, 250);
  }

  selectPatient(patient: RegisteredPatient): void {
    this.activePatient.set(patient);
    this.nurseVitalsPage.set(1);
  }

  resetQueue(): void {
    this.completedPatientIds.set([]);
    this.activePatient.set(this.patients().find(p => p.id === 'PT-39102') || MOCK_REGISTERED_PATIENTS[1]);
    this.nurseVitalsPage.set(1);
    this.vitalsForm.reset();
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

  selectSearchResultPatient(patient: RegisteredPatient): void {
    this.activePatient.set(patient);
    this.nurseVitalsPage.set(1);
    this.openPatientDetailsModal(patient);
    this.clearSearch();
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

  onLogout(): void {
    this.modalService.confirm({
      title: 'Confirm Logout',
      message: 'Are you sure you want to end your nurse session and log out?',
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
