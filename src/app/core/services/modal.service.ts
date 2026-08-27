import { Injectable, signal } from '@angular/core';
import { Doctor } from '../models/doctor.model';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  title: string;
  message: string;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'primary';
  icon?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  // Appointment modal state
  readonly isAppointmentModalOpen = signal<boolean>(false);
  readonly selectedDoctor = signal<Doctor | null>(null);
  readonly selectedDepartment = signal<string | null>(null);

  // Department detail modal state
  readonly isDepartmentDetailOpen = signal<boolean>(false);
  readonly selectedDepartmentDetail = signal<any | null>(null);

  // Login modal state
  readonly isLoginModalOpen = signal<boolean>(false);

  // Video preview player state
  readonly activeVideo = signal<{ title: string; patient: string; duration: string } | null>(null);

  // Confirmation dialog modal state
  readonly activeConfirmDialog = signal<ConfirmDialogOptions | null>(null);

  // Toast notifications
  readonly toasts = signal<ToastMessage[]>([]);

  confirm(options: ConfirmDialogOptions): void {
    this.activeConfirmDialog.set(options);
    document.body.style.overflow = 'hidden';
  }

  resolveConfirm(): void {
    const dialog = this.activeConfirmDialog();
    if (dialog) {
      dialog.onConfirm();
    }
    this.activeConfirmDialog.set(null);
    this.checkScrollLock();
  }

  dismissConfirm(): void {
    const dialog = this.activeConfirmDialog();
    if (dialog?.onCancel) {
      dialog.onCancel();
    }
    this.activeConfirmDialog.set(null);
    this.checkScrollLock();
  }

  openAppointmentModal(doctor?: Doctor, departmentName?: string): void {
    this.selectedDoctor.set(doctor || null);
    this.selectedDepartment.set(departmentName || doctor?.department || null);
    this.isAppointmentModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeAppointmentModal(): void {
    this.isAppointmentModalOpen.set(false);
    this.selectedDoctor.set(null);
    this.selectedDepartment.set(null);
    this.checkScrollLock();
  }

  openDepartmentDetailModal(department: any): void {
    this.selectedDepartmentDetail.set(department);
    this.isDepartmentDetailOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeDepartmentDetailModal(): void {
    this.isDepartmentDetailOpen.set(false);
    this.selectedDepartmentDetail.set(null);
    this.checkScrollLock();
  }

  openLoginModal(): void {
    this.isLoginModalOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeLoginModal(): void {
    this.isLoginModalOpen.set(false);
    this.checkScrollLock();
  }

  openVideoPreview(video: { title: string; patient: string; duration: string }): void {
    this.activeVideo.set(video);
    document.body.style.overflow = 'hidden';
  }

  closeVideoPreview(): void {
    this.activeVideo.set(null);
    this.checkScrollLock();
  }

  showToast(title: string, message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success'): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const toast: ToastMessage = { id, type, title, message };
    this.toasts.update(current => [...current, toast]);

    setTimeout(() => {
      this.removeToast(id);
    }, 4500);
  }

  removeToast(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  private checkScrollLock(): void {
    if (
      !this.isAppointmentModalOpen() &&
      !this.isDepartmentDetailOpen() &&
      !this.isLoginModalOpen() &&
      !this.activeVideo() &&
      !this.activeConfirmDialog()
    ) {
      document.body.style.overflow = '';
    }
  }
}
