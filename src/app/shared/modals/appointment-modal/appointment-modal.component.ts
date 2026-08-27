import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ModalService } from '../../../core/services/modal.service';
import { DOCTORS_DATA, Doctor } from '../../../core/models/doctor.model';
import { IconComponent } from '../../icons/icon.component';

@Component({
  selector: 'app-appointment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (modalService.isAppointmentModalOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
        
        <!-- Modal Backdrop Click Dismiss -->
        <div class="fixed inset-0" (click)="closeModal()"></div>

        <!-- Modal Content Card -->
        <div class="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-8">
          
          <!-- Modal Header -->
          <div class="relative bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 px-6 sm:px-8 py-6 text-white">
            <button 
              type="button" 
              (click)="closeModal()" 
              class="absolute top-6 right-6 text-teal-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition cursor-pointer"
              aria-label="Close modal"
            >
              <app-icon name="x" wrapperClass="w-5 h-5 block" />
            </button>

            <div class="flex items-center gap-3 mb-2">
              <span class="p-2 bg-teal-500/30 border border-teal-400/40 rounded-xl text-teal-200">
                <app-icon name="calendar" wrapperClass="w-5 h-5 block" />
              </span>
              <span class="text-xs uppercase tracking-widest font-semibold text-teal-300">Fast Online Booking</span>
            </div>
            
            <h2 id="modal-headline" class="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Book Doctor Appointment
            </h2>
            <p class="text-sm text-teal-100/80 mt-1">
              Select your specialist and convenient time slot for seamless consultation.
            </p>
          </div>

          <!-- Modal Body -->
          <div class="p-6 sm:p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
            
            @if (isSuccess()) {
              <!-- Success Screen -->
              <div class="text-center py-8 space-y-4">
                <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <app-icon name="check-circle" wrapperClass="w-10 h-10 block" />
                </div>
                <h3 class="text-2xl font-bold text-slate-900">Appointment Confirmed!</h3>
                <p class="text-sm text-slate-700 max-w-md mx-auto">
                  Your appointment with <span class="font-semibold text-teal-700">{{ bookingDetails()?.doctorName }}</span> has been registered.
                </p>

                <div class="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left max-w-md mx-auto space-y-2.5 text-sm">
                  <div class="flex justify-between items-center border-b border-slate-200/80 pb-2">
                    <span class="text-slate-700 font-semibold">Token No:</span>
                    <span class="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">{{ bookingDetails()?.token }}</span>
                  </div>
                  <div class="flex justify-between items-center border-b border-slate-200/80 pb-2">
                    <span class="text-slate-700 font-semibold">Date & Time:</span>
                    <span class="font-medium text-slate-800">{{ bookingDetails()?.date }} at {{ bookingDetails()?.timeSlot }}</span>
                  </div>
                  <div class="flex justify-between items-center border-b border-slate-200/80 pb-2">
                    <span class="text-slate-700 font-semibold">Patient:</span>
                    <span class="font-medium text-slate-800">{{ bookingDetails()?.patientName }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-700 font-semibold">Department:</span>
                    <span class="font-medium text-slate-800">{{ bookingDetails()?.department }}</span>
                  </div>
                </div>

                <div class="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    type="button" 
                    (click)="closeModal()" 
                    class="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md transition cursor-pointer"
                  >
                    Done & Close
                  </button>
                  <button 
                    type="button" 
                    (click)="resetForm()" 
                    class="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
                  >
                    Book Another
                  </button>
                </div>
              </div>
            } @else {
              <!-- Booking Form -->
              <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()" class="space-y-1.5">
                
                <!-- Step 1: Department & Doctor -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Department <span class="text-rose-500">*</span>
                    </label>
                    <select 
                      formControlName="department" 
                      (change)="onDepartmentChange()"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition outline-none"
                    >
                      <option value="All">All Departments</option>
                      @for (dept of departments; track dept) {
                        <option [value]="dept">{{ dept }}</option>
                      }
                    </select>
                    <div class="min-h-[18px] mt-1"></div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Doctor / Specialist <span class="text-rose-500">*</span>
                    </label>
                    <select 
                      formControlName="doctorId" 
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition outline-none"
                      [class.border-rose-400]="isFieldInvalid('doctorId')"
                    >
                      <option value="" disabled>Select a Doctor</option>
                      @for (doc of filteredDoctors(); track doc.id) {
                        <option [value]="doc.id">{{ doc.name }} ({{ doc.position }})</option>
                      }
                    </select>
                    <div class="min-h-[18px] mt-1">
                      @if (isFieldInvalid('doctorId')) {
                        <p class="text-xs text-rose-500 font-medium leading-none">Please select a specialist.</p>
                      }
                    </div>
                  </div>
                </div>

                <!-- Step 2: Date and Time Slot -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Preferred Date <span class="text-rose-500">*</span>
                    </label>
                    <input 
                      type="date" 
                      formControlName="date" 
                      [min]="minDate"
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition outline-none"
                      [class.border-rose-400]="isFieldInvalid('date')"
                    />
                    <div class="min-h-[18px] mt-1">
                      @if (isFieldInvalid('date')) {
                        <p class="text-xs text-rose-500 font-medium leading-none">Please select an appointment date.</p>
                      }
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Time Slot <span class="text-rose-500">*</span>
                    </label>
                    <select 
                      formControlName="timeSlot" 
                      class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition outline-none"
                      [class.border-rose-400]="isFieldInvalid('timeSlot')"
                    >
                      <option value="" disabled>Select a Time Slot</option>
                      @for (slot of timeSlots; track slot) {
                        <option [value]="slot">{{ slot }}</option>
                      }
                    </select>
                    <div class="min-h-[18px] mt-1">
                      @if (isFieldInvalid('timeSlot')) {
                        <p class="text-xs text-rose-500 font-medium leading-none">Please choose a convenient time slot.</p>
                      }
                    </div>
                  </div>
                </div>

                <!-- Step 3: Patient Information -->
                <div class="border-t border-slate-100 pt-2 space-y-1.5">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <app-icon name="user" wrapperClass="w-3.5 h-3.5 text-teal-600" />
                    Patient Details
                  </h4>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label class="block text-xs font-medium text-slate-700 mb-1">
                        Full Name <span class="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        formControlName="patientName" 
                        placeholder="e.g. John Doe"
                        class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition outline-none"
                        [class.border-rose-400]="isFieldInvalid('patientName')"
                      />
                      <div class="min-h-[18px] mt-1">
                        @if (isFieldInvalid('patientName')) {
                          <p class="text-xs text-rose-500 font-medium leading-none">Please enter the patient's full name.</p>
                        }
                      </div>
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-slate-700 mb-1">
                        Mobile Number <span class="text-rose-500">*</span>
                      </label>
                      <input 
                        type="tel" 
                        formControlName="mobileNumber" 
                        placeholder="e.g. 9876543210"
                        class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition outline-none"
                        [class.border-rose-400]="isFieldInvalid('mobileNumber')"
                      />
                      <div class="min-h-[18px] mt-1">
                        @if (isFieldInvalid('mobileNumber')) {
                          <p class="text-xs text-rose-500 font-medium leading-none">Please enter a valid 10-digit mobile number.</p>
                        }
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-slate-700 mb-1">
                      Reason for Consultation / Symptoms (Optional)
                    </label>
                    <textarea 
                      formControlName="reason" 
                      rows="2" 
                      placeholder="Briefly describe the symptoms or reason for visit..."
                      class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition outline-none resize-none"
                    ></textarea>
                    <div class="min-h-[6px] mt-0.5"></div>
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="pt-2">
                  <button 
                    type="submit" 
                    [disabled]="isSubmitting()"
                    class="btn-healthcare-primary w-full py-4 px-6 text-white font-bold rounded-2xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
                  >
                    @if (isSubmitting()) {
                      <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Registering Appointment...</span>
                    } @else {
                      <app-icon name="check-circle" wrapperClass="w-5 h-5 block text-teal-200" />
                      <span>Confirm & Book Appointment</span>
                    }
                  </button>
                </div>
              </form>
            }

          </div>
        </div>
      </div>
    }
  `
})
export class AppointmentModalComponent {
  readonly modalService = inject(ModalService);
  private readonly fb = inject(FormBuilder);

  readonly allDoctors = DOCTORS_DATA;
  readonly departments = [
    'Paediatrics',
    'Gynaecology',
    'Orthopedics',
    'General Medicine',
    'General Surgery',
    'Cardiology',
    'Urology',
    'ENT',
    'Psychiatry',
    'Gastroenterology',
    'Physiotherapy',
    'Neurology',
    'Surgical Gastro',
    'Critical Care',
    'Paediatric Surgery',
    'Neonatology',
    'Dermatology',
    'Oncology',
    'Pulmonology',
    'Emergency Care'
  ];
  
  readonly timeSlots = [
    '09:00 AM - 09:30 AM',
    '09:30 AM - 10:00 AM',
    '10:00 AM - 10:30 AM',
    '10:30 AM - 11:00 AM',
    '11:30 AM - 12:00 PM',
    '02:00 PM - 02:30 PM',
    '03:00 PM - 03:30 PM',
    '04:30 PM - 05:00 PM',
    '06:00 PM - 06:30 PM'
  ];

  readonly minDate = new Date().toISOString().split('T')[0];

  readonly isSubmitting = signal<boolean>(false);
  readonly isSuccess = signal<boolean>(false);
  readonly bookingDetails = signal<{
    token: string;
    doctorName: string;
    department: string;
    patientName: string;
    date: string;
    timeSlot: string;
  } | null>(null);

  bookingForm = this.fb.group({
    department: ['All'],
    doctorId: ['', Validators.required],
    date: ['', Validators.required],
    timeSlot: ['', Validators.required],
    patientName: ['', [Validators.required, Validators.minLength(2)]],
    mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    reason: ['']
  });

  readonly filteredDoctors = computed(() => {
    const selectedDept = this.bookingForm.get('department')?.value;
    if (!selectedDept || selectedDept === 'All') {
      return this.allDoctors;
    }
    const filtered = this.allDoctors.filter(doc => 
      doc.department.toLowerCase() === selectedDept.toLowerCase() ||
      doc.specialization.toLowerCase().includes(selectedDept.toLowerCase())
    );
    return filtered.length > 0 ? filtered : this.allDoctors;
  });

  constructor() {
    effect(() => {
      if (this.modalService.isAppointmentModalOpen()) {
        const doc = this.modalService.selectedDoctor();
        const dept = this.modalService.selectedDepartment();
        
        if (doc) {
          this.bookingForm.patchValue({
            department: doc.department,
            doctorId: doc.id
          });
        } else if (dept) {
          this.bookingForm.patchValue({
            department: dept
          });
          const matchingDocs = this.filteredDoctors();
          if (matchingDocs.length > 0) {
            this.bookingForm.patchValue({ doctorId: matchingDocs[0].id });
          }
        }
      }
    });
  }

  onDepartmentChange(): void {
    const currentDocId = this.bookingForm.get('doctorId')?.value;
    const isDocInDept = this.filteredDoctors().some(d => d.id === currentDocId);
    if (!isDocInDept && this.filteredDoctors().length > 0) {
      this.bookingForm.patchValue({ doctorId: this.filteredDoctors()[0].id });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.bookingForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.bookingForm.value;
    const selectedDoc = this.allDoctors.find(d => d.id === formVal.doctorId);

    setTimeout(() => {
      this.isSubmitting.set(false);
      const token = `HMS-TK-${Math.floor(10000 + Math.random() * 90000)}`;
      this.bookingDetails.set({
        token,
        doctorName: selectedDoc?.name || 'Assigned Specialist',
        department: selectedDoc?.department || formVal.department || 'General Medicine',
        patientName: formVal.patientName || '',
        date: formVal.date || '',
        timeSlot: formVal.timeSlot || ''
      });
      this.isSuccess.set(true);
      this.modalService.showToast('Appointment Registered', `Token #${token} confirmed for ${formVal.patientName}.`, 'success');
    }, 900);
  }

  resetForm(): void {
    this.bookingForm.reset({
      department: 'All',
      doctorId: '',
      date: '',
      timeSlot: '',
      patientName: '',
      mobileNumber: '',
      reason: ''
    });
    this.isSuccess.set(false);
    this.bookingDetails.set(null);
  }

  closeModal(): void {
    this.modalService.closeAppointmentModal();
    this.resetForm();
  }
}
