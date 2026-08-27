import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalService } from '../../../core/services/modal.service';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (modalService.isLoginModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
        
        <!-- Backdrop -->
        <div class="fixed inset-0" (click)="closeModal()"></div>

        <!-- Dialog Box -->
        <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-8">
          
          <!-- Header with Hospital Logo -->
          <div class="relative bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 px-6 py-6 text-white text-center">
            <button 
              type="button" 
              (click)="closeModal()" 
              class="absolute top-4 right-4 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition cursor-pointer"
              aria-label="Close login dialog"
            >
              <app-icon name="x" wrapperClass="w-5 h-5 block" />
            </button>

            <!-- Logo -->
            <div class="inline-flex items-center justify-center p-3 bg-teal-600/30 border border-teal-400/30 rounded-2xl mb-3 text-teal-300 shadow-inner">
              <app-icon name="heart-cross" wrapperClass="w-8 h-8 block" />
            </div>

            <h2 id="login-modal-title" class="text-2xl font-bold tracking-tight text-white">
              HMS Portal Login
            </h2>
            <p class="text-xs text-teal-100/75 mt-1">
              Secure digital access to your medical records & consultations
            </p>
          </div>

          <!-- Social Login Buttons (Icons Only) -->
          <div class="px-6 pt-5 pb-1">
            <div class="flex items-center justify-center gap-4">
              <button 
                type="button" 
                (click)="onSocialLogin('Google')" 
                class="w-12 h-12 rounded-2xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition cursor-pointer shadow-xs hover:border-teal-400 group"
                aria-label="Login with Google"
              >
                <app-icon name="google" wrapperClass="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
              <button 
                type="button" 
                (click)="onSocialLogin('Facebook')" 
                class="w-12 h-12 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30 flex items-center justify-center transition cursor-pointer shadow-xs hover:border-[#1877F2] group"
                aria-label="Login with Facebook"
              >
                <app-icon name="facebook" wrapperClass="w-5 h-5 text-[#1877F2] group-hover:scale-110 transition-transform" />
              </button>
            </div>

            <!-- Plain Separating Line -->
            <div class="border-t border-slate-200 my-4"></div>
          </div>

          <!-- Form Area -->
          <div class="p-6 pt-1 sm:p-7 sm:pt-1">
            <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-1">
              
              <!-- Quick Demo Fill: Patient, Receptionist, Nurse, Doctor & Pharmacist Buttons (Single Row) -->
              <div class="grid grid-cols-5 gap-1 mb-3">
                <button 
                  type="button" 
                  (click)="fillPatientCredentials()"
                  class="py-2 px-1 rounded-xl bg-teal-50 hover:bg-teal-100/90 border border-teal-200 text-teal-900 text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                  aria-label="Fill Patient credentials"
                >
                  <app-icon name="user" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                  <span class="truncate">Patient</span>
                </button>
                <button 
                  type="button" 
                  (click)="fillReceptionistCredentials()"
                  class="py-2 px-1 rounded-xl bg-teal-50 hover:bg-teal-100/90 border border-teal-200 text-teal-900 text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                  aria-label="Fill Receptionist credentials"
                >
                  <app-icon name="user-circle" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                  <span class="truncate">Reception</span>
                </button>
                <button 
                  type="button" 
                  (click)="fillNurseCredentials()"
                  class="py-2 px-1 rounded-xl bg-teal-50 hover:bg-teal-100/90 border border-teal-200 text-teal-900 text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                  aria-label="Fill Nurse credentials"
                >
                  <app-icon name="activity" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                  <span class="truncate">Nurse</span>
                </button>
                <button 
                  type="button" 
                  (click)="fillDoctorCredentials()"
                  class="py-2 px-1 rounded-xl bg-teal-50 hover:bg-teal-100/90 border border-teal-200 text-teal-900 text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                  aria-label="Fill Doctor credentials"
                >
                  <app-icon name="stethoscope" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                  <span class="truncate">Doctor</span>
                </button>
                <button 
                  type="button" 
                  (click)="fillPharmacistCredentials()"
                  class="py-2 px-1 rounded-xl bg-teal-50 hover:bg-teal-100/90 border border-teal-200 text-teal-900 text-[11px] font-bold flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                  aria-label="Fill Pharmacist credentials"
                >
                  <app-icon name="pill" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                  <span class="truncate">Pharm</span>
                </button>
              </div>

              <!-- Email or Phone Number -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email or Phone Number
                </label>
                <div class="relative">
                  <input 
                    type="text" 
                    formControlName="identifier"
                    placeholder="e.g. 9876543210 or user@example.com"
                    class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition outline-none"
                    [class.border-rose-400]="isFieldInvalid('identifier')"
                  />
                </div>
                <div class="min-h-[18px] mt-1">
                  @if (isFieldInvalid('identifier')) {
                    <p class="text-xs text-rose-500 font-medium leading-none">Please enter your email or phone number.</p>
                  }
                </div>
              </div>

              <!-- Password with Show/Hide & Forgot Password Below -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div class="relative">
                  <input 
                    [type]="showPassword() ? 'text' : 'password'" 
                    formControlName="password"
                    placeholder="••••••••"
                    class="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition outline-none"
                    [class.border-rose-400]="isFieldInvalid('password')"
                  />
                  <button 
                    type="button" 
                    (click)="showPassword.set(!showPassword())"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  >
                    <app-icon [name]="showPassword() ? 'eye-off' : 'eye'" wrapperClass="w-4 h-4" />
                  </button>
                </div>
                <div class="min-h-[18px] mt-1">
                  @if (isFieldInvalid('password')) {
                    <p class="text-xs text-rose-500 font-medium leading-none">Password must be at least 4 characters.</p>
                  }
                </div>

                <!-- Forgot Password Link Below Password Input -->
                <div class="flex justify-end pt-0.5">
                  <button 
                    type="button" 
                    (click)="goToForgotPassword()"
                    class="text-xs text-teal-700 hover:underline font-semibold cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <!-- Submit -->
              <div class="pt-2">
                <button 
                  type="submit" 
                  [disabled]="isLoggingIn()"
                  class="btn-healthcare-primary w-full py-3 px-6 text-white font-bold rounded-xl transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 text-sm"
                >
                  @if (isLoggingIn()) {
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  } @else {
                    <app-icon name="shield-check" wrapperClass="w-4 h-4 block text-teal-200" />
                    <span>Login</span>
                  }
                </button>
              </div>

              <!-- Sign Up Link -->
              <div class="pt-3 text-center text-xs text-slate-600 border-t border-slate-100">
                <span>Don't have an account? </span>
                <button 
                  type="button" 
                  (click)="goToSignUp()"
                  class="font-bold text-teal-700 hover:text-teal-800 hover:underline cursor-pointer ml-1"
                >
                  Sign Up
                </button>
              </div>

            </form>
          </div>

          <!-- Footer notice -->
          <div class="bg-slate-50 border-t border-slate-100 px-6 py-3 text-center text-xs text-slate-700">
            Protected by 256-bit Healthcare Grade Encryption
          </div>

        </div>
      </div>
    }
  `
})
export class LoginModalComponent {
  readonly modalService = inject(ModalService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly isLoggingIn = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);

  loginForm = this.fb.group({
    identifier: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  isFieldInvalid(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSocialLogin(provider: 'Google' | 'Facebook'): void {
    this.closeModal();
    this.authService.login(`patient.${provider.toLowerCase()}@example.com`, `Verified ${provider} Patient`);
    setTimeout(() => {
      this.router.navigate(['/patient-portal']);
    }, 700);
  }

  goToForgotPassword(): void {
    this.closeModal();
    this.router.navigate(['/login'], { queryParams: { mode: 'forgot' } });
  }

  goToSignUp(): void {
    this.closeModal();
    this.router.navigate(['/login'], { queryParams: { mode: 'signup' } });
  }

  fillPatientCredentials(): void {
    this.loginForm.patchValue({
      identifier: 'eleanor.vance@example.com',
      password: 'Patient@123'
    });
    this.loginForm.markAsDirty();
    this.loginForm.markAsTouched();
  }

  fillDoctorCredentials(): void {
    this.loginForm.patchValue({
      identifier: 'doctor@hms-hospital.org',
      password: 'Doctor@123'
    });
    this.loginForm.markAsDirty();
    this.loginForm.markAsTouched();
  }

  fillReceptionistCredentials(): void {
    this.loginForm.patchValue({
      identifier: 'receptionist@hms-hospital.org',
      password: 'Receptionist@123'
    });
    this.loginForm.markAsDirty();
    this.loginForm.markAsTouched();
  }

  fillNurseCredentials(): void {
    this.loginForm.patchValue({
      identifier: 'nurse@hms-hospital.org',
      password: 'Nurse@123'
    });
    this.loginForm.markAsDirty();
    this.loginForm.markAsTouched();
  }

  fillPharmacistCredentials(): void {
    this.loginForm.patchValue({
      identifier: 'pharmacist@hms-hospital.org',
      password: 'Pharmacist@123'
    });
    this.loginForm.markAsDirty();
    this.loginForm.markAsTouched();
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoggingIn.set(true);
    const identifier = this.loginForm.value.identifier || 'patient@hms-hospital.org';
    const isDoctor = identifier.toLowerCase().includes('doctor') || identifier.toLowerCase().includes('dr.');
    const isNurse = identifier.toLowerCase().includes('nurse');
    const isReceptionist = identifier.toLowerCase().includes('reception');
    const isPharmacist = identifier.toLowerCase().includes('pharmacist') || identifier.toLowerCase().includes('pharm');

    const role = isDoctor ? 'doctor' : isNurse ? 'nurse' : isReceptionist ? 'receptionist' : isPharmacist ? 'pharmacist' : 'patient';
    const name = isDoctor ? 'Dr. Sarah Johnson' : isNurse ? 'Emily Watson' : isReceptionist ? 'Sarah Jenkins' : isPharmacist ? 'Alex Mercer, RPh' : undefined;

    this.authService.login(identifier, name, role);

    setTimeout(() => {
      this.isLoggingIn.set(false);
      this.closeModal();
      if (isDoctor) {
        this.router.navigate(['/doctor']);
      } else if (isNurse) {
        this.router.navigate(['/nurse']);
      } else if (isReceptionist) {
        this.router.navigate(['/receptionist']);
      } else if (isPharmacist) {
        this.router.navigate(['/pharmacist']);
      } else {
        this.router.navigate(['/patient-portal']);
      }
    }, 700);
  }

  closeModal(): void {
    this.modalService.closeLoginModal();
    this.loginForm.reset();
  }
}
