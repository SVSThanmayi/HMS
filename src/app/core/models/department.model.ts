export interface Department {
  id: string;
  name: string;
  shortName?: string;
  code: string;
  category: 'clinical' | 'surgical' | 'pediatric' | 'specialty' | 'critical';
  tagline: string;
  description: string;
  highlights: string[];
  headDoctor: string;
  headSpecialty: string;
  timings: string;
  emergencyAvailable: boolean;
  accentColor: string;
  imageUrl: string;
  iconType: string;
  totalSpecialists: number;
}

export const DEPARTMENTS_DATA: Department[] = [
  // 1. Paediatrics
  {
    id: 'dept-paediatrics',
    name: 'Paediatrics',
    shortName: 'Paediatrics',
    code: 'PAED',
    category: 'pediatric',
    tagline: 'Compassionate child healthcare & pediatric immunizations',
    description: 'Comprehensive general and specialized child healthcare, growth monitoring, developmental assessments, and routine immunizations by dedicated pediatric specialists.',
    highlights: ['Routine & Special Immunizations', 'Pediatric Asthma & Allergy Care', 'Growth & Neuro-Development Clinic', '24/7 Pediatric Emergency Support'],
    headDoctor: 'Dr. Michael Patel',
    headSpecialty: 'MD (Pediatrics), Fellowship Pediatric Care',
    timings: '08:00 AM - 08:00 PM (Daily)',
    emergencyAvailable: true,
    accentColor: '#3b82f6',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
    iconType: 'paediatrics',
    totalSpecialists: 6
  },
  // 2. Gynaecology
  {
    id: 'dept-gynaecology',
    name: 'Gynaecology',
    shortName: 'Gynaecology',
    code: 'GYN',
    category: 'surgical',
    tagline: 'Excellence in women healthcare & maternity solutions',
    description: 'Specialized obstetrics and gynecology offering complete antenatal care, high-risk pregnancy management, painless deliveries, and advanced laparoscopic surgeries.',
    highlights: ['High-Risk Pregnancy & Delivery Care', 'Minimally Invasive Laparoscopy', 'Infertility & Reproductive Health', 'Cervical Screening & Menopause Clinic'],
    headDoctor: 'Dr. Sunita Rao',
    headSpecialty: 'MS (OBG), Fellow Laparoscopic Surgery',
    timings: '09:00 AM - 07:00 PM (Mon-Sat)',
    emergencyAvailable: true,
    accentColor: '#ec4899',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    iconType: 'gynaecology',
    totalSpecialists: 8
  },
  // 3. Orthopedics
  {
    id: 'dept-orthopedics',
    name: 'Orthopedics',
    shortName: 'Orthopedics',
    code: 'ORTH',
    category: 'surgical',
    tagline: 'Restoring mobility through advanced bone & joint care',
    description: 'World-class orthopedic surgical care specializing in robotic knee and hip replacements, arthroscopic sports injury treatments, complex trauma, and spine disorders.',
    highlights: ['Robotic Joint Replacements', 'Arthroscopy & Sports Medicine', 'Complex Fracture & Trauma Care', 'Spine Surgery & Pain Management'],
    headDoctor: 'Dr. Emily Chen',
    headSpecialty: 'MS (Ortho), MCh — Joint Reconstruction',
    timings: '09:00 AM - 06:00 PM (Mon-Sat)',
    emergencyAvailable: true,
    accentColor: '#f97316',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
    iconType: 'orthopedics',
    totalSpecialists: 7
  },
  // 4. General Medicine
  {
    id: 'dept-general-medicine',
    name: 'General Medicine',
    shortName: 'General Medicine',
    code: 'GMED',
    category: 'clinical',
    tagline: 'Holistic diagnosis & expert internal medicine care',
    description: 'Comprehensive primary medical care focusing on preventive healthcare, chronic lifestyle disease management (diabetes, hypertension), and infectious disease therapy.',
    highlights: ['Comprehensive Health Screenings', 'Diabetes & Hypertension Management', 'Infectious Diseases & Fever Clinic', 'Geriatric & Preventive Medicine'],
    headDoctor: 'Dr. Arvind Swaminathan',
    headSpecialty: 'MD (Internal Medicine), FACP',
    timings: '08:00 AM - 08:00 PM (Daily)',
    emergencyAvailable: true,
    accentColor: '#06b6d4',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    iconType: 'general-medicine',
    totalSpecialists: 9
  },
  // 5. General Surgery
  {
    id: 'dept-general-surgery',
    name: 'General Surgery',
    shortName: 'General Surgery',
    code: 'GSURG',
    category: 'surgical',
    tagline: 'Minimally invasive laparoscopic & open surgical care',
    description: 'Equipped with modular laminar-airflow operating suites for advanced laparoscopic procedures, abdominal surgeries, hernia repairs, laser proctology, and emergency surgery.',
    highlights: ['Advanced Laparoscopic Surgeries', 'Laser Proctology (Piles, Fistula)', 'Hernia & Gallbladder Surgeries', '24/7 Acute Surgical Emergencies'],
    headDoctor: 'Dr. Robert Harrison',
    headSpecialty: 'MS (General Surgery), FACS',
    timings: '09:00 AM - 05:30 PM (Mon-Sat)',
    emergencyAvailable: true,
    accentColor: '#6366f1',
    imageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80',
    iconType: 'general-surgery',
    totalSpecialists: 6
  },
  // 6. Cardiology
  {
    id: 'dept-cardiology',
    name: 'Cardiology',
    shortName: 'Cardiology',
    code: 'CARD',
    category: 'specialty',
    tagline: '24/7 Advanced cardiac care & emergency Cath Lab',
    description: 'State-of-the-art cardiac center providing emergency primary coronary angioplasty, pacemaker implantations, 3D echocardiography, and comprehensive cardiac rehabilitation.',
    highlights: ['24/7 Emergency Cath Lab', 'Coronary Angiography & Stenting', 'Pacemaker & ICD Implants', 'Heart Failure & Arrhythmia Clinic'],
    headDoctor: 'Dr. Sarah Johnson',
    headSpecialty: 'MBBS, MD, DM (Cardiology), FACC',
    timings: '24/7 Emergency & Consultations',
    emergencyAvailable: true,
    accentColor: '#ef4444',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    iconType: 'cardiology',
    totalSpecialists: 8
  },
  // 7. Urology
  {
    id: 'dept-urology',
    name: 'Urology',
    shortName: 'Urology',
    code: 'UROL',
    category: 'surgical',
    tagline: 'Advanced laser lithotripsy & renal healthcare',
    description: 'Cutting-edge urological solutions including Holmium laser kidney stone treatment (RIRS/PCNL), prostate surgery (TURP), and reconstructive urology with rapid recovery.',
    highlights: ['Laser Kidney Stone Surgery (RIRS)', 'Advanced Prostate Management', 'Uro-Oncology & Reconstructive Care', 'Male Infertility & Andrology'],
    headDoctor: 'Dr. Vikram Malhotra',
    headSpecialty: 'MS, MCh (Urology), DNB',
    timings: '09:30 AM - 06:30 PM (Mon-Sat)',
    emergencyAvailable: true,
    accentColor: '#e11d48',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    iconType: 'urology',
    totalSpecialists: 5
  },
  // 8. ENT
  {
    id: 'dept-ent',
    name: 'ENT',
    shortName: 'ENT',
    code: 'ENT',
    category: 'clinical',
    tagline: 'Precision ear, nose, throat & micro-surgery care',
    description: 'Full-spectrum otorhinolaryngology care with advanced endoscopic sinus surgery (FESS), micro-ear reconstructions, voice pathology treatment, vertigo, and snoring solutions.',
    highlights: ['Endoscopic Sinus Surgery (FESS)', 'Microscopic Ear & Tympanoplasty', 'Voice, Swallowing & Snoring Clinic', 'Audiometry & Vertigo Diagnostics'],
    headDoctor: 'Dr. Priya Nambiar',
    headSpecialty: 'MS (ENT), DLO, Fellowship Otology',
    timings: '09:00 AM - 07:00 PM (Mon-Sat)',
    emergencyAvailable: true,
    accentColor: '#f59e0b',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    iconType: 'ent',
    totalSpecialists: 5
  },
  // 9. Gastroenterology
  {
    id: 'dept-gastroenterology',
    name: 'Gastroenterology',
    shortName: 'Gastroenterology',
    code: 'GAST',
    category: 'clinical',
    tagline: 'Digestive wellness & therapeutic endoscopy center',
    description: 'Expert gastrointestinal care equipped with advanced video endoscopy, colonoscopy, ERCP, fatty liver treatments, and acid reflux management solutions.',
    highlights: ['Diagnostic & Therapeutic Endoscopy', 'Colonoscopy & Polypectomy', 'ERCP for Biliary & Pancreatic Care', 'Hepatology & Fatty Liver Clinic'],
    headDoctor: 'Dr. Karthik Reddy',
    headSpecialty: 'MD, DM (Medical Gastroenterology)',
    timings: '09:00 AM - 06:00 PM (Mon-Sat)',
    emergencyAvailable: true,
    accentColor: '#d97706',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
    iconType: 'gastroenterology',
    totalSpecialists: 6
  },
  // 10. Physiotherapy
  {
    id: 'dept-physiotherapy',
    name: 'Physiotherapy',
    shortName: 'Physiotherapy',
    code: 'PHYS',
    category: 'clinical',
    tagline: 'Advanced rehabilitation & mobility restoration',
    description: 'Customized therapeutic rehabilitation programs for post-surgical recovery, neuro-rehab after stroke, sports injury healing, and ergonomic pain management.',
    highlights: ['Post-Surgical Joint Rehabilitation', 'Stroke & Neuro Rehabilitation', 'Sports Injury Recovery & Physio', 'Electrotherapy & Manual Traction'],
    headDoctor: 'Dr. Maya Nair',
    headSpecialty: 'MPT (Orthopedics & Sports Rehabilitation)',
    timings: '07:30 AM - 07:30 PM (Mon-Sat)',
    emergencyAvailable: false,
    accentColor: '#10b981',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    iconType: 'physiotherapy',
    totalSpecialists: 7
  },
  // 11. Neurology
  {
    id: 'dept-neurology',
    name: 'Neurology',
    shortName: 'Neurology',
    code: 'NEUR',
    category: 'specialty',
    tagline: 'Advanced brain, spine & neuromuscular care',
    description: 'Comprehensive neurological diagnostic center equipped with digital video EEG, EMG, nerve conduction studies, acute stroke management, and epilepsy care.',
    highlights: ['Comprehensive Stroke Response Unit', 'Epilepsy & Seizure Disorder Clinic', 'Headache & Migraine Solutions', 'Parkinson’s & Movement Disorders'],
    headDoctor: 'Dr. Rajesh Menon',
    headSpecialty: 'MBBS, DM (Neurology), Stroke Specialist',
    timings: '09:00 AM - 05:00 PM (Mon-Fri)',
    emergencyAvailable: true,
    accentColor: '#6366f1',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
    iconType: 'neurology',
    totalSpecialists: 6
  },
  // 12. Surgical Gastro
  {
    id: 'dept-surgical-gastro',
    name: 'Surgical Gastro',
    shortName: 'Surgical Gastro',
    code: 'SGAS',
    category: 'surgical',
    tagline: 'Complex hepatobiliary & GI oncosurgery',
    description: 'Specialized gastrointestinal surgical unit handling complex abdominal tumors, liver resections, pancreatic surgery, laparoscopic bariatrics, and intestinal surgeries.',
    highlights: ['GI Oncology & Tumor Resections', 'Liver, Bile Duct & Pancreatic Surgeries', 'Laparoscopic Bariatric Surgery', 'Complex Fistula & Colorectal Surgeries'],
    headDoctor: 'Dr. Alok Singhania',
    headSpecialty: 'MS, MCh (Surgical Gastroenterology)',
    timings: '09:30 AM - 05:00 PM (Mon-Sat)',
    emergencyAvailable: true,
    accentColor: '#ea580c',
    imageUrl: 'https://images.unsplash.com/photo-1579684453423-f84349ef60b0?auto=format&fit=crop&w=800&q=80',
    iconType: 'surgical-gastro',
    totalSpecialists: 4
  },
  // 13. Critical Care
  {
    id: 'dept-critical-care',
    name: 'Critical Care',
    shortName: 'Critical Care',
    code: 'CRIT',
    category: 'critical',
    tagline: '24/7 Level-III ICU & advanced life support',
    description: 'Dedicated multidisciplinary intensive care unit staffed round-the-clock by certified intensivists, advanced mechanical ventilators, ECMO, and continuous hemodialysis.',
    highlights: ['24/7 Dedicated Intensivist Team', 'Advanced Invasive Hemodynamic Monitoring', 'Bedside Dialysis (CRRT) & ECMO', 'Isolation Rooms with Negative Pressure'],
    headDoctor: 'Dr. Marcus Vance',
    headSpecialty: 'MBBS, MRCEM, Fellowship Critical Care & Trauma',
    timings: '24/7 Emergency & ICU Care',
    emergencyAvailable: true,
    accentColor: '#ef4444',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    iconType: 'critical-care',
    totalSpecialists: 10
  },
  // 14. Paediatric Surgery
  {
    id: 'dept-paediatric-surgery',
    name: 'Paediatric Surgery',
    shortName: 'Paediatric Surgery',
    code: 'PSUR',
    category: 'pediatric',
    tagline: 'Delicate & specialized surgery for young patients',
    description: 'Focused pediatric surgical interventions for neonatal congenital anomalies, pediatric laparoscopic procedures, pediatric urology, and trauma with tender child care.',
    highlights: ['Congenital Anomaly Corrections', 'Minimally Invasive Pediatric Laparoscopy', 'Pediatric Urological Reconstruction', 'Neonatal Surgical Emergencies'],
    headDoctor: 'Dr. Sanjay Kulkarni',
    headSpecialty: 'MS, MCh (Pediatric Surgery)',
    timings: '09:00 AM - 05:00 PM (Mon-Sat)',
    emergencyAvailable: true,
    accentColor: '#0284c7',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    iconType: 'paediatric-surgery',
    totalSpecialists: 4
  },
  // 15. Neonatology
  {
    id: 'dept-neonatology',
    name: 'Neonatology',
    shortName: 'Neonatology',
    code: 'NEON',
    category: 'pediatric',
    tagline: 'State-of-the-art Level-III NICU for vulnerable newborns',
    description: 'Advanced neonatal intensive care with specialized incubators, high-frequency oscillatory ventilation, total parenteral nutrition, and developmental follow-up for preterm babies.',
    highlights: ['Level-III Neonatal Intensive Care (NICU)', 'Preterm & Extremely Low Birth Weight Care', 'High-Frequency Oscillatory Ventilation', 'Neonatal Jaundice & Phototherapy'],
    headDoctor: 'Dr. Anjali Mehta',
    headSpecialty: 'MD (Pediatrics), DM (Neonatology)',
    timings: '24/7 NICU Support',
    emergencyAvailable: true,
    accentColor: '#0d9488',
    imageUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=800&q=80',
    iconType: 'neonatology',
    totalSpecialists: 5
  },
  // 16. Dermatology
  {
    id: 'dept-dermatology',
    name: 'Dermatology',
    shortName: 'Dermatology',
    code: 'DERM',
    category: 'specialty',
    tagline: 'Advanced skin care, laser treatments & cosmetology',
    description: 'Expert medical dermatology and aesthetic cosmetology addressing stubborn acne, scar treatments, laser hair removal, eczema, vitiligo, and anti-aging therapies.',
    highlights: ['Advanced Laser Treatments & Peels', 'Acne Scar Revision & Cosmetology', 'Psoriasis, Vitiligo & Eczema Clinic', 'Hair Loss & PRP Therapies'],
    headDoctor: 'Dr. David Kim',
    headSpecialty: 'MD (Dermatology, Venereology & Leprosy)',
    timings: '10:00 AM - 07:00 PM (Wed-Sun)',
    emergencyAvailable: false,
    accentColor: '#8b5cf6',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    iconType: 'dermatology',
    totalSpecialists: 5
  },
  // 17. Psychiatry (17th card centered at the bottom row)
  {
    id: 'dept-psychiatry',
    name: 'Psychiatry',
    shortName: 'Psychiatry',
    code: 'PSYC',
    category: 'clinical',
    tagline: 'Compassionate mental wellness & psychiatric care',
    description: 'Empathetic psychiatric counseling and behavioral therapy for depression, anxiety, stress disorders, sleep disturbances, cognitive health, and addiction rehabilitation.',
    highlights: ['Depression & Anxiety Management', 'Cognitive Behavioral Therapy (CBT)', 'Sleep & Stress Disorder Clinic', 'Child & Adolescent Guidance'],
    headDoctor: 'Dr. Devika Sharma',
    headSpecialty: 'MD (Psychiatry), DPM',
    timings: '10:00 AM - 06:00 PM (Mon-Sat)',
    emergencyAvailable: false,
    accentColor: '#8b5cf6',
    imageUrl: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=800&q=80',
    iconType: 'psychiatry',
    totalSpecialists: 4
  }
];
