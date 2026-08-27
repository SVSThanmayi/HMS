import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ModalService } from '../../core/services/modal.service';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/icons/icon.component';

type AuthMode = 'login' | 'signup' | 'forgot-password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-screen max-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-50 via-[#f8fafc] to-teal-50/25 text-slate-800 select-none font-sans relative">
      
      <!-- ================================================================= -->
      <!-- PREMIUM ANIMATED HOSPITAL BACKGROUND (LIGHT THEME) -->
      <!-- ================================================================= -->
      <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        
        <!-- Soft Ambient Pastel Aurora Glows -->
        <div class="absolute -top-28 -left-28 w-[36rem] h-[36rem] bg-gradient-to-br from-teal-300/30 via-emerald-200/25 to-transparent rounded-full blur-[100px] animate-orb-1"></div>
        <div class="absolute top-1/4 -right-32 w-[40rem] h-[40rem] bg-gradient-to-bl from-cyan-300/30 via-teal-200/25 to-transparent rounded-full blur-[110px] animate-orb-2"></div>
        <div class="absolute -bottom-28 left-1/4 w-[42rem] h-[42rem] bg-gradient-to-tr from-emerald-200/25 via-teal-300/20 to-transparent rounded-full blur-[120px] animate-orb-3"></div>

        <!-- High-Tech Medical Grid Pattern Matrix (Light Slate/Teal) -->
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#0d948815_1px,transparent_1px),linear-gradient(to_bottom,#0d948815_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_65%,transparent_100%)] opacity-80"></div>

        <!-- Animated ECG Heartbeat Line 1 (Mid-Screen Horizon) -->
        <div class="absolute top-1/3 left-0 right-0 w-full opacity-40 pointer-events-none">
          <svg class="w-full h-24 text-teal-600" viewBox="0 0 1200 100" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 50 H300 L315 20 L330 80 L345 10 L360 90 L375 40 L390 55 L405 50 H700 L715 15 L730 85 L745 5 L760 95 L775 35 L790 55 L805 50 H1200" 
              stroke="url(#ecg-gradient-light-1)" 
              stroke-width="2.5" 
              stroke-linecap="round" 
              stroke-linejoin="round"
              class="animate-ecg"
            />
            <defs>
              <linearGradient id="ecg-gradient-light-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#0d9488" stop-opacity="0" />
                <stop offset="20%" stop-color="#0d9488" stop-opacity="0.8" />
                <stop offset="50%" stop-color="#0284c7" stop-opacity="1" />
                <stop offset="80%" stop-color="#059669" stop-opacity="0.8" />
                <stop offset="100%" stop-color="#0d9488" stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <!-- Animated ECG Heartbeat Line 2 (Lower Screen Drift) -->
        <div class="absolute bottom-1/4 left-0 right-0 w-full opacity-35 pointer-events-none">
          <svg class="w-full h-20 text-cyan-600" viewBox="0 0 1200 100" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 50 H150 L165 25 L180 75 L195 15 L210 85 L225 45 L240 50 H550 L565 20 L580 80 L595 10 L610 90 L625 40 L640 50 H950 L965 20 L980 80 L995 15 L1010 85 L1025 45 L1040 50 H1200" 
              stroke="url(#ecg-gradient-light-2)" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round"
              class="animate-ecg"
              style="animation-duration: 9s; animation-direction: reverse;"
            />
            <defs>
              <linearGradient id="ecg-gradient-light-2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#0284c7" stop-opacity="0" />
                <stop offset="50%" stop-color="#0d9488" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <!-- Floating Glowing Medical Crosses (+) & Bokeh Vitals -->
        <div class="absolute left-[8%] animate-particle-1">
          <div class="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 shadow-sm backdrop-blur-xs">
            <app-icon name="plus" wrapperClass="w-4 h-4" />
          </div>
        </div>

        <div class="absolute left-[85%] animate-particle-2">
          <div class="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-sm backdrop-blur-xs">
            <app-icon name="heart-cross" wrapperClass="w-4.5 h-4.5" />
          </div>
        </div>

        <div class="absolute left-[22%] animate-particle-3">
          <div class="w-6 h-6 rounded-md bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 shadow-xs">
            <app-icon name="plus" wrapperClass="w-3.5 h-3.5" />
          </div>
        </div>

        <div class="absolute left-[78%] animate-particle-4">
          <div class="w-7 h-7 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 shadow-sm">
            <app-icon name="plus" wrapperClass="w-4 h-4" />
          </div>
        </div>

        <div class="absolute left-[45%] animate-particle-5">
          <div class="w-6 h-6 rounded-full bg-teal-400/30 blur-[2px]"></div>
        </div>

        <div class="absolute left-[65%] animate-particle-6">
          <div class="w-6 h-6 rounded-md bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shadow-xs">
            <app-icon name="plus" wrapperClass="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      <!-- ================================================================= -->
      <!-- TOP NAVIGATION BAR (SLEEK & COMPACT) -->
      <!-- ================================================================= -->
      <header class="relative z-10 w-full px-5 sm:px-8 py-3 flex items-center justify-between border-b border-slate-200/70 bg-white/80 backdrop-blur-xl shadow-2xs shrink-0">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-2.5 group cursor-pointer">
          <div class="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-teal-600/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
            <app-icon name="heart-cross" wrapperClass="w-4.5 h-4.5 text-white" />
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-extrabold tracking-tight text-slate-900 leading-none group-hover:text-teal-700 transition-colors">
              HMS
            </span>
            <span class="text-[10px] uppercase font-bold tracking-wider text-teal-600 leading-tight">
              Healthcare
            </span>
          </div>
        </a>

        <!-- Back to Home Button -->
        <a 
          routerLink="/" 
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-teal-700 bg-white hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 transition-all shadow-2xs group cursor-pointer"
        >
          <app-icon name="arrow-left" wrapperClass="w-3.5 h-3.5 text-slate-600 group-hover:-translate-x-0.5 group-hover:text-teal-600 transition-transform" />
          <span>Back to Home</span>
        </a>
      </header>

      <!-- ================================================================= -->
      <!-- MAIN AUTHENTICATION PANEL (PREMIUM NO-SCROLL) -->
      <!-- ================================================================= -->
      <main class="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-4 overflow-hidden">
        <div class="w-full mx-auto transition-all duration-300" [class.max-w-[720px]]="authMode() === 'signup'" [class.max-w-[560px]]="authMode() !== 'signup'">
          
          <!-- Glassmorphic Elevated Glow Card -->
          <div class="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(15,118,110,0.12),0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-200/90 relative">
              
            <!-- Mode Tabs / Header -->
            <div class="text-center">
              @if (authMode() === 'login') {
                <h2 class="text-2xl sm:text-[26px] font-semibold text-slate-800 tracking-tight">
                  Login
                </h2>

                <!-- Quick Patient, Receptionist, Nurse, Doctor & Pharmacist Autofill Badges (Spacious Single Row - Unified Colors) -->
                <div class="mt-3 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap py-0.5">
                  <button 
                    type="button" 
                    (click)="fillPatientCredentials()"
                    class="shrink-0 inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 text-xs font-semibold transition cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                    title="Fill Patient credentials"
                  >
                    <app-icon name="user" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                    <span>Patient</span>
                  </button>
                  <button 
                    type="button" 
                    (click)="fillReceptionistCredentials()"
                    class="shrink-0 inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 text-xs font-semibold transition cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                    title="Fill Receptionist credentials"
                  >
                    <app-icon name="user-circle" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                    <span>Receptionist</span>
                  </button>
                  <button 
                    type="button" 
                    (click)="fillNurseCredentials()"
                    class="shrink-0 inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 text-xs font-semibold transition cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                    title="Fill Nurse credentials"
                  >
                    <app-icon name="activity" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                    <span>Nurse</span>
                  </button>
                  <button 
                    type="button" 
                    (click)="fillDoctorCredentials()"
                    class="shrink-0 inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 text-xs font-semibold transition cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                    title="Fill Doctor credentials"
                  >
                    <app-icon name="stethoscope" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                    <span>Doctor</span>
                  </button>
                  <button 
                    type="button" 
                    (click)="fillPharmacistCredentials()"
                    class="shrink-0 inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 text-xs font-semibold transition cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                    title="Fill Pharmacist credentials"
                  >
                    <app-icon name="pill" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                    <span>Pharmacist</span>
                  </button>
                </div>
              } @else if (authMode() === 'signup') {
                <h2 class="text-2xl sm:text-[26px] font-semibold text-slate-800 tracking-tight">
                  Create Account
                </h2>
              } @else {
                <h2 class="text-2xl sm:text-[26px] font-semibold text-slate-800 tracking-tight">
                  Reset Password
                </h2>
                <p class="text-slate-500 text-xs mt-1 font-medium">
                  Enter your email or phone for reset instructions
                </p>
              }
            </div>

            <!-- ========================================================= -->
            <!-- SOCIAL ICONS (Google & Facebook) - Circular & Elegant -->
            <!-- ========================================================= -->
            @if (authMode() === 'login') {
              <div class="mt-3.5">
                <div class="flex items-center justify-center gap-3.5">
                  
                  <!-- Google Icon Button -->
                  <button 
                    type="button" 
                    (click)="onSocialLogin('Google')" 
                    class="w-10 h-10 rounded-full bg-slate-50 hover:bg-white border border-slate-200 hover:border-teal-400 flex items-center justify-center transition cursor-pointer shadow-2xs hover:shadow-md group active:scale-95"
                    aria-label="Login with Google"
                  >
                    <app-icon name="google" wrapperClass="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                  </button>

                  <!-- Facebook Icon Button -->
                  <button 
                    type="button" 
                    (click)="onSocialLogin('Facebook')" 
                    class="w-10 h-10 rounded-full bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#1877F2] flex items-center justify-center transition cursor-pointer shadow-2xs hover:shadow-md group active:scale-95"
                    aria-label="Login with Facebook"
                  >
                    <app-icon name="facebook" wrapperClass="w-4.5 h-4.5 text-[#1877F2] group-hover:scale-110 transition-transform" />
                  </button>

                </div>

                <!-- Separator with Text -->
                <div class="relative flex py-1.5 items-center my-2.5">
                  <div class="flex-grow border-t border-slate-200"></div>
                  <span class="shrink-0 mx-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">or login with</span>
                  <div class="flex-grow border-t border-slate-200"></div>
                </div>
              </div>
            }

            <!-- ========================================================= -->
            <!-- VIEW 1: LOGIN FORM -->
            <!-- ========================================================= -->
            @if (authMode() === 'login') {
              <form [formGroup]="loginForm" (ngSubmit)="onLoginSubmit()" class="space-y-0.5">
                
                <!-- Email or Phone Number Input -->
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Email or Phone Number
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <app-icon name="user" wrapperClass="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      formControlName="identifier"
                      placeholder="e.g. user@example.com or +91 98765 43210"
                      class="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition shadow-2xs"
                      [class.border-rose-400]="isFieldInvalid(loginForm, 'identifier')"
                    />
                  </div>
                  <div class="min-h-[16px] mt-0.5">
                    @if (isFieldInvalid(loginForm, 'identifier')) {
                      <p class="text-xs text-rose-500 font-medium leading-none">Please enter a valid email or phone number.</p>
                    }
                  </div>
                </div>

                <!-- Password Input with Show/Hide & Forgot Password Below -->
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Password
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <app-icon name="lock" wrapperClass="w-4 h-4" />
                    </div>
                    <input 
                      [type]="showPassword() ? 'text' : 'password'" 
                      formControlName="password"
                      placeholder="••••••••"
                      class="w-full pl-10 pr-11 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition shadow-2xs"
                      [class.border-rose-400]="isFieldInvalid(loginForm, 'password')"
                    />
                    <button 
                      type="button" 
                      (click)="showPassword.set(!showPassword())"
                      class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                      [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                    >
                      <app-icon [name]="showPassword() ? 'eye-off' : 'eye'" wrapperClass="w-4 h-4" />
                    </button>
                  </div>
                  <div class="min-h-[16px] mt-0.5">
                    @if (isFieldInvalid(loginForm, 'password')) {
                      <p class="text-xs text-rose-500 font-medium leading-none">Password must be at least 4 characters.</p>
                    }
                  </div>

                  <!-- Forgot Password Link -->
                  <div class="flex justify-end pt-0.5">
                    <button 
                      type="button" 
                      (click)="setMode('forgot-password')" 
                      class="text-xs font-semibold text-teal-700 hover:text-teal-900 transition cursor-pointer hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <!-- Submit Login Button -->
                <div class="pt-2">
                  <button 
                    type="submit" 
                    [disabled]="isSubmitting()"
                    class="w-full py-2.5 sm:py-3 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold text-sm shadow-md shadow-teal-700/20 hover:shadow-lg transition-all transform active:scale-[0.99] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    @if (isSubmitting()) {
                      <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Authenticating...</span>
                    } @else {
                      <app-icon name="shield-check" wrapperClass="w-4.5 h-4.5 text-teal-100" />
                      <span>Login</span>
                    }
                  </button>
                </div>

              </form>

              <!-- Sign Up Navigation Link -->
              <div class="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
                <span>Don't have an account? </span>
                <button 
                  type="button" 
                  (click)="setMode('signup')"
                  class="font-bold text-teal-700 hover:text-teal-900 hover:underline transition cursor-pointer ml-1"
                >
                  Sign Up
                </button>
              </div>
            }

            <!-- ========================================================= -->
            <!-- VIEW 2: SIGN UP / REGISTRATION FORM -->
            <!-- ========================================================= -->
            @if (authMode() === 'signup') {
              <form [formGroup]="signupForm" (ngSubmit)="onSignupSubmit()" class="mt-5 space-y-1">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-5 sm:gap-x-6 gap-y-2">
                  
                  <!-- Full Name Input (Mandatory) -->
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Full Name <span class="text-rose-500">*</span>
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <app-icon name="user" wrapperClass="w-4 h-4" />
                      </div>
                      <input 
                        type="text" 
                        formControlName="fullName"
                        placeholder="e.g. Eleanor Vance"
                        class="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition shadow-2xs"
                        [class.border-rose-400]="isFieldInvalid(signupForm, 'fullName')"
                      />
                    </div>
                    <div class="min-h-[16px] mt-1">
                      @if (isFieldInvalid(signupForm, 'fullName')) {
                        <p class="text-xs text-rose-500 font-medium leading-none">Please enter your full name.</p>
                      }
                    </div>
                  </div>

                  <!-- Phone Number (Mandatory) -->
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Phone Number <span class="text-rose-500">*</span>
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <app-icon name="phone" wrapperClass="w-4 h-4" />
                      </div>
                      <input 
                        type="tel" 
                        formControlName="phone"
                        placeholder="e.g. +91 98765 43210"
                        class="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition shadow-2xs"
                        [class.border-rose-400]="isFieldInvalid(signupForm, 'phone')"
                      />
                    </div>
                    <div class="min-h-[16px] mt-1">
                      @if (isFieldInvalid(signupForm, 'phone')) {
                        <p class="text-xs text-rose-500 font-medium leading-none">Please enter your phone number.</p>
                      }
                    </div>
                  </div>

                  <!-- Email Address (Optional) -->
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Email Address <span class="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <app-icon name="mail" wrapperClass="w-4 h-4" />
                      </div>
                      <input 
                        type="email" 
                        formControlName="email"
                        placeholder="e.g. eleanor@example.com"
                        class="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition shadow-2xs"
                        [class.border-rose-400]="isFieldInvalid(signupForm, 'email')"
                      />
                    </div>
                    <div class="min-h-[16px] mt-1">
                      @if (isFieldInvalid(signupForm, 'email')) {
                        <p class="text-xs text-rose-500 font-medium leading-none">Please enter a valid email address.</p>
                      }
                    </div>
                  </div>

                  <!-- Residential Address (Optional) -->
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Address <span class="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <app-icon name="map-pin" wrapperClass="w-4 h-4" />
                      </div>
                      <input 
                        type="text" 
                        formControlName="address"
                        placeholder="e.g. Flat 402, Bengaluru"
                        class="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition shadow-2xs"
                      />
                    </div>
                    <div class="min-h-[16px] mt-1"></div>
                  </div>

                  <!-- Emergency Contact (Optional) -->
                  <div class="sm:col-span-2">
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Emergency Contact <span class="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <app-icon name="phone" wrapperClass="w-4 h-4" />
                      </div>
                      <input 
                        type="tel" 
                        formControlName="emergencyContact"
                        placeholder="e.g. +91 98450 12345 (Spouse)"
                        class="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition shadow-2xs"
                      />
                    </div>
                    <div class="min-h-[16px] mt-1"></div>
                  </div>

                  <!-- Create Password -->
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Create Password <span class="text-rose-500">*</span>
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <app-icon name="lock" wrapperClass="w-4 h-4" />
                      </div>
                      <input 
                        [type]="showPassword() ? 'text' : 'password'" 
                        formControlName="password"
                        placeholder="At least 6 characters"
                        class="w-full pl-10 pr-11 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition shadow-2xs"
                        [class.border-rose-400]="isFieldInvalid(signupForm, 'password')"
                      />
                      <button 
                        type="button" 
                        (click)="showPassword.set(!showPassword())"
                        class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                        [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                      >
                        <app-icon [name]="showPassword() ? 'eye-off' : 'eye'" wrapperClass="w-4 h-4" />
                      </button>
                    </div>
                    <div class="min-h-[16px] mt-1">
                      @if (isFieldInvalid(signupForm, 'password')) {
                        <p class="text-xs text-rose-500 font-medium leading-none">Password must be at least 6 characters.</p>
                      }
                    </div>
                  </div>

                  <!-- Confirm Password -->
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Confirm Password <span class="text-rose-500">*</span>
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <app-icon name="lock" wrapperClass="w-4 h-4" />
                      </div>
                      <input 
                        [type]="showConfirmPassword() ? 'text' : 'password'" 
                        formControlName="confirmPassword"
                        placeholder="Re-enter password"
                        class="w-full pl-10 pr-11 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition shadow-2xs"
                        [class.border-rose-400]="isFieldInvalid(signupForm, 'confirmPassword')"
                      />
                      <button 
                        type="button" 
                        (click)="showConfirmPassword.set(!showConfirmPassword())"
                        class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                        [attr.aria-label]="showConfirmPassword() ? 'Hide password' : 'Show password'"
                      >
                        <app-icon [name]="showConfirmPassword() ? 'eye-off' : 'eye'" wrapperClass="w-4 h-4" />
                      </button>
                    </div>
                    <div class="min-h-[16px] mt-1">
                      @if (isFieldInvalid(signupForm, 'confirmPassword')) {
                        @if (signupForm.get('confirmPassword')?.hasError('passwordMismatch')) {
                          <p class="text-xs text-rose-500 font-medium leading-none">Passwords do not match.</p>
                        } @else {
                          <p class="text-xs text-rose-500 font-medium leading-none">Please confirm your password.</p>
                        }
                      }
                    </div>
                  </div>

                </div>

                <!-- Agreement Checkbox -->
                <div class="pt-1.5">
                  <label class="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      formControlName="agreeTerms" 
                      class="w-4 h-4 mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>
                      I agree to the <span class="text-teal-700 font-semibold underline">Terms of Service</span> and <span class="text-teal-700 font-semibold underline">HIPAA Privacy Policy</span>.
                    </span>
                  </label>
                  <div class="min-h-[16px] mt-1">
                    @if (isFieldInvalid(signupForm, 'agreeTerms')) {
                      <p class="text-xs text-rose-500 font-medium leading-none">You must agree to continue.</p>
                    }
                  </div>
                </div>

                <!-- Submit Sign Up Button -->
                <div class="pt-2">
                  <button 
                    type="submit" 
                    [disabled]="isSubmitting()"
                    class="w-full py-2.5 sm:py-3 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold text-sm shadow-md shadow-teal-700/20 hover:shadow-lg transition-all transform active:scale-[0.99] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    @if (isSubmitting()) {
                      <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    } @else {
                      <app-icon name="check-circle" wrapperClass="w-4.5 h-4.5 text-teal-100" />
                      <span>Complete Registration</span>
                    }
                  </button>
                </div>

              </form>

              <!-- Back to Login Link -->
              <div class="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-600">
                <span>Already have an account? </span>
                <button 
                  type="button" 
                  (click)="setMode('login')"
                  class="font-bold text-teal-700 hover:text-teal-900 hover:underline transition cursor-pointer ml-1"
                >
                  Login
                </button>
              </div>
            }

            <!-- ========================================================= -->
            <!-- VIEW 3: FORGOT PASSWORD FORM -->
            <!-- ========================================================= -->
            @if (authMode() === 'forgot-password') {
              @if (resetSent()) {
                <!-- Success State -->
                <div class="text-center py-4 space-y-3">
                  <div class="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
                    <app-icon name="check-circle" wrapperClass="w-7 h-7" />
                  </div>
                  <h3 class="text-lg font-bold text-slate-900">Reset Link Sent!</h3>
                  <p class="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed font-medium">
                    We have sent password recovery instructions to <strong class="text-teal-700">{{ forgotForm.value.identifier }}</strong>. Please check your messages.
                  </p>
                  <div class="pt-2">
                    <button 
                      type="button" 
                      (click)="resetSent.set(false); setMode('login')" 
                      class="w-full py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer shadow-md"
                    >
                      Return to Login
                    </button>
                  </div>
                </div>
              } @else {
                <form [formGroup]="forgotForm" (ngSubmit)="onForgotSubmit()" class="space-y-1 mt-3">
                  
                  <div>
                    <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Registered Email or Phone
                    </label>
                    <div class="relative">
                      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <app-icon name="mail" wrapperClass="w-4 h-4" />
                      </div>
                      <input 
                        type="text" 
                        formControlName="identifier"
                        placeholder="e.g. patient@example.com or +91 98765 43210"
                        class="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-none transition shadow-2xs"
                        [class.border-rose-400]="isFieldInvalid(forgotForm, 'identifier')"
                      />
                    </div>
                    <div class="min-h-[16px] mt-0.5">
                      @if (isFieldInvalid(forgotForm, 'identifier')) {
                        <p class="text-xs text-rose-500 font-medium leading-none">Please enter your registered email or phone.</p>
                      }
                    </div>
                  </div>

                  <!-- Submit Reset Button -->
                  <div class="pt-2">
                    <button 
                      type="submit" 
                      [disabled]="isSubmitting()"
                      class="w-full py-2.5 sm:py-3 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold text-sm shadow-md shadow-teal-700/20 hover:shadow-lg transition-all transform active:scale-[0.99] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      @if (isSubmitting()) {
                        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending Instructions...</span>
                      } @else {
                        <app-icon name="sparkles" wrapperClass="w-4.5 h-4.5 text-teal-100" />
                        <span>Send Reset Link / OTP</span>
                      }
                    </button>
                  </div>

                  <!-- Back to Login Link -->
                  <div class="mt-3 pt-2.5 border-t border-slate-100 text-center text-xs text-slate-600">
                    <button 
                      type="button" 
                      (click)="setMode('login')"
                      class="font-bold text-teal-700 hover:text-teal-900 hover:underline transition cursor-pointer"
                    >
                      Back to Login
                    </button>
                  </div>

                </form>
              }
            }

          </div>
        </div>
      </main>

    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly modalService = inject(ModalService);
  private readonly authService = inject(AuthService);

  readonly authMode = signal<AuthMode>('login');
  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly resetSent = signal<boolean>(false);

  // Login Form
  loginForm = this.fb.group({
    identifier: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  // Sign Up Form (Only for patients, with Create & Confirm Password)
  signupForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    address: [''],
    emergencyContact: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    agreeTerms: [true, [Validators.requiredTrue]]
  }, {
    validators: (group) => {
      const pass = group.get('password')?.value;
      const confirm = group.get('confirmPassword')?.value;
      const confirmCtrl = group.get('confirmPassword');
      if (pass && confirm && pass !== confirm) {
        confirmCtrl?.setErrors({ ...confirmCtrl.errors, passwordMismatch: true });
        return { passwordMismatch: true };
      } else if (confirmCtrl?.hasError('passwordMismatch')) {
        const errors = { ...confirmCtrl.errors };
        delete errors['passwordMismatch'];
        confirmCtrl.setErrors(Object.keys(errors).length ? errors : null);
      }
      return null;
    }
  });

  // Forgot Password Form
  forgotForm = this.fb.group({
    identifier: ['', [Validators.required, Validators.minLength(3)]]
  });

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'signup') {
        this.authMode.set('signup');
      } else if (params['mode'] === 'forgot') {
        this.authMode.set('forgot-password');
      }
    });
  }

  setMode(mode: AuthMode): void {
    this.authMode.set(mode);
    this.resetSent.set(false);
  }

  isFieldInvalid(form: any, fieldName: string): boolean {
    const control = form.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSocialLogin(provider: 'Google' | 'Facebook'): void {
    this.authService.login(`patient.${provider.toLowerCase()}@example.com`, `Verified ${provider} Patient`);
    setTimeout(() => {
      this.router.navigate(['/patient-portal']);
    }, 700);
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

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const identifier = this.loginForm.value.identifier || 'patient@hms-hospital.org';
    const isDoctor = identifier.toLowerCase().includes('doctor') || identifier.toLowerCase().includes('dr.');
    const isNurse = identifier.toLowerCase().includes('nurse');
    const isReceptionist = identifier.toLowerCase().includes('reception');
    const isPharmacist = identifier.toLowerCase().includes('pharmacist') || identifier.toLowerCase().includes('pharm');

    const role = isDoctor ? 'doctor' : isNurse ? 'nurse' : isReceptionist ? 'receptionist' : isPharmacist ? 'pharmacist' : 'patient';
    const name = isDoctor ? 'Dr. Sarah Johnson' : isNurse ? 'Emily Watson' : isReceptionist ? 'Sarah Jenkins' : isPharmacist ? 'Alex Mercer, RPh' : undefined;

    this.authService.login(identifier, name, role);

    setTimeout(() => {
      this.isSubmitting.set(false);
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

  onSignupSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const name = this.signupForm.value.fullName || 'Patient';
    const phone = this.signupForm.value.phone || '+91 98765 43210';
    const email = this.signupForm.value.email || `${phone.replace(/\D/g, '')}@patient.hms.org`;
    const address = this.signupForm.value.address || '';
    const emergencyContact = this.signupForm.value.emergencyContact || '';

    this.authService.login(email, name, 'patient', {
      phone,
      address,
      emergencyContact
    });

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.modalService.showToast('Registration Successful', `Welcome to HMS, ${name}! Your patient account is ready.`, 'success');
      this.router.navigate(['/patient-portal']);
    }, 800);
  }

  onForgotSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.resetSent.set(true);
    }, 700);
  }
}
