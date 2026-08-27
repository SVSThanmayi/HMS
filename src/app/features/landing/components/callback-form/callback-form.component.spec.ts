import { TestBed } from '@angular/core/testing';
import { CallbackFormComponent } from './callback-form.component';
import { ModalService } from '../../../../core/services/modal.service';

describe('CallbackFormComponent', () => {
  let modalService: ModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallbackFormComponent],
      providers: [ModalService]
    }).compileComponents();

    modalService = TestBed.inject(ModalService);
  });

  it('should create the callback form component', () => {
    const fixture = TestBed.createComponent(CallbackFormComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should validate name and mobile number', () => {
    const fixture = TestBed.createComponent(CallbackFormComponent);
    const component = fixture.componentInstance;
    
    // Initially invalid
    expect(component.callbackForm.valid).toBe(false);

    // Set invalid phone
    component.callbackForm.patchValue({
      name: 'John Doe',
      mobile: '12345'
    });
    expect(component.callbackForm.valid).toBe(false);

    // Set valid phone
    component.callbackForm.patchValue({
      name: 'John Doe',
      mobile: '9876543210'
    });
    expect(component.callbackForm.valid).toBe(true);
  });

  it('should prompt confirmation dialog on valid submit', () => {
    const fixture = TestBed.createComponent(CallbackFormComponent);
    const component = fixture.componentInstance;

    component.callbackForm.patchValue({
      name: 'Robert Smith',
      mobile: '9876543210'
    });

    component.onSubmit();
    expect(modalService.activeConfirmDialog()).toBeTruthy();
    expect(modalService.activeConfirmDialog()?.title).toContain('Confirm Call Back Request');

    modalService.resolveConfirm();
  });
});
