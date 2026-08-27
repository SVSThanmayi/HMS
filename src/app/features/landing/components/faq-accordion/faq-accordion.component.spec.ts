import { TestBed } from '@angular/core/testing';
import { FaqAccordionComponent } from './faq-accordion.component';

describe('FaqAccordionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqAccordionComponent]
    }).compileComponents();
  });

  it('should create the FAQ accordion component', () => {
    const fixture = TestBed.createComponent(FaqAccordionComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should have 6 default required questions', () => {
    const fixture = TestBed.createComponent(FaqAccordionComponent);
    const component = fixture.componentInstance;
    expect(component.faqs.length).toBe(6);
  });

  it('should toggle accordion items', () => {
    const fixture = TestBed.createComponent(FaqAccordionComponent);
    const component = fixture.componentInstance;
    
    expect(component.isExpanded('faq-2')).toBe(false);
    component.toggleFaq('faq-2');
    expect(component.isExpanded('faq-2')).toBe(true);
    component.toggleFaq('faq-2');
    expect(component.isExpanded('faq-2')).toBe(false);
  });
});
