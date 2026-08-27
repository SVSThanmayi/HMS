import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DEPARTMENTS_DATA, Department } from '../../../../core/models/department.model';
import { ModalService } from '../../../../core/services/modal.service';
import { IconComponent } from '../../../../shared/icons/icon.component';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      width: 100%;
      position: relative;
    }

    /* Symbol 3D Flip */
    .symbol-container {
      perspective: 800px;
    }

    .symbol-flipper {
      transition: transform 0.65s cubic-bezier(0.34, 1.35, 0.64, 1);
      transform-style: preserve-3d;
    }

    /* Controlled strictly by .is-hovered (removes browser stuck :hover glitch on scroll) */
    .dept-card.is-hovered .symbol-flipper {
      transform: rotateY(180deg);
    }

    /* Trigger background photo reveal */
    .dept-card.is-hovered .dept-bg-hover {
      opacity: 1;
    }

    .dept-card.is-hovered .dept-bg-img {
      transform: scale(1.05);
    }

    /* Trigger badge glassmorphic style */
    .dept-card.is-hovered .symbol-badge {
      background-color: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.35);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }

    /* Trigger amber glowing title */
    .dept-card.is-hovered .dept-title {
      color: #fbbf24;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    /* Trigger READ MORE button hide */
    .dept-card.is-hovered .read-more-btn {
      opacity: 0;
      transform: scale(0.9);
      pointer-events: none;
    }

    /* Trigger Specialist Doctor badge reveal */
    .dept-card.is-hovered .specialist-badge {
      opacity: 1;
      transform: scale(1) translateY(0);
      pointer-events: auto;
    }

    /* Subtle Medical Hexagon Background Pattern for Default State */
    .hex-bg {
      background-color: #ffffff;
      background-image: 
        radial-gradient(#e2e8f0 1.2px, transparent 1.2px),
        radial-gradient(#f1f5f9 1.2px, transparent 1.2px);
      background-size: 20px 20px;
      background-position: 0 0, 10px 10px;
    }
  `],
  template: `
    <section id="departments" class="py-20 sm:py-28 bg-slate-50/80 relative overflow-hidden border-b border-slate-200/60">
      
      <!-- Background decorative subtle elements -->
      <div class="absolute inset-0 opacity-25 bg-[radial-gradient(#0d9488_0.75px,transparent_0.75px)] [background-size:24px_24px] pointer-events-none"></div>
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <!-- Section Header (Clean & Focused) -->
        <div class="text-center max-w-3xl mx-auto mb-14">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold tracking-wider uppercase mb-3 shadow-xs">
            <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Centres of Clinical Excellence
          </div>
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Our Medical Departments
          </h2>
          <p class="text-base sm:text-lg text-slate-600 leading-relaxed mt-2.5">
            Explore our specialized clinical departments equipped with cutting-edge medical technology and distinguished consultants.
          </p>
        </div>

        <!-- 17 Department Cards: Centered Flex Grid (Psychiatry centers at bottom) -->
        <div class="flex flex-wrap justify-center gap-6 sm:gap-7">
          @for (dept of departments; track dept.id) {
            <div 
              [attr.data-dept-id]="dept.id"
              class="dept-card relative overflow-hidden rounded-3xl hex-bg border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-2xl transition-all duration-300 w-full sm:w-[calc(50%-14px)] lg:w-[calc(25%-21px)] min-w-[260px] max-w-[295px] h-[310px] flex flex-col justify-between items-center text-center p-6 cursor-pointer select-none shrink-0"
              [class.is-hovered]="hoveredDeptId() === dept.id"
              (pointerenter)="onCardPointerEnter(dept.id)"
              (pointerleave)="onCardPointerLeave(dept.id)"
              (click)="openDeptDetail(dept)"
              (keydown.enter)="openDeptDetail(dept)"
              [attr.aria-label]="dept.name + ' department. Click to view details.'"
            >
              
              <!-- BACKGROUND HOVER IMAGE LAYER: Crossfades in smoothly with dark overlay on card hover -->
              <div 
                class="dept-bg-hover absolute inset-0 z-0 opacity-0 transition-opacity duration-500 ease-in-out pointer-events-none"
              >
                <!-- Department Background Image -->
                <img 
                  [src]="dept.imageUrl" 
                  [alt]="dept.name"
                  class="dept-bg-img w-full h-full object-cover object-center transform scale-100 transition-transform duration-700 ease-out"
                />
                <!-- Dark Gradient Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/80 to-slate-900/60"></div>
              </div>

              <!-- 1. TOP: Circular Medical Icon Badge (Symbol flips on hover) -->
              <div class="symbol-badge relative z-10 w-20 h-20 rounded-full bg-slate-50 border border-slate-200/70 shadow-xs transition-all duration-300 flex items-center justify-center symbol-container">
                <div class="symbol-flipper flex items-center justify-center">
                  @switch (dept.iconType) {
                    @case ('paediatrics') {
                      <!-- Paediatrics: Child + Stethoscope Care -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="26" cy="22" r="9" fill="#FEF08A" stroke="#0F172A" stroke-width="2.5"/>
                        <path d="M22 14c2-3 6-3 8 0" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="23" cy="21" r="1.5" fill="#0F172A"/>
                        <circle cx="29" cy="21" r="1.5" fill="#0F172A"/>
                        <path d="M24 25c1.5 1.5 3.5 1.5 5 0" stroke="#DC2626" stroke-width="2" stroke-linecap="round"/>
                        <path d="M14 42c0-7 5.5-12 12-12s12 5 12 12v3H14v-3z" fill="#93C5FD" stroke="#0F172A" stroke-width="2.5"/>
                        <path d="M48 20c-3 0-5 2-6 5-1-3-3-5-6-5-3.3 0-6 2.7-6 6 0 7 12 14 12 14s12-7 12-14c0-3.3-2.7-6-6-6z" fill="#F87171" stroke="#0F172A" stroke-width="2.5"/>
                        <path d="M42 28v6M39 31h6" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
                      </svg>
                    }
                    @case ('gynaecology') {
                      <!-- Gynaecology: Pregnancy Maternal Care & Fetus in Womb -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="32" cy="32" r="23" fill="#FDF2F8" stroke="#E879F9" stroke-width="2.5" stroke-dasharray="3 3"/>
                        <path d="M30 17c-6 0-10 4.5-10 10 0 8 10 18 10 18s10-10 10-18c0-5.5-4-10-10-10z" fill="#F472B6" stroke="#0F172A" stroke-width="2.5"/>
                        <circle cx="30" cy="24" r="4.5" fill="#FEF08A" stroke="#0F172A" stroke-width="2"/>
                        <path d="M26 31c2.5 3 6.5 3 9 0" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="45" cy="42" r="6" fill="#38BDF8" stroke="#0F172A" stroke-width="2"/>
                        <path d="M42 42l2 2 4-4" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    }
                    @case ('orthopedics') {
                      <!-- Orthopedics: Knee Joint Anatomy & Bones -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M26 10h12v14a6 6 0 0 1-6 6 6 6 0 0 1-6-6V10z" fill="#F1F5F9" stroke="#0F172A" stroke-width="2.5"/>
                        <path d="M26 54h12V38a6 6 0 0 0-6-6 6 6 0 0 0-6 6v16z" fill="#CBD5E1" stroke="#0F172A" stroke-width="2.5"/>
                        <circle cx="32" cy="30" r="9" fill="#FCA5A5" stroke="#EF4444" stroke-width="2.5"/>
                        <path d="M28 30h8M32 26v8" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round"/>
                        <circle cx="44" cy="22" r="3.5" fill="#F59E0B" stroke="#0F172A" stroke-width="2"/>
                      </svg>
                    }
                    @case ('general-medicine') {
                      <!-- General Medicine: Prescription Medicine Bottle & Capsules -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="28" y="14" width="23" height="36" rx="5" fill="#67E8F9" stroke="#0F172A" stroke-width="2.5"/>
                        <rect x="32" y="9" width="15" height="6" rx="2" fill="#E2E8F0" stroke="#0F172A" stroke-width="2"/>
                        <rect x="33" y="24" width="13" height="15" rx="3" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/>
                        <path d="M39.5 28v7M36 31.5h7" stroke="#06B6D4" stroke-width="2.5" stroke-linecap="round"/>
                        <rect x="11" y="34" width="24" height="12" rx="6" transform="rotate(-35 11 34)" fill="#34D399" stroke="#0F172A" stroke-width="2.5"/>
                        <path d="M13 38l10-7" stroke="#FDE047" stroke-width="4.5" stroke-linecap="round"/>
                      </svg>
                    }
                    @case ('general-surgery') {
                      <!-- General Surgery: Surgeon & OT Lamp -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32 7v8M23 15h18l-3.5 6.5h-11L23 15z" fill="#94A3B8" stroke="#0F172A" stroke-width="2"/>
                        <circle cx="32" cy="29" r="7.5" fill="#FED7AA" stroke="#0F172A" stroke-width="2.5"/>
                        <path d="M24.5 28h15v5a7.5 7.5 0 0 1-15 0v-5z" fill="#38BDF8" stroke="#0F172A" stroke-width="2"/>
                        <path d="M25.5 25h13v-2a6.5 6.5 0 0 0-13 0v2z" fill="#0284C7" stroke="#0F172A" stroke-width="2"/>
                        <path d="M17 48c0-7.5 6.5-12 15-12s15 4.5 15 12v4H17v-4z" fill="#0EA5E9" stroke="#0F172A" stroke-width="2.5"/>
                        <rect x="13" y="48" width="38" height="6" rx="2" fill="#E2E8F0" stroke="#0F172A" stroke-width="2"/>
                      </svg>
                    }
                    @case ('cardiology') {
                      <!-- Cardiology: Anatomical Heart & ECG Pulse -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25 13v9M35 11v11M39 15l4.5-4.5" stroke="#0EA5E9" stroke-width="3" stroke-linecap="round"/>
                        <path d="M32 19c-8.5 0-15 6.5-15 15 0 11.5 15 21 15 21s15-9.5 15-21c0-8.5-6.5-15-15-15z" fill="#F87171" stroke="#0F172A" stroke-width="2.5"/>
                        <path d="M22 34h4l3-5 5 10 3-6h5" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="44" cy="42" r="6" fill="#34D399" stroke="#0F172A" stroke-width="2"/>
                        <path d="M41 42l2 2 4-4" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    }
                    @case ('urology') {
                      <!-- Urology: Kidneys & Renal System -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25 19c-5.5 0-10 4.5-10 11 0 7.5 5.5 12 10 12 3.5 0 5.5-3.5 5.5-7.5V27c0-4.5-2-8-5.5-8z" fill="#F43F5E" stroke="#0F172A" stroke-width="2.5"/>
                        <path d="M39 19c5.5 0 10 4.5 10 11 0 7.5-5.5 12-10 12-3.5 0-5.5-3.5-5.5-7.5V27c0-4.5 2-8 5.5-8z" fill="#FB7185" stroke="#0F172A" stroke-width="2.5"/>
                        <path d="M30 38v11a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V38" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"/>
                        <path d="M32 49v6" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/>
                      </svg>
                    }
                    @case ('ent') {
                      <!-- ENT: Head & Throat Examination -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="32" cy="21" r="10.5" fill="#FED7AA" stroke="#0F172A" stroke-width="2.5"/>
                        <path d="M21 16h22" stroke="#0F172A" stroke-width="3"/>
                        <circle cx="32" cy="13" r="4" fill="#38BDF8" stroke="#0F172A" stroke-width="2"/>
                        <circle cx="28" cy="20" r="1.5" fill="#0F172A"/>
                        <circle cx="36" cy="20" r="1.5" fill="#0F172A"/>
                        <path d="M17 48c0-7.5 6.5-13 15-13s15 5.5 15 13v4H17v-4z" fill="#38BDF8" stroke="#0F172A" stroke-width="2.5"/>
                        <path d="M28 37l4 4 4-4" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    }
                    @case ('gastroenterology') {
                      <!-- Gastroenterology: Stomach & Endoscopy Camera -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 15c4.5 0 6.5 3.5 6.5 7.5 0 6.5-6.5 9.5-6.5 16 0 7.5 6.5 13 15 13 7.5 0 13-5.5 13-11 0-8.5-13-11-13-17 0-4.5 3.5-8.5 8.5-8.5" fill="#FDA4AF" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round"/>
                        <circle cx="23" cy="26" r="8.5" fill="#67E8F9" fill-opacity="0.5" stroke="#0284C7" stroke-width="2.5"/>
                        <path d="M29 32l7 7" stroke="#0F172A" stroke-width="3" stroke-linecap="round"/>
                      </svg>
                    }
                    @case ('physiotherapy') {
                      <!-- Physiotherapy: Spine Alignment & Physical Rehabilitation -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="32" cy="17" r="4.5" fill="#FED7AA" stroke="#0F172A" stroke-width="2"/>
                        <path d="M25 27c0-3.5 3.5-5.5 7-5.5s7 2 7 5.5v7H25v-7z" fill="#0D9488" stroke="#0F172A" stroke-width="2"/>
                        <rect x="13" y="38" width="38" height="6" rx="2" fill="#F87171" stroke="#0F172A" stroke-width="2"/>
                        <line x1="17" y1="44" x2="17" y2="53" stroke="#0F172A" stroke-width="2.5"/>
                        <line x1="47" y1="44" x2="47" y2="53" stroke="#0F172A" stroke-width="2.5"/>
                        <circle cx="45" cy="33" r="4" fill="#FED7AA" stroke="#0F172A" stroke-width="2"/>
                        <path d="M21 38c0-3.5 4.5-4.5 18-4.5" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
                      </svg>
                    }
                    @case ('neurology') {
                      <!-- Neurology: Brain Neural Network -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M31 15c-7.5 0-14 5.5-14 13 0 3.5 2 6.5 2 10 0 6.5 5.5 12 12 12" fill="#F472B6" stroke="#0F172A" stroke-width="2.5"/>
                        <path d="M33 15c7.5 0 14 5.5 14 13 0 3.5-2 6.5-2 10 0 6.5-5.5 12-12 12" fill="#FB7185" stroke="#0F172A" stroke-width="2.5"/>
                        <path d="M23 28h18M21 37h22" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="32" cy="28" r="2.5" fill="#FDE047"/>
                        <circle cx="32" cy="37" r="2.5" fill="#FDE047"/>
                      </svg>
                    }
                    @case ('surgical-gastro') {
                      <!-- Surgical Gastro: Stomach Surgery with Scalpel -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 17c4.5 0 6.5 3.5 6.5 7.5 0 6.5-6.5 8.5-6.5 15 0 7.5 6.5 12 15 12 7.5 0 13-5.5 13-11 0-8.5-13-11-13-17" fill="#FCA5A5" stroke="#0F172A" stroke-width="2.5"/>
                        <path d="M47 15l-19 21-4.5-1 21-22 2.5 2z" fill="#94A3B8" stroke="#0F172A" stroke-width="2"/>
                        <circle cx="28" cy="36" r="2.5" fill="#EF4444"/>
                      </svg>
                    }
                    @case ('critical-care') {
                      <!-- Critical Care: Hands Holding Heart & Life Monitor -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32 15c-3.3 0-5.5 2-6.5 5.5-1-3.5-3.3-5.5-6.5-5.5-3.6 0-6.5 3-6.5 6.5 0 7.5 13 14.5 13 14.5s13-7 13-14.5c0-3.5-2.9-6.5-6.5-6.5z" fill="#EF4444" stroke="#0F172A" stroke-width="2.5"/>
                        <path d="M13 42c4.5-3.5 11-2.5 15.5 2l3.5 3.5 3.5-3.5c4.5-4.5 11-5.5 15.5-2v6.5c-6.5 3.5-13 2.5-19 6.5-6-4-12.5-3-19-6.5v-6.5z" fill="#67E8F9" stroke="#0F172A" stroke-width="2.5"/>
                      </svg>
                    }
                    @case ('paediatric-surgery') {
                      <!-- Paediatric Surgery: Surgical Scissors & Scalpel -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="19" cy="47" r="5.5" fill="#E2E8F0" stroke="#0F172A" stroke-width="2"/>
                        <circle cx="35" cy="47" r="5.5" fill="#E2E8F0" stroke="#0F172A" stroke-width="2"/>
                        <path d="M21 42l18-26M33 42L15 16" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/>
                        <rect x="43" y="16" width="5.5" height="30" rx="2" fill="#F87171" stroke="#0F172A" stroke-width="2"/>
                        <path d="M43 16l5.5-6.5v6.5h-5.5z" fill="#E2E8F0" stroke="#0F172A" stroke-width="1.5"/>
                      </svg>
                    }
                    @case ('neonatology') {
                      <!-- Neonatology: Incubator & Premature Infant -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="32" cy="32" r="22" fill="#E0F2FE" stroke="#38BDF8" stroke-width="2.5" stroke-dasharray="3 3"/>
                        <circle cx="25" cy="30" r="5.5" fill="#FED7AA" stroke="#0F172A" stroke-width="2"/>
                        <path d="M27 36c3.5 0 9 3.5 9 9H18c0-5.5 5.5-9 9-9z" fill="#93C5FD" stroke="#0F172A" stroke-width="2"/>
                        <circle cx="43" cy="23" r="3.5" fill="#FDE047" stroke="#0F172A" stroke-width="1.5"/>
                        <path d="M38 49h14M45 44v10" stroke="#0D9488" stroke-width="2.5" stroke-linecap="round"/>
                      </svg>
                    }
                    @case ('dermatology') {
                      <!-- Dermatology: Face Profile & Skin Inspection Lens -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="29" cy="30" r="17" fill="#FED7AA" stroke="#0F172A" stroke-width="2.5"/>
                        <path d="M13 25c-2-4.5 0-11 4.5-13 5.5-2.5 11 2 11 2s5.5-4.5 11-2c4.5 2.5 6.5 9 4.5 13" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
                        <circle cx="39" cy="37" r="9.5" fill="#93C5FD" fill-opacity="0.55" stroke="#0284C7" stroke-width="2.5"/>
                        <path d="M46 44l8.5 8.5" stroke="#0F172A" stroke-width="3.5" stroke-linecap="round"/>
                        <circle cx="37" cy="35" r="1.5" fill="#EF4444"/>
                        <circle cx="41" cy="39" r="1.5" fill="#EF4444"/>
                      </svg>
                    }
                    @case ('psychiatry') {
                      <!-- Psychiatry: Profile Head & Mind Brain with Cross -->
                      <svg class="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 49c0-8.5 6.5-15 15-15 6.5 0 12-4.5 12-11 0-7.5-5.5-13-13-13-8.5 0-15 6.5-15 15v1c0 3.5-1 6.5-4.5 8.5V49h15.5z" fill="#334155" stroke="#0F172A" stroke-width="2.5"/>
                        <circle cx="34" cy="21" r="7.5" fill="#C084FC" stroke="#A855F7" stroke-width="2"/>
                        <path d="M34 17v8M30 21h8" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round"/>
                      </svg>
                    }
                    @default {
                      <app-icon name="heart-cross" wrapperClass="w-10 h-10 text-emerald-600" />
                    }
                  }
                </div>
              </div>

              <!-- 2. MIDDLE: Department Name (Turns glowing amber/orange on hover) -->
              <div class="relative z-10 my-auto py-2">
                <h3 class="dept-title text-xl sm:text-[22px] font-bold text-slate-800 tracking-tight transition-colors duration-300 line-clamp-1">
                  {{ dept.name }}
                </h3>
              </div>

              <!-- 3. BOTTOM AREA: READ MORE in default state (EMERALD GREEN), Specialist Doctor info on hover -->
              <div class="relative z-10 w-full min-h-[50px] flex items-center justify-center">
                
                <!-- DEFAULT STATE: Emerald Green Pill READ MORE Button (Fades out on hover) -->
                <button 
                  type="button" 
                  (click)="openDeptDetail(dept); $event.stopPropagation()"
                  class="read-more-btn w-full sm:w-auto min-w-[140px] px-7 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/25 transition-all duration-300 cursor-pointer block mx-auto"
                  aria-label="Read more about {{ dept.name }}"
                >
                  READ MORE
                </button>

                <!-- HOVER STATE: Specialist Doctor Information (Fades & slides in on hover) -->
                <div 
                  class="specialist-badge absolute inset-0 flex flex-col items-center justify-center opacity-0 scale-95 translate-y-1.5 transition-all duration-300 pointer-events-none"
                >
                  <div class="w-full px-3 py-1.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-lg flex items-center justify-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                    <div class="min-w-0 text-center">
                      <p class="text-xs sm:text-sm font-bold text-white tracking-tight truncate leading-tight">
                        {{ dept.headDoctor }}
                      </p>
                      <p class="text-[10px] sm:text-[11px] text-teal-300 font-medium truncate leading-tight mt-0.5">
                        {{ dept.headSpecialty }}
                      </p>
                    </div>
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
export class DepartmentsComponent {
  private readonly modalService = inject(ModalService);

  readonly departments = DEPARTMENTS_DATA;
  readonly hoveredDeptId = signal<string | null>(null);

  private lastMouseX: number | null = null;
  private lastMouseY: number | null = null;

  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:pointermove', ['$event'])
  onPointerMove(e: MouseEvent): void {
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.checkCardUnderCursor();
  }

  @HostListener('window:scroll')
  @HostListener('window:wheel')
  onWindowScroll(): void {
    this.checkCardUnderCursor();
  }

  @HostListener('document:mouseleave')
  onDocumentMouseLeave(): void {
    this.hoveredDeptId.set(null);
  }

  onCardPointerEnter(deptId: string): void {
    this.hoveredDeptId.set(deptId);
  }

  onCardPointerLeave(deptId: string): void {
    if (this.hoveredDeptId() === deptId) {
      this.hoveredDeptId.set(null);
    }
  }

  private checkCardUnderCursor(): void {
    if (this.lastMouseX === null || this.lastMouseY === null) return;
    const elem = document.elementFromPoint(this.lastMouseX, this.lastMouseY);
    if (!elem) {
      this.hoveredDeptId.set(null);
      return;
    }

    const card = elem.closest('[data-dept-id]');
    if (card) {
      const id = card.getAttribute('data-dept-id');
      this.hoveredDeptId.set(id);
    } else {
      this.hoveredDeptId.set(null);
    }
  }

  openDeptDetail(dept: Department): void {
    this.modalService.openDepartmentDetailModal(dept);
  }
}
