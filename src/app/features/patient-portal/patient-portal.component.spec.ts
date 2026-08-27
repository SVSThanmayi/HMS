import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PatientPortalComponent } from './patient-portal.component';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';

describe('PatientPortalComponent', () => {
  let component: PatientPortalComponent;
  let fixture: ComponentFixture<PatientPortalComponent>;
  let authService: AuthService;
  let modalService: ModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientPortalComponent],
      providers: [
        provideRouter([]),
        AuthService,
        ModalService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientPortalComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    modalService = TestBed.inject(ModalService);
    
    // Simulate logged in patient
    authService.login('eleanor.vance@example.com', 'Eleanor Vance');
    fixture.detectChanges();
  });

  it('should create the patient portal component', () => {
    expect(component).toBeTruthy();
  });

  it('should default activeTab to my-dashboard', () => {
    expect(component.activeTab()).toBe('my-dashboard');
  });

  it('should update activeTab when selectTab is called', () => {
    component.selectTab('my-appointments');
    expect(component.activeTab()).toBe('my-appointments');

    component.selectTab('my-health-records');
    expect(component.activeTab()).toBe('my-health-records');
  });

  it('should toggle sidebar open state', () => {
    expect(component.isSidebarOpen()).toBe(false);
    component.toggleSidebar();
    expect(component.isSidebarOpen()).toBe(true);
    component.toggleSidebar();
    expect(component.isSidebarOpen()).toBe(false);
  });

  it('should switch dashboardSubTab correctly', () => {
    expect(component.dashboardSubTab()).toBe('personal');
    component.dashboardSubTab.set('medications');
    expect(component.dashboardSubTab()).toBe('medications');
    component.dashboardSubTab.set('clinical');
    expect(component.dashboardSubTab()).toBe('clinical');
  });

  it('should return correct description and badge for appointment status stages', () => {
    expect(component.getStatusDescription('Pending')).toContain('waiting for confirmation');
    expect(component.getStatusDescription('Confirmed')).toContain('accepted the appointment');
    expect(component.getStatusDescription('Cancelled')).toContain('cancelled by the patient or hospital');

    expect(component.getStatusBadgeClass('Pending')).toContain('amber');
    expect(component.getStatusBadgeClass('Confirmed')).toContain('emerald');
    expect(component.getStatusBadgeClass('Cancelled')).toContain('rose');
  });

  it('should prompt confirmation and cancel an appointment on confirm', () => {
    const targetApt = component.appointments()[0];
    component.cancelAppointment(targetApt.id);
    
    expect(modalService.activeConfirmDialog()).toBeTruthy();
    expect(modalService.activeConfirmDialog()?.title).toContain('Cancel');
    
    modalService.resolveConfirm();
    const updated = component.appointments().find(a => a.id === targetApt.id);
    expect(updated?.status).toBe('Cancelled');
  });

  it('should paginate dashboard current medications and handle page changes', () => {
    expect(component.dashboardMedicationPage()).toBe(1);
    expect(component.dashboardMedicationPageSize()).toBe(10);
    expect(component.paginatedPrescriptions().length).toBeGreaterThan(0);

    component.onDashboardMedicationPageSizeChange(1);
    expect(component.dashboardMedicationPageSize()).toBe(1);
    expect(component.totalDashboardMedicationPages()).toBe(component.prescriptions().length);

    component.nextDashboardMedicationPage();
    expect(component.dashboardMedicationPage()).toBe(2);
    component.prevDashboardMedicationPage();
    expect(component.dashboardMedicationPage()).toBe(1);

    component.lastDashboardMedicationPage();
    expect(component.dashboardMedicationPage()).toBe(component.prescriptions().length);
    component.firstDashboardMedicationPage();
    expect(component.dashboardMedicationPage()).toBe(1);
  });

  it('should paginate appointments and lab reports with referral paginator controls', () => {
    // Appointments pagination
    expect(component.appointmentPage()).toBe(1);
    expect(component.appointmentPageSize()).toBe(10);
    component.onAppointmentPageSizeChange(2);
    expect(component.appointmentPageSize()).toBe(2);
    expect(component.totalAppointmentPages()).toBe(Math.ceil(component.sortedAppointments().length / 2));
    component.nextAppointmentPage();
    expect(component.appointmentPage()).toBe(2);
    component.firstAppointmentPage();
    expect(component.appointmentPage()).toBe(1);

    // Lab Reports pagination
    expect(component.labReportPage()).toBe(1);
    expect(component.labReportPageSize()).toBe(10);
    component.onLabReportPageSizeChange(2);
    expect(component.labReportPageSize()).toBe(2);
    expect(component.totalLabReportPages()).toBe(Math.ceil(component.sortedLabReports().length / 2));
    component.nextLabReportPage();
    expect(component.labReportPage()).toBe(2);
    component.firstLabReportPage();
    expect(component.labReportPage()).toBe(1);
  });
});
