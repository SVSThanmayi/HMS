import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal.service';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-department-detail-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (modalService.isDepartmentDetailOpen() && modalService.selectedDepartmentDetail(); as dept) {
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-md animate-fade-in" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="dept-modal-title"
      >
        <!-- Modal Backdrop Click Dismiss -->
        <div class="fixed inset-0" (click)="closeModal()"></div>

        <!-- Modal Content Card -->
        <div class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-8">
          
          <!-- Department Banner Image Header with Overlay -->
          <div class="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-900">
            <img 
              [src]="dept.imageUrl" 
              [alt]="dept.name"
              class="w-full h-full object-cover object-center transform scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30"></div>
            
            <!-- Close Button -->
            <button 
              type="button" 
              (click)="closeModal()" 
              class="absolute top-4 right-4 text-white/80 hover:text-white bg-slate-900/60 hover:bg-slate-900/90 rounded-full p-2.5 backdrop-blur-md transition cursor-pointer z-10 border border-white/10 shadow-lg"
              aria-label="Close dialog"
            >
              <app-icon name="x" wrapperClass="w-5 h-5 block" />
            </button>

            <!-- Floating Badge & Title over Image -->
            <div class="absolute bottom-4 left-6 right-6 text-white">
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-600/90 text-white backdrop-blur-sm border border-emerald-400/40">
                  {{ dept.category }}
                </span>
                @if (dept.emergencyAvailable) {
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-500/90 text-white backdrop-blur-sm">
                    24/7 Available
                  </span>
                }
              </div>
              <h2 id="dept-modal-title" class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
                {{ dept.name }}
              </h2>
              <p class="text-xs sm:text-sm text-slate-200 font-medium mt-1 drop-shadow-sm">
                {{ dept.tagline }}
              </p>
            </div>
          </div>

          <!-- Modal Body Content -->
          <div class="p-6 sm:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
            
            <!-- Description -->
            <div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Overview</h3>
              <p class="text-slate-700 text-sm sm:text-base leading-relaxed">
                {{ dept.description }}
              </p>
            </div>

            <!-- Key Highlights / Clinical Services -->
            <div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Clinical Highlights</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                @for (item of dept.highlights; track item) {
                  <div class="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition">
                    <span class="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <app-icon name="check-circle" wrapperClass="w-3.5 h-3.5 block" />
                    </span>
                    <span class="text-xs sm:text-sm font-semibold text-slate-800">{{ item }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Lead Consultant / Head & Schedule Info -->
            <div class="bg-gradient-to-br from-slate-50 to-emerald-50/40 rounded-2xl p-4 sm:p-5 border border-slate-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="space-y-1">
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-700">Department Lead</span>
                <h4 class="text-base font-bold text-slate-900">{{ dept.headDoctor }}</h4>
                <p class="text-xs text-slate-600">{{ dept.headSpecialty }}</p>
              </div>

              <div class="sm:text-right space-y-1 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-5">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Consultation Timings</span>
                <p class="text-xs font-semibold text-slate-800">{{ dept.timings }}</p>
                <p class="text-xs text-emerald-600 font-medium flex items-center gap-1 sm:justify-end">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {{ dept.totalSpecialists }} Active Specialists
                </p>
              </div>
            </div>

          </div>

          <!-- Modal Action Footer -->
          <div class="p-6 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button 
              type="button" 
              (click)="closeModal()" 
              class="w-full sm:w-auto px-6 py-2.5 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs uppercase font-bold tracking-wider transition cursor-pointer"
            >
              Close
            </button>
            <button 
              type="button" 
              (click)="bookConsultation(dept)" 
              class="w-full sm:w-auto px-8 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs uppercase font-bold tracking-wider shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <app-icon name="calendar" wrapperClass="w-4 h-4 block text-white" />
              <span>Book Consultation</span>
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class DepartmentDetailModalComponent {
  readonly modalService = inject(ModalService);

  closeModal(): void {
    this.modalService.closeDepartmentDetailModal();
  }

  bookConsultation(dept: any): void {
    this.modalService.closeDepartmentDetailModal();
    this.modalService.openAppointmentModal(undefined, dept.name);
  }
}
