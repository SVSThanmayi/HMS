import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PharmacistComponent } from './pharmacist.component';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { MOCK_REGISTERED_PATIENTS } from '../../core/models/patient.model';

describe('PharmacistComponent', () => {
  let component: PharmacistComponent;
  let fixture: ComponentFixture<PharmacistComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacistComponent],
      providers: [
        AuthService,
        ModalService,
        provideRouter([])
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    authService.login('pharmacist@hms-hospital.org', 'Alex Mercer, RPh', 'pharmacist');

    fixture = TestBed.createComponent(PharmacistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the pharmacist component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the navbar with pharmacist profile and pharmacy title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('HMS Pharmacy');
    expect(compiled.textContent).toContain('Central Dispensing & Billing');
    expect(compiled.textContent).toContain('Alex Mercer, RPh');
    expect(compiled.textContent).toContain('Counter #2');
  });

  it('should display the universal patient search header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pharmacy Dispensing');
  });

  it('should filter patients on search query input', () => {
    component.onSearchInputChange('Eleanor');
    expect(component.searchResults().length).toBeGreaterThan(0);
    expect(component.searchResults()[0].name).toContain('Eleanor');
  });

  it('should select a patient and render the prescription medicines in a table', () => {
    const patient = MOCK_REGISTERED_PATIENTS[0]; // Eleanor Vance
    component.selectPatient(patient);
    fixture.detectChanges();

    expect(component.activePatient()?.name).toBe(patient.name);
    expect(component.activePrescriptionMedicines().length).toBeGreaterThan(0);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(patient.name);
    expect(compiled.textContent).toContain('Prescribed Medicines for Fulfillment');
    expect(compiled.textContent).toContain('Generate Pay Receipt');
    expect(compiled.textContent).toContain('Done');
  });

  it('should generate an itemized pay receipt including doctor consultation and medicines', () => {
    const patient = MOCK_REGISTERED_PATIENTS[0];
    component.selectPatient(patient);

    component.generatePayReceipt();
    expect(component.isReceiptModalOpen()).toBe(true);

    const receipt = component.currentReceipt();
    expect(receipt).toBeTruthy();
    expect(receipt?.patientName).toBe(patient.name);
    expect(receipt?.paymentStatus).toBe('PAID');

    // Should include Doctor Consultation item
    const consultItem = receipt?.items.find(i => i.category === 'Consultation');
    expect(consultItem).toBeTruthy();

    // Should include Medication items
    const medItems = receipt?.items.filter(i => i.category === 'Medication') || [];
    expect(medItems.length).toBeGreaterThan(0);

    expect(receipt!.grandTotal).toBeGreaterThan(0);
  });

  it('should include diagnosis in receipt when present and omit when missing', () => {
    // 1. Patient with diagnosis
    const patientWithDiag = MOCK_REGISTERED_PATIENTS[0];
    component.selectPatient(patientWithDiag);
    component.generatePayReceipt();
    let receipt = component.currentReceipt();
    
    if (component.activeDiagnosis().trim().length > 0) {
      expect(receipt?.hasDiagnosis).toBe(true);
      expect(receipt?.items.some(i => i.category === 'Diagnosis')).toBe(true);
    }

    // 2. Patient without diagnosis
    const patientWithoutDiag = {
      ...MOCK_REGISTERED_PATIENTS[1],
      previousVisits: []
    };
    component.selectPatient(patientWithoutDiag);
    component.generatePayReceipt();
    receipt = component.currentReceipt();

    expect(receipt?.hasDiagnosis).toBe(false);
    expect(receipt?.items.some(i => i.category === 'Diagnosis')).toBe(false);
  });

  it('should open and close the pay receipt preview modal', () => {
    const patient = MOCK_REGISTERED_PATIENTS[0];
    component.selectPatient(patient);

    component.generatePayReceipt();
    expect(component.isReceiptModalOpen()).toBe(true);

    component.closeReceiptModal();
    expect(component.isReceiptModalOpen()).toBe(false);
  });

  it('should handle Done action to dispense medicines, record payment, and reset view', () => {
    vi.useFakeTimers();
    const patient = MOCK_REGISTERED_PATIENTS[0];
    component.selectPatient(patient);
    component.generatePayReceipt();

    component.onDoneDispensing();
    expect(component.isDispensed()).toBe(true);

    vi.advanceTimersByTime(1300);
    expect(component.activePatient()).toBeNull();
    vi.useRealTimers();
  });
});
