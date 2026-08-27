export interface TestimonialPair {
  id: string;
  patientName: string;
  title: string;
  quote: string;
  videoDuration: string;
  videoTitle: string;
  videoPlaceholderBg?: string;
  theme: 'cyan' | 'teal' | 'sky';
}

export const TESTIMONIALS_ROW_1_PAIRS: TestimonialPair[] = [
  {
    id: 'p1-1',
    patientName: 'B SRINIVASA SHETTY',
    title: 'From Pain To Freedom',
    quote: "From Pain to Freedom! Hear the heartfelt words of gratitude from our patient's family, made possible by the exceptional care and expertise of Dr. Rajasekhar K. T and his team.",
    videoDuration: '01:45',
    videoTitle: 'Srinivasa Shetty - Heart Recovery Journey',
    videoPlaceholderBg: 'from-slate-800 via-teal-950 to-slate-900',
    theme: 'cyan'
  },
  {
    id: 'p1-2',
    patientName: 'Ajai Kumar Srivastava',
    title: 'Bilateral TKR Mobility Recovery',
    quote: 'I am a 58-year-old mechanical engineer. I visited for bilateral TKR Surgery. Both knee surgeries were smooth, comfortable, and I regained complete pain-free mobility within days.',
    videoDuration: '02:10',
    videoTitle: 'Ajai Kumar shares his knee rehabilitation',
    videoPlaceholderBg: 'from-slate-900 via-cyan-950 to-slate-900',
    theme: 'sky'
  },
  {
    id: 'p1-3',
    patientName: 'Amanda & Baby Liam',
    title: 'High-Risk Maternity & Delivery',
    quote: 'The neonatal intensive care unit and obstetricians were phenomenal. They monitored every second with state-of-the-art tech and profound human empathy throughout.',
    videoDuration: '01:30',
    videoTitle: 'Amanda welcoming baby Liam with neonatal team',
    videoPlaceholderBg: 'from-slate-900 via-emerald-950 to-slate-900',
    theme: 'cyan'
  },
  {
    id: 'p1-4',
    patientName: 'Kavita & Father',
    title: 'Stroke Emergency Rehabilitation',
    quote: 'Immediate emergency protocol and comprehensive neuro-rehab saved my father’s motor functions after an acute ischemic stroke. HMS care is truly lifesaving.',
    videoDuration: '02:40',
    videoTitle: 'Kavita on her father’s recovery',
    videoPlaceholderBg: 'from-slate-900 via-blue-950 to-slate-900',
    theme: 'teal'
  }
];

export const TESTIMONIALS_ROW_2_PAIRS: TestimonialPair[] = [
  {
    id: 'p2-1',
    patientName: 'Niyati Shah',
    title: 'Dr. Sridhar is a Lifesaver',
    quote: 'Dr. Sridhar is a lifesaver. My father was diagnosed with lung cancer and given only six months. Thankfully, we came to HMS and after Cyberknife treatment, my father is thriving.',
    videoDuration: '02:15',
    videoTitle: 'Niyati Shah on Cyberknife cancer therapy',
    videoPlaceholderBg: 'from-slate-950 via-teal-900 to-slate-900',
    theme: 'teal'
  },
  {
    id: 'p2-2',
    patientName: 'Carlos Mendez',
    title: 'Precision Oncology Chemotherapy',
    quote: 'Navigating cancer is daunting, but Dr. Elena Rostova and the oncology team treated me like family with tailored immunotherapy and compassionate guidance.',
    videoDuration: '01:50',
    videoTitle: 'Carlos celebrating 2 years remission',
    videoPlaceholderBg: 'from-slate-900 via-slate-800 to-slate-950',
    theme: 'cyan'
  },
  {
    id: 'p2-3',
    patientName: 'Sunita & Anaya',
    title: 'Pediatric Pulmonology Care',
    quote: 'My 6-year-old daughter struggled with chronic asthma until we consulted Dr. Michael Patel. Now she breathes effortlessly and plays sports freely every day.',
    videoDuration: '01:55',
    videoTitle: 'Sunita & daughter Anaya on asthma relief',
    videoPlaceholderBg: 'from-slate-900 via-cyan-900 to-slate-950',
    theme: 'sky'
  },
  {
    id: 'p2-4',
    patientName: 'David Thompson',
    title: 'Robotic Spine Decompression',
    quote: 'The minimally invasive robotic surgical suite and transparent physician communication gave me total confidence. I was back hiking in under six weeks.',
    videoDuration: '02:25',
    videoTitle: 'David returns to active lifestyle',
    videoPlaceholderBg: 'from-slate-900 via-slate-950 to-teal-950',
    theme: 'teal'
  }
];
