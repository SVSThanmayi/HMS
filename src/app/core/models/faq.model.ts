export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'booking' | 'doctor' | 'documents' | 'emergency' | 'reports' | 'general';
}

export const FAQS_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'How can I book an appointment?',
    answer: 'You can book an appointment instantly through our website by clicking the "Book Appointment" button at the top, selecting your preferred department, doctor, and convenient time slot. Alternatively, you can use our "Request a Call Back" form or call our 24/7 hospital helpline at 1800 467 2273.',
    category: 'booking'
  },
  {
    id: 'faq-2',
    question: 'Can I choose a specific doctor?',
    answer: 'Yes, absolutely. You can browse through our "Our Doctors" directory, view their specialized credentials, clinical experience, and real-time schedule availability. During the booking process, you can select any specialist of your choice.',
    category: 'doctor'
  },
  {
    id: 'faq-3',
    question: 'What documents should I bring for my appointment?',
    answer: 'Please bring a valid Government-issued photo ID, your health insurance card (if applicable), any previous medical records, diagnostic test reports, X-rays/scans, and a list of current medications you are taking.',
    category: 'documents'
  },
  {
    id: 'faq-4',
    question: 'Do you provide emergency services?',
    answer: 'Yes, our Level-1 Trauma & Emergency Department operates 24 hours a day, 7 days a week, 365 days a year. We have dedicated resuscitation bays, rapid-response ambulances, on-duty trauma surgeons, cardiologists, and acute care specialists ready at all times.',
    category: 'emergency'
  },
  {
    id: 'faq-5',
    question: 'Can I cancel or reschedule my appointment?',
    answer: 'Yes, appointments can be rescheduled or cancelled up to 2 hours prior to the scheduled slot without any cancellation fee. You can manage this via the Patient Portal login or by contacting our patient care desk.',
    category: 'booking'
  },
  {
    id: 'faq-6',
    question: 'How can I get my medical reports?',
    answer: 'All laboratory results, diagnostic scans, and clinical summaries are automatically published to your secure HMS Patient Portal within hours of testing. You can view, download, or print digital copies, or collect physical stamped reports at the hospital registration counter.',
    category: 'reports'
  }
];
