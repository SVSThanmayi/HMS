import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal.service';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-confirm-dialog-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (modalService.activeConfirmDialog(); as dialog) {
      <div 
        class="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-fade-in" 
        (click)="modalService.dismissConfirm()"
        role="dialog"
        aria-modal="true"
      >
        <div 
          class="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-6 sm:p-7 text-center animate-scale-up space-y-5" 
          (click)="$event.stopPropagation()"
        >
          
          <!-- Icon Indicator -->
          <div class="mx-auto flex items-center justify-center">
            @switch (dialog.type || 'primary') {
              @case ('danger') {
                <div class="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
                  <app-icon [name]="dialog.icon || 'x'" wrapperClass="w-7 h-7" />
                </div>
              }
              @case ('warning') {
                <div class="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
                  <app-icon [name]="dialog.icon || 'info'" wrapperClass="w-7 h-7" />
                </div>
              }
              @default {
                <div class="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-xs">
                  <app-icon [name]="dialog.icon || 'calendar'" wrapperClass="w-7 h-7" />
                </div>
              }
            }
          </div>

          <!-- Title & Message Text -->
          <div class="space-y-2">
            <h3 class="text-xl font-bold text-slate-900 tracking-tight">
              {{ dialog.title }}
            </h3>
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
              {{ dialog.message }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-3 pt-2">
            <button 
              type="button" 
              (click)="modalService.dismissConfirm()"
              class="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition cursor-pointer active:scale-95"
            >
              {{ dialog.cancelText || 'Cancel' }}
            </button>

            <button 
              type="button" 
              (click)="modalService.resolveConfirm()"
              class="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
              [class]="dialog.type === 'danger' 
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20' 
                : dialog.type === 'warning' 
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20' 
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-900/20'"
            >
              {{ dialog.confirmText || 'Confirm' }}
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class ConfirmDialogModalComponent {
  readonly modalService = inject(ModalService);
}
