import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppointmentModalComponent } from './shared/modals/appointment-modal/appointment-modal.component';
import { LoginModalComponent } from './shared/modals/login-modal/login-modal.component';
import { VideoModalComponent } from './shared/modals/video-modal/video-modal.component';
import { ConfirmDialogModalComponent } from './shared/modals/confirm-dialog-modal/confirm-dialog-modal.component';
import { DepartmentDetailModalComponent } from './shared/modals/department-detail-modal/department-detail-modal.component';
import { ToastContainerComponent } from './shared/components/toast/toast.component';
import { CustomScrollbarComponent } from './shared/components/custom-scrollbar/custom-scrollbar.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AppointmentModalComponent,
    DepartmentDetailModalComponent,
    LoginModalComponent,
    VideoModalComponent,
    ConfirmDialogModalComponent,
    ToastContainerComponent,
    CustomScrollbarComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}


