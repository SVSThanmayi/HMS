import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quick-services',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      width: 100%;
      position: relative;
    }

    /* Premium Microscopic Red Blood Cell (Erythrocyte) Style */
    .micro-rbc {
      position: absolute;
      bottom: -10px;
      border-radius: 50%;
      background: radial-gradient(circle at 40% 40%, rgba(254, 202, 202, 0.3) 12%, rgba(248, 113, 113, 0.65) 55%, rgba(185, 28, 28, 0.85) 100%);
      box-shadow: 0 0 3px rgba(239, 68, 68, 0.35), inset 0 0 2px rgba(127, 29, 29, 0.8);
      pointer-events: none;
      will-change: transform, opacity;
      animation: cellDriftUp linear infinite;
    }

    /* Microscopic Glowing Oxygen / Bio Micro-Spore */
    .micro-bioparticle {
      position: absolute;
      bottom: -10px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #ffffff 10%, #5eead4 60%, #0d9488 100%);
      box-shadow: 0 0 5px rgba(45, 212, 191, 0.55);
      pointer-events: none;
      will-change: transform, opacity;
      animation: cellDriftUp linear infinite;
    }

    /* Upward Cellular Hydrodynamic Drift */
    @keyframes cellDriftUp {
      0% {
        transform: translate3d(0, 0, 0) rotate(0deg) scale(0.85);
        opacity: 0;
      }
      15% {
        opacity: var(--cell-op, 0.4);
        transform: translate3d(5px, -30px, 0) rotate(35deg) scale(1);
      }
      45% {
        transform: translate3d(-7px, -80px, 0) rotate(95deg) scale(1.05);
      }
      75% {
        opacity: var(--cell-op, 0.4);
        transform: translate3d(6px, -130px, 0) rotate(165deg) scale(0.95);
      }
      100% {
        transform: translate3d(0, -180px, 0) rotate(220deg) scale(0.75);
        opacity: 0;
      }
    }
  `],
  template: `
    <section class="w-full bg-gradient-to-t from-[#012026] via-[#022c33] to-[#022c33] border-b border-teal-800/40 shadow-lg relative z-20 overflow-hidden">
      
      <!-- Ambient Microscopic Cellular Bio-Stream Layer (Floating Tiny Red Blood Cells & Oxygen Particles) -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <!-- Tiny Red Blood Cells (RBCs) with Staggered Delays & Paths -->
        <div class="micro-rbc w-2.5 h-2.5" style="left: 3%; animation-duration: 9.5s; animation-delay: 0s; --cell-op: 0.35;"></div>
        <div class="micro-rbc w-3 h-3" style="left: 9%; animation-duration: 11s; animation-delay: 2.2s; --cell-op: 0.45;"></div>
        <div class="micro-bioparticle w-1.5 h-1.5" style="left: 15%; animation-duration: 8.5s; animation-delay: 1.1s; --cell-op: 0.5;"></div>
        <div class="micro-rbc w-2 h-2" style="left: 21%; animation-duration: 12.5s; animation-delay: 3.8s; --cell-op: 0.3;"></div>
        <div class="micro-rbc w-3.5 h-3.5" style="left: 28%; animation-duration: 10s; animation-delay: 0.5s; --cell-op: 0.4;"></div>
        <div class="micro-bioparticle w-1 h-1" style="left: 34%; animation-duration: 7.8s; animation-delay: 2.9s; --cell-op: 0.6;"></div>
        <div class="micro-rbc w-2.5 h-2.5" style="left: 41%; animation-duration: 11.5s; animation-delay: 1.7s; --cell-op: 0.35;"></div>
        <div class="micro-rbc w-3 h-3" style="left: 47%; animation-duration: 9s; animation-delay: 4.3s; --cell-op: 0.45;"></div>
        <div class="micro-bioparticle w-1.5 h-1.5" style="left: 54%; animation-duration: 10.5s; animation-delay: 0.8s; --cell-op: 0.55;"></div>
        <div class="micro-rbc w-2 h-2" style="left: 60%; animation-duration: 13s; animation-delay: 3.1s; --cell-op: 0.3;"></div>
        <div class="micro-rbc w-3.5 h-3.5" style="left: 67%; animation-duration: 9.8s; animation-delay: 1.4s; --cell-op: 0.4;"></div>
        <div class="micro-bioparticle w-1 h-1" style="left: 73%; animation-duration: 8.2s; animation-delay: 4.7s; --cell-op: 0.5;"></div>
        <div class="micro-rbc w-2.5 h-2.5" style="left: 80%; animation-duration: 11s; animation-delay: 2.5s; --cell-op: 0.35;"></div>
        <div class="micro-rbc w-3 h-3" style="left: 87%; animation-duration: 10.2s; animation-delay: 0.3s; --cell-op: 0.45;"></div>
        <div class="micro-bioparticle w-1.5 h-1.5" style="left: 93%; animation-duration: 9.2s; animation-delay: 3.5s; --cell-op: 0.55;"></div>
      </div>

      <div class="max-w-7xl 2xl:max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8 sm:pb-10 relative z-10">
        <!-- 4-Column Highlight Grid without divider lines -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <!-- 1. 24*7 Ambulance Service -->
          <div class="flex items-center gap-4 py-2 px-3 sm:px-4">
            <!-- Illustrated Ambulance Badge -->
            <div class="w-16 h-16 sm:w-17 sm:h-17 rounded-full bg-white/95 border border-white/30 shrink-0 flex items-center justify-center p-2 shadow-md select-none">
              <svg viewBox="0 0 64 64" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Ambulance Body -->
                <path d="M10 24C10 21.7909 11.7909 20 14 20H40V42H10V24Z" fill="#FFFFFF" stroke="#1E293B" stroke-width="2.5" stroke-linejoin="round"/>
                <!-- Front Cabin Slope -->
                <path d="M40 24H48.5C49.8261 24 51.0979 24.5268 52.0355 25.4645L55.5355 28.9645C56.4732 29.9021 57 31.1739 57 32.5V42H40V24Z" fill="#F8FAFC" stroke="#1E293B" stroke-width="2.5" stroke-linejoin="round"/>
                <!-- Cabin Window -->
                <path d="M42 27H49.5C50.3284 27 51.123 27.329 51.708 27.914L53.586 29.792C54.171 30.377 54.5 31.1716 54.5 32V35H42V27Z" fill="#38BDF8" stroke="#1E293B" stroke-width="2"/>
                <!-- Red Medical Cross -->
                <rect x="22" y="28" width="6" height="6" fill="#EF4444" stroke="#EF4444" stroke-width="0.5"/>
                <rect x="20" y="29.5" width="10" height="3" fill="#EF4444"/>
                <rect x="23.5" y="26" width="3" height="10" fill="#EF4444"/>
                <!-- Siren on Top -->
                <rect x="23" y="16" width="6" height="4" rx="2" fill="#EF4444" stroke="#1E293B" stroke-width="1.5"/>
                <line x1="26" y1="13" x2="26" y2="15" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
                <!-- Wheels -->
                <circle cx="20" cy="42" r="6" fill="#1E293B"/>
                <circle cx="20" cy="42" r="2.5" fill="#94A3B8"/>
                <circle cx="46" cy="42" r="6" fill="#1E293B"/>
                <circle cx="46" cy="42" r="2.5" fill="#94A3B8"/>
                <!-- Headlight -->
                <rect x="55" y="37" width="2" height="3" rx="1" fill="#F59E0B"/>
              </svg>
            </div>
            <!-- Text Content -->
            <div class="flex-1 min-w-0">
              <h3 class="text-[15px] font-bold text-white leading-snug tracking-tight">
                24*7 Ambulance Service
              </h3>
              <p class="text-xs text-teal-100/75 mt-1 leading-relaxed line-clamp-2">
                Rapid Response, Exceptional Care
              </p>
            </div>
          </div>

          <!-- 2. Lab -->
          <div class="flex items-center gap-4 py-2 px-3 sm:px-4">
            <!-- Illustrated Lab Badge -->
            <div class="w-16 h-16 sm:w-17 sm:h-17 rounded-full bg-white/95 border border-white/30 shrink-0 flex items-center justify-center p-2 shadow-md select-none">
              <svg viewBox="0 0 64 64" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Flask Base & Liquid -->
                <path d="M22 17H30V27L15.5 45.5C14.1193 47.2652 15.3807 49.8 17.5858 49.8H34.4142C36.6193 49.8 37.8807 47.2652 36.5 45.5L22 27V17Z" fill="#E0F2FE" stroke="#1E293B" stroke-width="2.5" stroke-linejoin="round"/>
                <path d="M17.5 44L21 39.5C22.5 37.5 25 39 27.5 38C29.5 37.2 31.5 38.5 33 40.5L35 44C36.2 45.7 35.1 48 33 48H19C16.9 48 15.8 45.7 17.5 44Z" fill="#0284C7"/>
                <circle cx="24" cy="43" r="1.5" fill="#BAE6FD"/>
                <circle cx="28" cy="41" r="1" fill="#BAE6FD"/>
                <!-- Microscope Illustration on Right -->
                <path d="M47 18L40 28" stroke="#EF4444" stroke-width="4.5" stroke-linecap="round"/>
                <path d="M45 16L50 19.5" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>
                <circle cx="43" cy="27" r="3" fill="#1E293B"/>
                <!-- Microscope Arm & Base -->
                <path d="M43 30V43C43 45.5 46 47 48.5 47H53" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>
                <rect x="37" y="47" width="18" height="3" rx="1.5" fill="#EF4444" stroke="#1E293B" stroke-width="1.5"/>
                <rect x="36" y="38" width="8" height="2" fill="#1E293B"/>
              </svg>
            </div>
            <!-- Text Content -->
            <div class="flex-1 min-w-0">
              <h3 class="text-[15px] font-bold text-white leading-snug tracking-tight">
                Lab
              </h3>
              <p class="text-xs text-teal-100/75 mt-1 leading-relaxed line-clamp-2">
                Advancing Health Through Science
              </p>
            </div>
          </div>

          <!-- 3. Pharmacy -->
          <div class="flex items-center gap-4 py-2 px-3 sm:px-4">
            <!-- Illustrated Pharmacy Storefront Badge -->
            <div class="w-16 h-16 sm:w-17 sm:h-17 rounded-full bg-white/95 border border-white/30 shrink-0 flex items-center justify-center p-2 shadow-md select-none">
              <svg viewBox="0 0 64 64" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Pharmacy Roof / Sign Board -->
                <rect x="14" y="16" width="36" height="12" rx="3" fill="#94A3B8" stroke="#1E293B" stroke-width="2.5"/>
                <!-- Medical Cross in Sign -->
                <circle cx="32" cy="22" r="4.5" fill="#EF4444"/>
                <rect x="30.5" y="19.5" width="3" height="5" fill="#FFFFFF"/>
                <rect x="29.5" y="20.5" width="5" height="3" fill="#FFFFFF"/>
                <!-- Storefront Main Wall -->
                <rect x="16" y="28" width="32" height="22" fill="#F8FAFC" stroke="#1E293B" stroke-width="2.5"/>
                <!-- Wooden Door (Left) -->
                <rect x="19" y="34" width="11" height="16" fill="#D97706" stroke="#1E293B" stroke-width="2"/>
                <circle cx="28" cy="42" r="1" fill="#FEF3C7"/>
                <!-- Medicine Display Window (Right) -->
                <rect x="33" y="34" width="12" height="12" fill="#E0F2FE" stroke="#1E293B" stroke-width="2"/>
                <line x1="33" y1="40" x2="45" y2="40" stroke="#1E293B" stroke-width="1.5"/>
                <!-- Medicine Bottles in Window -->
                <rect x="35" y="36" width="2.5" height="3.5" rx="0.5" fill="#EF4444"/>
                <rect x="39" y="36" width="2.5" height="3.5" rx="0.5" fill="#10B981"/>
                <rect x="36" y="42" width="3" height="3.5" rx="0.5" fill="#F59E0B"/>
              </svg>
            </div>
            <!-- Text Content -->
            <div class="flex-1 min-w-0">
              <h3 class="text-[15px] font-bold text-white leading-snug tracking-tight">
                Pharmacy
              </h3>
              <p class="text-xs text-teal-100/75 mt-1 leading-relaxed line-clamp-2">
                Reliable Care, Trusted Medications
              </p>
            </div>
          </div>

          <!-- 4. 24/7 Emergency Services -->
          <div class="flex items-center gap-4 py-2 px-3 sm:px-4">
            <!-- Illustrated 24/7 Emergency Badge -->
            <div class="w-16 h-16 sm:w-17 sm:h-17 rounded-full bg-white/95 border border-white/30 shrink-0 flex items-center justify-center p-2 shadow-md select-none">
              <svg viewBox="0 0 64 64" class="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Sparkles / Radiance -->
                <path d="M32 10V14" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
                <path d="M23 14L25.5 17" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
                <path d="M41 14L38.5 17" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
                <path d="M18 21L21.5 23" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
                <path d="M46 21L42.5 23" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/>
                <!-- Headset Band -->
                <path d="M22 30C22 23.5 26.5 20 32 20C37.5 20 42 23.5 42 30" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
                <!-- Headset Ear Cushions -->
                <rect x="19" y="27" width="4.5" height="8" rx="2" fill="#1E293B"/>
                <rect x="40.5" y="27" width="4.5" height="8" rx="2" fill="#1E293B"/>
                <!-- 24 Typography Badge in Center -->
                <text x="32" y="33" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="10" fill="#1E1B4B">24</text>
                <!-- Microphone Boom -->
                <path d="M22 33V37C22 38.5 24 39.5 26 39.5H30" stroke="#1E293B" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="31" cy="39.5" r="1.5" fill="#EF4444"/>
                <!-- Supportive Caring Hands -->
                <!-- Left Hand -->
                <path d="M14 43C15.5 39 19 36 21 34C22 33.5 23 34.5 22.5 35.5C21.5 37.5 19.5 40.5 18 43C17 44.5 17.5 47 19.5 49L25 53C26 53.8 25.5 55 24 55H19C16.5 55 14.5 53 14 50V43Z" fill="#FED7AA" stroke="#1E293B" stroke-width="1.5" stroke-linejoin="round"/>
                <!-- Right Hand -->
                <path d="M50 43C48.5 39 45 36 43 34C42 33.5 41 34.5 41.5 35.5C42.5 37.5 44.5 40.5 46 43C47 44.5 46.5 47 44.5 49L39 53C38 53.8 38.5 55 40 55H45C47.5 55 49.5 53 50 50V43Z" fill="#FED7AA" stroke="#1E293B" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
            </div>
            <!-- Text Content -->
            <div class="flex-1 min-w-0">
              <h3 class="text-[15px] font-bold text-white leading-snug tracking-tight">
                24/7 Emergency Services
              </h3>
              <p class="text-xs text-teal-100/75 mt-1 leading-relaxed line-clamp-2">
                Contact us 24 hours a day
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  `
})
export class QuickServicesComponent {}
