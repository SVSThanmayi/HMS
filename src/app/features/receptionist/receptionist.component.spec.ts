import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ReceptionistComponent } from './receptionist.component';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';

describe('ReceptionistComponent', () => {
  let component: ReceptionistComponent;
  let fixture: ComponentFixture<ReceptionistComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceptionistComponent],
      providers: [
        AuthService,
        ModalService,
        provideRouter([{ path: 'login', component: ReceptionistComponent }])
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    authService.login('receptionist@hms-hospital.org', 'Sarah Jenkins', 'receptionist');
    fixture = TestBed.createComponent(ReceptionistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the receptionist component', () => {
    expect(component).toBeTruthy();
  });

  it('should render Receptionist header title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector('h1');
    expect(titleElement?.textContent).toContain('Receptionist');
  });

  it('should search existing patient by name or phone and return only matching patients', () => {
    // Single letter search: 'e' should only match Eleanor Vance (starts with E), not Robert or Grace
    component.onSearchInputChange('e');
    expect(component.searchResults().length).toBe(1);
    expect(component.searchResults()[0].name).toBe('Eleanor Vance');

    component.onSearchInputChange('Eleanor');
    expect(component.searchResults().length).toBe(1);
    expect(component.searchResults()[0].name).toBe('Eleanor Vance');

    component.onSearchInputChange('98765');
    expect(component.searchResults().length).toBe(1);
    expect(component.searchResults()[0].name).toBe('Eleanor Vance');

    component.onSearchInputChange('NonExistentPerson');
    expect(component.searchResults().length).toBe(0);

    // Selecting a patient from dropdown opens details and resets search
    component.onSearchInputChange('Eleanor');
    const matched = component.searchResults()[0];
    component.selectSearchResultPatient(matched);
    expect(component.isPatientDetailsModalOpen()).toBe(true);
    expect(component.activePatientDetails()?.name).toBe('Eleanor Vance');
    expect(component.searchQuery()).toBe('');
    expect(component.searchResults().length).toBe(0);
  });

  it('should support standalone Create Account modal without booking slot', () => {
    const initialPatientCount = component.patients().length;
    const initialQueueCount = component.tokens().length;

    component.openCreateAccountModal('Nikola Tesla');
    expect(component.isCreateAccountModalOpen()).toBe(true);

    component.patientForm.setValue({
      name: 'Nikola Tesla',
      phone: '+91 98765 11223',
      email: 'nikola.tesla@example.com',
      address: 'Ward 4, Bengaluru',
      emergencyContact: '+91 98450 99887',
      age: 50,
      gender: 'Male',
      bloodGroup: 'O+ Positive'
    });

    component.submitCreateAccount();
    expect(component.isCreateAccountModalOpen()).toBe(false);
    expect(component.patients().length).toBe(initialPatientCount + 1);
    expect(component.patients()[0].name).toBe('Nikola Tesla');
    // Queue count unchanged (no appointment booked)
    expect(component.tokens().length).toBe(initialQueueCount);
  });

  it('should create a new patient profile and book slot through 3-step wizard', () => {
    const initialPatientCount = component.patients().length;
    const initialQueueCount = component.tokens().length;

    component.openCreatePatientModal('Marie Curie');
    expect(component.isCreatePatientModalOpen()).toBe(true);
    expect(component.registrationStep()).toBe(1);

    component.patientForm.setValue({
      name: 'Marie Curie',
      phone: '+91 98765 77799',
      email: 'marie.curie@example.com',
      address: 'Flat 101, Science Park, Bengaluru',
      emergencyContact: '+91 98450 12345 (Pierre Curie)',
      age: 45,
      gender: 'Female',
      bloodGroup: 'AB+ Positive'
    });

    // Step 1 -> Step 2
    component.proceedToBookingStep();
    expect(component.registrationStep()).toBe(2);

    component.onRegistrationDoctorChange('DOC-2');
    component.selectRegistrationDate('Monday Aug 24, 2026');
    component.registrationSlot.set('10:00 AM - 11:00 AM');

    // Step 2 -> Step 3 (Confirmation)
    component.confirmRegistrationAndBooking();
    expect(component.registrationStep()).toBe(3);
    expect(component.patients().length).toBe(initialPatientCount + 1);
    expect(component.patients()[0].name).toBe('Marie Curie');
    expect(component.tokens().length).toBe(initialQueueCount + 1);
    expect(component.bookedTokenResult()).toBeTruthy();
    expect(component.bookedTokenResult()?.patientName).toBe('Marie Curie');

    // Finish flow
    component.finishRegistrationFlow();
    expect(component.isCreatePatientModalOpen()).toBe(false);
    expect(component.registrationStep()).toBe(1);
  });

  it('should open 3-step registration modal from callback item and resolve on complete', () => {
    const cb = component.callbackRequests().find(c => c.status === 'Pending')!;
    component.openRegisterModalFromCallback(cb);
    expect(component.isCreatePatientModalOpen()).toBe(true);
    expect(component.registrationStep()).toBe(1);
    expect(component.patientForm.value.name).toBe(cb.name);

    component.proceedToBookingStep();
    expect(component.registrationStep()).toBe(2);

    component.confirmRegistrationAndBooking();
    expect(component.registrationStep()).toBe(3);
    expect(component.callbackRequests().find(c => c.id === cb.id)?.status).toBe('Resolved');
  });

  it('should confirm online appointment, removing it from online appointments and adding token to queue', () => {
    const initialQueueCount = component.tokens().length;
    const initialOnlineCount = component.onlineAppointments().length;
    const onlineReq = component.onlineAppointments()[0];

    component.confirmOnlineAppointment(onlineReq);

    // Removed from online appointments
    expect(component.onlineAppointments().find(a => a.id === onlineReq.id)).toBeUndefined();
    expect(component.onlineAppointments().length).toBe(initialOnlineCount - 1);

    // Also added to patients queue
    expect(component.tokens().length).toBe(initialQueueCount + 1);
    const addedToken = component.tokens().find(t => t.patientName === onlineReq.patientName);
    expect(addedToken).toBeTruthy();
    expect(addedToken?.type).toBe('Online Appointment');
  });

  it('should format slot with date on top and time below it', () => {
    const req = component.onlineAppointments()[0];
    expect(component.getSlotDate(req)).toBe('Today');
    expect(component.getSlotTime(req)).toBe('10:30 AM');

    const customReq = {
      ...req,
      date: 'Aug 25, 2026, 03:30 PM',
      timeSlot: '03:30 PM'
    };
    expect(component.getSlotDate(customReq)).toBe('Aug 25, 2026');
    expect(component.getSlotTime(customReq)).toBe('03:30 PM');
  });

  it('should cancel online appointment with specified reason or custom Other reason', () => {
    const onlineReq = component.onlineAppointments()[0];
    component.activeCancelTarget.set(onlineReq);
    component.cancelReasonSelection = 'Patient requested cancellation';

    component.confirmCancelAppointment();

    const updated = component.onlineAppointments().find(a => a.id === onlineReq.id);
    expect(updated?.status).toBe('Cancelled');
    expect(updated?.cancelReason).toBe('Patient requested cancellation');

    // Test with 'Other' custom reason
    const onlineReq2 = component.onlineAppointments()[1];
    component.openCancelModal(onlineReq2);
    expect(component.isCancelModalOpen()).toBe(true);
    component.cancelReasonSelection = 'Other';
    component.customCancelReason = 'Equipment maintenance in OPD room';
    component.confirmCancelAppointment();

    const updated2 = component.onlineAppointments().find(a => a.id === onlineReq2.id);
    expect(updated2?.status).toBe('Cancelled');
    expect(updated2?.cancelReason).toBe('Equipment maintenance in OPD room');
  });

  it('should process callback booking, generate token, and mark callback as resolved', () => {
    const initialQueueCount = component.tokens().length;
    const callback = component.callbackRequests()[0];

    component.processCallbackBooking(callback);
    expect(component.isBookModalOpen()).toBe(true);

    component.onBookAppointmentSubmit();

    expect(component.tokens().length).toBe(initialQueueCount + 1);
    expect(component.callbackRequests().find(c => c.id === callback.id)?.status).toBe('Resolved');
  });

  it('should extract day and time and determine patient type for callback items', () => {
    const cb1 = component.callbackRequests()[0];
    expect(component.getCallbackDay(cb1)).toBe('Today');
    expect(component.getCallbackTime(cb1)).toBe('02:30 PM');
    expect(component.getCallbackPatientType(cb1)).toBe('New Patient');

    const cb2 = component.callbackRequests()[1];
    expect(component.getCallbackDay(cb2)).toBe('Today');
    expect(component.getCallbackTime(cb2)).toBe('02:00 PM');
    expect(component.getCallbackPatientType(cb2)).toBe('Old Patient');
  });

  it('should open Book Slot modal from callback request and confirm booking with token and resolved callback', () => {
    const initialQueueCount = component.tokens().length;
    const cb = component.callbackRequests()[0];

    component.openCallbackBookingModal(cb);
    expect(component.isSlotBookingModalOpen()).toBe(true);
    expect(component.slotBookingStep()).toBe(1);
    expect(component.slotBookingModalTitle()).toBe('Book Slot');
    expect(component.activeCallbackTarget()).toEqual(cb);

    component.confirmSlotBooking();
    expect(component.slotBookingStep()).toBe(2);
    expect(component.tokens().length).toBe(initialQueueCount + 1);

    const newestToken = component.tokens()[component.tokens().length - 1];
    expect(newestToken.patientName).toBe(cb.name);
    expect(newestToken.type).toBe('Phone Callback');
    expect(component.callbackRequests().find(c => c.id === cb.id)?.status).toBe('Resolved');
  });

  it('should advance token to In Consultation and complete consultation removing it from queue', () => {
    const initialQueue = component.tokens();
    const waitingToken = initialQueue.find(t => t.status === 'Waiting');
    expect(waitingToken).toBeTruthy();

    if (waitingToken) {
      component.advanceToken(waitingToken);
      expect(component.tokens().find(t => t.tokenNumber === waitingToken.tokenNumber)?.status).toBe('In Consultation');

      const countBeforeComplete = component.tokens().length;
      component.completeToken(waitingToken);
      expect(component.tokens().length).toBe(countBeforeComplete - 1);
      expect(component.tokens().some(t => t.tokenNumber === waitingToken.tokenNumber)).toBe(false);
    }
  });

  it('should open patient 360 details modal with complete personal, clinical, medications, visits, and records data', () => {
    const patient = component.patients()[0];
    component.openPatientDetailsModal(patient);

    expect(component.isPatientDetailsModalOpen()).toBe(true);
    expect(component.activePatientDetails()).toEqual(patient);
    expect(component.patientDetailsTab()).toBe('personal');

    // Test sub-tab switching
    component.patientDetailsTab.set('clinical');
    expect(component.patientDetailsTab()).toBe('clinical');

    component.patientDetailsTab.set('medications');
    expect(component.patientDetailsTab()).toBe('medications');
    expect(component.activePatientDetails()?.currentMedications.length).toBeGreaterThan(0);

    component.patientDetailsTab.set('visits');
    expect(component.patientDetailsTab()).toBe('visits');
    expect(component.activePatientDetails()?.previousVisits.length).toBeGreaterThan(0);

    component.patientDetailsTab.set('records');
    expect(component.patientDetailsTab()).toBe('records');
    expect(component.activePatientDetails()?.healthRecords.length).toBeGreaterThan(0);
  });

  it('should open and close visit prescription modal, visit receipt modal, and lab receipt modal', () => {
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

  it('should support drag and drop queue reordering', () => {
    const initialFirstToken = component.tokens()[0].tokenNumber;
    const initialLastToken = component.tokens()[component.tokens().length - 1].tokenNumber;
    const lastIdx = component.tokens().length - 1;

    // Simulate drag start on last item
    const mockDragStartEvent = {
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn()
      }
    } as unknown as DragEvent;
    component.onQueueDragStart(lastIdx, mockDragStartEvent);
    expect(component.draggedQueueIndex()).toBe(lastIdx);

    // Simulate drag over on first item
    const mockDragOverEvent = {
      preventDefault: vi.fn(),
      dataTransfer: { dropEffect: '' }
    } as unknown as DragEvent;
    component.onQueueDragOver(0, mockDragOverEvent);
    expect(component.dragOverQueueIndex()).toBe(0);

    // Simulate drop on first item
    const mockDropEvent = {
      preventDefault: vi.fn()
    } as unknown as DragEvent;
    component.onQueueDrop(0, mockDropEvent);

    // The item from the bottom should now be at position 0
    expect(component.tokens()[0].tokenNumber).toBe(initialLastToken);
    expect(component.tokens()[1].tokenNumber).toBe(initialFirstToken);
    expect(component.draggedQueueIndex()).toBeNull();
    expect(component.dragOverQueueIndex()).toBeNull();
  });

  it('should open Add Patient search modal, filter patients, and display matches or no results found', () => {
    component.openAddPatientSearchModal();
    expect(component.isAddPatientSearchModalOpen()).toBe(true);
    expect(component.addPatientSearchQuery()).toBe('');
    expect(component.addPatientSearchResults().length).toBe(0);

    // Search for existing patient
    const mockInputEvent = {
      target: { value: 'Eleanor' }
    } as unknown as Event;
    component.onAddPatientSearchInput(mockInputEvent);
    expect(component.addPatientSearchQuery()).toBe('Eleanor');
    expect(component.addPatientSearchResults().length).toBe(1);
    expect(component.addPatientSearchResults()[0].name).toBe('Eleanor Vance');

    // Search for non-existent patient
    const mockInputEvent2 = {
      target: { value: 'Unknown Person' }
    } as unknown as Event;
    component.onAddPatientSearchInput(mockInputEvent2);
    expect(component.addPatientSearchQuery()).toBe('Unknown Person');
    expect(component.addPatientSearchResults().length).toBe(0);

    // Clear search
    component.clearAddPatientSearch();
    expect(component.addPatientSearchQuery()).toBe('');
    expect(component.addPatientSearchResults().length).toBe(0);
  });

  it('should open 3-step registration wizard when clicking Register from Add Patient search popup', () => {
    component.openAddPatientSearchModal();
    const mockInputEvent = {
      target: { value: 'James Maxwell' }
    } as unknown as Event;
    component.onAddPatientSearchInput(mockInputEvent);
    expect(component.addPatientSearchResults().length).toBe(0);

    component.openRegisterFromSearch();
    expect(component.isAddPatientSearchModalOpen()).toBe(false);
    expect(component.isCreatePatientModalOpen()).toBe(true);
    expect(component.registrationStep()).toBe(1);
    expect(component.patientForm.get('name')?.value).toBe('James Maxwell');

    // Step 1 -> Step 2
    component.proceedToBookingStep();
    expect(component.registrationStep()).toBe(2);

    // Step 2 -> Step 3 (Confirm & Book Slot)
    const initialQueueCount = component.tokens().length;
    component.confirmRegistrationAndBooking();
    expect(component.registrationStep()).toBe(3);
    expect(component.tokens().length).toBe(initialQueueCount + 1);
    expect(component.bookedTokenResult()?.patientName).toBe('James Maxwell');

    // Finish
    component.finishRegistrationFlow();
    expect(component.isCreatePatientModalOpen()).toBe(false);
    expect(component.activeTab()).toBe('queue');
  });

  it('should open 2-step slot booking modal for found patient, allow selecting doctor/date/time, and add token on confirm', () => {
    const initialQueueCount = component.tokens().length;
    const patient = component.patients()[0];

    component.openSlotBookingForPatient(patient);
    expect(component.isSlotBookingModalOpen()).toBe(true);
    expect(component.slotBookingStep()).toBe(1);
    expect(component.activeBookingPatient()).toEqual(patient);

    component.selectedBookingDoctorId.set('DOC-2');
    component.selectedBookingDate.set('Monday Aug 24, 2026');
    component.selectedBookingTimeSlot.set('08:00 AM - 09:00 AM');

    component.confirmSlotBooking();
    expect(component.slotBookingStep()).toBe(2);
    expect(component.tokens().length).toBe(initialQueueCount + 1);

    const newestToken = component.tokens()[component.tokens().length - 1];
    expect(newestToken.patientName).toBe(patient.name);
    expect(newestToken.patientId).toBe(patient.id);
    expect(newestToken.doctorName).toBe('Dr. Clara Reynolds, MD');
    expect(newestToken.time).toBe('08:00 AM');
    expect(newestToken.status).toBe('Waiting');
  });

  it('should open Reassign popup for queue token, allow changing doctor/date/slot, and reassign token in queue', () => {
    const queueToken = component.tokens()[0];
    const originalDocName = queueToken.doctorName;
    component.openReassignTokenModal(queueToken);
    expect(component.isRescheduleModalOpen()).toBe(true);
    expect(component.activeReassignToken()).toEqual(queueToken);

    // Pick Dr. Clara Reynolds (DOC-2)
    component.rescheduleDoctorId = 'DOC-2';
    component.rescheduleDate = 'Tuesday Aug 25, 2026';
    component.rescheduleSlot = '08:00 AM - 09:00 AM';

    component.confirmReschedule();
    expect(component.isRescheduleModalOpen()).toBe(false);

    const updated = component.tokens().find(t => t.tokenNumber === queueToken.tokenNumber);
    expect(updated?.doctorName).toBe('Dr. Clara Reynolds, MD');
    expect(updated?.department).toBe('Neurology');
    expect(updated?.room).toBe('OPD Room 104');
    expect(updated?.time).toBe('08:00 AM');
  });

  it('should correctly determine date and time slot availability and badges', () => {
    // Book Slot dates are all available (unshaded)
    expect(component.bookingDateOptions.every(d => d.isAvailable)).toBe(true);

    // In Move Slot (reschedule), Friday, Saturday, Sunday, and Wednesday are disabled
    expect(component.isDateAvailable('Friday Aug 21, 2026', true)).toBe(false);
    expect(component.isDateAvailable('Saturday Aug 22, 2026', true)).toBe(false);
    expect(component.isDateAvailable('Sunday Aug 23, 2026', true)).toBe(false);
    expect(component.isDateAvailable('Wednesday Aug 26, 2026', true)).toBe(false);
    expect(component.isDateAvailable('Monday Aug 24, 2026', true)).toBe(true);
    expect(component.isDateAvailable('Tuesday Aug 25, 2026', true)).toBe(true);

    // Lunch break and early morning are unavailable
    expect(component.isTimeSlotAvailable('06:00 AM - 07:00 AM', 'Monday Aug 24, 2026')).toBe(false);
    expect(component.isTimeSlotAvailable('01:00 PM - 02:00 PM', 'Monday Aug 24, 2026')).toBe(false);

    // Available and booked slots for specific dates
    expect(component.isTimeSlotAvailable('09:00 AM - 10:00 AM', 'Monday Aug 24, 2026')).toBe(false);
    expect(component.isTimeSlotAvailable('08:00 AM - 09:00 AM', 'Monday Aug 24, 2026')).toBe(true);

    // Selecting an available date updates date and preserves/adjusts slot
    component.selectRescheduleDate('Tuesday Aug 25, 2026');
    expect(component.rescheduleDate).toBe('Tuesday Aug 25, 2026');

    // Attempting to select a disabled date is ignored
    component.selectRescheduleDate('Friday Aug 21, 2026');
    expect(component.rescheduleDate).toBe('Tuesday Aug 25, 2026');
  });

  it('should prompt confirmation dialog before logging out', () => {
    const modalService = TestBed.inject(ModalService);
    component.onLogout();

    const activeDialog = modalService.activeConfirmDialog();
    expect(activeDialog).toBeTruthy();
    expect(activeDialog?.title).toBe('Confirm Logout');
    expect(activeDialog?.type).toBe('danger');

    // Resolve confirmation
    modalService.resolveConfirm();
    expect(modalService.activeConfirmDialog()).toBeNull();
  });

  it('should render side slide menu and switch tabs on menu button clicks', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const aside = compiled.querySelector('aside');
    expect(aside).toBeTruthy();
    expect(aside?.classList.contains('group/sidebar')).toBe(true);

    const navButtons = aside?.querySelectorAll('nav button');
    expect(navButtons?.length).toBe(3);

    // Initial tab is queue
    expect(component.activeTab()).toBe('queue');

    // Click Online Appointments in side menu
    (navButtons?.[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.activeTab()).toBe('online');

    // Click Call Back Requests in side menu
    (navButtons?.[2] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.activeTab()).toBe('callbacks');

    // Click Patients Queue in side menu
    (navButtons?.[0] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(component.activeTab()).toBe('queue');
  });

  it('should filter queue table by token number, patient name, doctor, source type, and status', () => {
    // 1. Filter by Token
    component.filterToken.set('T-101');
    expect(component.filteredTokens().length).toBe(1);
    expect(component.filteredTokens()[0].tokenNumber).toBe('T-101');
    expect(component.hasActiveQueueFilters()).toBe(true);

    // 2. Filter by Patient name
    component.clearQueueFilters();
    expect(component.hasActiveQueueFilters()).toBe(false);
    // Single-letter search 'A': should match Alan Turing, Ada Lovelace, etc. but not Eleanor or Robert or Grace
    component.filterPatient.set('A');
    expect(component.filteredTokens().every(t => 
      t.patientName.toLowerCase().startsWith('a') || 
      t.patientName.toLowerCase().split(/\s+/).some(w => w.startsWith('a'))
    )).toBe(true);
    expect(component.filteredTokens().some(t => t.patientName === 'Alan Turing')).toBe(true);
    expect(component.filteredTokens().some(t => t.patientName === 'Ada Lovelace')).toBe(true);
    expect(component.filteredTokens().some(t => t.patientName === 'Robert Langdon')).toBe(false);
    expect(component.filteredTokens().some(t => t.patientName === 'Grace Hopper')).toBe(false);
    expect(component.filteredTokens().some(t => t.patientName === 'Eleanor Vance')).toBe(false);

    component.filterPatient.set('Grace');
    expect(component.filteredTokens().length).toBe(1);
    expect(component.filteredTokens()[0].patientName).toBe('Grace Hopper');

    // 3. Filter by Doctor
    component.clearQueueFilters();
    component.filterDoctor.set('Dr. Clara Reynolds');
    expect(component.filteredTokens().length).toBeGreaterThan(0);
    expect(component.filteredTokens().every(t => t.doctorName.includes('Dr. Clara Reynolds'))).toBe(true);

    // 4. Filter by Source Type
    component.clearQueueFilters();
    component.filterSourceType.set('Online Appointment');
    expect(component.filteredTokens().every(t => t.type === 'Online Appointment')).toBe(true);

    // 5. Filter by Status
    component.clearQueueFilters();
    component.filterStatus.set('Waiting');
    expect(component.filteredTokens().every(t => t.status === 'Waiting')).toBe(true);

    // 6. Reset filters
    component.clearQueueFilters();
    expect(component.filteredTokens().length).toBe(component.tokens().length);
  });

  it('should paginate queue table entries across pages and respond to page size changes', () => {
    // Total 13 tokens, default pageSize = 10 -> totalQueuePages = 2
    expect(component.queuePageSize()).toBe(10);
    expect(component.totalQueuePages()).toBe(2);
    expect(component.paginatedTokens().length).toBe(10);
    expect(component.paginatedTokens()[0].tokenNumber).toBe('T-101');

    // Move to page 2
    component.nextQueuePage();
    expect(component.queuePage()).toBe(2);
    expect(component.paginatedTokens().length).toBe(3);
    expect(component.paginatedTokens()[0].tokenNumber).toBe('T-111');

    // Move back to page 1
    component.prevQueuePage();
    expect(component.queuePage()).toBe(1);
    expect(component.paginatedTokens().length).toBe(10);

    // First and last page helpers
    component.lastQueuePage();
    expect(component.queuePage()).toBe(2);
    component.firstQueuePage();
    expect(component.queuePage()).toBe(1);

    // Change page size to 5
    component.onQueuePageSizeChange(5);
    expect(component.queuePageSize()).toBe(5);
    expect(component.totalQueuePages()).toBe(3);
    expect(component.paginatedTokens().length).toBe(5);

    // Change page size to 20
    component.onQueuePageSizeChange(20);
    expect(component.queuePageSize()).toBe(20);
    expect(component.totalQueuePages()).toBe(1);
    expect(component.paginatedTokens().length).toBe(13);
  });

  it('should paginate online appointments table and handle page size changes', () => {
    // Switch to online tab
    component.activeTab.set('online');
    fixture.detectChanges();

    expect(component.onlinePageSize()).toBe(10);
    expect(component.totalOnlinePages()).toBe(2);
    expect(component.paginatedOnlineAppointments().length).toBe(10);
    expect(component.paginatedOnlineAppointments()[0].id).toBe('ONL-101');

    // Page 2
    component.nextOnlinePage();
    expect(component.onlinePage()).toBe(2);
    expect(component.paginatedOnlineAppointments().length).toBe(3);
    expect(component.paginatedOnlineAppointments()[0].id).toBe('ONL-111');

    // Page 1
    component.prevOnlinePage();
    expect(component.onlinePage()).toBe(1);
    expect(component.paginatedOnlineAppointments().length).toBe(10);

    // Page size 5
    component.onOnlinePageSizeChange(5);
    expect(component.onlinePageSize()).toBe(5);
    expect(component.totalOnlinePages()).toBe(3);
    expect(component.paginatedOnlineAppointments().length).toBe(5);
  });

  it('should paginate callback requests table and handle page size changes', () => {
    // Switch to callbacks tab
    component.activeTab.set('callbacks');
    fixture.detectChanges();

    expect(component.callbackPageSize()).toBe(10);
    expect(component.totalCallbackPages()).toBe(2);
    expect(component.paginatedCallbackRequests().length).toBe(10);
    expect(component.paginatedCallbackRequests()[0].id).toBe('CB-213');

    // Page 2
    component.nextCallbackPage();
    expect(component.callbackPage()).toBe(2);
    expect(component.paginatedCallbackRequests().length).toBe(3);
    expect(component.paginatedCallbackRequests()[0].id).toBe('CB-203');

    // Page 1
    component.prevCallbackPage();
    expect(component.callbackPage()).toBe(1);
    expect(component.paginatedCallbackRequests().length).toBe(10);

    // Page size 5
    component.onCallbackPageSizeChange(5);
    expect(component.callbackPageSize()).toBe(5);
    expect(component.totalCallbackPages()).toBe(3);
    expect(component.paginatedCallbackRequests().length).toBe(5);
  });

  it('should paginate Patient 360 modal tables (medications, visits, records) and reset page on open', () => {
    const patient = component.patients()[0]; // Eleanor Vance
    component.openPatientDetailsModal(patient);
    fixture.detectChanges();

    expect(component.isPatientDetailsModalOpen()).toBe(true);
    expect(component.patientMedicationsPage()).toBe(1);
    expect(component.patientVisitsPage()).toBe(1);
    expect(component.patientRecordsPage()).toBe(1);

    // Verify medications pagination
    expect(component.paginatedPatientMedications().length).toBeGreaterThan(0);
    component.onPatientMedicationsPageSizeChange(1);
    expect(component.patientMedicationsPageSize()).toBe(1);
    expect(component.totalPatientMedicationsPages()).toBe(patient.currentMedications.length);
    component.nextPatientMedicationsPage();
    expect(component.patientMedicationsPage()).toBe(2);

    // Verify visits pagination
    component.onPatientVisitsPageSizeChange(1);
    expect(component.totalPatientVisitsPages()).toBe(patient.previousVisits.length);
    component.nextPatientVisitsPage();
    expect(component.patientVisitsPage()).toBe(2);

    // Verify records pagination
    component.onPatientRecordsPageSizeChange(1);
    expect(component.totalPatientRecordsPages()).toBe(patient.healthRecords.length);
    component.nextPatientRecordsPage();
    expect(component.patientRecordsPage()).toBe(2);

    // Reopening modal resets all pages to 1
    component.openPatientDetailsModal(patient);
    expect(component.patientMedicationsPage()).toBe(1);
    expect(component.patientVisitsPage()).toBe(1);
    expect(component.patientRecordsPage()).toBe(1);
  });
});
