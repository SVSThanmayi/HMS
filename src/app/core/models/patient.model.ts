export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  reason?: string;
  form?: string;
  strength?: string;
}

export interface PrescriptionDetails {
  rxNumber: string;
  date: string;
  doctorReg: string;
  diagnosis: string;
  clinicalNotes: string;
  medicines: PrescriptionMedicine[];
  advice: string[];
  nextFollowUp: string;
}

export interface ReceiptItem {
  description: string;
  code: string;
  quantity: number;
  price: number;
}

export interface ReceiptDetails {
  receiptNumber: string;
  invoiceDate: string;
  paymentStatus: 'PAID' | 'COMPLETED';
  paymentMethod: string;
  transactionId: string;
  items: ReceiptItem[];
  subtotal: number;
  insuranceCoveragePercent: number;
  insuranceCoveredAmount: number;
  copayAmount: number;
  tax: number;
  totalPaid: number;
}

export interface PatientVitals {
  bp: string;
  pulse: string;
  temp: string;
  spo2: string;
  weight: string;
  bmi: string;
  bloodSugar: string;
  recordedAt: string;
}

export interface PatientAllergy {
  allergen: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  reaction: string;
  diagnosedDate?: string;
  duration?: string;
  status?: string;
  diagnosedBy?: string;
}

export interface PatientChronicCondition {
  condition: string;
  diagnosedDate: string;
  severity?: string;
  doctor?: string;
  duration?: string;
  status: string;
  notes?: string;
}

export interface PatientMedication {
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  doctor: string;
  startDate: string;
  refillsRemaining: number;
  pharmacy: string;
}

export interface PatientPreviousVisit {
  id: string;
  date: string;
  timeSlot: string;
  doctorName: string;
  specialty: string;
  room: string;
  reason: string;
  diagnosis: string;
  type: string;
  status: string;
  prescription?: PrescriptionDetails;
  receipt?: ReceiptDetails;
}

export interface PatientLabParameter {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'Normal' | 'High' | 'Low';
}

export interface PatientHealthRecord {
  id: string;
  testName: string;
  category: string;
  doctor: string;
  date: string;
  locationType: 'Hospital' | 'Out';
  locationName: string;
  status: 'Normal' | 'Completed' | 'Pending Review';
  summary: string;
  parameters: PatientLabParameter[];
  receipt?: ReceiptDetails;
}

export interface RegisteredPatient {
  id: string;
  name: string;
  tokenNumber?: string;
  dob: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phone: string;
  email: string;
  address: string;
  occupation: string;
  maritalStatus: string;
  nationalId: string;
  emergencyContact: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  primaryPhysician: string;
  vitals: PatientVitals;
  previousVitals?: PatientVitals[];
  allergies: PatientAllergy[];
  chronicConditions: string[];
  chronicConditionsList?: PatientChronicCondition[];
  currentMedications: PatientMedication[];
  previousVisits: PatientPreviousVisit[];
  healthRecords: PatientHealthRecord[];
}

export const MOCK_REGISTERED_PATIENTS: RegisteredPatient[] = [
  {
    id: 'PT-94821',
    name: 'Eleanor Vance',
    tokenNumber: 'T-101',
    dob: '14 March 1992',
    age: 34,
    gender: 'Female',
    bloodGroup: 'O+ Positive',
    phone: '+91 98765 43210',
    email: 'eleanor.vance@example.com',
    address: 'Flat 402, Green Glen Heights, Bellandur, Bengaluru, Karnataka 560103',
    occupation: 'Biomedical Researcher',
    maritalStatus: 'Married',
    nationalId: 'AADHAAR-****-****-4921',
    emergencyContact: '+91 98450 12345 (Arthur Vance - Spouse)',
    insuranceProvider: 'Star Health Comprehensive',
    insurancePolicyNumber: 'STAR-882910-PX',
    primaryPhysician: 'Dr. Arthur Vance, MD',
    vitals: {
      bp: '120/80 mmHg',
      pulse: '72 bpm',
      temp: '98.6 °F',
      spo2: '99%',
      weight: '62 kg',
      bmi: '22.4',
      bloodSugar: '95 mg/dL',
      recordedAt: 'Today, 08:30 AM'
    },
    previousVitals: [
      {
        bp: '118/78 mmHg',
        pulse: '70 bpm',
        temp: '98.4 °F',
        spo2: '99%',
        weight: '62 kg',
        bmi: '22.4',
        bloodSugar: '92 mg/dL',
        recordedAt: '12 Aug 2026, 09:15 AM'
      },
      {
        bp: '122/80 mmHg',
        pulse: '74 bpm',
        temp: '98.7 °F',
        spo2: '98%',
        weight: '63 kg',
        bmi: '22.7',
        bloodSugar: '98 mg/dL',
        recordedAt: '15 May 2026, 11:00 AM'
      },
      {
        bp: '120/79 mmHg',
        pulse: '72 bpm',
        temp: '98.6 °F',
        spo2: '99%',
        weight: '62 kg',
        bmi: '22.4',
        bloodSugar: '94 mg/dL',
        recordedAt: '10 Feb 2026, 10:30 AM'
      },
      {
        bp: '119/78 mmHg',
        pulse: '71 bpm',
        temp: '98.5 °F',
        spo2: '99%',
        weight: '62 kg',
        bmi: '22.4',
        bloodSugar: '91 mg/dL',
        recordedAt: '18 Nov 2025, 02:00 PM'
      },
      {
        bp: '121/80 mmHg',
        pulse: '73 bpm',
        temp: '98.6 °F',
        spo2: '98%',
        weight: '63 kg',
        bmi: '22.7',
        bloodSugar: '96 mg/dL',
        recordedAt: '05 Aug 2025, 09:45 AM'
      },
      {
        bp: '118/77 mmHg',
        pulse: '69 bpm',
        temp: '98.4 °F',
        spo2: '99%',
        weight: '61 kg',
        bmi: '22.0',
        bloodSugar: '90 mg/dL',
        recordedAt: '22 Apr 2025, 11:15 AM'
      },
      {
        bp: '120/80 mmHg',
        pulse: '72 bpm',
        temp: '98.6 °F',
        spo2: '99%',
        weight: '62 kg',
        bmi: '22.4',
        bloodSugar: '93 mg/dL',
        recordedAt: '14 Jan 2025, 03:20 PM'
      },
      {
        bp: '122/81 mmHg',
        pulse: '75 bpm',
        temp: '98.7 °F',
        spo2: '98%',
        weight: '63 kg',
        bmi: '22.7',
        bloodSugar: '97 mg/dL',
        recordedAt: '09 Oct 2024, 10:00 AM'
      },
      {
        bp: '119/78 mmHg',
        pulse: '70 bpm',
        temp: '98.5 °F',
        spo2: '99%',
        weight: '62 kg',
        bmi: '22.4',
        bloodSugar: '92 mg/dL',
        recordedAt: '15 Jul 2024, 01:45 PM'
      },
      {
        bp: '120/79 mmHg',
        pulse: '71 bpm',
        temp: '98.6 °F',
        spo2: '99%',
        weight: '62 kg',
        bmi: '22.4',
        bloodSugar: '94 mg/dL',
        recordedAt: '28 Mar 2024, 09:30 AM'
      },
      {
        bp: '117/76 mmHg',
        pulse: '68 bpm',
        temp: '98.4 °F',
        spo2: '99%',
        weight: '61 kg',
        bmi: '22.0',
        bloodSugar: '89 mg/dL',
        recordedAt: '10 Dec 2023, 11:00 AM'
      },
      {
        bp: '121/80 mmHg',
        pulse: '72 bpm',
        temp: '98.6 °F',
        spo2: '98%',
        weight: '62 kg',
        bmi: '22.4',
        bloodSugar: '95 mg/dL',
        recordedAt: '15 Sep 2023, 02:30 PM'
      }
    ],
    allergies: [
      { allergen: 'Latex Gloves & Polymers', severity: 'Mild', reaction: 'Contact dermatitis, erythema & pruritus', diagnosedDate: '22 Jun 2021, 02:15 PM', duration: '5 Years (Ongoing)', status: 'Active - Non-Latex Protocol', diagnosedBy: 'Dr. Clara Reynolds, MD' },
      { allergen: 'Dust Mite & Tree Pollen', severity: 'Mild', reaction: 'Seasonal allergic rhinitis, sneezing', diagnosedDate: '05 Apr 2020, 09:45 AM', duration: '3.5 Years', status: 'Cured / Desensitized (18 Aug 2023)', diagnosedBy: 'Dr. Priya Nambiar, MS' },
      { allergen: 'Penicillin', severity: 'Severe', reaction: 'Anaphylaxis, hives, acute dyspnea', diagnosedDate: '14 Mar 2018, 10:30 AM', duration: '8 Years (Ongoing)', status: 'Active - Strict Avoidance', diagnosedBy: 'Dr. Arthur Vance, MD' },
      { allergen: 'Sulfa Antibiotics', severity: 'Moderate', reaction: 'Maculopapular rash, mild fever', diagnosedDate: '10 Nov 2015, 11:00 AM', duration: '6 Months', status: 'Cured / Resolved (15 May 2016)', diagnosedBy: 'Dr. Marcus Thorne, MD' }
    ],
    chronicConditions: ['Seasonal Allergic Asthma'],
    chronicConditionsList: [
      { condition: 'Cervical Spine Ergonomic Strain', diagnosedDate: '15 Jan 2024', severity: 'Mild Strain', doctor: 'Dr. Marcus Thorne, MD', duration: '8 Months', status: 'Cured / Resolved (10 Sep 2024)', notes: 'Resolved with workplace physiotherapy and ergonomic desk adjustments.' },
      { condition: 'Iron Deficiency Anemia', diagnosedDate: '10 Feb 2022', severity: 'Moderate (Hb 9.8)', doctor: 'Dr. Clara Reynolds, MD', duration: '1 Year', status: 'Cured / Resolved (15 Feb 2023)', notes: 'Ferritin and Hemoglobin fully restored to 14.2 g/dL after oral supplementation.' },
      { condition: 'Seasonal Allergic Asthma', diagnosedDate: '12 Sep 2020', severity: 'Mild Intermittent', doctor: 'Dr. Arthur Vance, MD', duration: '6 Years (Ongoing)', status: 'Active - Inhaler Maintenance', notes: 'Symptom-free during winter, managed with SOS Salbutamol.' }
    ],
    currentMedications: [
      {
        name: 'Amoxicillin Trihydrate',
        dosage: '500',
        frequency: '3 times daily',
        timing: 'After meals',
        doctor: 'Dr. Arthur Vance, MD',
        startDate: '10 Aug 2026',
        refillsRemaining: 2,
        pharmacy: 'HMS Main Pharmacy'
      },
      {
        name: 'Cetirizine HCl',
        dosage: '10',
        frequency: 'Once daily',
        timing: 'At bedtime',
        doctor: 'Dr. Clara Reynolds, MD',
        startDate: '01 Jul 2026',
        refillsRemaining: 4,
        pharmacy: 'HMS Main Pharmacy'
      }
    ],
    previousVisits: [
      {
        id: 'VIS-301',
        date: '12 Aug 2026',
        timeSlot: '09:30 AM',
        doctorName: 'Dr. Arthur Vance, MD',
        specialty: 'Cardiology',
        room: 'OPD Room 101',
        reason: 'Routine Annual Cardiac Checkup',
        diagnosis: 'Healthy cardiac rhythm, normal sinus baseline.',
        type: 'In-Person OPD',
        status: 'Completed',
        prescription: {
          rxNumber: 'RX-884210',
          date: '12 Aug 2026',
          doctorReg: 'MD-882910',
          diagnosis: 'Routine Cardiovascular Wellness & Sinus Rhythm',
          clinicalNotes: 'Blood pressure is optimal. ECG shows standard sinus rhythm.',
          medicines: [
            { name: 'Omega-3 Fish Oil', dosage: '1000', frequency: 'Once daily', duration: '90 Days', instructions: 'Take with lunch' },
            { name: 'CoQ10 Softgels', dosage: '100', frequency: 'Once daily', duration: '60 Days', instructions: 'Take with water in the morning' }
          ],
          advice: [
            'Continue 30 minutes of aerobic cardio exercise 4 times a week.',
            'Maintain low-sodium dietary habits.'
          ],
          nextFollowUp: '12 Aug 2027 (Annual Review)'
        },
        receipt: {
          receiptNumber: 'INV-2026-9041',
          invoiceDate: '12 Aug 2026',
          paymentStatus: 'PAID',
          paymentMethod: 'Credit Card / Visa',
          transactionId: 'TXN-904182-EV',
          items: [
            { description: 'Cardiology Specialist Consultation', code: 'CPT-99214', quantity: 1, price: 180.00 },
            { description: '12-Lead Resting Electrocardiogram (ECG)', code: 'CPT-93000', quantity: 1, price: 65.00 }
          ],
          subtotal: 245.00,
          insuranceCoveragePercent: 85,
          insuranceCoveredAmount: 208.25,
          copayAmount: 36.75,
          tax: 0.00,
          totalPaid: 36.75
        }
      }
    ],
    healthRecords: [
      {
        id: 'LAB-9042',
        testName: 'Lipid Profile & Serum Cholesterol',
        category: 'Biochemistry',
        doctor: 'Dr. Arthur Vance, MD',
        date: '12 Aug 2026',
        locationType: 'Hospital',
        locationName: 'HMS Central Pathology Lab',
        status: 'Completed',
        summary: 'Normal baseline profile. LDL and HDL within recommended target ranges.',
        parameters: [
          { name: 'Total Cholesterol', value: '178', unit: 'mg/dL', referenceRange: '< 200 Desirable', status: 'Normal' },
          { name: 'HDL Cholesterol', value: '58', unit: 'mg/dL', referenceRange: '> 50 Optimal', status: 'Normal' },
          { name: 'LDL Cholesterol', value: '98', unit: 'mg/dL', referenceRange: '< 100 Optimal', status: 'Normal' },
          { name: 'Triglycerides', value: '110', unit: 'mg/dL', referenceRange: '< 150 Normal', status: 'Normal' }
        ],
        receipt: {
          receiptNumber: 'LAB-INV-9042',
          invoiceDate: '12 Aug 2026',
          paymentStatus: 'PAID',
          paymentMethod: 'Insurance Direct Pay',
          transactionId: 'TXN-LAB-90421',
          items: [
            { description: 'Automated Lipid Profile Panel', code: 'CPT-80061', quantity: 1, price: 95.00 }
          ],
          subtotal: 95.00,
          insuranceCoveragePercent: 85,
          insuranceCoveredAmount: 80.75,
          copayAmount: 14.25,
          tax: 0.00,
          totalPaid: 14.25
        }
      }
    ]
  },
  {
    id: 'PT-39102',
    name: 'Robert Langdon',
    tokenNumber: 'T-102',
    dob: '22 June 1978',
    age: 48,
    gender: 'Male',
    bloodGroup: 'A+ Positive',
    phone: '+91 98230 45678',
    email: 'robert.langdon@example.com',
    address: '108 MG Road, Indiranagar, Bengaluru, Karnataka 560038',
    occupation: 'University Professor',
    maritalStatus: 'Single',
    nationalId: 'AADHAAR-****-****-8812',
    emergencyContact: '+91 97110 88990 (Faculty Desk)',
    insuranceProvider: 'HDFC ERGO Health Insurance',
    insurancePolicyNumber: 'HDFC-992104-RR',
    primaryPhysician: 'Dr. Clara Reynolds, MD',
    vitals: {
      bp: '128/84 mmHg',
      pulse: '68 bpm',
      temp: '98.4 °F',
      spo2: '98%',
      weight: '78 kg',
      bmi: '24.1',
      bloodSugar: '105 mg/dL',
      recordedAt: 'Today, 09:00 AM'
    },
    previousVitals: [
      {
        bp: '130/86 mmHg',
        pulse: '72 bpm',
        temp: '98.6 °F',
        spo2: '97%',
        weight: '79 kg',
        bmi: '24.4',
        bloodSugar: '112 mg/dL',
        recordedAt: '18 Aug 2026, 03:30 PM'
      },
      {
        bp: '134/88 mmHg',
        pulse: '74 bpm',
        temp: '98.5 °F',
        spo2: '98%',
        weight: '79 kg',
        bmi: '24.4',
        bloodSugar: '118 mg/dL',
        recordedAt: '04 Jun 2026, 02:15 PM'
      },
      {
        bp: '132/85 mmHg',
        pulse: '70 bpm',
        temp: '98.4 °F',
        spo2: '98%',
        weight: '80 kg',
        bmi: '24.7',
        bloodSugar: '115 mg/dL',
        recordedAt: '20 Apr 2026, 11:30 AM'
      },
      {
        bp: '128/84 mmHg',
        pulse: '68 bpm',
        temp: '98.3 °F',
        spo2: '99%',
        weight: '80 kg',
        bmi: '24.7',
        bloodSugar: '108 mg/dL',
        recordedAt: '15 Feb 2026, 09:45 AM'
      },
      {
        bp: '136/88 mmHg',
        pulse: '76 bpm',
        temp: '98.6 °F',
        spo2: '97%',
        weight: '81 kg',
        bmi: '25.0',
        bloodSugar: '122 mg/dL',
        recordedAt: '10 Dec 2025, 04:00 PM'
      },
      {
        bp: '130/84 mmHg',
        pulse: '72 bpm',
        temp: '98.5 °F',
        spo2: '98%',
        weight: '81 kg',
        bmi: '25.0',
        bloodSugar: '114 mg/dL',
        recordedAt: '18 Oct 2025, 10:15 AM'
      },
      {
        bp: '135/86 mmHg',
        pulse: '75 bpm',
        temp: '98.6 °F',
        spo2: '98%',
        weight: '82 kg',
        bmi: '25.3',
        bloodSugar: '119 mg/dL',
        recordedAt: '25 Aug 2025, 02:30 PM'
      },
      {
        bp: '128/82 mmHg',
        pulse: '70 bpm',
        temp: '98.4 °F',
        spo2: '99%',
        weight: '82 kg',
        bmi: '25.3',
        bloodSugar: '110 mg/dL',
        recordedAt: '14 Jun 2025, 09:00 AM'
      },
      {
        bp: '138/90 mmHg',
        pulse: '78 bpm',
        temp: '98.7 °F',
        spo2: '97%',
        weight: '83 kg',
        bmi: '25.6',
        bloodSugar: '125 mg/dL',
        recordedAt: '08 Apr 2025, 03:45 PM'
      },
      {
        bp: '132/85 mmHg',
        pulse: '71 bpm',
        temp: '98.5 °F',
        spo2: '98%',
        weight: '83 kg',
        bmi: '25.6',
        bloodSugar: '116 mg/dL',
        recordedAt: '15 Jan 2025, 11:00 AM'
      },
      {
        bp: '136/88 mmHg',
        pulse: '74 bpm',
        temp: '98.6 °F',
        spo2: '97%',
        weight: '84 kg',
        bmi: '25.9',
        bloodSugar: '120 mg/dL',
        recordedAt: '20 Nov 2024, 01:30 PM'
      },
      {
        bp: '140/92 mmHg',
        pulse: '80 bpm',
        temp: '98.8 °F',
        spo2: '96%',
        weight: '84 kg',
        bmi: '25.9',
        bloodSugar: '130 mg/dL',
        recordedAt: '10 Sep 2024, 10:00 AM'
      }
    ],
    allergies: [
      { allergen: 'Shellfish & Marine Proteins', severity: 'Severe', reaction: 'Facial angioedema, intense pruritus', diagnosedDate: '12 Jul 2022, 08:30 PM', duration: '4 Years (Ongoing)', status: 'Active - Emergency EpiPen Assigned', diagnosedBy: 'Dr. Clara Reynolds, MD' },
      { allergen: 'Sulfa Drugs & Sulfonamides', severity: 'Moderate', reaction: 'Erythema multiforme, fever & hives', diagnosedDate: '10 Aug 2019, 03:00 PM', duration: '7 Years (Ongoing)', status: 'Active - Absolute Contraindication', diagnosedBy: 'Dr. Clara Reynolds, MD' },
      { allergen: 'Aspirin / NSAIDs', severity: 'Mild', reaction: 'Gastric irritation, mild facial rash', diagnosedDate: '05 Feb 2017, 11:30 AM', duration: '2 Years', status: 'Cured / Resolved (20 Mar 2019)', diagnosedBy: 'Dr. Arthur Vance, MD' }
    ],
    chronicConditions: ['Hypertension (Stage 1)'],
    chronicConditionsList: [
      { condition: 'Screen-Induced Tension Headaches', diagnosedDate: '04 Jun 2024', severity: 'Mild Episodic', doctor: 'Dr. Clara Reynolds, MD', duration: '1.5 Years', status: 'Cured / Resolved (18 Aug 2025)', notes: 'Resolved with blue-light filter prescription and hourly screen break regime.' },
      { condition: 'Lumbar Muscular Strain', diagnosedDate: '20 Nov 2023', severity: 'Moderate', doctor: 'Dr. Marcus Thorne, MD', duration: '6 Months', status: 'Cured / Resolved (15 May 2024)', notes: 'Full recovery achieved with physical therapy and lumbar support chair.' },
      { condition: 'Hypertension (Stage 1)', diagnosedDate: '15 May 2022', severity: 'Stage 1 Essential', doctor: 'Dr. Clara Reynolds, MD', duration: '4 Years (Ongoing)', status: 'Active - Daily Lisinopril 10', notes: 'Blood pressure well-controlled with standard morning dosage.' }
    ],
    currentMedications: [
      {
        name: 'Lisinopril',
        dosage: '10',
        frequency: 'Once daily',
        timing: 'Morning before breakfast',
        doctor: 'Dr. Clara Reynolds, MD',
        startDate: '15 May 2026',
        refillsRemaining: 3,
        pharmacy: 'HMS Main Pharmacy'
      }
    ],
    previousVisits: [
      {
        id: 'VIS-204',
        date: '04 Jun 2026',
        timeSlot: '02:30 PM',
        doctorName: 'Dr. Clara Reynolds, MD',
        specialty: 'Neurology',
        room: 'OPD Room 104',
        reason: 'Occasional tension-type headaches',
        diagnosis: 'Tension headaches secondary to screen fatigue, normal neurological exam.',
        type: 'In-Person OPD',
        status: 'Completed',
        prescription: {
          rxNumber: 'RX-291034',
          date: '04 Jun 2026',
          doctorReg: 'MD-771920',
          diagnosis: 'Screen-Induced Tension Headache Syndrome',
          clinicalNotes: 'Eye-strain ergonomics advised. Rest periods between lectures.',
          medicines: [
            { name: 'Magnesium Glycinate', dosage: '400', frequency: 'Once daily', duration: '60 Days', instructions: 'Take with dinner' }
          ],
          advice: ['Take a 5-minute break every hour of screen work.'],
          nextFollowUp: 'As needed'
        },
        receipt: {
          receiptNumber: 'INV-2026-7712',
          invoiceDate: '04 Jun 2026',
          paymentStatus: 'PAID',
          paymentMethod: 'UPI / NetBanking',
          transactionId: 'TXN-771209-RL',
          items: [
            { description: 'Neurological Specialist Consultation', code: 'CPT-99213', quantity: 1, price: 150.00 }
          ],
          subtotal: 150.00,
          insuranceCoveragePercent: 80,
          insuranceCoveredAmount: 120.00,
          copayAmount: 30.00,
          tax: 0.00,
          totalPaid: 30.00
        }
      }
    ],
    healthRecords: [
      {
        id: 'LAB-8812',
        testName: 'Complete Blood Count (CBC) with Differential',
        category: 'Hematology',
        doctor: 'Dr. Clara Reynolds, MD',
        date: '04 Jun 2026',
        locationType: 'Hospital',
        locationName: 'HMS Central Pathology Lab',
        status: 'Completed',
        summary: 'All hematological parameters within standard reference ranges.',
        parameters: [
          { name: 'Hemoglobin', value: '15.2', unit: 'g/dL', referenceRange: '13.8 - 17.2', status: 'Normal' },
          { name: 'WBC Count', value: '6.8', unit: 'x10^3 / uL', referenceRange: '4.5 - 11.0', status: 'Normal' },
          { name: 'Platelets', value: '240', unit: 'x10^3 / uL', referenceRange: '150 - 450', status: 'Normal' }
        ],
        receipt: {
          receiptNumber: 'LAB-INV-8812',
          invoiceDate: '04 Jun 2026',
          paymentStatus: 'PAID',
          paymentMethod: 'Insurance Direct Pay',
          transactionId: 'TXN-LAB-88120',
          items: [
            { description: 'Automated Complete Blood Count (CBC)', code: 'CPT-85025', quantity: 1, price: 65.00 }
          ],
          subtotal: 65.00,
          insuranceCoveragePercent: 80,
          insuranceCoveredAmount: 52.00,
          copayAmount: 13.00,
          tax: 0.00,
          totalPaid: 13.00
        }
      }
    ]
  },
  {
    id: 'PT-88129',
    name: 'Grace Hopper',
    tokenNumber: 'T-103',
    dob: '09 December 1974',
    age: 52,
    gender: 'Female',
    bloodGroup: 'B+ Positive',
    phone: '+91 94430 56789',
    email: 'grace.hopper@example.com',
    address: '500 Anna Salai, T. Nagar, Chennai, Tamil Nadu 600017',
    occupation: 'Software Engineer',
    maritalStatus: 'Widowed',
    nationalId: 'AADHAAR-****-****-3341',
    emergencyContact: '+91 94250 22334 (Daughter)',
    insuranceProvider: 'Care Health Insurance Plus',
    insurancePolicyNumber: 'CARE-448201-GH',
    primaryPhysician: 'Dr. Marcus Thorne, MD',
    vitals: {
      bp: '132/86 mmHg',
      pulse: '76 bpm',
      temp: '98.7 °F',
      spo2: '97%',
      weight: '70 kg',
      bmi: '26.2',
      bloodSugar: '124 mg/dL',
      recordedAt: 'Today, 09:15 AM'
    },
    previousVitals: [
      {
        bp: '136/88 mmHg',
        pulse: '78 bpm',
        temp: '98.8 °F',
        spo2: '96%',
        weight: '71 kg',
        bmi: '26.5',
        bloodSugar: '130 mg/dL',
        recordedAt: '20 Jul 2026, 10:30 AM'
      },
      {
        bp: '138/90 mmHg',
        pulse: '80 bpm',
        temp: '98.6 °F',
        spo2: '97%',
        weight: '71 kg',
        bmi: '26.5',
        bloodSugar: '138 mg/dL',
        recordedAt: '10 Apr 2026, 04:00 PM'
      }
    ],
    allergies: [
      { allergen: 'Latex & Rubber Accelerators', severity: 'Severe', reaction: 'Severe contact dermatitis, localized edema', diagnosedDate: '18 Nov 2020, 11:15 AM', duration: '6 Years (Ongoing)', status: 'Active - Latex-Safe Environment Required', diagnosedBy: 'Dr. Marcus Thorne, MD' },
      { allergen: 'Ciprofloxacin (Fluoroquinolones)', severity: 'Moderate', reaction: 'Achilles tendonitis pain, dizziness', diagnosedDate: '14 Jun 2018, 04:00 PM', duration: '3 Months', status: 'Cured / Resolved (15 Sep 2018)', diagnosedBy: 'Dr. Clara Reynolds, MD' },
      { allergen: 'Peanuts & Tree Nuts', severity: 'Severe', reaction: 'Urticaria, laryngeal edema', diagnosedDate: '09 Jan 2012, 01:30 PM', duration: '14 Years (Ongoing)', status: 'Active - Auto-injector Prescribed', diagnosedBy: 'Dr. Arthur Vance, MD' }
    ],
    chronicConditions: ['Type 2 Diabetes', 'Osteoarthritis'],
    chronicConditionsList: [
      { condition: 'Mild Bilateral Knee Osteoarthritis', diagnosedDate: '20 Jul 2024', severity: 'Grade 1 Early', doctor: 'Dr. Marcus Thorne, MD', duration: '2 Years (Ongoing)', status: 'Active - Glucosamine Therapy', notes: 'Physical therapy active, joint mobility well-preserved.' },
      { condition: 'Acute Bronchitis Episode', diagnosedDate: '10 Feb 2023', severity: 'Moderate', doctor: 'Dr. Clara Reynolds, MD', duration: '4 Weeks', status: 'Cured / Resolved (12 Mar 2023)', notes: 'Full resolution with 7-day course of azithromycin and steam inhalation.' },
      { condition: 'Type 2 Diabetes Mellitus', diagnosedDate: '20 Jan 2019', severity: 'Moderate (HbA1c 6.4%)', doctor: 'Dr. Marcus Thorne, MD', duration: '7 Years (Ongoing)', status: 'Active - Metformin 850 BD', notes: 'Stable glycemic control, biannual HbA1c monitoring.' }
    ],
    currentMedications: [
      {
        name: 'Metformin HCl',
        dosage: '850',
        frequency: 'Twice daily',
        timing: 'With meals',
        doctor: 'Dr. Marcus Thorne, MD',
        startDate: '20 Jan 2026',
        refillsRemaining: 5,
        pharmacy: 'HMS Main Pharmacy'
      }
    ],
    previousVisits: [
      {
        id: 'VIS-402',
        date: '20 Jul 2026',
        timeSlot: '10:45 AM',
        doctorName: 'Dr. Marcus Thorne, MD',
        specialty: 'Orthopedics',
        room: 'OPD Room 202',
        reason: 'Knee joint pain consultation',
        diagnosis: 'Mild bilateral osteoarthritis, physical therapy recommended.',
        type: 'In-Person OPD',
        status: 'Completed',
        prescription: {
          rxNumber: 'RX-448201',
          date: '20 Jul 2026',
          doctorReg: 'MD-881290',
          diagnosis: 'Mild Bilateral Knee Osteoarthritis',
          clinicalNotes: 'Mild joint stiffness, range of motion maintained.',
          medicines: [
            { name: 'Glucosamine Chondroitin Complex', dosage: '1500', frequency: 'Once daily', duration: '90 Days', instructions: 'Take with food' }
          ],
          advice: ['Low-impact swimming and physical therapy.'],
          nextFollowUp: '20 Oct 2026'
        },
        receipt: {
          receiptNumber: 'INV-2026-8819',
          invoiceDate: '20 Jul 2026',
          paymentStatus: 'PAID',
          paymentMethod: 'Insurance Direct Pay',
          transactionId: 'TXN-881902-GH',
          items: [
            { description: 'Orthopedic Consultation & Joint Exam', code: 'CPT-99214', quantity: 1, price: 190.00 }
          ],
          subtotal: 190.00,
          insuranceCoveragePercent: 85,
          insuranceCoveredAmount: 161.50,
          copayAmount: 28.50,
          tax: 0.00,
          totalPaid: 28.50
        }
      }
    ],
    healthRecords: [
      {
        id: 'LAB-9923',
        testName: 'Glycated Hemoglobin (HbA1c)',
        category: 'Diabetes Endocrinology',
        doctor: 'Dr. Marcus Thorne, MD',
        date: '20 Jul 2026',
        locationType: 'Out',
        locationName: 'BioReference External Outpatient Lab (Out)',
        status: 'Completed',
        summary: 'Glycemic control stable under current Metformin regimen.',
        parameters: [
          { name: 'HbA1c', value: '6.4', unit: '%', referenceRange: '< 5.7 Normal, 5.7-6.4 Pre, >6.4 Diab', status: 'Normal' }
        ],
        receipt: {
          receiptNumber: 'LAB-INV-9923',
          invoiceDate: '20 Jul 2026',
          paymentStatus: 'PAID',
          paymentMethod: 'Insurance Direct Pay',
          transactionId: 'TXN-LAB-99230',
          items: [
            { description: 'Glycated Hemoglobin (HbA1c) Assay', code: 'CPT-83036', quantity: 1, price: 75.00 }
          ],
          subtotal: 75.00,
          insuranceCoveragePercent: 85,
          insuranceCoveredAmount: 63.75,
          copayAmount: 11.25,
          tax: 0.00,
          totalPaid: 11.25
        }
      }
    ]
  }
];

export interface MasterMedicine {
  id: string;
  name: string;
  genericName: string;
  composition: string;
  strength: string;
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Inhaler' | 'Ointment' | 'Eye Drops' | 'Suspension';
  category: string;
  route: string;
  defaultDosage: string;
  defaultFrequency: string;
  defaultDuration: string;
  defaultInstructions: string;
  defaultReason: string;
  stockCount: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export const MOCK_MEDICINE_CATALOG: MasterMedicine[] = [
  {
    id: 'MED-101',
    name: 'Dolo 650',
    genericName: 'Paracetamol IP',
    composition: 'Paracetamol 650',
    strength: '650',
    dosageForm: 'Tablet',
    category: 'Analgesic & Antipyretic',
    route: 'Oral',
    defaultDosage: '1 Tablet (650)',
    defaultFrequency: '1-0-1 (Twice daily after food)',
    defaultDuration: '5 Days',
    defaultInstructions: 'Take with a glass of water after meals. Do not exceed 3g per day.',
    defaultReason: 'For fever, acute headache, and post-viral body aches relief',
    stockCount: 284,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-102',
    name: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin + Potassium Clavulanate',
    composition: 'Amoxicillin 500 + Clavulanic Acid 125',
    strength: '625',
    dosageForm: 'Tablet',
    category: 'Antibiotic (Broad Spectrum)',
    route: 'Oral',
    defaultDosage: '1 Tablet (625)',
    defaultFrequency: '1-0-1 (Twice daily after food)',
    defaultDuration: '5 Days',
    defaultInstructions: 'Complete full 5-day course. Take after breakfast and dinner.',
    defaultReason: 'For bacterial upper respiratory tract / sinus infection',
    stockCount: 142,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-103',
    name: 'Pan-D (Pantoprazole + Domperidone)',
    genericName: 'Pantoprazole Sodium + Domperidone SR',
    composition: 'Pantoprazole 40 + Domperidone 30 SR',
    strength: '40 / 30',
    dosageForm: 'Capsule',
    category: 'Gastrointestinal & PPI',
    route: 'Oral',
    defaultDosage: '1 Capsule',
    defaultFrequency: '1-0-0 (Once daily before food)',
    defaultDuration: '14 Days',
    defaultInstructions: 'Take empty stomach 30 minutes before morning breakfast.',
    defaultReason: 'For gastroesophageal reflux (GERD), heartburn, and gastric mucosal protection',
    stockCount: 198,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-104',
    name: 'Azithral 500',
    genericName: 'Azithromycin Dihydrate IP',
    composition: 'Azithromycin 500',
    strength: '500',
    dosageForm: 'Tablet',
    category: 'Macrolide Antibiotic',
    route: 'Oral',
    defaultDosage: '1 Tablet (500)',
    defaultFrequency: '1-0-0 (Once daily)',
    defaultDuration: '3 Days',
    defaultInstructions: 'Take 1 hour before or 2 hours after meals once daily at the same time.',
    defaultReason: 'For acute pharyngitis, tonsillitis, and community-acquired chest congestion',
    stockCount: 86,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-105',
    name: 'Telma 40',
    genericName: 'Telmisartan IP',
    composition: 'Telmisartan 40',
    strength: '40',
    dosageForm: 'Tablet',
    category: 'Antihypertensive (ARB)',
    route: 'Oral',
    defaultDosage: '1 Tablet (40)',
    defaultFrequency: '1-0-0 (Morning with breakfast)',
    defaultDuration: '30 Days',
    defaultInstructions: 'Take regularly every morning. Monitor blood pressure periodically.',
    defaultReason: 'For primary essential hypertension management and cardiovascular protection',
    stockCount: 310,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-106',
    name: 'Glycomet-GP 1 / 500',
    genericName: 'Glimepiride + Metformin Hydrochloride',
    composition: 'Glimepiride 1 + Metformin 500 SR',
    strength: '1 / 500',
    dosageForm: 'Tablet',
    category: 'Antidiabetic (Oral Hypoglycemic)',
    route: 'Oral',
    defaultDosage: '1 Tablet',
    defaultFrequency: '1-0-0 (Once daily with breakfast)',
    defaultDuration: '30 Days',
    defaultInstructions: 'Take with the first main meal. Do not skip meals to prevent hypoglycemia.',
    defaultReason: 'For glycemic control in Type 2 Diabetes Mellitus',
    stockCount: 220,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-107',
    name: 'Montair-LC',
    genericName: 'Montelukast Sodium + Levocetirizine',
    composition: 'Montelukast 10 + Levocetirizine 5',
    strength: '10 / 5',
    dosageForm: 'Tablet',
    category: 'Antiallergic & Bronchodilator',
    route: 'Oral',
    defaultDosage: '1 Tablet',
    defaultFrequency: '0-0-1 (Once at bedtime)',
    defaultDuration: '7 Days',
    defaultInstructions: 'Take at night before sleeping. May cause mild drowsiness.',
    defaultReason: 'For allergic rhinitis, seasonal sneezing, nasal congestion, and mild asthma symptoms',
    stockCount: 165,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-108',
    name: 'Atorva 20',
    genericName: 'Atorvastatin Calcium IP',
    composition: 'Atorvastatin 20',
    strength: '20',
    dosageForm: 'Tablet',
    category: 'Lipid-Lowering / Statin',
    route: 'Oral',
    defaultDosage: '1 Tablet (20)',
    defaultFrequency: '0-0-1 (Once at night after dinner)',
    defaultDuration: '30 Days',
    defaultInstructions: 'Take at bedtime. Maintain low-cholesterol dietary precautions.',
    defaultReason: 'For hypercholesterolemia, elevated LDL, and atherosclerotic plaque stabilization',
    stockCount: 175,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-109',
    name: 'Cipcal 500',
    genericName: 'Calcium Carbonate + Vitamin D3',
    composition: 'Elemental Calcium 500 + Cholecalciferol 250 IU',
    strength: '500',
    dosageForm: 'Tablet',
    category: 'Calcium & Vitamin Supplement',
    route: 'Oral',
    defaultDosage: '1 Tablet',
    defaultFrequency: '0-1-0 (Once daily afternoon after lunch)',
    defaultDuration: '30 Days',
    defaultInstructions: 'Take after afternoon meal with plenty of water.',
    defaultReason: 'For bone mineral density maintenance and calcium supplementation',
    stockCount: 240,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-110',
    name: 'Asthalin Inhaler (100 mcg)',
    genericName: 'Salbutamol / Albuterol Sulfate',
    composition: 'Salbutamol 100 mcg per actuation (200 MDIs)',
    strength: '100 mcg',
    dosageForm: 'Inhaler',
    category: 'Bronchodilator (Beta-2 Agonist)',
    route: 'Inhalation',
    defaultDosage: '2 Puffs',
    defaultFrequency: 'As needed (SOS) during wheezing / breathlessness',
    defaultDuration: '30 Days',
    defaultInstructions: 'Shake well before each actuation. Rinse mouth with water after inhalation.',
    defaultReason: 'For acute bronchospasm relief, wheezing, and reversible airway obstruction',
    stockCount: 45,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-111',
    name: 'Voveran 50 (Diclofenac)',
    genericName: 'Diclofenac Sodium Gastro-resistant',
    composition: 'Diclofenac Sodium 50',
    strength: '50',
    dosageForm: 'Tablet',
    category: 'NSAID / Anti-inflammatory',
    route: 'Oral',
    defaultDosage: '1 Tablet (50)',
    defaultFrequency: '1-0-1 (Twice daily after food SOS)',
    defaultDuration: '3 Days',
    defaultInstructions: 'Always take after meals with antacid protection. Avoid if gastric ulcer history.',
    defaultReason: 'For acute inflammatory musculoskeletal pain, arthritis flare-up, or sprain',
    stockCount: 18,
    stockStatus: 'Low Stock'
  },
  {
    id: 'MED-112',
    name: 'Ascoril-LS Expectorant',
    genericName: 'Levosalbutamol + Ambroxol + Guaiphenesin',
    composition: 'Levosalbutamol 1mg + Ambroxol 30mg + Guaiphenesin 50mg / 5ml',
    strength: '100 ml Syrup',
    dosageForm: 'Syrup',
    category: 'Mucolytic & Bronchodilator Syrup',
    route: 'Oral',
    defaultDosage: '10 ml (2 Teaspoons)',
    defaultFrequency: '1-1-1 (Thrice daily after food)',
    defaultDuration: '5 Days',
    defaultInstructions: 'Use measuring cup provided. Drink warm water after dose.',
    defaultReason: 'For productive cough with thick mucus, chest congestion, and wheezing',
    stockCount: 92,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-113',
    name: 'Neurobion Forte',
    genericName: 'Vitamin B-Complex + Vitamin B12',
    composition: 'Thiamine 10mg + Riboflavin 10mg + Pyridoxine 3mg + Cyanocobalamin 15mcg',
    strength: 'B-Complex',
    dosageForm: 'Tablet',
    category: 'Neurotropic Multivitamin',
    route: 'Oral',
    defaultDosage: '1 Tablet',
    defaultFrequency: '1-0-0 (Once daily after breakfast)',
    defaultDuration: '30 Days',
    defaultInstructions: 'Take once daily in morning with water.',
    defaultReason: 'For diabetic peripheral neuropathy, nerve tingling, and B-complex deficiency',
    stockCount: 310,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-114',
    name: 'Ciplox 500',
    genericName: 'Ciprofloxacin Hydrochloride IP',
    composition: 'Ciprofloxacin 500',
    strength: '500',
    dosageForm: 'Tablet',
    category: 'Fluoroquinolone Antibiotic',
    route: 'Oral',
    defaultDosage: '1 Tablet (500)',
    defaultFrequency: '1-0-1 (Twice daily after food)',
    defaultDuration: '5 Days',
    defaultInstructions: 'Maintain adequate fluid intake. Avoid taking with milk/antacids simultaneously.',
    defaultReason: 'For urinary tract infection (UTI) and gastrointestinal bacterial infection',
    stockCount: 64,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-115',
    name: 'Refresh Tears Eye Drops',
    genericName: 'Carboxymethylcellulose Sodium 0.5%',
    composition: 'Carboxymethylcellulose Sodium 0.5% w/v',
    strength: '10 ml Drop',
    dosageForm: 'Eye Drops',
    category: 'Ophthalmic Lubricant',
    route: 'Ophthalmic (Eye)',
    defaultDosage: '1-2 Drops',
    defaultFrequency: '1-1-1-1 (4 times daily in both eyes)',
    defaultDuration: '14 Days',
    defaultInstructions: 'Wash hands before instilling. Do not touch dropper tip to eye surface.',
    defaultReason: 'For dry eye syndrome, ocular fatigue, burning sensation, and computer vision strain',
    stockCount: 52,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-116',
    name: 'Electral ORS Powder',
    genericName: 'Oral Rehydration Salts IP (WHO Formula)',
    composition: 'Sodium Chloride 2.6g + Potassium Chloride 1.5g + Sodium Citrate 2.9g + Dextrose 13.5g',
    strength: '21.8 g Sachet',
    dosageForm: 'Suspension',
    category: 'Rehydration & Electrolyte',
    route: 'Oral',
    defaultDosage: '1 Sachet dissolved in 1 Litre water',
    defaultFrequency: 'Sip throughout the day after each loose bowel movement',
    defaultDuration: '3 Days',
    defaultInstructions: 'Dissolve entire sachet in 1000ml clean drinking water. Discard unused portion after 24 hrs.',
    defaultReason: 'For electrolyte restoration and dehydration management in acute gastroenteritis',
    stockCount: 150,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-117',
    name: 'Amlong 5',
    genericName: 'Amlodipine Besylate IP',
    composition: 'Amlodipine 5',
    strength: '5',
    dosageForm: 'Tablet',
    category: 'Calcium Channel Blocker (Antihypertensive)',
    route: 'Oral',
    defaultDosage: '1 Tablet (5)',
    defaultFrequency: '1-0-0 (Morning)',
    defaultDuration: '30 Days',
    defaultInstructions: 'Take once daily in morning. Check for peripheral ankle swelling.',
    defaultReason: 'For blood pressure control in essential hypertension and angina prophylaxis',
    stockCount: 0,
    stockStatus: 'Out of Stock'
  },
  {
    id: 'MED-118',
    name: 'Hifenac-P',
    genericName: 'Aceclofenac + Paracetamol',
    composition: 'Aceclofenac 100 + Paracetamol 325',
    strength: '100 / 325',
    dosageForm: 'Tablet',
    category: 'NSAID & Analgesic',
    route: 'Oral',
    defaultDosage: '1 Tablet',
    defaultFrequency: '1-0-1 (Twice daily after food)',
    defaultDuration: '5 Days',
    defaultInstructions: 'Take with or after food. Do not take on an empty stomach.',
    defaultReason: 'For acute musculoskeletal pain, arthritis swelling, and inflammation relief',
    stockCount: 110,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-119',
    name: 'Histac 150',
    genericName: 'Ranitidine Hydrochloride IP',
    composition: 'Ranitidine 150',
    strength: '150',
    dosageForm: 'Tablet',
    category: 'H2 Receptor Blocker (Antacid)',
    route: 'Oral',
    defaultDosage: '1 Tablet (150)',
    defaultFrequency: '1-0-1 (Twice daily before food)',
    defaultDuration: '14 Days',
    defaultInstructions: 'Take 30 minutes before meals or at bedtime.',
    defaultReason: 'For gastric hyperacidity, peptic ulcer symptoms, and heartburn prevention',
    stockCount: 95,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-120',
    name: 'Hydrochlorothiazide 25',
    genericName: 'Hydrochlorothiazide IP',
    composition: 'Hydrochlorothiazide 25',
    strength: '25',
    dosageForm: 'Tablet',
    category: 'Thiazide Diuretic',
    route: 'Oral',
    defaultDosage: '1 Tablet (25)',
    defaultFrequency: '1-0-0 (Morning)',
    defaultDuration: '30 Days',
    defaultInstructions: 'Take in the morning to avoid nocturnal diuresis.',
    defaultReason: 'For hypertension management and fluid retention / edema control',
    stockCount: 78,
    stockStatus: 'In Stock'
  },
  {
    id: 'MED-121',
    name: 'HCQS 200',
    genericName: 'Hydroxychloroquine Sulfate IP',
    composition: 'Hydroxychloroquine 200',
    strength: '200',
    dosageForm: 'Tablet',
    category: 'DMARD & Anti-inflammatory',
    route: 'Oral',
    defaultDosage: '1 Tablet (200)',
    defaultFrequency: '1-0-0 (Once daily with meals)',
    defaultDuration: '30 Days',
    defaultInstructions: 'Take with food or milk. Periodic ophthalmic check-up recommended.',
    defaultReason: 'For rheumatoid arthritis and systemic lupus erythematosus maintenance',
    stockCount: 45,
    stockStatus: 'In Stock'
  }
];

