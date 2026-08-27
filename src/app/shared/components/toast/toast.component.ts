import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal.service';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      @for (toast of modalService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto p-4 rounded-2xl shadow-xl border bg-white flex items-start gap-3 transform transition-all duration-300 animate-slide-up"
          [class.border-emerald-200]="toast.type === 'success'"
          [class.border-blue-200]="toast.type === 'info'"
          [class.border-rose-200]="toast.type === 'error'"
          [class.border-amber-200]="toast.type === 'warning'"
        >
          <!-- Icon -->
          <div 
            class="p-2 rounded-xl shrink-0 mt-0.5"
            [class.bg-emerald-100]="toast.type === 'success'"
            [class.text-emerald-700]="toast.type === 'success'"
            [class.bg-blue-100]="toast.type === 'info'"
            [class.text-blue-700]="toast.type === 'info'"
            [class.bg-rose-100]="toast.type === 'error'"
            [class.text-rose-700]="toast.type === 'error'"
            [class.bg-amber-100]="toast.type === 'warning'"
            [class.text-amber-700]="toast.type === 'warning'"
          >
            @if (toast.type === 'success') {
              <app-icon name="check-circle" wrapperClass="w-5 h-5 block" />
            } @else {
              <app-icon name="sparkles" wrapperClass="w-5 h-5 block" />
            }
          </div>

          <!-- Message -->
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-bold text-slate-900 leading-tight">{{ toast.title }}</h4>
            <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">{{ toast.message }}</p>
          </div>

          <!-- Dismiss -->
          <button 
            type="button" 
            (click)="modalService.removeToast(toast.id)"
            class="text-slate-500 hover:text-slate-800 p-1 cursor-pointer transition"
          >
            <app-icon name="x" wrapperClass="w-4 h-4 block" />
          </button>
        </div>
      }
    </div>
  `
})
export class ToastContainerComponent {
  readonly modalService = inject(ModalService);
}
