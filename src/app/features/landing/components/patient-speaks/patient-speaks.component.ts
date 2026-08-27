import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TESTIMONIALS_ROW_1_PAIRS, TESTIMONIALS_ROW_2_PAIRS, TestimonialPair } from '../../../../core/models/testimonial.model';
import { ModalService } from '../../../../core/services/modal.service';
import { IconComponent } from '../../../../shared/icons/icon.component';

@Component({
  selector: 'app-patient-speaks',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="reviews" class="py-16 bg-white relative overflow-hidden">
      
      <!-- Section Header with Subtitle -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          
          <!-- Left: Patients Speak Heading & Subtitle -->
          <div class="space-y-1.5 max-w-2xl">
            <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-[#063342] tracking-tight">
              Patients Speak
            </h2>
            <p class="text-sm sm:text-base text-slate-700 leading-relaxed">
              Real stories of healing, renewed hope, and world-class surgical care from patients and families around the globe.
            </p>
          </div>

          <!-- Right: EXPLORE MORE Button -->
          <div class="shrink-0">
            <button 
              type="button" 
              (click)="onExploreMore()"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FDEBB2] hover:bg-[#FEE89D] text-slate-900 font-bold text-xs tracking-wider uppercase shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <span>Explore More</span>
              <app-icon name="arrow-right" wrapperClass="w-3.5 h-3.5 block" />
            </button>
          </div>

        </div>
      </div>

      <!-- Two Continuous Marquee Rows of Paired Video + Story Cards Scrolling in Opposite Directions (No Arrows) -->
      <div class="space-y-6 w-full overflow-hidden">
        
        <!-- Row 1: Continuous Leftward Scrolling of Paired Cards -->
        <div class="w-full overflow-hidden flex">
          <div class="animate-marquee-left gap-6 px-2">
            @for (pair of duplicatedRow1; track $index) {
              
              <!-- Paired Card (Video + Story Content Together in Same Container) -->
              <div class="w-[490px] sm:w-[560px] md:w-[600px] h-[210px] sm:h-[220px] rounded-3xl overflow-hidden flex flex-row bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all shrink-0 group/card">
                
                <!-- Left: Patient Video Section -->
                <div 
                  (click)="playVideo(pair)"
                  class="w-[190px] sm:w-[220px] md:w-[240px] h-full relative overflow-hidden bg-slate-900 flex items-center justify-center shrink-0 cursor-pointer group/vid"
                >
                  <div class="absolute inset-0 bg-gradient-to-br {{ pair.videoPlaceholderBg || 'from-slate-800 to-slate-950' }} group-hover/vid:scale-105 transition-transform duration-500"></div>
                  <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:12px_12px]"></div>

                  <!-- Patient silhouette / placeholder -->
                  <div class="absolute inset-0 flex flex-col items-center justify-center p-3 text-center z-0">
                    <div class="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 mb-1">
                      <app-icon name="user" wrapperClass="w-8 h-8" />
                    </div>
                    <span class="text-xs font-medium text-slate-300 max-w-[140px] truncate">{{ pair.patientName }}</span>
                  </div>

                  <!-- Translucent Center Play Button -->
                  <div class="absolute inset-0 flex items-center justify-center z-10">
                    <div class="w-11 h-11 rounded-full bg-white/80 group-hover/vid:bg-white text-slate-900 flex items-center justify-center shadow-lg group-hover/vid:scale-115 transition-transform duration-300">
                      <app-icon name="play" wrapperClass="w-4 h-4 translate-x-0.5 text-slate-900" />
                    </div>
                  </div>

                  <!-- Duration Tag -->
                  <div class="absolute bottom-2.5 left-2.5 z-10 bg-slate-950/85 text-white text-xs font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
                    <app-icon name="clock" wrapperClass="w-3 h-3 text-teal-400" />
                    <span>{{ pair.videoDuration }}</span>
                  </div>
                </div>

                <!-- Right: Pairing Text Content Section -->
                <div 
                  class="flex-1 p-5 sm:p-6 flex flex-col justify-between"
                  [class]="pair.theme === 'teal' 
                    ? 'bg-[#007D8C] text-white' 
                    : (pair.theme === 'cyan' ? 'bg-[#C6E7F2] text-[#053240]' : 'bg-[#BEE3EE] text-[#053240]')"
                >
                  <div class="space-y-1.5">
                    <h4 
                      class="text-sm sm:text-base font-bold leading-snug line-clamp-1"
                      [class]="pair.theme === 'teal' ? 'text-white' : 'text-[#053240]'"
                    >
                      {{ pair.title }}
                    </h4>
                    <p 
                      class="text-xs sm:text-[13px] leading-relaxed line-clamp-4"
                      [class]="pair.theme === 'teal' ? 'text-teal-50' : 'text-[#074356]'"
                    >
                      {{ pair.quote }}
                    </p>
                  </div>

                  <div 
                    class="text-xs font-semibold uppercase tracking-wider pt-2 border-t"
                    [class]="pair.theme === 'teal' ? 'text-teal-200 border-white/10' : 'text-[#053240] border-slate-300/60'"
                  >
                    {{ pair.patientName }}
                  </div>
                </div>

              </div>

            }
          </div>
        </div>

        <!-- Row 2: Continuous Rightward Scrolling of Paired Cards (Opposite Direction) -->
        <div class="w-full overflow-hidden flex">
          <div class="animate-marquee-right gap-6 px-2">
            @for (pair of duplicatedRow2; track $index) {
              
              <!-- Paired Card (Video + Story Content Together in Same Container) -->
              <div class="w-[490px] sm:w-[560px] md:w-[600px] h-[210px] sm:h-[220px] rounded-3xl overflow-hidden flex flex-row bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all shrink-0 group/card">
                
                <!-- Left: Patient Video Section -->
                <div 
                  (click)="playVideo(pair)"
                  class="w-[190px] sm:w-[220px] md:w-[240px] h-full relative overflow-hidden bg-slate-900 flex items-center justify-center shrink-0 cursor-pointer group/vid"
                >
                  <div class="absolute inset-0 bg-gradient-to-br {{ pair.videoPlaceholderBg || 'from-slate-800 to-slate-950' }} group-hover/vid:scale-105 transition-transform duration-500"></div>
                  <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:12px_12px]"></div>

                  <!-- Patient silhouette / placeholder -->
                  <div class="absolute inset-0 flex flex-col items-center justify-center p-3 text-center z-0">
                    <div class="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/80 mb-1">
                      <app-icon name="user" wrapperClass="w-8 h-8" />
                    </div>
                    <span class="text-xs font-medium text-slate-300 max-w-[140px] truncate">{{ pair.patientName }}</span>
                  </div>

                  <!-- Translucent Center Play Button -->
                  <div class="absolute inset-0 flex items-center justify-center z-10">
                    <div class="w-11 h-11 rounded-full bg-white/80 group-hover/vid:bg-white text-slate-900 flex items-center justify-center shadow-lg group-hover/vid:scale-115 transition-transform duration-300">
                      <app-icon name="play" wrapperClass="w-4 h-4 translate-x-0.5 text-slate-900" />
                    </div>
                  </div>

                  <!-- Duration Tag -->
                  <div class="absolute bottom-2.5 left-2.5 z-10 bg-slate-950/85 text-white text-xs font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
                    <app-icon name="clock" wrapperClass="w-3 h-3 text-teal-400" />
                    <span>{{ pair.videoDuration }}</span>
                  </div>
                </div>

                <!-- Right: Pairing Text Content Section -->
                <div 
                  class="flex-1 p-5 sm:p-6 flex flex-col justify-between"
                  [class]="pair.theme === 'teal' 
                    ? 'bg-[#007D8C] text-white' 
                    : (pair.theme === 'cyan' ? 'bg-[#C6E7F2] text-[#053240]' : 'bg-[#BEE3EE] text-[#053240]')"
                >
                  <div class="space-y-1.5">
                    <h4 
                      class="text-sm sm:text-base font-bold leading-snug line-clamp-1"
                      [class]="pair.theme === 'teal' ? 'text-white' : 'text-[#053240]'"
                    >
                      {{ pair.title }}
                    </h4>
                    <p 
                      class="text-xs sm:text-[13px] leading-relaxed line-clamp-4"
                      [class]="pair.theme === 'teal' ? 'text-teal-50' : 'text-[#074356]'"
                    >
                      {{ pair.quote }}
                    </p>
                  </div>

                  <div 
                    class="text-xs font-semibold uppercase tracking-wider pt-2 border-t"
                    [class]="pair.theme === 'teal' ? 'text-teal-200 border-white/10' : 'text-[#053240] border-slate-300/60'"
                  >
                    {{ pair.patientName }}
                  </div>
                </div>

              </div>

            }
          </div>
        </div>

      </div>
    </section>
  `
})
export class PatientSpeaksComponent {
  private readonly modalService = inject(ModalService);

  readonly row1 = TESTIMONIALS_ROW_1_PAIRS;
  readonly row2 = TESTIMONIALS_ROW_2_PAIRS;

  // Duplicated arrays for continuous seamless infinite marquee loop
  readonly duplicatedRow1 = [...TESTIMONIALS_ROW_1_PAIRS, ...TESTIMONIALS_ROW_1_PAIRS, ...TESTIMONIALS_ROW_1_PAIRS];
  readonly duplicatedRow2 = [...TESTIMONIALS_ROW_2_PAIRS, ...TESTIMONIALS_ROW_2_PAIRS, ...TESTIMONIALS_ROW_2_PAIRS];

  playVideo(item: TestimonialPair): void {
    this.modalService.openVideoPreview({
      title: item.videoTitle || `${item.patientName}'s Story`,
      patient: item.patientName,
      duration: item.videoDuration || '02:00'
    });
  }

  onExploreMore(): void {
  }
}
