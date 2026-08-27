import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NurseComponent } from './nurse.component';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';

describe('NurseComponent', () => {
  let component: NurseComponent;
  let fixture: ComponentFixture<NurseComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NurseComponent],
      providers: [
        AuthService,
        ModalService,
        provideRouter([
          { path: 'login', children: [] }
        ])
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    authService.login('nurse@hms-hospital.org', 'Emily Watson', 'nurse');
    fixture = TestBed.createComponent(NurseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the nurse component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the nav bar with nurse name and role', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header')).toBeTruthy();
    expect(compiled.textContent).toContain('Emily Watson');
    expect(compiled.textContent).toContain('Nurse (NUR-1042)');
  });

  it('should display Nurse heading below the nav bar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const h1 = compiled.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(h1?.textContent?.trim()).toBe('Nurse');
  });

  it('should display Token badge in the patient details header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Token: T-102');
    expect(compiled.textContent).toContain('PT-39102');
    expect(compiled.textContent).toContain('Robert Langdon');
  });

  it('should display Patient Vitals History heading and Add New Vitals button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Patient Vitals History');
    expect(compiled.textContent).toContain('Add New Vitals');
  });

  it('should render vitals history table with proper columns', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Date & Time');
    expect(compiled.textContent).toContain('Weight');
    expect(compiled.textContent).toContain('BP');
    expect(compiled.textContent).toContain('Pulse');
    expect(compiled.textContent).toContain('SpO2');
    expect(compiled.textContent).toContain('Blood Sugar');
    expect(component.paginatedNurseVitals().length).toBe(10);
  });

  it('should paginate vitals history table with referral paginator', () => {
    expect(component.nurseVitalsPage()).toBe(1);
    expect(component.nurseVitalsPageSize()).toBe(10);
    expect(component.totalNurseVitalsPages()).toBe(2);

    // Page 2
    component.nextNurseVitalsPage();
    expect(component.nurseVitalsPage()).toBe(2);
    expect(component.paginatedNurseVitals().length).toBe(2);

    // Page 1
    component.prevNurseVitalsPage();
    expect(component.nurseVitalsPage()).toBe(1);
    expect(component.paginatedNurseVitals().length).toBe(10);

    // Page size 5
    component.onNurseVitalsPageSizeChange(5);
    expect(component.nurseVitalsPageSize()).toBe(5);
    expect(component.totalNurseVitalsPages()).toBe(3);
    expect(component.paginatedNurseVitals().length).toBe(5);
  });

  it('should open Add New Vitals modal popup and record new vitals to top of table', () => {
    vi.useFakeTimers();
    expect(component.isAddVitalsModalOpen()).toBe(false);

    component.openAddVitalsModal();
    expect(component.isAddVitalsModalOpen()).toBe(true);

    component.vitalsForm.patchValue({
      weight: '80',
      bp: '125/82',
      pulse: '70',
      spo2: '99',
      bloodSugar: '108',
      temperature: '98.6'
    });

    component.onSaveVitals();
    vi.advanceTimersByTime(300);

    expect(component.isAddVitalsModalOpen()).toBe(false);
    expect(component.activePatient()?.vitals.bp).toBe('125/82 mmHg');
    expect(component.activePatient()?.vitals.pulse).toBe('70 bpm');
    expect(component.activePatient()?.vitals.spo2).toBe('99%');
    expect(component.activePatient()?.vitals.weight).toBe('80 kg');
    expect(component.activePatient()?.vitals.bloodSugar).toBe('108 mg/dL');
    expect(component.activePatient()?.previousVitals?.[0].bp).toBe('125/82 mmHg');
    expect(component.nurseVitalsPage()).toBe(1);
    expect(component.paginatedNurseVitals()[0].bp).toBe('125/82 mmHg');
    vi.useRealTimers();
  });

  it('should filter patients matching search query by name, ID or phone', () => {
    // Search by name prefix
    component.onSearchInputChange('eleanor');
    expect(component.searchResults().length).toBe(1);
    expect(component.searchResults()[0].name).toBe('Eleanor Vance');

    // Search by phone
    component.onSearchInputChange('98765');
    expect(component.searchResults().length).toBe(1);
    expect(component.searchResults()[0].name).toBe('Eleanor Vance');

    // Search by ID
    component.onSearchInputChange('94821');
    expect(component.searchResults().length).toBe(1);
    expect(component.searchResults()[0].name).toBe('Eleanor Vance');

    // Non-matching
    component.onSearchInputChange('NonExistent');
    expect(component.searchResults().length).toBe(0);
  });

  it('should select patient from search results and open details modal', () => {
    component.onSearchInputChange('Robert');
    expect(component.searchResults().length).toBe(1);
    const patient = component.searchResults()[0];

    component.selectSearchResultPatient(patient);
    expect(component.activePatient()).toEqual(patient);
    expect(component.activePatientDetails()).toEqual(patient);
    expect(component.isPatientDetailsModalOpen()).toBe(true);
    expect(component.searchQuery()).toBe('');
    expect(component.searchResults().length).toBe(0);
  });

  it('should clear search input and results when clearSearch is called', () => {
    component.onSearchInputChange('Grace');
    expect(component.searchQuery()).toBe('Grace');
    expect(component.searchResults().length).toBe(1);

    component.clearSearch();
    expect(component.searchQuery()).toBe('');
    expect(component.searchResults().length).toBe(0);
  });

  it('should render Today\'s Patient Queue sidebar and update active patient and vitals table on patient click', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Today's Patient Queue");
    expect(compiled.textContent).toContain("Patient triage status & live consultation queue");

    // Click Eleanor Vance (first patient in queue)
    const eleanor = component.patients()[0];
    component.selectPatient(eleanor);
    fixture.detectChanges();

    expect(component.activePatient()?.name).toBe('Eleanor Vance');
    expect(component.activePatient()?.id).toBe('PT-94821');
    expect(component.nurseVitalsPage()).toBe(1);
    expect(compiled.textContent).toContain('Eleanor Vance');
    expect(compiled.textContent).toContain('PT-94821');

    // Click Grace Hopper (third patient in queue)
    const grace = component.patients()[2];
    component.selectPatient(grace);
    fixture.detectChanges();

    expect(component.activePatient()?.name).toBe('Grace Hopper');
    expect(component.activePatient()?.id).toBe('PT-88129');
    expect(compiled.textContent).toContain('Grace Hopper');
  });

  it('should open Patient 360 modal with complete tabs and pagination for medications, visits, and records', () => {
    const patient = component.patients()[0]; // Eleanor Vance
    component.openPatientDetailsModal(patient);
    expect(component.isPatientDetailsModalOpen()).toBe(true);
    expect(component.activePatientDetails()?.id).toBe(patient.id);

    // Personal info tab
    expect(component.patientDetailsTab()).toBe('personal');

    // Clinical tab with 3 subtabs
    component.patientDetailsTab.set('clinical');
    expect(component.clinicalSubTab()).toBe('vitals');
    expect(component.paginatedPatientVitals().length).toBeGreaterThan(0);

    component.clinicalSubTab.set('allergies');
    expect(component.paginatedPatientAllergies().length).toBeGreaterThan(0);

    component.clinicalSubTab.set('chronic');
    expect(component.paginatedPatientChronic().length).toBeGreaterThan(0);

    // Medications tab with pagination
    component.patientDetailsTab.set('medications');
    expect(component.paginatedPatientMedications().length).toBeGreaterThan(0);

    // Visits tab with pagination
    component.patientDetailsTab.set('visits');
    expect(component.paginatedPatientVisits().length).toBeGreaterThan(0);

    // Records tab with pagination
    component.patientDetailsTab.set('records');
    expect(component.paginatedPatientRecords().length).toBeGreaterThan(0);
  });

  it('should open and close visit prescription modal, visit receipt modal, and lab receipt modal in Nurse portal', () => {
    const patient = component.patients()[0];
    const visit = patient.previousVisits[0];
    const record = patient.healthRecords[0];

    // 1. Visit Prescription Modal
    component.openVisitPrescription(visit, patient);
    expect(component.selectedVisitPrescription()).toBeTruthy();
    expect(component.selectedVisitPrescription()?.patientName).toBe(patient.name);
    expect(component.selectedVisitPrescription()?.prescription.rxNumber).toBe('RX-884210');
    component.closePrescriptionModal();
    expect(component.selectedVisitPrescription()).toBeNull();

    // 2. Visit Receipt Modal
    component.openVisitReceipt(visit, patient);
    expect(component.selectedReceiptData()).toBeTruthy();
    expect(component.selectedReceiptData()?.receipt.receiptNumber).toBe('INV-2026-9041');
    expect(component.selectedReceiptData()?.receipt.paymentStatus).toBe('PAID');
    component.closeReceiptModal();
    expect(component.selectedReceiptData()).toBeNull();

    // 3. Lab Record Receipt Modal
    component.openLabReceipt(record, patient);
    expect(component.selectedReceiptData()).toBeTruthy();
    expect(component.selectedReceiptData()?.receipt.receiptNumber).toBe('LAB-INV-9042');
    component.closeReceiptModal();
    expect(component.selectedReceiptData()).toBeNull();
  });

  it('should prompt confirmation dialog before logging out', () => {
    const modalService = TestBed.inject(ModalService);
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.onLogout();

    const activeDialog = modalService.activeConfirmDialog();
    expect(activeDialog).toBeTruthy();
    expect(activeDialog?.title).toBe('Confirm Logout');
    expect(activeDialog?.type).toBe('danger');

    // Resolve confirmation
    modalService.resolveConfirm();
    expect(authService.currentNurse()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
