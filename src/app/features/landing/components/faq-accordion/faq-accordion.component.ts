import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FAQS_DATA, FaqItem } from '../../../../core/models/faq.model';
import { IconComponent } from '../../../../shared/icons/icon.component';

@Component({
  selector: 'app-faq-accordion',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="faqs" class="py-24 bg-slate-50 relative overflow-hidden">
      
      <!-- Decorative Backdrop Elements -->
      <div class="absolute inset-0 opacity-30 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <!-- Header (Clean title and subtitle without badge pill) -->
        <div class="text-center space-y-3 mb-12">
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p class="text-base sm:text-lg text-slate-700 max-w-xl mx-auto leading-relaxed">
            Find immediate answers about appointment scheduling, doctor selection, medical records, and hospital policies.
          </p>
        </div>

        <!-- Accordion Container (all closed by default) -->
        <div class="space-y-4">
          @for (faq of faqs; track faq.id; let i = $index) {
            <div 
              class="bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs"
              [class]="isExpanded(faq.id) 
                ? 'border-teal-500/60 shadow-md ring-1 ring-teal-500/20' 
                : 'border-slate-200/90 hover:border-slate-300 hover:shadow-sm'"
            >
              
              <!-- Accordion Question Trigger Header -->
              <button 
                type="button" 
                (click)="toggleFaq(faq.id)"
                class="w-full px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer select-none group"
                [attr.aria-expanded]="isExpanded(faq.id)"
              >
                <div class="flex items-center gap-3.5">
                  <span 
                    class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 transition-colors"
                    [class]="isExpanded(faq.id) 
                      ? 'bg-teal-600 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-700 group-hover:bg-teal-50 group-hover:text-teal-700'"
                  >
                    0{{ i + 1 }}
                  </span>
                  <span 
                    class="text-base sm:text-lg font-semibold transition-colors"
                    [class]="isExpanded(faq.id) 
                      ? 'text-teal-900' 
                      : 'text-slate-800 group-hover:text-teal-700'"
                  >
                    {{ faq.question }}
                  </span>
                </div>

                <!-- Plus / Minus Icon Indicator with smooth rotation -->
                <div 
                  class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300"
                  [class]="isExpanded(faq.id) 
                    ? 'bg-teal-100 text-teal-800 rotate-180' 
                    : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200 group-hover:text-slate-900 rotate-0'"
                >
                  @if (isExpanded(faq.id)) {
                    <app-icon name="minus" wrapperClass="w-4 h-4 block" />
                  } @else {
                    <app-icon name="plus" wrapperClass="w-4 h-4 block" />
                  }
                </div>
              </button>

              <!-- Accordion Body Answer (Smooth Grid Transition) -->
              <div 
                class="grid transition-all duration-300 ease-in-out"
                [class]="isExpanded(faq.id) ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
              >
                <div class="overflow-hidden">
                  <div class="px-6 pb-6 pt-1 text-sm sm:text-base text-slate-700 leading-relaxed border-t border-slate-100/80 bg-gradient-to-b from-teal-50/20 to-transparent pl-16">
                    <p>{{ faq.answer }}</p>
                  </div>
                </div>
              </div>

            </div>
          }
        </div>

      </div>
    </section>
  `
})
export class FaqAccordionComponent {
  readonly faqs: FaqItem[] = FAQS_DATA;
  
  // Track open panels (no question active/open by default)
  readonly expandedIds = signal<Set<string>>(new Set());

  isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  toggleFaq(id: string): void {
    this.expandedIds.update(current => {
      const updated = new Set(current);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  }
}
