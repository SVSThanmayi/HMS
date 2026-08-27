import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal.service';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-video-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (modalService.activeVideo(); as video) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true">
        
        <!-- Backdrop dismiss -->
        <div class="fixed inset-0" (click)="closeVideo()"></div>

        <!-- Video Player Modal Box -->
        <div class="relative w-full max-w-3xl bg-slate-950 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden z-10">
          
          <!-- Top Bar -->
          <div class="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
            <div class="flex items-center gap-3">
              <span class="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
                <app-icon name="play" wrapperClass="w-4 h-4 block" />
              </span>
              <div>
                <h3 class="text-sm sm:text-base font-bold text-white">{{ video.title }}</h3>
                <p class="text-xs text-slate-300">Patient: {{ video.patient }} • Duration: {{ video.duration }}</p>
              </div>
            </div>
            <button 
              type="button" 
              (click)="closeVideo()" 
              class="text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full p-2 transition cursor-pointer"
              aria-label="Close video"
            >
              <app-icon name="x" wrapperClass="w-5 h-5 block" />
            </button>
          </div>

          <!-- Video Player Display Area (realistic animated player) -->
          <div class="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden group">
            
            <!-- Video background simulation -->
            <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950 flex items-center justify-center">
              <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <!-- Center Patient Hologram / Silhouette Graphic -->
              <div class="text-center p-6 space-y-3 z-10">
                <div class="w-20 h-20 rounded-full bg-teal-600/20 border border-teal-500/40 mx-auto flex items-center justify-center text-teal-400 shadow-2xl animate-pulse">
                  <app-icon name="user" wrapperClass="w-10 h-10 block" />
                </div>
                <div class="space-y-1">
                  <div class="text-xs uppercase tracking-widest font-semibold text-teal-400">Patient Testimonial Story</div>
                  <h4 class="text-xl font-bold text-white">{{ video.patient }}</h4>
                  <p class="text-xs text-slate-300 max-w-sm mx-auto">"{{ video.title }}"</p>
                </div>
              </div>
            </div>

            <!-- Video playback controls overlay -->
            <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent flex flex-col gap-2 z-20">
              
              <!-- Progress Bar -->
              <div class="w-full bg-slate-700/60 h-1.5 rounded-full overflow-hidden cursor-pointer">
                <div class="bg-teal-500 h-full w-2/3 rounded-full transition-all duration-300"></div>
              </div>

              <!-- Controls -->
              <div class="flex items-center justify-between text-xs text-slate-300">
                <div class="flex items-center gap-3">
                  <button 
                    type="button" 
                    (click)="togglePlay()" 
                    class="p-2 bg-teal-600 hover:bg-teal-500 text-white rounded-full transition cursor-pointer"
                  >
                    @if (isPlaying()) {
                      <app-icon name="pause" wrapperClass="w-4 h-4 block" />
                    } @else {
                      <app-icon name="play" wrapperClass="w-4 h-4 block" />
                    }
                  </button>
                  <span>01:12 / {{ video.duration }}</span>
                </div>

                <div class="flex items-center gap-2">
                  <span class="bg-slate-800 text-teal-300 text-2xs uppercase px-2 py-0.5 rounded font-mono font-bold">1080p HD</span>
                  <span class="text-slate-300">HMS Patient Archive</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    }
  `
})
export class VideoModalComponent {
  readonly modalService = inject(ModalService);
  readonly isPlaying = signal<boolean>(true);

  togglePlay(): void {
    this.isPlaying.update(v => !v);
  }

  closeVideo(): void {
    this.modalService.closeVideoPreview();
  }
}
