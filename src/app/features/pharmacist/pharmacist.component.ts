import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IconComponent } from '../../shared/icons/icon.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { AuthService, PharmacistProfile } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { 
  MOCK_REGISTERED_PATIENTS, 
  RegisteredPatient, 
  PrescriptionMedicine,
  MOCK_MEDICINE_CATALOG,
  MasterMedicine
} from '../../core/models/patient.model';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Safe initialization of vfs fonts for pdfmake
const pdfMakeInstance: any = (pdfMake as any).default || pdfMake;
const pdfFontsInstance: any = (pdfFonts as any).default || pdfFonts;
if (pdfFontsInstance && (pdfFontsInstance.pdfMake?.vfs || pdfFontsInstance.vfs)) {
  pdfMakeInstance.vfs = pdfFontsInstance.pdfMake?.vfs || pdfFontsInstance.vfs;
}

export interface ReceiptItem {
  id: number;
  description: string;
  category: 'Consultation' | 'Diagnosis' | 'Medication';
  details: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PharmacistReceipt {
  receiptNumber: string;
  dateStr: string;
  timeStr: string;
  patientName: string;
  patientId: string;
  tokenNumber: string;
  age: number;
  gender: string;
  phone: string;
  bloodGroup: string;
  doctorName: string;
  specialty: string;
  diagnosis?: string;
  hasDiagnosis: boolean;
  items: ReceiptItem[];
  subtotal: number;
  insuranceDiscount: number;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: 'PAID';
  dispensedBy: string;
  counterNumber: string;
}

@Component({
  selector: 'app-pharmacist',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent, AvatarComponent],
  templateUrl: './pharmacist.component.html'
})
export class PharmacistComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  // Master patient data
  readonly registeredPatients = signal<RegisteredPatient[]>(MOCK_REGISTERED_PATIENTS);
  readonly medicineCatalog = signal<MasterMedicine[]>(MOCK_MEDICINE_CATALOG);

  // Pharmacist profile from AuthService
  readonly currentPharmacist = computed<PharmacistProfile | null>(() => this.authService.currentPharmacist());

  // Search State
  readonly searchQuery = signal<string>('');
  readonly activePatient = signal<RegisteredPatient | null>(null);

  // Filtered search results
  readonly searchResults = computed<RegisteredPatient[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return [];
    return this.registeredPatients().filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.phone && p.phone.toLowerCase().includes(q)) ||
      (p.tokenNumber && p.tokenNumber.toLowerCase().includes(q))
    );
  });

  // Active Prescribed Medicines for selected patient
  readonly activePrescriptionMedicines = computed<PrescriptionMedicine[]>(() => {
    const patient = this.activePatient();
    if (!patient) return [];

    // 1. Look for medicines in the latest previousVisits prescription
    const latestVisit = patient.previousVisits?.[0];
    if (latestVisit?.prescription?.medicines && latestVisit.prescription.medicines.length > 0) {
      return latestVisit.prescription.medicines;
    }

    // 2. Or fallback to currentMedications
    if (patient.currentMedications && patient.currentMedications.length > 0) {
      return patient.currentMedications.map(m => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency || 'Once daily',
        duration: '30 Days',
        instructions: m.timing || 'Take as directed by doctor',
        reason: 'Maintenance therapy',
        form: 'Tablet',
        strength: ''
      }));
    }

    // Default sample medicines for demo if patient has empty prescriptions
    return [
      {
        name: 'Dolo 650',
        dosage: '1 Tablet (650)',
        frequency: 'Three times daily (TDS)',
        duration: '5 Days',
        instructions: 'Take with a glass of water after meals. Do not exceed 3g/day.',
        reason: 'Post-viral fever & body aches relief',
        form: 'Tablet',
        strength: '650'
      },
      {
        name: 'Augmentin 625 Duo',
        dosage: '1 Tablet (625)',
        frequency: 'Twice daily (BD)',
        duration: '7 Days',
        instructions: 'Take at start of meal to enhance absorption.',
        reason: 'Respiratory tract infection coverage',
        form: 'Tablet',
        strength: '625'
      },
      {
        name: 'Pan-D',
        dosage: '1 Capsule',
        frequency: 'Once daily (OD)',
        duration: '7 Days',
        instructions: 'Take 30 minutes before breakfast.',
        reason: 'Gastric acid protection',
        form: 'Capsule',
        strength: '40 / 30'
      }
    ];
  });

  // Active Diagnosis string
  readonly activeDiagnosis = computed<string>(() => {
    const patient = this.activePatient();
    if (!patient) return '';
    const visit = patient.previousVisits?.[0];
    return visit?.prescription?.diagnosis || visit?.diagnosis || '';
  });

  // Active Prescribing Doctor
  readonly activeDoctorName = computed<string>(() => {
    const patient = this.activePatient();
    if (!patient) return 'Dr. Sarah Johnson, MD';
    const visit = patient.previousVisits?.[0];
    return visit?.doctorName || patient.primaryPhysician || 'Dr. Sarah Johnson, MD';
  });

  // Active Doctor Specialty
  readonly activeDoctorSpecialty = computed<string>(() => {
    const patient = this.activePatient();
    if (!patient) return 'Cardiology & OPD';
    const visit = patient.previousVisits?.[0];
    return visit?.specialty || 'General OPD & Internal Medicine';
  });

  // Receipt Modal State
  readonly isReceiptModalOpen = signal<boolean>(false);
  readonly currentReceipt = signal<PharmacistReceipt | null>(null);
  readonly isDispensed = signal<boolean>(false);
  readonly isGeneratingPdf = signal<boolean>(false);
  readonly receiptPdfUrl = signal<SafeResourceUrl | null>(null);

  ngOnInit(): void {
    // Ensure pharmacist role in AuthService
    if (!this.authService.isLoggedIn() || this.authService.userRole() !== 'pharmacist') {
      this.authService.login('pharmacist@hms-hospital.org', 'Alex Mercer, RPh', 'pharmacist');
    }
  }

  // Search input handler
  onSearchInputChange(query: string): void {
    this.searchQuery.set(query);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  // Select patient from search result or quick-select list
  selectPatient(patient: RegisteredPatient): void {
    this.activePatient.set(patient);
    this.searchQuery.set('');
    this.isDispensed.set(false);
    this.currentReceipt.set(null);
    this.receiptPdfUrl.set(null);
  }

  // Quick Select helper for demo
  quickSelectPatient(patientId: string): void {
    const p = this.registeredPatients().find(item => item.id === patientId);
    if (p) {
      this.selectPatient(p);
    }
  }

  getInitials(name: string): string {
    if (!name) return 'PT';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }

  // Price estimate helper for medicines
  getMedicineEstimatedPrice(medName: string): number {
    const nameLower = medName.toLowerCase();
    if (nameLower.includes('augmentin') || nameLower.includes('amoxicillin')) return 24.50;
    if (nameLower.includes('dolo') || nameLower.includes('paracetamol')) return 12.00;
    if (nameLower.includes('pan-d') || nameLower.includes('pantoprazole')) return 18.50;
    if (nameLower.includes('azithral') || nameLower.includes('azithromycin')) return 22.00;
    if (nameLower.includes('telma') || nameLower.includes('atorva')) return 16.00;
    if (nameLower.includes('glycomet') || nameLower.includes('metformin')) return 14.00;
    if (nameLower.includes('cipcal') || nameLower.includes('calcium')) return 15.00;
    if (nameLower.includes('montair') || nameLower.includes('cetirizine')) return 19.00;
    return 15.00;
  }

  // 1. Generate Pay Receipt Logic
  generatePayReceipt(): void {
    const patient = this.activePatient();
    if (!patient) {
      this.modalService.showToast('No Patient Selected', 'Please select a patient before generating a receipt.', 'warning');
      return;
    }

    const medicines = this.activePrescriptionMedicines();
    const diagnosisText = this.activeDiagnosis().trim();
    const hasDiagnosis = diagnosisText.length > 0 && diagnosisText.toLowerCase() !== 'n/a' && diagnosisText.toLowerCase() !== 'none';

    const items: ReceiptItem[] = [];
    let itemId = 1;

    // Item 1: Doctor Consultation Fee (Always present)
    items.push({
      id: itemId++,
      description: `Doctor Specialist Consultation (${this.activeDoctorName()})`,
      category: 'Consultation',
      details: `${this.activeDoctorSpecialty()} • OPD Consultation & Clinical Evaluation`,
      qty: 1,
      unitPrice: 150.00,
      totalPrice: 150.00
    });

    // Item 2: Diagnosis / Diagnostic Fee (ONLY if diagnosis is present)
    if (hasDiagnosis) {
      items.push({
        id: itemId++,
        description: `Diagnostic Clinical Assessment & Care Plan`,
        category: 'Diagnosis',
        details: `Diagnosis: ${diagnosisText}`,
        qty: 1,
        unitPrice: 45.00,
        totalPrice: 45.00
      });
    }

    // Item 3+: Prescribed Medicines
    medicines.forEach(med => {
      const price = this.getMedicineEstimatedPrice(med.name);
      items.push({
        id: itemId++,
        description: `${med.name} ${med.strength ? '• ' + med.strength : ''}`,
        category: 'Medication',
        details: `Dosage: ${med.dosage} | Directions: ${med.instructions || med.reason || 'As prescribed'}`,
        qty: 1,
        unitPrice: price,
        totalPrice: price
      });
    });

    // Financial calculations
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const insuranceDiscount = patient.insuranceProvider ? subtotal * 0.20 : 0.00; // 20% co-pay waiver if insured
    const taxableAmount = subtotal - insuranceDiscount;
    const taxAmount = +(taxableAmount * 0.05).toFixed(2); // 5% pharmacy healthcare tax
    const grandTotal = +(taxableAmount + taxAmount).toFixed(2);

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const receiptNumber = `INV-2026-PH-${Math.floor(100000 + Math.random() * 900000)}`;

    const receipt: PharmacistReceipt = {
      receiptNumber,
      dateStr,
      timeStr,
      patientName: patient.name,
      patientId: patient.id,
      tokenNumber: patient.tokenNumber || 'T-101',
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      bloodGroup: patient.bloodGroup,
      doctorName: this.activeDoctorName(),
      specialty: this.activeDoctorSpecialty(),
      diagnosis: hasDiagnosis ? diagnosisText : undefined,
      hasDiagnosis,
      items,
      subtotal: +subtotal.toFixed(2),
      insuranceDiscount: +insuranceDiscount.toFixed(2),
      taxAmount,
      grandTotal,
      paymentMethod: patient.insuranceProvider ? 'Corporate Insurance / Cashless' : 'UPI / Card / Cash',
      paymentStatus: 'PAID',
      dispensedBy: this.currentPharmacist()?.name || 'Alex Mercer, RPh',
      counterNumber: this.currentPharmacist()?.counterNumber || 'Counter #2'
    };

    this.currentReceipt.set(receipt);
    this.isReceiptModalOpen.set(true);
    this.modalService.showToast('Pay Receipt Generated', `Invoice ${receipt.receiptNumber} generated successfully.`, 'success');
  }

  // 2. Build PDF Document Definition using pdfMake
  private createPdfDocumentDefinition(receipt: PharmacistReceipt): any {
    const tableBody: any[] = [
      [
        { text: '#', style: 'tableHeader', alignment: 'center' },
        { text: 'Item Description & Clinical Details', style: 'tableHeader' },
        { text: 'Category', style: 'tableHeader', alignment: 'center' },
        { text: 'Qty', style: 'tableHeader', alignment: 'center' },
        { text: 'Unit Price ($)', style: 'tableHeader', alignment: 'right' },
        { text: 'Amount ($)', style: 'tableHeader', alignment: 'right' }
      ]
    ];

    receipt.items.forEach((item, index) => {
      tableBody.push([
        { text: (index + 1).toString(), alignment: 'center', fontSize: 9, color: '#334155' },
        {
          stack: [
            { text: item.description, bold: true, fontSize: 9.5, color: '#0f172a' },
            { text: item.details, fontSize: 8, color: '#64748b', margin: [0, 2, 0, 0] }
          ]
        },
        { text: item.category, alignment: 'center', fontSize: 8.5, color: '#0d9488', bold: true },
        { text: item.qty.toString(), alignment: 'center', fontSize: 9, color: '#334155' },
        { text: `$${item.unitPrice.toFixed(2)}`, alignment: 'right', fontSize: 9, color: '#334155' },
        { text: `$${item.totalPrice.toFixed(2)}`, alignment: 'right', fontSize: 9, bold: true, color: '#0f172a' }
      ]);
    });

    const docDef: any = {
      pageSize: 'A4',
      pageMargins: [36, 36, 36, 36],
      content: [
        // 1. HOSPITAL HEADER
        {
          columns: [
            {
              stack: [
                { text: 'HMS MULTI-SPECIALTY HOSPITAL', fontSize: 16, bold: true, color: '#005f54' },
                { text: 'Central Pharmacy & Outpatient Dispensing Services', fontSize: 9.5, bold: true, color: '#0f766e', margin: [0, 2, 0, 0] },
                { text: '100 Hospital Boulevard, Bellandur, Bengaluru, KA 560103', fontSize: 8.5, color: '#64748b', margin: [0, 2, 0, 0] },
                { text: 'Ph: +91 80 4455 6677 | Email: pharmacy@hms-hospital.org | GSTIN: 29AAAAA0000A1Z5', fontSize: 8, color: '#64748b' }
              ]
            },
            {
              stack: [
                { text: 'PAYMENT RECEIPT', fontSize: 13, bold: true, alignment: 'right', color: '#005f54' },
                { text: `Receipt #: ${receipt.receiptNumber}`, fontSize: 9, bold: true, alignment: 'right', color: '#0f172a', margin: [0, 2, 0, 0] },
                { text: `Date: ${receipt.dateStr}, ${receipt.timeStr}`, fontSize: 8.5, alignment: 'right', color: '#64748b' },
                { 
                  text: 'STATUS: PAID', 
                  fontSize: 9, 
                  bold: true, 
                  alignment: 'right', 
                  color: '#15803d',
                  margin: [0, 3, 0, 0] 
                }
              ]
            }
          ]
        },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 10, x2: 523, y2: 10, lineWidth: 1.5, lineColor: '#005f54' }
          ],
          margin: [0, 0, 0, 12]
        },

        // 2. PATIENT & DOCTOR INFO BOXES
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'PATIENT INFORMATION', fontSize: 9, bold: true, color: '#0f766e', margin: [0, 0, 0, 4] },
                { text: [{ text: 'Name: ', bold: true }, receipt.patientName], fontSize: 9, color: '#0f172a' },
                { text: [{ text: 'Patient ID: ', bold: true }, `${receipt.patientId}  •  Token: ${receipt.tokenNumber}`], fontSize: 8.5, color: '#334155' },
                { text: [{ text: 'Age/Gender: ', bold: true }, `${receipt.age} yrs / ${receipt.gender}  •  Blood: ${receipt.bloodGroup}`], fontSize: 8.5, color: '#334155' },
                { text: [{ text: 'Contact: ', bold: true }, receipt.phone], fontSize: 8.5, color: '#334155' }
              ]
            },
            {
              width: '50%',
              stack: [
                { text: 'CLINICAL & PHARMACY DETAILS', fontSize: 9, bold: true, color: '#0f766e', margin: [0, 0, 0, 4] },
                { text: [{ text: 'Prescribing Doctor: ', bold: true }, receipt.doctorName], fontSize: 9, color: '#0f172a' },
                { text: [{ text: 'Department: ', bold: true }, receipt.specialty], fontSize: 8.5, color: '#334155' },
                ...(receipt.hasDiagnosis && receipt.diagnosis ? [
                  { text: [{ text: 'Diagnosis: ', bold: true }, receipt.diagnosis], fontSize: 8.5, color: '#0f172a' }
                ] : []),
                { text: [{ text: 'Dispensed By: ', bold: true }, `${receipt.dispensedBy} (${receipt.counterNumber})`], fontSize: 8.5, color: '#334155' }
              ]
            }
          ],
          margin: [0, 0, 0, 14]
        },

        // 3. ITEMIZED CHARGES TABLE
        {
          table: {
            headerRows: 1,
            widths: [20, '*', 65, 30, 60, 60],
            body: tableBody
          },
          layout: {
            fillColor: (rowIndex: number) => {
              if (rowIndex === 0) return '#f0fdfa';
              return rowIndex % 2 === 0 ? '#fafafa' : null;
            },
            hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
            vLineWidth: () => 0,
            hLineColor: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? '#0f766e' : '#e2e8f0',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 5,
            paddingBottom: () => 5
          },
          margin: [0, 0, 0, 14]
        },

        // 4. FINANCIAL TOTALS SUMMARY
        {
          columns: [
            {
              width: '55%',
              stack: [
                { text: 'Payment Details & Remarks:', fontSize: 8.5, bold: true, color: '#334155' },
                { text: `Payment Mode: ${receipt.paymentMethod}`, fontSize: 8.5, color: '#64748b', margin: [0, 2, 0, 0] },
                { text: 'All prescribed medicines dispensed in full according to physician instructions.', fontSize: 8, color: '#64748b', margin: [0, 2, 0, 0] },
                { text: 'Medicines once sold cannot be returned without original cash receipt.', fontSize: 7.5, color: '#94a3b8', margin: [0, 2, 0, 0] }
              ]
            },
            {
              width: '45%',
              table: {
                widths: ['*', 70],
                body: [
                  [
                    { text: 'Subtotal:', fontSize: 8.5, color: '#64748b' },
                    { text: `$${receipt.subtotal.toFixed(2)}`, fontSize: 8.5, alignment: 'right', color: '#0f172a' }
                  ],
                  ...(receipt.insuranceDiscount > 0 ? [
                    [
                      { text: 'Insurance Co-Pay Benefit:', fontSize: 8.5, color: '#0d9488' },
                      { text: `-$${receipt.insuranceDiscount.toFixed(2)}`, fontSize: 8.5, alignment: 'right', color: '#0d9488', bold: true }
                    ]
                  ] : []),
                  [
                    { text: 'Healthcare Tax / GST (5%):', fontSize: 8.5, color: '#64748b' },
                    { text: `$${receipt.taxAmount.toFixed(2)}`, fontSize: 8.5, alignment: 'right', color: '#0f172a' }
                  ],
                  [
                    { text: 'TOTAL PAID:', fontSize: 10, bold: true, color: '#005f54' },
                    { text: `$${receipt.grandTotal.toFixed(2)}`, fontSize: 11, bold: true, alignment: 'right', color: '#005f54' }
                  ]
                ]
              },
              layout: 'noBorders'
            }
          ],
          margin: [0, 0, 0, 20]
        },

        // 5. SIGNATURE & AUTHENTICATION
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'Computer Generated Official Hospital Invoice', fontSize: 7.5, color: '#94a3b8' },
                { text: `Printed On: ${receipt.dateStr} | HMS POS System v2.4`, fontSize: 7.5, color: '#94a3b8' }
              ]
            },
            {
              width: '50%',
              stack: [
                { text: 'Authorized Pharmacist Signature', fontSize: 8.5, bold: true, alignment: 'right', color: '#0f172a' },
                { text: `${receipt.dispensedBy}`, fontSize: 8, alignment: 'right', color: '#0f766e', margin: [0, 2, 0, 0] },
                { text: `License: RPH-KA-2024-88910`, fontSize: 7.5, alignment: 'right', color: '#64748b' }
              ]
            }
          ]
        }
      ],
      styles: {
        tableHeader: {
          fontSize: 9,
          bold: true,
          color: '#0f766e',
          fillColor: '#f0fdfa'
        }
      }
    };

    return docDef;
  }

  // 3. Download PDF Action
  downloadPdf(): void {
    const receipt = this.currentReceipt();
    if (!receipt) return;

    try {
      const docDef = this.createPdfDocumentDefinition(receipt);
      pdfMakeInstance.createPdf(docDef).download(`HMS_Pharmacy_Receipt_${receipt.receiptNumber}.pdf`);
      this.modalService.showToast('Download Started', `Receipt ${receipt.receiptNumber} is downloading.`, 'info');
    } catch (err) {
      console.error('PDF download error:', err);
      this.modalService.showToast('Download Error', 'Could not generate PDF download. Please try printing.', 'error');
    }
  }

  // 4. Print Receipt Action
  printReceipt(): void {
    const receipt = this.currentReceipt();
    if (!receipt) return;

    try {
      const docDef = this.createPdfDocumentDefinition(receipt);
      pdfMakeInstance.createPdf(docDef).print();
    } catch (err) {
      console.error('PDF print error:', err);
      window.print();
    }
  }

  closeReceiptModal(): void {
    this.isReceiptModalOpen.set(false);
  }

  // 5. Done Action: Dispenses medicines, marks transaction complete, resets patient
  onDoneDispensing(): void {
    const patient = this.activePatient();
    if (!patient) return;

    const receipt = this.currentReceipt();
    const totalAmount = receipt ? receipt.grandTotal : 85.00;

    this.isDispensed.set(true);
    this.modalService.showToast(
      'Dispensing & Payment Completed',
      `Medicines successfully dispensed to ${patient.name}. Payment of $${totalAmount.toFixed(2)} received.`,
      'success'
    );

    // Reset view ready for next patient after short confirmation
    setTimeout(() => {
      this.activePatient.set(null);
      this.currentReceipt.set(null);
      this.isReceiptModalOpen.set(false);
      this.isDispensed.set(false);
      this.searchQuery.set('');
    }, 1200);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
