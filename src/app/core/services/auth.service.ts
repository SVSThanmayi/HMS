import { Injectable, computed, signal } from '@angular/core';

export interface PatientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  bloodGroup: string;
  age: number;
  gender: string;
  memberSince: string;
  emergencyContact: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
}

export type UserRole = 'patient' | 'receptionist' | 'nurse' | 'doctor' | 'pharmacist';

export interface ReceptionistProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'receptionist';
  department: string;
  deskNumber: string;
  shift: string;
}

export interface NurseProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'nurse';
  department: string;
  shift: string;
}

export interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'doctor';
  specialization: string;
  department: string;
  roomNumber: string;
  shift: string;
}

export interface PharmacistProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'pharmacist';
  department: string;
  licenseNumber: string;
  counterNumber: string;
  shift: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly defaultPatient: PatientProfile = {
    id: 'PT-94821',
    name: 'Eleanor Vance',
    email: 'eleanor.vance@example.com',
    phone: '+91 98765 43210',
    address: 'Flat 402, Green Glen Heights, Bellandur, Bengaluru, Karnataka 560103',
    bloodGroup: 'O+ Positive',
    age: 34,
    gender: 'Female',
    memberSince: 'March 2024',
    emergencyContact: '+91 98450 12345 (Spouse)',
    insuranceProvider: 'Star Health & Allied Insurance',
    insurancePolicyNumber: 'STAR-882910-PX'
  };

  private readonly defaultReceptionist: ReceptionistProfile = {
    id: 'REC-4029',
    name: 'Sarah Jenkins',
    email: 'receptionist@hms-hospital.org',
    phone: '+91 98765 01948',
    role: 'receptionist',
    department: 'Central OPD Reception & Registration',
    deskNumber: 'Desk #1 (Main Atrium)',
    shift: 'Morning (08:00 AM - 04:00 PM)'
  };

  private readonly defaultNurse: NurseProfile = {
    id: 'NUR-1042',
    name: 'Emily Watson',
    email: 'nurse@hms-hospital.org',
    phone: '+91 98765 11223',
    role: 'nurse',
    department: 'General Ward & Triage Care',
    shift: 'Day (07:00 AM - 03:00 PM)'
  };

  private readonly defaultDoctor: DoctorProfile = {
    id: 'DOC-8841',
    name: 'Dr. Sarah Johnson',
    email: 'doctor@hms-hospital.org',
    phone: '+91 98765 22334',
    role: 'doctor',
    specialization: 'MBBS, MD — Senior Cardiologist',
    department: 'Cardiology',
    roomNumber: 'OPD Suite 204 (2nd Floor)',
    shift: 'Morning & Afternoon (09:00 AM - 05:00 PM)'
  };

  private readonly defaultPharmacist: PharmacistProfile = {
    id: 'PHARM-3021',
    name: 'Alex Mercer, RPh',
    email: 'pharmacist@hms-hospital.org',
    phone: '+91 98765 33445',
    role: 'pharmacist',
    department: 'Central Pharmacy & Dispensing Unit',
    licenseNumber: 'RPH-KA-2024-88910',
    counterNumber: 'Pharmacy Counter #2',
    shift: 'Day Shift (08:00 AM - 04:00 PM)'
  };

  readonly userRole = signal<UserRole>('patient');
  readonly currentPatient = signal<PatientProfile | null>(null);
  readonly currentReceptionist = signal<ReceptionistProfile | null>(null);
  readonly currentNurse = signal<NurseProfile | null>(null);
  readonly currentDoctor = signal<DoctorProfile | null>(null);
  readonly currentPharmacist = signal<PharmacistProfile | null>(null);

  readonly isLoggedIn = computed(() => {
    if (this.userRole() === 'doctor') return !!this.currentDoctor();
    if (this.userRole() === 'nurse') return !!this.currentNurse();
    if (this.userRole() === 'receptionist') return !!this.currentReceptionist();
    if (this.userRole() === 'pharmacist') return !!this.currentPharmacist();
    return !!this.currentPatient();
  });
  readonly isDoctor = computed(() => this.userRole() === 'doctor' && !!this.currentDoctor());
  readonly isReceptionist = computed(() => this.userRole() === 'receptionist' && !!this.currentReceptionist());
  readonly isNurse = computed(() => this.userRole() === 'nurse' && !!this.currentNurse());
  readonly isPharmacist = computed(() => this.userRole() === 'pharmacist' && !!this.currentPharmacist());

  login(
    identifier: string, 
    fullName?: string, 
    explicitRole?: UserRole, 
    extraDetails?: { phone?: string; address?: string; emergencyContact?: string }
  ): void {
    const isEmail = identifier.includes('@');
    const isDoctorLogin = explicitRole === 'doctor' || identifier.toLowerCase().includes('doctor') || identifier.toLowerCase().includes('dr.');
    const isNurseLogin = explicitRole === 'nurse' || identifier.toLowerCase().includes('nurse');
    const isReceptionistLogin = explicitRole === 'receptionist' || identifier.toLowerCase().includes('reception');
    const isPharmacistLogin = explicitRole === 'pharmacist' || identifier.toLowerCase().includes('pharm');

    if (isDoctorLogin) {
      this.userRole.set('doctor');
      const name = fullName || 'Dr. Sarah Johnson';
      this.currentDoctor.set({
        ...this.defaultDoctor,
        name: name,
        email: isEmail ? identifier : 'doctor@hms-hospital.org'
      });
      return;
    }

    if (isNurseLogin) {
      this.userRole.set('nurse');
      const name = fullName || 'Emily Watson';
      this.currentNurse.set({
        ...this.defaultNurse,
        name: name,
        email: isEmail ? identifier : 'nurse@hms-hospital.org'
      });
      return;
    }

    if (isReceptionistLogin) {
      this.userRole.set('receptionist');
      const name = fullName || 'Sarah Jenkins';
      this.currentReceptionist.set({
        ...this.defaultReceptionist,
        name: name,
        email: isEmail ? identifier : 'receptionist@hms-hospital.org'
      });
      return;
    }

    if (isPharmacistLogin) {
      this.userRole.set('pharmacist');
      const name = fullName || 'Alex Mercer, RPh';
      this.currentPharmacist.set({
        ...this.defaultPharmacist,
        name: name,
        email: isEmail ? identifier : 'pharmacist@hms-hospital.org'
      });
      return;
    }

    this.userRole.set('patient');
    const name = fullName || (isEmail ? identifier.split('@')[0].replace('.', ' ') : 'Eleanor Vance');
    
    // Capitalize name nicely
    const formattedName = name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    this.currentPatient.set({
      ...this.defaultPatient,
      name: formattedName || 'Eleanor Vance',
      email: isEmail ? identifier : `${identifier.replace(/\D/g, '')}@patient.hms.org`,
      phone: extraDetails?.phone || (!isEmail ? identifier : '+91 98765 43210'),
      address: extraDetails?.address || this.defaultPatient.address,
      emergencyContact: extraDetails?.emergencyContact || this.defaultPatient.emergencyContact,
      id: `PT-${Math.floor(10000 + Math.random() * 90000)}`
    });
  }

  logout(): void {
    this.currentPatient.set(null);
    this.currentReceptionist.set(null);
    this.currentNurse.set(null);
    this.currentDoctor.set(null);
    this.currentPharmacist.set(null);
  }
}
