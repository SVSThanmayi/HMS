import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogModalComponent } from './confirm-dialog-modal.component';
import { ModalService } from '../../../core/services/modal.service';

describe('ConfirmDialogModalComponent', () => {
  let component: ConfirmDialogModalComponent;
  let fixture: ComponentFixture<ConfirmDialogModalComponent>;
  let modalService: ModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogModalComponent],
      providers: [ModalService]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogModalComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render dialog content when activeConfirmDialog is set', () => {
    modalService.confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      type: 'danger',
      onConfirm: () => {}
    });
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Delete Item');
    expect(el.textContent).toContain('Are you sure you want to delete this item?');
  });

  it('should call onConfirm when confirmed', () => {
    let confirmed = false;
    modalService.confirm({
      title: 'Action Confirmation',
      message: 'Proceed with this critical operation?',
      onConfirm: () => {
        confirmed = true;
      }
    });

    modalService.resolveConfirm();
    expect(confirmed).toBe(true);
    expect(modalService.activeConfirmDialog()).toBeNull();
  });

  it('should call onCancel when dismissed', () => {
    let cancelled = false;
    modalService.confirm({
      title: 'Cancel Action',
      message: 'Cancel confirmation test',
      onConfirm: () => {},
      onCancel: () => {
        cancelled = true;
      }
    });

    modalService.dismissConfirm();
    expect(cancelled).toBe(true);
    expect(modalService.activeConfirmDialog()).toBeNull();
  });
});
