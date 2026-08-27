import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate initials for "Jane Doe" as "JD"', () => {
    component.name = 'Jane Doe';
    fixture.detectChanges();
    expect(component.initials()).toBe('JD');
  });

  it('should calculate initials for doctor "Dr. Sarah Jenkins" as "SJ"', () => {
    component.name = 'Dr. Sarah Jenkins';
    fixture.detectChanges();
    expect(component.initials()).toBe('SJ');
  });

  it('should calculate initials for "Dr. Sarah jenkins, MD" as "SJ"', () => {
    component.name = 'Dr. Sarah jenkins, MD';
    fixture.detectChanges();
    expect(component.initials()).toBe('SJ');
  });

  it('should calculate initials for "Prof. Marcus Brody, PhD" as "MB"', () => {
    component.name = 'Prof. Marcus Brody, PhD';
    fixture.detectChanges();
    expect(component.initials()).toBe('MB');
  });

  it('should fallback to initials on image error', () => {
    component.name = 'Jane Doe';
    component.src = 'invalid-image-url.png';
    fixture.detectChanges();
    
    // Trigger error
    component.onImageError();
    fixture.detectChanges();

    expect(component.hasError()).toBe(true);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('JD');
  });
});
