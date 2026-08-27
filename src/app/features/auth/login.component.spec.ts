import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { ModalService } from '../../core/services/modal.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        AuthService,
        ModalService,
        provideRouter([
          { path: 'receptionist', children: [] },
          { path: 'nurse', children: [] },
          { path: 'doctor', children: [] },
          { path: 'pharmacist', children: [] },
          { path: 'patient-portal', children: [] }
        ])
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should populate receptionist dummy data when fillReceptionistCredentials is called', () => {
    component.fillReceptionistCredentials();
    expect(component.loginForm.value.identifier).toBe('receptionist@hms-hospital.org');
    expect(component.loginForm.value.password).toBe('Receptionist@123');
    expect(component.loginForm.valid).toBe(true);
  });

  it('should populate patient dummy data when fillPatientCredentials is called', () => {
    component.fillPatientCredentials();
    expect(component.loginForm.value.identifier).toBe('eleanor.vance@example.com');
    expect(component.loginForm.value.password).toBe('Patient@123');
    expect(component.loginForm.valid).toBe(true);
  });

  it('should populate doctor dummy data when fillDoctorCredentials is called', () => {
    component.fillDoctorCredentials();
    expect(component.loginForm.value.identifier).toBe('doctor@hms-hospital.org');
    expect(component.loginForm.value.password).toBe('Doctor@123');
    expect(component.loginForm.valid).toBe(true);
  });

  it('should populate nurse dummy data when fillNurseCredentials is called', () => {
    component.fillNurseCredentials();
    expect(component.loginForm.value.identifier).toBe('nurse@hms-hospital.org');
    expect(component.loginForm.value.password).toBe('Nurse@123');
    expect(component.loginForm.valid).toBe(true);
  });

  it('should populate pharmacist dummy data when fillPharmacistCredentials is called', () => {
    component.fillPharmacistCredentials();
    expect(component.loginForm.value.identifier).toBe('pharmacist@hms-hospital.org');
    expect(component.loginForm.value.password).toBe('Pharmacist@123');
    expect(component.loginForm.valid).toBe(true);
  });

  it('should navigate to /patient-portal on submit with patient credentials', async () => {
    vi.useFakeTimers();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.fillPatientCredentials();
    component.onLoginSubmit();
    vi.advanceTimersByTime(800);
    expect(navigateSpy).toHaveBeenCalledWith(['/patient-portal']);
    expect(authService.isLoggedIn()).toBe(true);
    expect(authService.isDoctor()).toBe(false);
    expect(authService.isReceptionist()).toBe(false);
    expect(authService.isNurse()).toBe(false);
    expect(authService.isPharmacist()).toBe(false);
    vi.useRealTimers();
  });

  it('should authenticate doctor and navigate to /doctor on submit with doctor credentials', async () => {
    vi.useFakeTimers();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.fillDoctorCredentials();
    component.onLoginSubmit();
    vi.advanceTimersByTime(800);
    expect(navigateSpy).toHaveBeenCalledWith(['/doctor']);
    expect(authService.isLoggedIn()).toBe(true);
    expect(authService.isDoctor()).toBe(true);
    expect(authService.isReceptionist()).toBe(false);
    expect(authService.isNurse()).toBe(false);
    expect(authService.isPharmacist()).toBe(false);
    vi.useRealTimers();
  });

  it('should navigate to /receptionist on submit with receptionist credentials', async () => {
    vi.useFakeTimers();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.fillReceptionistCredentials();
    component.onLoginSubmit();
    vi.advanceTimersByTime(800);
    expect(navigateSpy).toHaveBeenCalledWith(['/receptionist']);
    expect(authService.isReceptionist()).toBe(true);
    expect(authService.isDoctor()).toBe(false);
    expect(authService.isNurse()).toBe(false);
    expect(authService.isPharmacist()).toBe(false);
    vi.useRealTimers();
  });

  it('should navigate to /nurse on submit with nurse credentials', async () => {
    vi.useFakeTimers();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.fillNurseCredentials();
    component.onLoginSubmit();
    vi.advanceTimersByTime(800);
    expect(navigateSpy).toHaveBeenCalledWith(['/nurse']);
    expect(authService.isNurse()).toBe(true);
    expect(authService.isDoctor()).toBe(false);
    expect(authService.isPharmacist()).toBe(false);
    vi.useRealTimers();
  });

  it('should navigate to /pharmacist on submit with pharmacist credentials', async () => {
    vi.useFakeTimers();
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.fillPharmacistCredentials();
    component.onLoginSubmit();
    vi.advanceTimersByTime(800);
    expect(navigateSpy).toHaveBeenCalledWith(['/pharmacist']);
    expect(authService.isPharmacist()).toBe(true);
    expect(authService.isDoctor()).toBe(false);
    expect(authService.isNurse()).toBe(false);
    expect(authService.isReceptionist()).toBe(false);
    vi.useRealTimers();
  });
});
