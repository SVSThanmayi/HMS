import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalService } from '../../../../core/services/modal.service';
import { IconComponent } from '../../../../shared/icons/icon.component';

@Component({
  selector: 'app-callback-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      width: 100%;
      position: relative;
    }

    /* Subtle Floating Ambient Glow Animations */
    @keyframes float-1 {
      0%, 100% {
        transform: translate(0px, 0px) scale(1);
      }
      50% {
        transform: translate(30px, -25px) scale(1.1);
      }
    }

    @keyframes float-2 {
      0%, 100% {
        transform: translate(0px, 0px) scale(1);
      }
      50% {
        transform: translate(-35px, 25px) scale(1.15);
      }
    }

    @keyframes pulse-ring {
      0% {
        transform: scale(0.92);
        opacity: 0.15;
      }
      50% {
        transform: scale(1.08);
        opacity: 0.35;
      }
      100% {
        transform: scale(0.92);
        opacity: 0.15;
      }
    }

    /* Subtle Animated ECG Line Sweep */
    @keyframes ecg-sweep {
      0% {
        stroke-dashoffset: 1000;
      }
      100% {
        stroke-dashoffset: 0;
      }
    }

    /* Tiny Drifting Medical Cross Particles */
    @keyframes particle-drift {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0.12;
      }
      50% {
        transform: translateY(-24px) rotate(20deg);
        opacity: 0.35;
      }
      100% {
        transform: translateY(0) rotate(0deg);
        opacity: 0.12;
      }
    }

    .anim-blob-1 {
      animation: float-1 14s ease-in-out infinite;
    }

    .anim-blob-2 {
      animation: float-2 18s ease-in-out infinite;
    }

    .anim-pulse-ring {
      animation: pulse-ring 8s ease-in-out infinite;
    }

    .anim-ecg {
      stroke-dasharray: 400 400;
      animation: ecg-sweep 10s linear infinite;
    }

    .anim-particle-1 {
      animation: particle-drift 9s ease-in-out infinite;
    }

    .anim-particle-2 {
      animation: particle-drift 13s ease-in-out infinite 2s;
    }

    .anim-particle-3 {
      animation: particle-drift 16s ease-in-out infinite 4s;
    }
  `],
  template: `
    <section id="callback" class="py-24 relative overflow-hidden bg-slate-950 text-white">
      
      <!-- 1. ANIMATED HEALTHCARE BACKGROUND LAYERS -->
      <!-- Radial Dot Matrix Base -->
      <div class="absolute inset-0 opacity-15 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-0"></div>
      
      <!-- Gradient Overlays -->
      <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-teal-950/80 pointer-events-none z-0"></div>

      <!-- Animated Floating Glowing Ambient Orbs -->
      <div class="anim-blob-1 absolute -top-20 -left-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div class="anim-blob-2 absolute -bottom-24 -right-20 w-[420px] h-[420px] bg-teal-500/15 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div class="anim-pulse-ring absolute top-1/3 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none z-0"></div>

      <!-- Animated ECG Waveform Background Silhouette -->
      <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none z-0 overflow-hidden">
        <svg class="w-full h-36" viewBox="0 0 1200 120" fill="none" preserveAspectRatio="none">
          <path 
            class="anim-ecg"
            d="M0,60 L200,60 L230,20 L250,100 L270,40 L290,70 L310,60 L550,60 L580,15 L600,105 L620,35 L640,75 L660,60 L900,60 L930,20 L950,100 L970,40 L990,70 L1010,60 L1200,60" 
            stroke="#10b981" 
            stroke-width="2.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- Subtle Floating Medical Cross Particles -->
      <div class="anim-particle-1 absolute top-16 left-[15%] w-8 h-8 text-teal-400/20 pointer-events-none z-0">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 10.5h-5.5V5a1.5 1.5 0 0 0-3 0v5.5H5a1.5 1.5 0 0 0 0 3h5.5V19a1.5 1.5 0 0 0 3 0v-5.5H19a1.5 1.5 0 0 0 0-3z"/></svg>
      </div>

      <div class="anim-particle-2 absolute bottom-20 left-[45%] w-6 h-6 text-emerald-400/25 pointer-events-none z-0">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 10.5h-5.5V5a1.5 1.5 0 0 0-3 0v5.5H5a1.5 1.5 0 0 0 0 3h5.5V19a1.5 1.5 0 0 0 3 0v-5.5H19a1.5 1.5 0 0 0 0-3z"/></svg>
      </div>

      <div class="anim-particle-3 absolute top-28 right-[10%] w-10 h-10 text-cyan-400/15 pointer-events-none z-0">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 10.5h-5.5V5a1.5 1.5 0 0 0-3 0v5.5H5a1.5 1.5 0 0 0 0 3h5.5V19a1.5 1.5 0 0 0 3 0v-5.5H19a1.5 1.5 0 0 0 0-3z"/></svg>
      </div>

      <!-- 2. MAIN CONTENT -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <!-- Left Column: Heading & 24/7 Emergency Hotline -->
          <div class="lg:col-span-6 space-y-8">
            <div class="space-y-3">
              <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase shadow-xs">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Rapid Response Healthcare
              </div>
              <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Request a Call Back
              </h2>
              <p class="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Have questions or need assistance? Leave your details and our clinical care team will get in touch with you within 15 minutes.
              </p>
            </div>

            <!-- Emergency 24/7 Hotline Card -->
            <div class="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4 shadow-xl hover:border-emerald-500/30 transition duration-300">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-lg shrink-0">
                <app-icon name="phone" wrapperClass="w-7 h-7 block text-white" />
              </div>
              <div class="space-y-0.5">
                <div class="text-xs font-bold text-teal-300 uppercase tracking-wider">Emergency 24/7 Hotline</div>
                <div class="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">1800 467 2273</div>
              </div>
            </div>
          </div>

          <!-- Right Column: Interactive Form Card -->
          <div class="lg:col-span-6">
            <div class="relative bg-white/95 text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/20 backdrop-blur-md">
              
              @if (isSuccess()) {
                <!-- Success Feedback Message -->
                <div class="py-8 text-center space-y-4 animate-fade-in">
                  <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <app-icon name="check-circle" wrapperClass="w-10 h-10 block" />
                  </div>
                  
                  <h3 class="text-2xl font-bold text-slate-900">Request Received!</h3>
                  
                  <p class="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Thank you, <strong class="text-teal-700">{{ submittedName() }}</strong>. Our patient care representative will call you at <strong class="text-teal-700 font-mono">{{ submittedPhone() }}</strong> shortly.
                  </p>

                  <div class="p-4 bg-teal-50/80 rounded-2xl border border-teal-200/80 text-xs text-teal-800 font-medium">
                    Reference Request ID: <span class="font-mono font-bold">{{ requestId() }}</span>
                  </div>

                  <div class="pt-4">
                    <button 
                      type="button" 
                      (click)="resetForm()"
                      class="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition cursor-pointer"
                    >
                      Submit Another Request
                    </button>
                  </div>
                </div>
              } @else {
                <!-- Interactive Form -->
                <div>
                  <h3 class="text-2xl font-bold text-slate-900 mb-1">
                    Get in Touch
                  </h3>
                  <p class="text-xs sm:text-sm text-slate-600 mb-6">
                    Fill out your contact info below and we'll connect with you right away.
                  </p>

                  <form [formGroup]="callbackForm" (ngSubmit)="onSubmit()" class="space-y-1.5">
                    
                    <!-- 1. Name Input -->
                    <div>
                      <label for="cb-name" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Your Full Name <span class="text-rose-500">*</span>
                      </label>
                      <div class="relative">
                        <input 
                          id="cb-name"
                          type="text" 
                          formControlName="name"
                          placeholder="e.g. Robert Smith"
                          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition outline-none"
                          [class.border-rose-400]="isFieldInvalid('name')"
                        />
                      </div>
                      <div class="min-h-[18px] mt-1">
                        @if (isFieldInvalid('name')) {
                          <p class="text-xs text-rose-500 font-medium leading-none flex items-center gap-1">
                            <span>Please enter your name (at least 2 characters).</span>
                          </p>
                        }
                      </div>
                    </div>

                    <!-- 2. Mobile Number Input & Send OTP Action -->
                    <div>
                      <label for="cb-mobile" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Mobile Number <span class="text-rose-500">*</span>
                      </label>
                      <div class="relative">
                        <input 
                          id="cb-mobile"
                          type="tel" 
                          formControlName="mobile"
                          placeholder="e.g. 9876543210"
                          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition outline-none"
                          [class.border-rose-400]="isFieldInvalid('mobile')"
                        />
                      </div>

                      <!-- Sub-row: Validation error on left, Clickable Send OTP text on right with reserved space -->
                      <div class="min-h-[18px] mt-1 flex items-start justify-between">
                        @if (isFieldInvalid('mobile')) {
                          <p class="text-xs text-rose-500 font-medium leading-none">
                            Please enter a valid 10-digit mobile number.
                          </p>
                        } @else {
                          <span></span>
                        }

                        <!-- Clickable "Send OTP" link / button -->
                        <button 
                          type="button" 
                          (click)="sendOtp()"
                          [disabled]="isSendingOtp()"
                          class="text-xs font-bold text-teal-600 hover:text-teal-800 hover:underline transition cursor-pointer disabled:opacity-50 ml-auto flex items-center gap-1 leading-none"
                        >
                          @if (isSendingOtp()) {
                            <div class="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Sending OTP...</span>
                          } @else if (otpSent()) {
                            <span class="text-emerald-600 font-semibold">Resend OTP</span>
                          } @else {
                            <span>Send OTP</span>
                          }
                        </button>
                      </div>
                    </div>

                    <!-- 3. OTP Input (Appears between Mobile Number and Preferred Time) -->
                    @if (otpSent()) {
                      <div class="animate-fade-in">
                        <label for="cb-otp" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          OTP <span class="text-rose-500">*</span>
                        </label>
                        <div class="relative">
                          <input 
                            id="cb-otp"
                            type="text" 
                            formControlName="otp"
                            placeholder="Enter OTP"
                            maxlength="6"
                            class="w-full px-4 py-2.5 bg-slate-50 border border-teal-300 rounded-xl text-slate-900 text-sm font-medium tracking-wide focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition outline-none"
                          />
                        </div>
                        <div class="min-h-[18px] mt-1 flex items-center">
                          <p class="text-xs text-teal-700 font-medium leading-none flex items-center gap-1">
                            <app-icon name="check" wrapperClass="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>OTP sent successfully to your mobile number</span>
                          </p>
                        </div>
                      </div>
                    }

                    <!-- 4. Preferred Time to Call Input -->
                    <div>
                      <label for="cb-preferred-time" class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Preferred Time to Call
                      </label>
                      <div class="relative">
                        <select 
                          id="cb-preferred-time"
                          formControlName="preferredTime"
                          class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition outline-none cursor-pointer"
                        >
                          <option value="Immediate (Within 15 mins)">Immediate (Within 15 mins)</option>
                          <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                          <option value="Afternoon (12:00 PM - 04:00 PM)">Afternoon (12:00 PM - 04:00 PM)</option>
                          <option value="Evening (04:00 PM - 08:00 PM)">Evening (04:00 PM - 08:00 PM)</option>
                          <option value="Anytime today">Anytime today</option>
                        </select>
                      </div>
                      <div class="min-h-[18px] mt-1"></div>
                    </div>

                    <!-- 5. Submit Button -->
                    <div class="pt-1.5">
                      <button 
                        type="submit" 
                        [disabled]="isSubmitting()"
                        class="btn-healthcare-primary w-full py-4 px-6 text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                      >
                        @if (isSubmitting()) {
                          <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sending Request...</span>
                        } @else {
                          <app-icon name="phone" wrapperClass="w-5 h-5 block text-teal-200" />
                          <span>Request Instant Call Back</span>
                        }
                      </button>
                    </div>

                    <p class="text-2xs text-slate-600 text-center pt-1">
                      By submitting, you agree to receive a callback from our hospital team.
                    </p>

                  </form>
                </div>
              }

            </div>
          </div>

        </div>

      </div>
    </section>
  `
})
export class CallbackFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(ModalService);

  readonly isSubmitting = signal<boolean>(false);
  readonly isSuccess = signal<boolean>(false);
  readonly submittedName = signal<string>('');
  readonly submittedPhone = signal<string>('');
  readonly submittedTime = signal<string>('');
  readonly requestId = signal<string>('');
  
  readonly isSendingOtp = signal<boolean>(false);
  readonly otpSent = signal<boolean>(false);

  callbackForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    otp: [''],
    preferredTime: ['Immediate (Within 15 mins)']
  });

  isFieldInvalid(field: string): boolean {
    const control = this.callbackForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  sendOtp(): void {
    const mobileCtrl = this.callbackForm.get('mobile');
    if (!mobileCtrl || mobileCtrl.invalid) {
      mobileCtrl?.markAsTouched();
      return;
    }

    this.isSendingOtp.set(true);
    setTimeout(() => {
      this.isSendingOtp.set(false);
      this.otpSent.set(true);
    }, 600);
  }

  onSubmit(): void {
    if (this.callbackForm.invalid) {
      this.callbackForm.markAllAsTouched();
      return;
    }

    const formVal = this.callbackForm.value;

    this.modalService.confirm({
      title: 'Confirm Call Back Request',
      message: `Would you like to request a priority call back for ${formVal.name} at ${formVal.mobile} (${formVal.preferredTime || 'Immediate'})?`,
      confirmText: 'Request Call Back',
      cancelText: 'Edit Info',
      type: 'primary',
      icon: 'phone',
      onConfirm: () => {
        this.isSubmitting.set(true);

        setTimeout(() => {
          this.isSubmitting.set(false);
          this.submittedName.set(formVal.name || '');
          this.submittedPhone.set(formVal.mobile || '');
          this.submittedTime.set(formVal.preferredTime || 'Immediate (Within 15 mins)');
          const reqId = `CB-REQ-${Math.floor(1000 + Math.random() * 9000)}`;
          this.requestId.set(reqId);
          this.isSuccess.set(true);
          this.modalService.showToast('Call Back Requested', `Our team will call ${formVal.mobile} shortly. (Ref: ${reqId})`, 'success');
        }, 700);
      }
    });
  }

  resetForm(): void {
    this.callbackForm.reset({
      name: '',
      mobile: '',
      otp: '',
      preferredTime: 'Immediate (Within 15 mins)'
    });
    this.otpSent.set(false);
    this.isSuccess.set(false);
  }
}
