import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookAppointmentComponent } from './book-appointment.component';

describe('BookAppointmentComponent', () => {
  let component: BookAppointmentComponent;
  let fixture: ComponentFixture<BookAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookAppointmentComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(BookAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the list of doctors', () => {
    expect(component.doctorsList.length).toBeGreaterThan(0);
    expect(component.filteredDoctors().length).toBe(component.doctorsList.length);
  });

  it('should filter doctors by specialty', () => {
    component.toggleSpecialty('ENT');
    fixture.detectChanges();
    const entDoctors = component.filteredDoctors();
    expect(entDoctors.every(d => d.specialty.toLowerCase().includes('ent'))).toBe(true);
  });

  it('should filter doctors by search query', () => {
    component.doctorSearchQuery.set('Chen');
    fixture.detectChanges();
    const results = component.filteredDoctors();
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain('Chen');
  });

  it('should clear all filters on clearAllFilters()', () => {
    component.toggleSpecialty('Cardiology');
    component.toggleGender('Female');
    component.doctorSearchQuery.set('Sarah');
    expect(component.hasActiveFilters()).toBe(true);

    component.clearAllFilters();
    expect(component.selectedSpecialties().length).toBe(0);
    expect(component.selectedGenders().length).toBe(0);
    expect(component.doctorSearchQuery()).toBe('');
    expect(component.hasActiveFilters()).toBe(false);
  });

  it('should open time slot modal on bookDoctor() and close on closeBookingModal()', () => {
    const doc = component.doctorsList[0];
    expect(component.selectedDoctorForSlot()).toBeNull();

    component.bookDoctor(doc);
    expect(component.selectedDoctorForSlot()).toEqual(doc);
    expect(component.selectedTimeSlot()).toBe('09:00 AM - 10:00 AM');
    expect(component.selectedDateIndex()).toBe(0);

    component.closeBookingModal();
    expect(component.selectedDoctorForSlot()).toBeNull();
  });

  it('should select different date and time slot in modal', () => {
    const doc = component.doctorsList[1];
    component.bookDoctor(doc);

    component.selectedDateIndex.set(2);
    component.selectedTimeSlot.set('02:00 PM - 03:00 PM');

    expect(component.selectedDateIndex()).toBe(2);
    expect(component.selectedTimeSlot()).toBe('02:00 PM - 03:00 PM');
  });
});
