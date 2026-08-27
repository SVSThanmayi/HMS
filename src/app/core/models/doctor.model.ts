export interface Doctor {
  id: string;
  name: string;
  position: string;
  specialization: string;
  department: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  availableDays: string;
  avatarPlaceholderColor?: string;
  imageUrl?: string;
}

export const DOCTORS_DATA: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Johnson',
    position: 'Senior Cardiologist',
    specialization: 'MBBS, MD — Cardiology',
    department: 'Cardiology',
    experienceYears: 14,
    rating: 4.9,
    reviewsCount: 320,
    availableDays: 'Mon - Fri',
    avatarPlaceholderColor: 'from-emerald-600 to-teal-800'
  },
  {
    id: 'doc-2',
    name: 'Dr. Rajesh Menon',
    position: 'Chief Neurologist',
    specialization: 'MBBS, DM — Neurology, Stroke Specialist',
    department: 'Neurology',
    experienceYears: 18,
    rating: 4.95,
    reviewsCount: 450,
    availableDays: 'Mon, Wed, Fri',
    avatarPlaceholderColor: 'from-cyan-600 to-blue-800'
  },
  {
    id: 'doc-3',
    name: 'Dr. Emily Chen',
    position: 'Lead Orthopedic Surgeon',
    specialization: 'MS (Ortho), MCh — Joint Reconstruction',
    department: 'Orthopedics',
    experienceYears: 12,
    rating: 4.88,
    reviewsCount: 280,
    availableDays: 'Tue - Sat',
    avatarPlaceholderColor: 'from-teal-600 to-emerald-900'
  },
  {
    id: 'doc-4',
    name: 'Dr. Michael Patel',
    position: 'Head of Pediatrics',
    specialization: 'MD (Pediatrics), Fellowship Pediatric Critical Care',
    department: 'Pediatrics',
    experienceYears: 16,
    rating: 4.97,
    reviewsCount: 510,
    availableDays: 'Daily (Morning)',
    avatarPlaceholderColor: 'from-sky-600 to-indigo-800'
  },
  {
    id: 'doc-5',
    name: 'Dr. Elena Rostova',
    position: 'Senior Oncologist',
    specialization: 'MD, DM — Medical Oncology, ESMO Certified',
    department: 'Oncology',
    experienceYears: 15,
    rating: 4.92,
    reviewsCount: 390,
    availableDays: 'Mon, Tue, Thu, Fri',
    avatarPlaceholderColor: 'from-slate-700 to-slate-900'
  },
  {
    id: 'doc-6',
    name: 'Dr. David Kim',
    position: 'Consultant Dermatologist',
    specialization: 'MD (Dermatology, Venereology & Leprosy)',
    department: 'Dermatology',
    experienceYears: 10,
    rating: 4.85,
    reviewsCount: 215,
    availableDays: 'Wed - Sun',
    avatarPlaceholderColor: 'from-teal-700 to-cyan-900'
  },
  {
    id: 'doc-7',
    name: 'Dr. Ananya Iyer',
    position: 'Senior Pulmonologist',
    specialization: 'MD, DNB (Respiratory Medicine), FCCP',
    department: 'Pulmonology',
    experienceYears: 13,
    rating: 4.91,
    reviewsCount: 340,
    availableDays: 'Mon - Thu',
    avatarPlaceholderColor: 'from-blue-700 to-slate-900'
  },
  {
    id: 'doc-8',
    name: 'Dr. Marcus Vance',
    position: 'Director of Emergency Medicine',
    specialization: 'MBBS, MRCEM, Fellowship in Trauma Care',
    department: 'Emergency Care',
    experienceYears: 20,
    rating: 4.99,
    reviewsCount: 680,
    availableDays: '24/7 On-Call',
    avatarPlaceholderColor: 'from-emerald-700 to-teal-950'
  }
];
