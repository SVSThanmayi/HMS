import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GradientTheme {
  background: string;
  textColor: string;
  borderColor: string;
}

// Constant Distinct Professional Medical Green Gradient Palette for all Profile Avatars
const CONSTANT_GREEN_THEME: GradientTheme = {
  background: 'linear-gradient(135deg, #044E46 0%, #0D9488 50%, #14B8A6 100%)',
  textColor: '#FFFFFF',
  borderColor: '#0F766E'
};

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (src && !hasError()) {
      <img 
        [src]="src" 
        [alt]="alt || name || 'Profile image'" 
        [class]="sizeClass + ' object-cover border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform'"
        (error)="onImageError()"
      />
    } @else {
      <div 
        [class]="sizeClass + ' flex items-center justify-center font-bold tracking-wider shadow-2xs select-none border shrink-0 group-hover:scale-105 transition-transform'"
        [style.background]="palette().background"
        [style.color]="palette().textColor"
        [style.borderColor]="palette().borderColor"
        [attr.aria-label]="name || 'Profile Avatar'"
      >
        <span [class]="textSizeClass || defaultTextSizeClass()">{{ initials() }}</span>
      </div>
    }
  `
})
export class AvatarComponent {
  @Input() src?: string | null = null;
  @Input() name: string = '';
  @Input() alt?: string = '';
  @Input() sizeClass: string = 'w-10 h-10 rounded-full';
  @Input() textSizeClass?: string;
  @Input() customGradient?: string;

  readonly hasError = signal(false);

  onImageError(): void {
    this.hasError.set(true);
  }

  readonly initials = computed(() => {
    const raw = this.name || '';
    if (!raw.trim()) return 'U';
    
    // 1. Strip everything after comma (e.g. "Dr. Sarah jenkins, MD" -> "Dr. Sarah jenkins")
    let cleaned = raw.split(',')[0].trim();

    // 2. Remove parenthesized text (e.g. "(Cardiology)" or "(MD)")
    cleaned = cleaned.replace(/\(.*?\)/g, '').trim();

    // 3. Remove common titles/prefixes: Dr., Dr, Doctor, Prof., Prof, Professor, Mr., Mrs., Ms., Miss, etc.
    cleaned = cleaned.replace(/^(dr\.|dr|doctor|prof\.|prof|professor|mr\.|mr|mrs\.|mrs|ms\.|ms|miss|rev\.|hon\.|sir)\s+/i, '').trim();

    // 4. Remove standalone degree/credential suffixes if at the end (e.g. "Sarah Jenkins MD" -> "Sarah Jenkins")
    cleaned = cleaned.replace(/\s+(md|mbbs|phd|ms|do|facs|dnb|facp|frcs|rn|np|dm|dgo|mch|jr\.?|sr\.?|ii|iii|iv)$/i, '').trim();

    // 5. Extract words starting with alphabetic characters
    const parts = cleaned.split(/\s+/).filter(p => /^[a-zA-Z]/i.test(p));
    
    if (parts.length === 0) return 'U';
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    // Return first letter of first name and first letter of last name (e.g. Sarah Jenkins -> SJ)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  readonly palette = computed<GradientTheme>(() => {
    if (this.customGradient) {
      return {
        background: this.customGradient,
        textColor: '#FFFFFF',
        borderColor: '#0F766E'
      };
    }
    return CONSTANT_GREEN_THEME;
  });

  defaultTextSizeClass(): string {
    const s = this.sizeClass || '';
    if (s.includes('w-6') || s.includes('w-7') || s.includes('h-6') || s.includes('h-7')) return 'text-xs';
    if (s.includes('w-8') || s.includes('w-9') || s.includes('h-8') || s.includes('h-9')) return 'text-xs';
    if (s.includes('w-10') || s.includes('w-11') || s.includes('w-12')) return 'text-sm';
    if (s.includes('w-13') || s.includes('w-14') || s.includes('w-16')) return 'text-base';
    if (s.includes('w-20') || s.includes('w-24')) return 'text-2xl';
    return 'text-sm';
  }
}
