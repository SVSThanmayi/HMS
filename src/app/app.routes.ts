import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login.component';
import { PatientPortalComponent } from './features/patient-portal/patient-portal.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    title: 'HMS - Hospital Management System | Compassionate Care, World-Class Medicine'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login | HMS Healthcare Portal'
  },
  {
    path: 'signup',
    component: LoginComponent,
    title: 'Sign Up | HMS Healthcare Portal'
  },
  {
    path: 'forgot-password',
    component: LoginComponent,
    title: 'Reset Password | HMS Healthcare Portal'
  },
  {
    path: 'patient-portal',
    component: PatientPortalComponent,
    title: 'Patient Dashboard | HMS Healthcare Portal'
  },
  {
    path: 'receptionist',
    loadComponent: () => import('./features/receptionist/receptionist.component').then(m => m.ReceptionistComponent),
    title: 'Receptionist | HMS Healthcare'
  },
  {
    path: 'nurse',
    loadComponent: () => import('./features/nurse/nurse.component').then(m => m.NurseComponent),
    title: 'Nurse | HMS Healthcare'
  },
  {
    path: 'doctor',
    loadComponent: () => import('./features/doctor/doctor.component').then(m => m.DoctorComponent),
    title: 'Doctor | HMS Healthcare'
  },
  {
    path: 'pharmacist',
    loadComponent: () => import('./features/pharmacist/pharmacist.component').then(m => m.PharmacistComponent),
    title: 'Pharmacist | HMS Healthcare'
  },
  {
    path: 'book-appointment',
    loadComponent: () => import('./features/book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent),
    title: 'Book Appointment | HMS Healthcare'
  },
  {
    path: 'book',
    redirectTo: 'book-appointment'
  },
  {
    path: 'dashboard',
    redirectTo: 'patient-portal'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
