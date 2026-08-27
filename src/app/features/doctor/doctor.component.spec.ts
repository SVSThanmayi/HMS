import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DoctorComponent } from './doctor.component';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';
import { MOCK_REGISTERED_PATIENTS } from '../../core/models/patient.model';

describe('DoctorComponent', () => {
  let component: DoctorComponent;
  let fixture: ComponentFixture<DoctorComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorComponent],
      providers: [
        AuthService,
        ModalService,
        provideRouter([])
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    authService.login('doctor@hms-hospital.org', 'Dr. Sarah Johnson', 'doctor');

    fixture = TestBed.createComponent(DoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the doctor component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the side slide menu with Consult and Schedule options', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Consult');
    expect(compiled.textContent).toContain('Schedule');
    expect(component.doctorNavTab()).toBe('consult');

    // Switch to Schedule
    component.doctorNavTab.set('schedule');
    fixture.detectChanges();
    expect(compiled.textContent).toContain('Calendar');
    expect(compiled.textContent).not.toContain('Lunch & Clinical Rest Break');

    // Switch back to Consult
    component.doctorNavTab.set('consult');
    fixture.detectChanges();
    expect(component.doctorNavTab()).toBe('consult');
  });

  it('should filter schedule slots and open consultation from schedule card', () => {
    component.doctorNavTab.set('schedule');
    fixture.detectChanges();

    // Verify slots for today (Thursday, index 0)
    const thursdaySlots = component.getSlotsForDay(0);
    expect(thursdaySlots.length).toBeGreaterThan(0);
    const patientSlot = thursdaySlots.find(s => s.type === 'patient')!;
    expect(patientSlot).toBeTruthy();

    // Open consultation from schedule slot
    component.openConsultationFromSchedule(patientSlot);
    fixture.detectChanges();

    expect(component.doctorNavTab()).toBe('consult');
    expect(component.activePatient()?.name).toBe(patientSlot.patientName);
  });

  it('should render the search prompt initially and render tabs when patient is selected', () => {
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Search for the patient to view details and prescribe');

    // Select patient via search result
    const patient = MOCK_REGISTERED_PATIENTS[0];
    component.selectSearchResultPatient(patient);
    fixture.detectChanges();

    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Clinical Data');
    expect(compiled.textContent).toContain('Current Medications');
    expect(compiled.textContent).toContain('Prescriptions');
    expect(compiled.textContent).toContain('Health Records');
    expect(compiled.textContent).toContain('Consulted');
    expect(component.isPatientDetailsModalOpen()).toBe(false);
  });

  it('should clear patient and show search prompt when Consulted is clicked', () => {
    const patient = MOCK_REGISTERED_PATIENTS[0];
    component.selectSearchResultPatient(patient);
    fixture.detectChanges();

    expect(component.activePatient()).toBeTruthy();

    component.onConsulted();
    fixture.detectChanges();

    expect(component.activePatient()).toBeNull();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Search for the patient to view details and prescribe');
  });

  it('should display vitals, allergies, and chronic conditions subtabs in Clinical Data tab', () => {
    const patient = MOCK_REGISTERED_PATIENTS[1];
    component.selectPatient(patient);
    component.leftPanelTab.set('clinical');
    
    // 1. Recent Vitals Sub-tab
    component.clinicalDataSubTab.set('vitals');
    fixture.detectChanges();
    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Recent Vitals & Biometrics');
    expect(compiled.textContent).toContain('Blood Pressure');
    expect(compiled.textContent).toContain('Pulse Rate');

    // 2. Allergies Sub-tab (Table sorted recent first)
    component.clinicalDataSubTab.set('allergies');
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Allergen');
    const sortedAllergies = component.sortedActivePatientAllergies();
    expect(sortedAllergies.length).toBeGreaterThan(0);
    // Verify first item is more recent than last item
    if (sortedAllergies.length >= 2) {
      const firstTimestamp = Date.parse(sortedAllergies[0].diagnosedDate || '');
      const lastTimestamp = Date.parse(sortedAllergies[sortedAllergies.length - 1].diagnosedDate || '');
      expect(firstTimestamp).toBeGreaterThanOrEqual(lastTimestamp);
    }

    // 3. Chronics Sub-tab (Table sorted recent first)
    component.clinicalDataSubTab.set('chronics');
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Condition');
    const sortedChronics = component.sortedActivePatientChronics();
    expect(sortedChronics.length).toBeGreaterThan(0);
    // Verify first item is more recent than last item
    if (sortedChronics.length >= 2) {
      const firstTimestamp = Date.parse(sortedChronics[0].diagnosedDate || '');
      const lastTimestamp = Date.parse(sortedChronics[sortedChronics.length - 1].diagnosedDate || '');
      expect(firstTimestamp).toBeGreaterThanOrEqual(lastTimestamp);
    }
  });

  it('should switch to Current Medications tab and render table', () => {
    component.selectPatient(MOCK_REGISTERED_PATIENTS[1]);
    component.leftPanelTab.set('medications');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Active Prescriptions & Current Medications');
  });

  it('should switch to Previous Prescriptions tab and render table', () => {
    component.selectPatient(MOCK_REGISTERED_PATIENTS[1]);
    component.leftPanelTab.set('prescriptions');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Consultation Visits & Issued Prescriptions');
  });

  it('should switch to Health Records tab and render table', () => {
    component.selectPatient(MOCK_REGISTERED_PATIENTS[1]);
    component.leftPanelTab.set('records');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Diagnostic Lab & Medical Test Reports');
  });

  it('should filter patients on search query input', () => {
    component.onSearchInputChange('Robert');
    expect(component.searchResults().length).toBeGreaterThan(0);
    expect(component.searchResults()[0].name).toContain('Robert');
  });

  it('should open patient details modal on selection', () => {
    const patient = MOCK_REGISTERED_PATIENTS[0];
    component.openPatientDetailsModal(patient);
    expect(component.isPatientDetailsModalOpen()).toBe(true);
    expect(component.activePatientDetails()?.id).toBe(patient.id);
  });

  it('should open and close the prescribe medications modal', () => {
    component.selectPatient(MOCK_REGISTERED_PATIENTS[0]);
    component.openPrescribeModal();
    expect(component.isPrescribeModalOpen()).toBe(true);
    expect(component.prescribedMedicines().length).toBe(0);

    component.closePrescribeModal();
    expect(component.isPrescribeModalOpen()).toBe(false);
  });

  it('should search and filter medicine catalog', () => {
    component.medicineSearchQuery.set('Augmentin');
    const filtered = component.filteredMasterMedicines();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].name).toContain('Augmentin');
  });

  it('should strictly filter and rank medicines when searching letters like "h"', () => {
    component.medicineSearchQuery.set('h');
    const filtered = component.filteredMasterMedicines();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered[0].name.toLowerCase().startsWith('h')).toBe(true);

    const names = filtered.map(m => m.name);
    expect(names).not.toContain('Telma 40');
    expect(names).not.toContain('Dolo 650');
    expect(names).not.toContain('Pan-D (Pantoprazole + Domperidone)');
  });

  it('should select medicine and auto-populate dosage and directions to use', () => {
    component.selectPatient(MOCK_REGISTERED_PATIENTS[0]);
    component.openPrescribeModal();
    const med = component.medicineCatalog()[0]; // Dolo 650
    component.selectMasterMedicine(med);

    expect(component.selectedMasterMedicine()?.name).toBe(med.name);
    expect(component.medDosage()).toBe(med.defaultDosage);
    expect(component.medReason()).toBe(med.defaultInstructions || med.defaultReason);
  });

  it('should add multiple medicines to prescription pad and allow removal', () => {
    component.selectPatient(MOCK_REGISTERED_PATIENTS[0]);
    component.openPrescribeModal();

    // 1. Add first medicine
    const med1 = component.medicineCatalog()[0]; // Dolo 650
    component.selectMasterMedicine(med1);
    component.addMedicineToPrescription();

    expect(component.prescribedMedicines().length).toBe(1);
    expect(component.prescribedMedicines()[0].name).toBe(med1.name);
    expect(component.selectedMasterMedicine()).toBeNull(); // reset for next med

    // 2. Add second medicine
    const med2 = component.medicineCatalog()[1]; // Augmentin 625
    component.selectMasterMedicine(med2);
    component.medReason.set('For bacterial sinus infection');
    component.addMedicineToPrescription();

    expect(component.prescribedMedicines().length).toBe(2);
    expect(component.prescribedMedicines()[1].name).toBe(med2.name);
    expect(component.prescribedMedicines()[1].reason).toBe('For bacterial sinus infection');

    // 3. Remove first medicine
    component.removePrescribedMedicine(0);
    expect(component.prescribedMedicines().length).toBe(1);
    expect(component.prescribedMedicines()[0].name).toBe(med2.name);
  });

  it('should save prescription, update patient records, and close modal when clicking Done', () => {
    component.selectPatient(MOCK_REGISTERED_PATIENTS[0]);
    component.openPrescribeModal();
    const med = component.medicineCatalog()[0];
    component.selectMasterMedicine(med);
    component.addMedicineToPrescription();

    const previousVisitsCount = component.activePatient()?.previousVisits?.length || 0;
    const previousMedicationsCount = component.activePatient()?.currentMedications?.length || 0;

    component.onSavePrescriptionAndDone();

    expect(component.isPrescribeModalOpen()).toBe(false);
    expect(component.leftPanelTab()).toBe('prescriptions');
    expect(component.activePatient()?.previousVisits?.length).toBe(previousVisitsCount + 1);
    expect(component.activePatient()?.currentMedications?.length).toBe(previousMedicationsCount + 1);
    expect(component.activePatient()?.previousVisits?.[0]?.prescription?.medicines[0].name).toBe(med.name);
  });

  it('should support pagination across all tables in Doctor portal', () => {
    // 1. Check Allergies table pagination signals
    expect(component.activeAllergiesPage()).toBe(1);
    expect(component.totalActiveAllergiesPages()).toBeGreaterThanOrEqual(1);
    expect(component.paginatedActiveAllergies().length).toBeLessThanOrEqual(5);

    // 2. Check Chronics table pagination signals
    expect(component.activeChronicsPage()).toBe(1);
    expect(component.totalActiveChronicsPages()).toBeGreaterThanOrEqual(1);
    expect(component.paginatedActiveChronics().length).toBeLessThanOrEqual(5);

    // 3. Check Medications table pagination signals
    expect(component.activeMedicationsPage()).toBe(1);
    expect(component.totalActiveMedicationsPages()).toBeGreaterThanOrEqual(1);
    expect(component.paginatedActiveMedications().length).toBeLessThanOrEqual(5);

    // 4. Check Prescriptions table pagination signals
    expect(component.activePrescriptionsPage()).toBe(1);
    expect(component.totalActivePrescriptionsPages()).toBeGreaterThanOrEqual(1);
    expect(component.paginatedActivePrescriptions().length).toBeLessThanOrEqual(5);

    // 5. Check Health Records table pagination signals
    expect(component.activeRecordsPage()).toBe(1);
    expect(component.totalActiveRecordsPages()).toBeGreaterThanOrEqual(1);
    expect(component.paginatedActiveRecords().length).toBeLessThanOrEqual(5);

    // 6. Test modal table pagination signals
    const patient = component.patients()[0];
    component.openPatientDetailsModal(patient);
    expect(component.modalVitalsPage()).toBe(1);
    expect(component.modalAllergiesPage()).toBe(1);
    expect(component.modalChronicsPage()).toBe(1);
    expect(component.modalMedicationsPage()).toBe(1);
    expect(component.modalVisitsPage()).toBe(1);
    expect(component.modalRecordsPage()).toBe(1);
  });
});
