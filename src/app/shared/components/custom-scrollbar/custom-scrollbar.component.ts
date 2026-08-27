import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-scrollbar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
      display: block;
      pointer-events: none;
    }

    .scroll-track-container {
      position: fixed;
      top: 68px;
      right: 4px;
      bottom: 8px;
      width: 14px;
      z-index: 999999;
      pointer-events: none;
      background: transparent !important;
      background-color: transparent !important;
    }

    .scroll-thumb {
      position: absolute;
      top: 0;
      right: 0;
      width: 8px;
      border-radius: 9999px;
      pointer-events: auto;
      cursor: grab;
      opacity: 0;
      will-change: transform, opacity, height, width;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease;
    }

    .scroll-thumb:active {
      cursor: grabbing;
      width: 11px;
    }

    .scroll-thumb:hover {
      width: 11px;
      opacity: 1 !important;
      background: linear-gradient(180deg, #5eead4 0%, #0d9488 50%, #047857 100%) !important;
      box-shadow: 0 0 16px rgba(45, 212, 191, 0.85), inset 0 1px 2px rgba(255, 255, 255, 0.6) !important;
    }

    .thumb-visible {
      opacity: 1;
    }

    .thumb-down {
      background: linear-gradient(180deg, rgba(94, 234, 212, 0.3) 0%, rgba(20, 184, 166, 0.8) 45%, rgba(15, 118, 110, 1) 100%);
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.4);
    }

    .thumb-up {
      background: linear-gradient(0deg, rgba(94, 234, 212, 0.3) 0%, rgba(20, 184, 166, 0.8) 45%, rgba(15, 118, 110, 1) 100%);
      box-shadow: 0 -4px 14px rgba(13, 148, 136, 0.6), inset 0 -1px 2px rgba(255, 255, 255, 0.4);
    }

    .thumb-default {
      background: linear-gradient(180deg, rgba(20, 184, 166, 0.65) 0%, rgba(13, 148, 136, 0.95) 100%);
      box-shadow: 0 0 10px rgba(13, 148, 136, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.35);
    }
  `],
  template: `
    <div class="scroll-track-container">
      <div 
        #thumb 
        class="scroll-thumb thumb-default"
        (mousedown)="onThumbMouseDown($event)"
      ></div>
    </div>
  `
})
export class CustomScrollbarComponent implements AfterViewInit, OnDestroy {
  @ViewChild('thumb') thumbRef?: ElementRef<HTMLDivElement>;

  private ngZone = inject(NgZone);
  private hideTimeout?: ReturnType<typeof setTimeout>;
  private scrollListener?: () => void;
  private resizeListener?: () => void;
  private mouseMoveListener?: (e: MouseEvent) => void;
  private mouseUpListener?: () => void;

  private isDragging = false;
  private dragStartY = 0;
  private dragStartScrollTop = 0;
  private lastScrollY = 0;

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;

    this.ngZone.runOutsideAngular(() => {
      this.lastScrollY = window.scrollY || window.pageYOffset || 0;

      this.scrollListener = () => {
        this.updateScrollbar(true);
      };

      this.resizeListener = () => {
        this.updateScrollbar(false);
      };

      window.addEventListener('scroll', this.scrollListener, { passive: true, capture: true });
      window.addEventListener('resize', this.resizeListener, { passive: true });

      this.mouseMoveListener = (e: MouseEvent) => {
        if (!this.isDragging) return;
        const deltaY = e.clientY - this.dragStartY;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        const navOffset = 68;
        const bottomOffset = 8;
        const availableHeight = clientHeight - navOffset - bottomOffset;
        const maxScrollTop = scrollHeight - clientHeight;
        const thumbHeight = Math.max(54, (clientHeight / scrollHeight) * availableHeight);
        const maxThumbTop = availableHeight - thumbHeight;
        const scrollDelta = (deltaY / maxThumbTop) * maxScrollTop;

        window.scrollTo({
          top: this.dragStartScrollTop + scrollDelta,
          behavior: 'auto'
        });
      };

      this.mouseUpListener = () => {
        if (this.isDragging) {
          this.isDragging = false;
          this.scheduleHide();
        }
      };

      window.addEventListener('mousemove', this.mouseMoveListener, { passive: true });
      window.addEventListener('mouseup', this.mouseUpListener, { passive: true });

      // Initial calculation
      this.updateScrollbar(false);
    });
  }

  onThumbMouseDown(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = true;
    this.dragStartY = e.clientY;
    this.dragStartScrollTop = window.scrollY || window.pageYOffset || 0;

    if (this.thumbRef?.nativeElement) {
      this.thumbRef.nativeElement.classList.add('thumb-visible');
    }
  }

  private updateScrollbar(show: boolean): void {
    const thumb = this.thumbRef?.nativeElement;
    if (!thumb) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;
    const scrollTop = window.scrollY || window.pageYOffset || 0;

    // If page content fits in viewport, hide scrollbar
    if (scrollHeight <= clientHeight + 5) {
      thumb.style.display = 'none';
      return;
    }

    thumb.style.display = 'block';

    const navOffset = 68;
    const bottomOffset = 8;
    const availableHeight = clientHeight - navOffset - bottomOffset;
    const thumbHeight = Math.max(54, (clientHeight / scrollHeight) * availableHeight);
    const maxScrollTop = scrollHeight - clientHeight;
    const maxThumbTop = availableHeight - thumbHeight;
    const thumbTop = Math.min(maxThumbTop, Math.max(0, (scrollTop / maxScrollTop) * maxThumbTop));

    // Directional gradient
    if (scrollTop > this.lastScrollY + 1) {
      thumb.classList.remove('thumb-up', 'thumb-default');
      thumb.classList.add('thumb-down');
    } else if (scrollTop < this.lastScrollY - 1) {
      thumb.classList.remove('thumb-down', 'thumb-default');
      thumb.classList.add('thumb-up');
    }

    this.lastScrollY = scrollTop;

    // Apply GPU transform
    thumb.style.height = `${thumbHeight}px`;
    thumb.style.transform = `translate3d(0, ${thumbTop}px, 0)`;

    if (show) {
      thumb.classList.add('thumb-visible');
      this.scheduleHide();
    }
  }

  private scheduleHide(): void {
    if (this.isDragging) return;

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    this.hideTimeout = setTimeout(() => {
      if (!this.isDragging && this.thumbRef?.nativeElement) {
        this.thumbRef.nativeElement.classList.remove('thumb-visible');
      }
    }, 600);
  }

  ngOnDestroy(): void {
    if (typeof window === 'undefined') return;

    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener, { capture: true });
    }
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    if (this.mouseMoveListener) {
      window.removeEventListener('mousemove', this.mouseMoveListener);
    }
    if (this.mouseUpListener) {
      window.removeEventListener('mouseup', this.mouseUpListener);
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
  }
}
