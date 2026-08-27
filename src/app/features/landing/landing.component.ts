import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { QuickServicesComponent } from './components/quick-services/quick-services.component';
import { DepartmentsComponent } from './components/departments/departments.component';
import { HospitalStatsComponent } from './components/hospital-stats/hospital-stats.component';
import { DoctorsCarouselComponent } from './components/doctors-carousel/doctors-carousel.component';
import { PatientSpeaksComponent } from './components/patient-speaks/patient-speaks.component';
import { FaqAccordionComponent } from './components/faq-accordion/faq-accordion.component';
import { CallbackFormComponent } from './components/callback-form/callback-form.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    HeroComponent,
    QuickServicesComponent,
    DepartmentsComponent,
    HospitalStatsComponent,
    DoctorsCarouselComponent,
    PatientSpeaksComponent,
    FaqAccordionComponent,
    CallbackFormComponent,
    FooterComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-teal-500 selection:text-white">
      <!-- Fixed / Sticky Navigation Bar -->
      <app-navbar />

      <!-- Main Landing Page Content Sections -->
      <main class="flex-1">
        <!-- 1. Hero Section with Video Background & Book Appointment CTA -->
        <app-hero />

        <!-- 2. Quick Services Highlight Strip -->
        <app-quick-services />

        <!-- 3. Medical Departments & Specialties Section -->
        <app-departments />

        <!-- 4. Hospital Key Stats Banner Strip (10+ Doctors, 50 Bedded, 18000+ Patients, 600+ Surgeries) -->
        <app-hospital-stats />

        <!-- 5. Our Doctors Carousel / Slider Section -->
        <app-doctors-carousel />

        <!-- 3. Patients Speak Two-Row Video Testimonials Section -->
        <app-patient-speaks />

        <!-- 4. Frequently Asked Questions Expandable Accordion Section -->
        <app-faq-accordion />

        <!-- 5. Request a Call Back Form Section -->
        <app-callback-form />
      </main>

      <!-- 6. Footer Section with Hospital Info, Quick Links & Socials -->
      <app-footer />
    </div>
  `
})
export class LandingComponent {}
